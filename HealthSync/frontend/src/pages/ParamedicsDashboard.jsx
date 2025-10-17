  import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import API from '../services/api';
import { Ambulance as AmbulanceIcon, Plus, Pencil, CheckCircle2, Wrench, Route, MapPin, AlertTriangle, QrCode } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ParamedicsDashboard = () => {
  const [token, setToken] = useState(true);
  const [tab, setTab] = useState('emergencies'); // vehicles | dispatches | emergencies
  const [vehicles, setVehicles] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [assignFor, setAssignFor] = useState(null);
  const [startFor, setStartFor] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [qrResult, setQrResult] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [activeDispatchId, setActiveDispatchId] = useState(null);
  const [lastDispatchLink, setLastDispatchLink] = useState('');
  const [currentDispatchPatientId, setCurrentDispatchPatientId] = useState('');
  // Per-dispatch scanning and results
  const [openScanners, setOpenScanners] = useState([]); // array of dispatchIds
  const [scannedByDispatch, setScannedByDispatch] = useState({}); // { [dispatchId]: patient }
  const videoRefs = useRef({});
  const timersRef = useRef({});
  const canvasesRef = useRef({});
  const [scanningById, setScanningById] = useState({});
  const [scanErrorById, setScanErrorById] = useState({});
  const videoRef = useRef(null);
  const scanTimerRef = useRef(null);
  const canvasRef = useRef(null);
  const jsqrRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scannedPatient, setScannedPatient] = useState(null);
  const [showCondition, setShowCondition] = useState(false);
  const [conditionDispatch, setConditionDispatch] = useState(null);
  const [condSubmitting, setCondSubmitting] = useState(false);
  // Per-emergency scanning
  const [openErScanners, setOpenErScanners] = useState([]); // emergency id strings
  const erVideoRefs = useRef({});
  const erTimersRef = useRef({});
  const erCanvasesRef = useRef({});
  const [erScanningById, setErScanningById] = useState({});
  const [erScanErrorById, setErScanErrorById] = useState({});
  const [erScannedByEmergency, setErScannedByEmergency] = useState({}); // { [emergencyId]: patient }
  // Periodic geolocation updates when there is an active dispatch
  useEffect(() => {
    if (!activeDispatchId) return;
    let timer = null;
    const sendUpdate = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speedKph = pos.coords.speed && pos.coords.speed > 0 ? (pos.coords.speed * 3.6) : null; // m/s -> km/h
          const headingDeg = pos.coords.heading ?? null;
          await API.put(`/ambulance/dispatches/${activeDispatchId}/location`, { latitude: lat, longitude: lng, speedKph, headingDeg });
        } catch (_) {}
      }, () => {}, { enableHighAccuracy: true, maximumAge: 5000 });
    };

    // initial and interval
    sendUpdate();
    timer = setInterval(sendUpdate, 5000);
    return () => { if (timer) clearInterval(timer); };
  }, [activeDispatchId]);

  // Open the existing modal scanner for a given emergency (preferred UX)
  const openEmergencyModalScanner = async (er) => {
    const pid = er?.patientId || er?.patientID;
    if (!pid) { showToast('No patientId on this emergency', 'error'); return; }
    // Try to attach to an active dispatch if available; do not block modal if missing
    let d = findActiveDispatchByPatientId(pid);
    if (!d) {
      try {
        const created = await createDispatchForEmergency(er);
        if (created) { d = created; await load(); }
      } catch (_) {}
    }
    setCurrentDispatchPatientId(String(pid));
    setActiveDispatchId(d ? (d.id || d._id || null) : null);
    setQrResult('');
    setShowQR(true);
  };

  // Ensure the video ref is mounted before starting camera
  const openEmergencyScanner = async (er) => {
    const eid = String(er.id || er._id || '');
    if (!eid) return;
    // Show feedback and ensure only one scanner is open to avoid camera contention
    try { showToast('Opening scanner…', 'info', 1200); } catch {}
    setOpenErScanners([eid]);
    // wait until the <video> ref is attached in the DOM
    await new Promise(r => requestAnimationFrame(r));
    let tries = 0;
    const maxTries = 40; // ~2s at 50ms
    while (!erVideoRefs.current[eid] && tries < maxTries) {
      await new Promise(r => setTimeout(r, 50));
      tries++;
    }
    startEmergencyInlineScan(eid, er.patientId || er.patientID || '', er);
  };

  // Emergency inline scanner controls
  const stopEmergencyInlineScan = (emergencyId) => {
    try {
      if (erTimersRef.current[emergencyId]) { clearInterval(erTimersRef.current[emergencyId]); delete erTimersRef.current[emergencyId]; }
      const vid = erVideoRefs.current[String(emergencyId)];
      if (vid && vid.srcObject) {
        vid.srcObject.getTracks().forEach(t => t.stop());
        vid.srcObject = null;
      }
    } catch (_) {}
    setErScanningById(prev => ({ ...prev, [emergencyId]: false }));
  };

  const startEmergencyInlineScan = async (emergencyId, expectedPatientId, emergencyCtx = null) => {
    setErScanErrorById(prev => ({ ...prev, [emergencyId]: '' }));
    setErScanningById(prev => ({ ...prev, [emergencyId]: false }));
    try {
      const stream = await navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: 'environment' } });
      const vid = erVideoRefs.current[emergencyId];
      if (!vid) return;
      vid.srcObject = stream;
      await vid.play?.();
      const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
      const handlePatient = async (pid) => {
        // ensure matches emergency patient
        if (String(pid) !== String(expectedPatientId || '')) { showToast('Scanned patient does not match this emergency.', 'error'); return; }
        // find active dispatch for this patient
        let d = findActiveDispatchByPatientId(pid);
        if (!d && emergencyCtx) {
          // Auto-create a dispatch for this emergency if missing
          const created = await createDispatchForEmergency(emergencyCtx);
          if (created) { d = created; await load(); }
        }
        if (!d) { showToast('No active dispatch for this emergency. Start a dispatch first.', 'error'); return; }
        try {
          const resp = await API.post(`/ambulance/dispatches/${d.id || d._id}/validate-patient`, { patientId: pid });
          const patient = resp?.data?.patient || { id: pid };
          setErScannedByEmergency(prev => ({ ...prev, [emergencyId]: patient }));
          showToast('Patient validated for this emergency.', 'success');
        } catch (_) {
          setErScannedByEmergency(prev => ({ ...prev, [emergencyId]: { id: pid } }));
        }
        stopEmergencyInlineScan(String(emergencyId));
        setOpenErScanners(prev => prev.filter(x => x !== String(emergencyId)));
      };
      if (!hasDetector) {
        try {
          if (!jsqrRef.current) jsqrRef.current = await import('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.esm.js');
          setErScanningById(prev => ({ ...prev, [emergencyId]: true }));
          if (!erCanvasesRef.current[emergencyId]) erCanvasesRef.current[emergencyId] = document.createElement('canvas');
          erTimersRef.current[String(emergencyId)] = setInterval(async () => {
            const v = erVideoRefs.current[String(emergencyId)];
            const c = erCanvasesRef.current[String(emergencyId)];
            if (!v || !c) return;
            const w = v.videoWidth || 640; const h = v.videoHeight || 360;
            if (c.width !== w) c.width = w; if (c.height !== h) c.height = h;
            const ctx = c.getContext('2d'); if (!ctx) return;
            ctx.drawImage(v, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const jsqr = jsqrRef.current?.default || jsqrRef.current;
            const code = jsqr(img.data, w, h);
            if (code && code.data) {
              const text = String(code.data || '');
              if (text.startsWith('patient:')) { const pid = text.split(':')[1]; await handlePatient(pid); }
            }
          }, 600);
          return;
        } catch (e) {
          setErScanningById(prev => ({ ...prev, [String(emergencyId)]: false }));
          setErScanErrorById(prev => ({ ...prev, [String(emergencyId)]: 'Camera active. QR library failed to load.' }));
          return;
        }
      }
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      setErScanningById(prev => ({ ...prev, [String(emergencyId)]: true }));
      erTimersRef.current[String(emergencyId)] = setInterval(async () => {
        const v = erVideoRefs.current[String(emergencyId)]; if (!v) return;
        try {
          const codes = await detector.detect(v);
          if (codes && codes.length > 0) {
            const text = codes[0].rawValue || '';
            if (text.startsWith('patient:')) { const pid = text.split(':')[1]; await handlePatient(pid); }
          }
        } catch (_) {}
      }, 600);
    } catch (err) {
      setErScanErrorById(prev => ({ ...prev, [String(emergencyId)]: 'Unable to access camera.' }));
    }
  };

  // Helpers and handlers at component scope
  const createDispatchForEmergency = async (er) => {
    const ambulanceId = er?.ambulanceId;
    const patientId = er?.patientId || er?.patientID;
    const pickupLocation = er?.pickupLocation || er?.location || '';
    if (!ambulanceId || !patientId) {
      showToast('Assign an ambulance and ensure patientId exists before creating a dispatch.', 'error');
      return null;
    }
    try {
      const payload = {
        ambulanceId,
        paramedicId: (user?.id || user?._id || user?.userId),
        patientId,
        pickupLocation,
        dropoffLocation: ''
      };
      const res = await API.post('/ambulance/dispatches', payload);
      await load();
      const newId = res?.data?.id || res?.data?._id;
      return newId ? (res?.data || { id: newId, _id: newId, patientId }) : null;
    } catch (e) {
      showToast('Failed to create dispatch for this emergency.', 'error');
      return null;
    }
  };

  // Inline per-dispatch scanner controls
  const stopInlineScan = (dispatchId) => {
    try {
      if (timersRef.current[dispatchId]) { clearInterval(timersRef.current[dispatchId]); delete timersRef.current[dispatchId]; }
      const vid = videoRefs.current[dispatchId];
      if (vid && vid.srcObject) {
        vid.srcObject.getTracks().forEach(t => t.stop());
        vid.srcObject = null;
      }
    } catch (_) {}
    setScanningById(prev => ({ ...prev, [dispatchId]: false }));
  };

  const startInlineScan = async (dispatchId, expectedPatientId) => {
    setScanErrorById(prev => ({ ...prev, [dispatchId]: '' }));
    setScanningById(prev => ({ ...prev, [dispatchId]: false }));
    try {
      const stream = await navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: 'environment' } });
      const vid = videoRefs.current[dispatchId];
      if (!vid) return;
      vid.srcObject = stream;
      await vid.play?.();
      const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
      if (!hasDetector) {
        try {
          if (!jsqrRef.current) {
            jsqrRef.current = await import('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.esm.js');
          }
          setScanningById(prev => ({ ...prev, [dispatchId]: true }));
          if (!canvasesRef.current[dispatchId]) {
            const c = document.createElement('canvas');
            canvasesRef.current[dispatchId] = c;
          }
          timersRef.current[dispatchId] = setInterval(async () => {
            const v = videoRefs.current[dispatchId];
            const c = canvasesRef.current[dispatchId];
            if (!v || !c) return;
            const w = v.videoWidth || 640;
            const h = v.videoHeight || 360;
            if (c.width !== w) c.width = w;
            if (c.height !== h) c.height = h;
            const ctx = c.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(v, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            const jsqr = jsqrRef.current?.default || jsqrRef.current;
            const code = jsqr(imgData.data, w, h);
            if (code && code.data) {
              const text = String(code.data || '');
              if (text.startsWith('patient:')) {
                const pid = text.split(':')[1];
                if (String(pid) === String(expectedPatientId || '')) {
                  try {
                    const resp = await API.post(`/ambulance/dispatches/${dispatchId}/validate-patient`, { patientId: pid });
                    const patient = resp?.data?.patient || { id: pid };
                    setScannedByDispatch(prev => ({ ...prev, [dispatchId]: patient }));
                    showToast('Patient validated successfully.', 'success');
                  } catch (_) {
                    setScannedByDispatch(prev => ({ ...prev, [dispatchId]: { id: pid } }));
                  }
                  stopInlineScan(dispatchId);
                  setOpenScanners(prev => prev.filter(x => x !== dispatchId));
                } else {
                  showToast('Scanned patient does not match the current dispatch.', 'error');
                }
              }
            }
          }, 600);
          return;
        } catch (e) {
          setScanningById(prev => ({ ...prev, [dispatchId]: false }));
          setScanErrorById(prev => ({ ...prev, [dispatchId]: 'Camera active. QR library failed to load.' }));
          return;
        }
      }
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      setScanningById(prev => ({ ...prev, [dispatchId]: true }));
      timersRef.current[dispatchId] = setInterval(async () => {
        const v = videoRefs.current[dispatchId];
        if (!v) return;
        try {
          const barcodes = await detector.detect(v);
          if (barcodes && barcodes.length > 0) {
            const text = barcodes[0].rawValue || '';
            if (text.startsWith('patient:')) {
              const pid = text.split(':')[1];
              if (String(pid) === String(expectedPatientId || '')) {
                try {
                  const resp = await API.post(`/ambulance/dispatches/${dispatchId}/validate-patient`, { patientId: pid });
                  const patient = resp?.data?.patient || { id: pid };
                  setScannedByDispatch(prev => ({ ...prev, [dispatchId]: patient }));
                  showToast('Patient validated successfully.', 'success');
                } catch (_) {
                  setScannedByDispatch(prev => ({ ...prev, [dispatchId]: { id: pid } }));
                }
                stopInlineScan(dispatchId);
                setOpenScanners(prev => prev.filter(x => x !== dispatchId));
              } else {
                showToast('Scanned patient does not match the current dispatch.', 'error');
              }
            }
          }
        } catch (_) {}
      }, 600);
    } catch (err) {
      setScanErrorById(prev => ({ ...prev, [dispatchId]: 'Unable to access camera.' }));
    }
  };

  const isDispatchTerminal = (s) => {
    const v = (s||'').toLowerCase();
    return v==='completed'||v==='finished'||v==='closed'||v==='done'||v==='canceled'||v==='cancelled'||v==='dropped';
  };
  const findActiveDispatchByPatientId = (pid) => {
    const list = Array.isArray(dispatches)? dispatches: [];
    for (let i=list.length-1; i>=0; i--) {
      const d = list[i];
      if (String(d.patientId||'')===String(pid) && !isDispatchTerminal(d.status)) return d;
    }
    return null;
  };

  const openConditionForm = (d) => {
    setConditionDispatch(d);
    setShowCondition(true);
  };

  const submitCondition = async (e) => {
    e.preventDefault();
    if (!conditionDispatch) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      patientId: conditionDispatch.patientId || '',
      bpSystolic: parseInt(fd.get('bpSystolic')||'' ) || null,
      bpDiastolic: parseInt(fd.get('bpDiastolic')||'' ) || null,
      pulse: parseInt(fd.get('pulse')||'' ) || null,
      respRate: parseInt(fd.get('respRate')||'' ) || null,
      spo2: parseInt(fd.get('spo2')||'' ) || null,
      temperature: fd.get('temperature') ? parseFloat(fd.get('temperature')) : null,
      consciousnessLevel: fd.get('consciousnessLevel') || '',
      painScale: fd.get('painScale') ? parseInt(fd.get('painScale')) : null,
      allergies: fd.get('allergies') || '',
      medicationsGiven: fd.get('medicationsGiven') || '',
      injuries: fd.get('injuries') || '',
      notes: fd.get('notes') || ''
    };
    try {
      setCondSubmitting(true);
      await API.post(`/ambulance/dispatches/${conditionDispatch.id || conditionDispatch._id}/condition-reports`, payload, {
        headers: {
          'X-User-Role': (user?.role || '').toUpperCase?.() || '',
          'X-User-Id': (user?.id || user?._id || user?.userId || '')
        }
      });
      showToast('Condition report submitted', 'success');
      try { window.dispatchEvent(new Event('dispatch:updated')); } catch {}
      setShowCondition(false);
      setConditionDispatch(null);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to submit report', 'error');
    } finally {
      setCondSubmitting(false);
    }
  };

  // Ensure camera starts when modal opens and stops when it closes
  useEffect(() => {
    if (showQR) {
      setQrResult('');
      // small delay to ensure <video> is mounted
      const id = setTimeout(() => { startQRScan(); }, 100);
      return () => clearTimeout(id);
    } else {
      stopQRScan();
    }
  }, [showQR]);

  const stopQRScan = () => {
    try {
      if (scanTimerRef.current) { clearInterval(scanTimerRef.current); scanTimerRef.current = null; }
      const vid = videoRef.current;
      if (vid && vid.srcObject) {
        vid.srcObject.getTracks().forEach(t => t.stop());
        vid.srcObject = null;
      }
    } catch (_) {}
    setScanning(false);
  };

  const startQRScan = async (expectedPatientId, dispatchId) => {
    setScanError('');
    setScanning(false);
    if (expectedPatientId) setCurrentDispatchPatientId(String(expectedPatientId));
    if (dispatchId) setActiveDispatchId(dispatchId);
    try {
      const stream = await navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: 'environment' } });
      const vid = videoRef.current;
      if (!vid) return;
      vid.srcObject = stream;
      await vid.play?.();
      // Prefer BarcodeDetector if available
      const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
      if (!hasDetector) {
        // Fallback to jsQR (dynamic import) with canvas sampling
        try {
          if (!jsqrRef.current) {
            jsqrRef.current = await import('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.esm.js');
          }
          setScanning(true);
          const ensureCanvas = () => {
            if (!canvasRef.current) {
              const c = document.createElement('canvas');
              c.width = 640; c.height = 360; // default; will be resized to video
              canvasRef.current = c;
            }
          };
          ensureCanvas();
          scanTimerRef.current = setInterval(async () => {
            const v = videoRef.current;
            const c = canvasRef.current;
            if (!v || !c) return;
            const w = v.videoWidth || 640;
            const h = v.videoHeight || 360;
            if (c.width !== w) c.width = w;
            if (c.height !== h) c.height = h;
            const ctx = c.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(v, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            const jsqr = jsqrRef.current?.default || jsqrRef.current;
            const code = jsqr(imgData.data, w, h);
            if (code && code.data) {
              const text = String(code.data || '');
              setQrResult(text);
              if (text.startsWith('patient:')) {
                const pid = text.split(':')[1];
                if (currentDispatchPatientId) {
                  if (pid === currentDispatchPatientId) {
                    await confirmEmergencyByPatientId(pid);
                    // Server-side validate and update, returns patient
                    try {
                      if (activeDispatchId) {
                        const resp = await API.post(`/ambulance/dispatches/${activeDispatchId}/validate-patient`, { patientId: pid });
                        const patient = resp?.data?.patient || { id: pid };
                        setScannedPatient(patient);
                        setScannedByDispatch(prev => ({ ...prev, [activeDispatchId]: patient }));
                        // Also show under matching emergency card
                        try {
                          const matchEr = (Array.isArray(emergencies)?emergencies:[]).find(e=>String(e.patientId||e.patientID||'')===String(pid));
                          if (matchEr) setErScannedByEmergency(prev=>({ ...prev, [String(matchEr.id||matchEr._id)]: patient }));
                        } catch {}
                        try { window.dispatchEvent(new Event('dispatch:updated')); } catch {}
                      }
                    } catch (_) {
                      const patient = { id: pid };
                      setScannedPatient(patient);
                      if (activeDispatchId) setScannedByDispatch(prev => ({ ...prev, [activeDispatchId]: patient }));
                      try {
                        const matchEr = (Array.isArray(emergencies)?emergencies:[]).find(e=>String(e.patientId||e.patientID||'')===String(pid));
                        if (matchEr) setErScannedByEmergency(prev=>({ ...prev, [String(matchEr.id||matchEr._id)]: patient }));
                      } catch {}
                    }
                    showToast('Patient validated successfully.', 'success');
                    stopQRScan();
                    if (openScannerFor) setOpenScannerFor(null); else setShowQR(false);
                  } else {
                    showToast('Scanned patient does not match the current dispatch.', 'error');
                  }
                  return;
                }
                // Prevent starting new dispatch if emergency already completed
                const er = findEmergencyByPatientId(pid);
                if (er && isTerminalStatus(er.status)) {
                  showToast('Emergency already completed. Cannot start a new dispatch.', 'error');
                  stopQRScan();
                  setShowQR(false);
                  return;
                }
                await confirmEmergencyByPatientId(pid);
                stopQRScan();
                setShowQR(false);
                // If an emergency exists for this patient, carry id/status/pickupLocation into startFor
                if (er) {
                  setStartFor({
                    id: er.id || er._id,
                    patientId: pid,
                    pickupLocation: er.pickupLocation || '',
                    status: er.status || ''
                  });
                } else {
                  setStartFor({ patientId: pid, pickupLocation: '', status: '' });
                }
              }
            }
          }, 600);
          return;
        } catch (e) {
          setScanning(false);
          setScanError('Camera active. QR library failed to load. Please try Chrome or enable BarcodeDetector.');
          return;
        }
      }
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      setScanning(true);
      // Periodically detect barcodes from the video stream
      scanTimerRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const text = barcodes[0].rawValue || '';
            setQrResult(text);
            if (text.startsWith('patient:')) {
              const pid = text.split(':')[1];
              // If we have an active dispatch, validate scanned pid matches dispatch patient
              if (currentDispatchPatientId) {
                if (pid === currentDispatchPatientId) {
                  await confirmEmergencyByPatientId(pid);
                  // Server-side validate and update, returns patient
                  try {
                    if (activeDispatchId) {
                      const resp = await API.post(`/ambulance/dispatches/${activeDispatchId}/validate-patient`, { patientId: pid });
                      const patient = resp?.data?.patient || { id: pid };
                      setScannedPatient(patient);
                      setScannedByDispatch(prev => ({ ...prev, [activeDispatchId]: patient }));
                      try {
                        const matchEr = (Array.isArray(emergencies)?emergencies:[]).find(e=>String(e.patientId||e.patientID||'')===String(pid));
                        if (matchEr) setErScannedByEmergency(prev=>({ ...prev, [String(matchEr.id||matchEr._id)]: patient }));
                      } catch {}
                    }
                  } catch (_) {
                    const patient = { id: pid };
                    setScannedPatient(patient);
                    if (activeDispatchId) setScannedByDispatch(prev => ({ ...prev, [activeDispatchId]: patient }));
                    try {
                      const matchEr = (Array.isArray(emergencies)?emergencies:[]).find(e=>String(e.patientId||e.patientID||'')===String(pid));
                      if (matchEr) setErScannedByEmergency(prev=>({ ...prev, [String(matchEr.id||matchEr._id)]: patient }));
                    } catch {}
                  }
                  showToast('Patient validated successfully.', 'success');
                  stopQRScan();
                  if (openScannerFor) setOpenScannerFor(null); else setShowQR(false);
                } else {
                  showToast('Scanned patient does not match the current dispatch.', 'error');
                }
                return;
              }
              // No active dispatch: use scan to prefill Start Dispatch
              // Prevent starting new dispatch if emergency already completed
              const er = findEmergencyByPatientId(pid);
              if (er && isTerminalStatus(er.status)) {
                showToast('Emergency already completed. Cannot start a new dispatch.', 'error');
                stopQRScan();
                setShowQR(false);
                return;
              }
              await confirmEmergencyByPatientId(pid);
              stopQRScan();
              setShowQR(false);
              if (er) {
                setStartFor({
                  id: er.id || er._id,
                  patientId: pid,
                  pickupLocation: er.pickupLocation || '',
                  status: er.status || ''
                });
              } else {
                setStartFor({ patientId: pid, pickupLocation: '', status: '' });
              }
            }
          }
        } catch (_) {}
      }, 600);
    } catch (err) {
      setScanError('Unable to access camera. Grant permission or use manual input.');
    }
  };

  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }, []);
  const { showToast } = useNotification();
  const seenEmergencyIdsRef = useRef(new Set());
  const errorToastSentRef = useRef(false);

  const load = async () => {
    setLoading(true);
    try {
      const headers = {
        'X-Role': (user?.role || '').toUpperCase?.() || '',
        'X-User-Id': (user?.id || user?._id || user?.userId || '')
      };
      const [v, d] = await Promise.all([
        API.get('/ambulance/vehicles', { headers }),
        API.get('/ambulance/dispatches', { headers }),
      ]);
      setVehicles(Array.isArray(v.data) ? v.data : []);
      setDispatches(Array.isArray(d.data) ? d.data : []);
    } catch (_) {
      setVehicles([]); setDispatches([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Emergencies polling
  const loadEmergencies = async (notify = false) => {
    try {
      const res = await API.get('/emergency');
      const list = Array.isArray(res.data) ? res.data : [];
      if (notify) {
        // Initialize seen set from sessionStorage once
        try {
          if (seenEmergencyIdsRef.current.size === 0) {
            const raw = sessionStorage.getItem('seenEmergencyIds') || '[]';
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) arr.forEach(x=> seenEmergencyIdsRef.current.add(x));
          }
        } catch {}
        // Notify only for newly seen and status Requested
        for (const er of list) {
          const id = er.id || er._id;
          const st = (er.status || '').toLowerCase();
          if (!id) continue;
          if (st !== 'requested') continue;
          if (!seenEmergencyIdsRef.current.has(id)) {
            seenEmergencyIdsRef.current.add(id);
            showToast(`New emergency: ${er.patientName || 'Unknown'} (${er.severity || '—'})`, 'warning', 4000);
          }
        }
        // Persist seen ids
        try { sessionStorage.setItem('seenEmergencyIds', JSON.stringify(Array.from(seenEmergencyIdsRef.current))); } catch {}
        // If we haven't seen any before and list has items, surface a single toast (once per session)
        try {
          const queueNotified = sessionStorage.getItem('er_queue_notified') === '1';
          if (!queueNotified && seenEmergencyIdsRef.current.size === 0 && list.length > 0) {
            const latest = list[list.length - 1];
            showToast(`Emergency queue loaded: ${list.length} request(s). Latest: ${latest?.patientName || ''}`, 'info', 3000);
            sessionStorage.setItem('er_queue_notified', '1');
          }
        } catch {}
      }
      // Do not shrink seen set here; we persist across polls to avoid repeat toasts
      setEmergencies(list);
      try { console.debug('Emergencies fetched:', list); } catch {}
      errorToastSentRef.current = false;
    } catch (e) {
      setEmergencies([]);
      if (!errorToastSentRef.current) {
        showToast('Failed to fetch emergencies. Check your role or server.', 'error');
        errorToastSentRef.current = true;
      }
    }
  };
  const emerInitRef = useRef(false);
  useEffect(() => {
    if (tab !== 'emergencies') return;
    // Notify on first load only; then fetch on visibility changes (no interval)
    const tick = () => { if (!document.hidden) loadEmergencies(false); };
    if (!emerInitRef.current) {
      emerInitRef.current = true;
      loadEmergencies(true);
    }
    document.addEventListener('visibilitychange', tick);
    return () => { document.removeEventListener('visibilitychange', tick); };
  }, [tab]);

  const createVehicle = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      plateNumber: fd.get('plateNumber'),
      type: fd.get('type'),
      crewIds: [],
      status: fd.get('status') || 'Available',
      location: fd.get('location'),
      equipment: (fd.get('equipment') || '').split(',').map(s=>s.trim()).filter(Boolean)
    };
    if (editVehicle) {
      await API.put(`/ambulance/vehicles/${editVehicle.id || editVehicle._id}`, payload);
    } else {
      await API.post('/ambulance/vehicles', payload);
    }
    setShowVehicleModal(false); setEditVehicle(null);
    load(); e.currentTarget.reset();
    showToast('Vehicle created successfully', 'success');
  };

  const updateVehicleStatus = async (v, status) => {
    const body = { ...v, status };
    await API.put(`/ambulance/vehicles/${v.id || v._id}`, body);
    load();
    showToast('Vehicle status updated successfully', 'success');
  };

  const assignAmbulance = async (erId, ambulanceId) => {
    try {
      await API.put(`/emergency/${erId}/assign`, { ambulanceId });
      showToast('Ambulance assigned successfully', 'success');
      loadEmergencies(false);
    } catch (e) {
      showToast('Failed to assign ambulance', 'error');
    }
  };

  const updateEmergencyStatus = async (erId, status) => {
    try {
      await API.put(`/emergency/${ erId }/status`, { status });
      loadEmergencies(false);
    } catch (e) {
      // Surface but do not block dispatch flow
      try { console.warn('Failed to update emergency status', e); } catch {}
    }
  };

  // Find an emergency record by patientId (most recent match)
  const findEmergencyByPatientId = (pid) => {
    if (!pid) return null;
    const list = Array.isArray(emergencies) ? emergencies : [];
    // prioritize newest by reading from end
    for (let i = list.length - 1; i >= 0; i--) {
      const er = list[i];
      const erPid = er?.patientId || er?.patientID;
      if (String(erPid || '') === String(pid)) return er;
    }
    return null;
  };

  // Confirm an emergency by patientId to lock further dispatch actions
  const confirmEmergencyByPatientId = async (pid) => {
    const er = findEmergencyByPatientId(pid);
    if (!er) return;
    const curStatus = (er.status || '').toLowerCase();
    if (curStatus !== 'confirmed') {
      try {
        await updateEmergencyStatus(er.id || er._id, 'Confirmed');
        showToast('Emergency confirmed for patient.', 'success');
      } catch (_) {}
    }
  };

  const isTerminalStatus = (s) => {
    const v = (s || '').toLowerCase();
    return v === 'completed' || v === 'finished' || v === 'closed' || v === 'done';
  };

  const statusColor = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'available') return 'bg-emerald-100 text-emerald-700';
    if (v === 'enroute' || v === 'en-route') return 'bg-sky-100 text-sky-700';
    if (v === 'maintenance') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  };

  const createDispatch = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      ambulanceId: fd.get('ambulanceId'),
      paramedicId: user?.id || user?._id,
      patientId: fd.get('patientId') || null,
      pickupLocation: fd.get('pickupLocation'),
      dropoffLocation: fd.get('dropoffLocation'),
      status: 'Requested'
    };
    await API.post('/ambulance/dispatches', payload); load(); e.currentTarget.reset();
  };

  // Update dispatch status and clear local tracking if finished
  const updateDispatchStatus = async (dispatchId, status) => {
    try {
      if (!dispatchId) { showToast('Missing dispatch ID.', 'error'); return; }
      const existing = (dispatches || []).find(d => String(d.id || d._id) === String(dispatchId)) || {};
      const payload = { ...existing, status };
      const res = await API.put(`/ambulance/dispatches/${dispatchId}`, payload);
      const updated = res?.data || { ...existing, status };
      setDispatches(prev => (Array.isArray(prev) ? prev.map(d => (String(d.id || d._id) === String(dispatchId) ? updated : d)) : prev));
      try { window.dispatchEvent(new Event('dispatch:updated')); } catch {}
      const lower = (status || '').toLowerCase();
      if (['completed','finished','done','closed','canceled','cancelled','dropped'].includes(lower)) {
        if (String(activeDispatchId) === String(dispatchId)) {
          setActiveDispatchId(null);
          setCurrentDispatchPatientId('');
          setLastDispatchLink('');
        }
        showToast('Dispatch marked as finished.', 'success');
      } else {
        showToast('Dispatch status updated.', 'success');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update dispatch status';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar token={token} setToken={setToken} />
      <div className="flex-1 ml-64 px-8 pb-8">
        <Header token={token} setToken={setToken} />

        <div className="py-6">
          <div className="flex gap-3 mb-4">
            {['vehicles','dispatches','emergencies'].map(t => (
              <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded ${tab===t?'bg-primary text-white':'bg-white border'}`}>
                {t === 'emergencies' ? `EMERGENCIES (${emergencies.length})` : t.toUpperCase()}
              </button>
            ))}
            {loading && <span className="text-sm text-gray-500">Loading...</span>}
            <button onClick={()=>{setShowQR(true); setQrResult('');}} className="ml-auto inline-flex items-center gap-2 bg-white border px-3 py-2 rounded"><QrCode className="w-4 h-4"/> Scan Patient QR</button>
          </div>

          {tab==='vehicles' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Ambulance Fleet</h3>
                  <p className="text-sm text-gray-500">Manage vehicles, status and equipment</p>
                </div>
                <button onClick={()=>{setEditVehicle(null); setShowVehicleModal(true);}} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
                  <Plus className="w-4 h-4" /> Add Ambulance
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map(v => (
                  <div key={v.id || v._id} className="bg-white rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <AmbulanceIcon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{v.plateNumber} <span className="text-xs text-gray-500">({v.type})</span></div>
                          <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{v.location || 'Unknown'}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(v.status)}`}>{(v.status||'').toLowerCase()||'unknown'}</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">Equip: {(v.equipment||[]).join(', ') || '—'}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={()=>{setEditVehicle(v); setShowVehicleModal(true);}} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={()=>updateVehicleStatus(v, 'Available')} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Available
                      </button>
                      <button onClick={()=>updateVehicleStatus(v, 'EnRoute')} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <Route className="w-3 h-3 text-sky-600" /> En Route
                      </button>
                      <button onClick={()=>updateVehicleStatus(v, 'Maintenance')} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <Wrench className="w-3 h-3 text-amber-600" /> Maintenance
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {emergencies.length > 0 && (
                <div className="bg-white rounded-xl border p-4">
                  <h5 className="font-semibold mb-2 text-sm">Quick list</h5>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {emergencies.map(er => (
                      <li key={(er.id||er._id)+':row'}>
                        {(er.patientName||'Unknown')} · Severity: {(er.severity||'—')} · Pickup: {(er.pickupLocation||'—')} · PatientID: {(er.patientId||'—')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showVehicleModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl w-full max-w-lg p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">{editVehicle? 'Edit Ambulance':'Add Ambulance'}</h4>
                      <button onClick={()=>setShowVehicleModal(false)} className="text-gray-500">✕</button>
                    </div>
                    <form onSubmit={createVehicle} className="grid grid-cols-2 gap-3">
                      <input name="plateNumber" defaultValue={editVehicle?.plateNumber||''} placeholder="Plate Number" className="border p-2 rounded col-span-2" required />
                      <select name="type" defaultValue={editVehicle?.type||'BLS'} className="border p-2 rounded"><option>BLS</option><option>ALS</option><option>ICU</option></select>
                      <select name="status" defaultValue={editVehicle?.status||'Available'} className="border p-2 rounded"><option>Available</option><option>EnRoute</option><option>Maintenance</option></select>
                      <input name="location" defaultValue={editVehicle?.location||''} placeholder="Location" className="border p-2 rounded col-span-2" />
                      <input name="equipment" defaultValue={(editVehicle?.equipment||[]).join(', ')} placeholder="Equipment (comma separated)" className="border p-2 rounded col-span-2" />
                      <div className="col-span-2 flex justify-end gap-2 mt-2">
                        <button type="button" onClick={()=>setShowVehicleModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                        <button className="px-4 py-2 rounded bg-primary text-white">{editVehicle? 'Update':'Create'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {tab==='emergencies' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Emergency Requests</h3>
                  <p className="text-sm text-gray-500">Incoming patient emergencies</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>loadEmergencies(true)} className="px-3 py-2 rounded border bg-white text-sm">Refresh</button>
                  <button onClick={()=>setShowRaw(v=>!v)} className="px-3 py-2 rounded border bg-white text-sm">{showRaw?'Hide':'Show'} Raw</button>
                </div>
              </div>
              {emergencies.length === 0 && (
                <div className="bg-white rounded-xl border p-6 text-sm text-gray-600">No emergencies yet.</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencies.map(er => (
                  <div key={String(er.id || er._id)} className="bg-white rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-rose-600"/></div>
                        <div>
                          <div className="font-semibold">{er.patientName || er.name || 'Unknown Patient'}</div>
                          <div className="text-xs text-gray-500">Severity: {er.severity || '—'}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor((er.status||'').toLowerCase()==='assigned'?'available':er.status)}`}>{(er.status||'').toLowerCase()||'requested'}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">Pickup: {er.pickupLocation || er.location || '—'}</div>
                    <div className="mt-1 text-xs text-gray-600">Contact: {er.contactPhone || '—'}</div>
                    <div className="mt-1 text-xs text-gray-600">Patient ID: <span className="font-mono">{er.patientId || er.patientID || '—'}</span></div>
                    <div className="mt-1 text-[11px] text-gray-500">Requested: {er.requestedAt || '—'}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <button disabled={(er.status||'').toLowerCase()==='confirmed' || isTerminalStatus(er.status)} onClick={()=>setAssignFor(er)} className={`text-xs inline-flex items-center gap-1 px-3 py-1 rounded border ${(((er.status||'').toLowerCase()==='confirmed') || isTerminalStatus(er.status))?'opacity-50 cursor-not-allowed':''}`}>
                        <AmbulanceIcon className="w-3 h-3" /> Assign Ambulance
                      </button>
                      <button disabled={(er.status||'').toLowerCase()==='confirmed' || isTerminalStatus(er.status)} onClick={()=>setStartFor(er)} className={`text-xs inline-flex items-center gap-1 px-3 py-1 rounded border ${(((er.status||'').toLowerCase()==='confirmed') || isTerminalStatus(er.status))?'opacity-50 cursor-not-allowed':''}`}>
                        <Route className="w-3 h-3" /> Start Dispatch
                      </button>
                      <button onClick={()=> openEmergencyModalScanner(er)} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">Scan Patient QR</button>
                      <button onClick={()=>{
                        const d = findActiveDispatchByPatientId(er.patientId || er.patientID);
                        if (d) { openConditionForm(d); return; }
                        // No active dispatch: open Start Dispatch modal prefilled from this emergency
                        setStartFor(er);
                        showToast('Start the dispatch to fill the patient condition form.', 'info');
                      }} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">Patient Condition</button>
                      <button onClick={()=>updateEmergencyStatus(er.id||er._id, 'Completed')} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                      </button>
                    </div>
                    {/* Verified patient details for this emergency */}
                    {erScannedByEmergency[String(er.id || er._id)] && (
                      <div className="mt-2 p-2 border rounded bg-emerald-50">
                        <div className="text-sm font-medium">Patient verified</div>
                        <div className="text-xs text-gray-700">Name: {erScannedByEmergency[String(er.id || er._id)].name || '—'} • Email: {erScannedByEmergency[String(er.id || er._id)].email || '—'} • ID: <span className="font-mono">{erScannedByEmergency[String(er.id || er._id)].id || erScannedByEmergency[String(er.id || er._id)]._id || '—'}</span></div>
                        <div className="text-[11px] text-emerald-700 mt-1">Linked dispatch marked Arrived.</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {emergencies.length > 0 && (
                <div className="bg-white rounded-xl border p-4">
                  <h5 className="font-semibold mb-2 text-sm">Quick list</h5>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {emergencies.map(er => (
                      <li key={(er.id||er._id)+':row'}>
                        {(er.patientName||er.name||'Unknown')} · Severity: {(er.severity||'—')} · Pickup: {(er.pickupLocation||er.location||'—')} · PatientID: {(er.patientId||er.patientID||'—')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {startFor && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl w-full max-w-md p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Start Dispatch</h4>
                      <button onClick={()=>setStartFor(null)} className="text-gray-500">✕</button>
                    </div>
                    <form onSubmit={async (e)=>{
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const payload = {
                        ambulanceId: fd.get('ambulanceId'),
                        paramedicId: (user?.id || user?._id || user?.userId),
                        patientId: startFor.patientId,
                        pickupLocation: fd.get('pickupLocation') || startFor.pickupLocation || '',
                        dropoffLocation: fd.get('dropoffLocation') || ''
                      };
                      if (!payload.ambulanceId) { showToast('Select an ambulance.', 'error'); return; }
                      if (!payload.pickupLocation) { showToast('Pickup location is required.', 'error'); return; }
                      // Prevent creating dispatch only if the selected emergency is terminal
                      if (startFor && isTerminalStatus(startFor.status)) {
                        showToast('This emergency is already completed. Dispatch cannot be started.', 'error');
                        return;
                      }
                      try {
                        const res = await API.post('/ambulance/dispatches', payload);
                        await load();
                        showToast('Dispatch started', 'success');
                        setStartFor(null);
                        // Optionally mark emergency as Assigned if not already
                        if ((startFor?.status||'').toLowerCase() !== 'assigned' && (startFor?.id || startFor?._id)) {
                          await updateEmergencyStatus(startFor.id||startFor._id, 'Assigned');
                        }
                        const newId = res?.data?.id || res?.data?._id;
                        if (newId) {
                          setActiveDispatchId(newId);
                          setCurrentDispatchPatientId(payload.patientId || '');
                          const link = `/track/${newId}`;
                          setLastDispatchLink(link);
                          showToast(`Share tracking link with patient: ${link}`, 'info', 5000);
                          // Auto-open condition form for convenience
                          try { openConditionForm(res.data || { id: newId, _id: newId, patientId: payload.patientId }); } catch {}
                        }
                      } catch (err) {
                        const status = err?.response?.status;
                        const msg = err?.response?.data?.message || err?.message || 'Unknown error';
                        try { console.error('Start dispatch failed:', err); } catch {}
                        showToast(`Failed to start dispatch${status? ' ('+status+')':''}. ${msg}`, 'error');
                      }
                    }} className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500">Patient ID</div>
                        <div className="font-mono text-sm">{startFor.patientId || '— (scan QR to set)'}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Ambulance</label>
                        <select name="ambulanceId" defaultValue={startFor.assignedAmbulanceId || (vehicles[0]?.id||vehicles[0]?._id)} className="w-full border p-2 rounded">
                          {vehicles.map(v => (<option key={v.id||v._id} value={v.id||v._id}>{v.plateNumber} ({v.type})</option>))}
                        </select>
                      </div>
                      <input name="pickupLocation" defaultValue={startFor.pickupLocation || ''} placeholder="Pickup Location" className="w-full border p-2 rounded" />
                      <input name="dropoffLocation" placeholder="Dropoff Location (optional)" className="w-full border p-2 rounded" />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={()=>setStartFor(null)} className="px-4 py-2 rounded border">Cancel</button>
                        <button disabled={!startFor?.patientId} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed">Start</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {showQR && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={(e)=>{ if (e.target===e.currentTarget) { stopQRScan(); setShowQR(false); } }}>
              <div className="bg-white rounded-xl w-full max-w-md p-6 border" role="dialog" aria-modal="true">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Scan Patient QR</h4>
                  <button onClick={()=>{ stopQRScan(); setShowQR(false); }} className="text-gray-500">✕</button>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Point camera at the patient's QR. Format: <code>patient:&lt;id&gt;</code></p>
                  <div className="rounded border overflow-hidden bg-black">
                    <video ref={videoRef} className="w-full h-56 object-cover" autoPlay playsInline muted />
                  </div>
                  {scanning && <div className="text-xs text-gray-500">Scanning…</div>}
                  {scanError && <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">{scanError}</div>}
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>{ stopQRScan(); setShowQR(false); }} className="px-4 py-2 rounded border">Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==='dispatches' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 border">
                <h3 className="font-semibold mb-3">Create Dispatch</h3>
                {lastDispatchLink && (
                  <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-sm flex items-center justify-between">
                    <span>Tracking link: <code className="font-mono">{lastDispatchLink}</code></span>
                    <button onClick={()=>{navigator.clipboard?.writeText?.(window.location.origin + lastDispatchLink); showToast('Copied link to clipboard', 'success');}} className="px-2 py-1 border rounded bg-white">Copy</button>
                  </div>
                )}
                <form onSubmit={createDispatch} className="grid grid-cols-2 gap-3">
                  <select name="ambulanceId" className="border p-2 rounded" required>
                    {vehicles.map(v => (<option key={v.id} value={v.id}>{v.plateNumber} ({v.type})</option>))}
                  </select>
                  <input name="patientId" placeholder="Patient ID (optional)" className="border p-2 rounded" />
                  <input name="pickupLocation" placeholder="Pickup Location" className="border p-2 rounded col-span-2" required />
                  <input name="dropoffLocation" placeholder="Dropoff Location" className="border p-2 rounded col-span-2" required />
                  <button className="col-span-2 bg-primary text-white rounded py-2">Create</button>
                </form>
              </div>
              <div className="bg-white rounded-xl p-4 border">
                <h3 className="font-semibold mb-3">Dispatches</h3>
                {scannedPatient && activeDispatchId && (
                  <div className="mb-3 p-3 border rounded bg-sky-50">
                    <div className="text-sm font-medium">Patient verified for dispatch {activeDispatchId}</div>
                    <div className="text-xs text-gray-700">Name: {scannedPatient.name || '—'} • Email: {scannedPatient.email || '—'} • ID: <span className="font-mono">{scannedPatient.id || scannedPatient._id || '—'}</span></div>
                    <div className="text-[11px] text-sky-700 mt-1">Status set to Arrived.</div>
                  </div>
                )}
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {dispatches.map(d => (
                    <div key={d.id || d._id} className="border rounded p-2">
                      <div className="font-medium">{vehicles.find(v=>v.id===d.ambulanceId)?.plateNumber || d.ambulanceId} → {d.dropoffLocation}</div>
                      <div className="text-xs text-gray-600">{d.status} • Pickup: {d.pickupLocation} • Requested: {d.requestedAt ? new Date(d.requestedAt).toLocaleString(): '-'}</div>
                      <div className="mt-2 flex items-center gap-2">
                        {!(String(d.status||'').toLowerCase() === 'completed' || String(d.status||'').toLowerCase() === 'finished' || String(d.status||'').toLowerCase() === 'closed') && (
                          <>
                            <button onClick={()=>{ const id = (d.id || d._id || null); if (!id) return; setScannedPatient(null); if (!openScanners.includes(id)) setOpenScanners(prev => [...prev, id]); setTimeout(()=> startInlineScan(id, d.patientId || ''), 100); }} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">Scan Patient QR</button>
                            <button onClick={()=>openConditionForm(d)} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">Patient Condition</button>
                            <button onClick={()=>updateDispatchStatus(d.id || d._id, 'Completed')} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">Finish</button>
                          </>
                        )}
                      </div>
                      {/* Inline QR Scanner for this dispatch */}
                      {openScanners.includes(d.id || d._id) && (
                        <div className="mt-2 p-2 border rounded bg-gray-50">
                          <div className="text-xs text-gray-600 mb-1">Scan patient's QR for this dispatch (expects ID: <span className="font-mono">{d.patientId || '—'}</span>)</div>
                          <div className="rounded border overflow-hidden bg-black">
                            <video ref={el => { if (el) videoRefs.current[d.id || d._id] = el; }} className="w-full h-40 object-cover" autoPlay playsInline muted />
                          </div>
                          {scanningById[d.id || d._id] && <div className="text-[11px] text-gray-500 mt-1">Scanning…</div>}
                          {scanErrorById[d.id || d._id] && <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-1 rounded mt-1">{scanErrorById[d.id || d._id]}</div>}
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={()=>{ const id = (d.id || d._id); stopInlineScan(id); setOpenScanners(prev => prev.filter(x => x !== id)); }} className="px-2 py-1 rounded border text-xs">Close Scanner</button>
                          </div>
                        </div>
                      )}
                      {/* Per-dispatch verified patient details */}
                      {scannedByDispatch[(d.id || d._id)] && (
                        <div className="mt-2 p-2 border rounded bg-emerald-50">
                          <div className="text-sm font-medium">Patient verified</div>
                          <div className="text-xs text-gray-700">Name: {scannedByDispatch[d.id || d._id].name || '—'} • Email: {scannedByDispatch[d.id || d._id].email || '—'} • ID: <span className="font-mono">{scannedByDispatch[d.id || d._id].id || scannedByDispatch[d.id || d._id]._id || '—'}</span></div>
                          <div className="text-[11px] text-emerald-700 mt-1">Dispatch status set to Arrived.</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showCondition && conditionDispatch && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-lg p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Patient Condition</h4>
                  <button onClick={()=>{ if(!condSubmitting){ setShowCondition(false); setConditionDispatch(null);} }} className="text-gray-500">✕</button>
                </div>
                <form onSubmit={submitCondition} className="grid grid-cols-2 gap-3">
                  <input name="bpSystolic" placeholder="BP Systolic" className="border p-2 rounded" />
                  <input name="bpDiastolic" placeholder="BP Diastolic" className="border p-2 rounded" />
                  <input name="pulse" placeholder="Pulse (bpm)" className="border p-2 rounded" />
                  <input name="respRate" placeholder="Resp Rate" className="border p-2 rounded" />
                  <input name="spo2" placeholder="SpO2 %" className="border p-2 rounded" />
                  <input name="temperature" placeholder="Temp (°C)" className="border p-2 rounded" />
                  <input name="consciousnessLevel" placeholder="Consciousness Level" className="border p-2 rounded col-span-2" />
                  <input name="painScale" placeholder="Pain Scale 0-10" className="border p-2 rounded" />
                  <input name="allergies" placeholder="Allergies" className="border p-2 rounded" />
                  <input name="medicationsGiven" placeholder="Medications Given" className="border p-2 rounded col-span-2" />
                  <input name="injuries" placeholder="Injuries" className="border p-2 rounded col-span-2" />
                  <textarea name="notes" placeholder="Notes" className="border p-2 rounded col-span-2" rows="3"></textarea>
                  <div className="col-span-2 flex justify-end gap-2 mt-2">
                    <button type="button" onClick={()=>{ if(!condSubmitting){ setShowCondition(false); setConditionDispatch(null);} }} className="px-4 py-2 rounded border">Cancel</button>
                    <button disabled={condSubmitting} className="px-4 py-2 rounded bg-primary text-white">{condSubmitting? 'Submitting...' : 'Submit'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParamedicsDashboard;
