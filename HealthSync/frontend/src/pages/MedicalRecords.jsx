import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MedicalRecordForm from '../components/MedicalRecordForm';
import Logo from '../assets/LogoWHITE.png';
import API from '../services/api';
import { useLocation } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  User,
  Eye,
  Download,
  Filter,
  ChevronDown,
  Activity,
  Pill,
  Stethoscope,
  X
} from 'lucide-react';

const MedicalRecords = () => {
  const [token, setToken] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [patientListModal, setPatientListModal] = useState({ open: false, patientName: '', patientId: '', items: [] });
  const [filterDate, setFilterDate] = useState('');
  const location = useLocation();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const role = user?.role?.toUpperCase?.() || '';
  const userId = user?.id || user?._id;
  const [conditionReports, setConditionReports] = useState([]);
  const [loadingCR, setLoadingCR] = useState(false);

  // Normalize backend records to UI shape used by the page/modals
  const transformRecord = (rec) => {
    if (!rec) return rec;
    // If already normalized, return as-is
    if (rec.vitalSigns && typeof rec.vitalSigns === 'object') return rec;
    return {
      ...rec,
      vitalSigns: {
        bloodPressure: rec.vitalBloodPressure || rec?.vitals?.bloodPressure || '',
        heartRate: rec.vitalHeartRate || rec?.vitals?.heartRate || '',
        temperature: rec.vitalTemperature || rec?.vitals?.temperature || '',
        respiratoryRate: rec.vitalRespiratoryRate || rec?.vitals?.respiratoryRate || '',
        oxygenSaturation: rec.vitalOxygenSaturation || rec?.vitals?.oxygenSaturation || '',
      },
    };
  };

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    const loadCR = async () => {
      const pid = user?.id || user?._id || user?.userId;
      if (role !== 'PATIENT' || !pid) { setConditionReports([]); return; }
      try {
        setLoadingCR(true);
        const res = await API.get(`/condition-reports`, { 
          params: { patientId: pid },
          headers: { 'X-User-Role': role, 'X-User-Id': pid }
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setConditionReports(list);
      } catch (_) {
        setConditionReports([]);
      } finally {
        setLoadingCR(false);
      }
    };
    loadCR();
    const onUpd = () => loadCR();
    window.addEventListener('dispatch:updated', onUpd);
    return () => window.removeEventListener('dispatch:updated', onUpd);
  }, [role, userId]);

  useEffect(() => {
    const handler = () => loadRecords();
    window.addEventListener('medical:updated', handler);
    return () => window.removeEventListener('medical:updated', handler);
  }, []);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, filterDate, records]);

  const loadRecords = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const roomId = params.get('roomId');
      let data = [];
      if (roomId) {
        const res = await API.get(`/medical-records/room/${roomId}`);
        data = Array.isArray(res.data) ? res.data.map(transformRecord) : [];
      } else if (role === 'PATIENT') {
        const res = await API.get(`/medical-records/patient/${userId}`);
        data = Array.isArray(res.data) ? res.data.map(transformRecord) : [];
      } else if (role === 'DOCTOR') {
        const res = await API.get(`/medical-records/doctor/${userId}`);
        data = Array.isArray(res.data) ? res.data.map(transformRecord) : [];
      } else {
        data = [];
      }
      setRecords(data);
      setFilteredRecords(data);
    } catch (e) {
      setRecords([]);
      setFilteredRecords([]);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter(record => 
        record.consultationDate === filterDate
      );
    }

    setFilteredRecords(filtered);
  };

  const handleSaveRecord = (recordData) => {
    loadRecords();
    setShowForm(false);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
  };

  const handleViewPatientRecords = async (record) => {
    try {
      const pid = record.patientId || '';
      let items = [];
      if (pid) {
        const res = await API.get(`/medical-records/patient/${pid}`);
        items = Array.isArray(res.data) ? res.data.map(transformRecord) : [];
      } else {
        items = records.filter(r => r.patientName === record.patientName).map(transformRecord);
      }
      setPatientListModal({ open: true, patientName: record.patientName, patientId: pid, items });
    } catch (e) {
      setPatientListModal({ open: true, patientName: record.patientName, patientId: record.patientId || '', items: [] });
    }
  };

  // Dynamically load a script if needed
  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });

  const handleDownloadRecord = async (record) => {
    try {
      // Load libraries on demand from CDN (no npm install required)
      await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.background = '#ffffff';
      container.style.padding = '0';
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; color:#333;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color:#fff; padding:24px; text-align:center;">
            <div style="font-size:28px; font-weight:700;">HealthSync</div>
            <div style="font-size:14px; opacity:.9;">Medical Record Document</div>
          </div>
          <div style="padding:24px;">
            <div style="margin-bottom:16px; border-bottom:2px solid #e5e7eb; padding-bottom:12px; color:#14b8a6; font-weight:700;">Patient Information</div>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;">
              <div style="background:#f9fafb; padding:10px; border-radius:8px;">
                <div style="font-size:12px; color:#6b7280; font-weight:600;">Full Name</div>
                <div style="font-size:14px; color:#111827; font-weight:500;">${record.patientName}</div>
              </div>
              <div style="background:#f9fafb; padding:10px; border-radius:8px;">
                <div style="font-size:12px; color:#6b7280; font-weight:600;">Age</div>
                <div style="font-size:14px; color:#111827; font-weight:500;">${record.patientAge} years</div>
              </div>
              <div style="background:#f9fafb; padding:10px; border-radius:8px;">
                <div style="font-size:12px; color:#6b7280; font-weight:600;">Gender</div>
                <div style="font-size:14px; color:#111827; font-weight:500;">${record.patientGender}</div>
              </div>
            </div>

            <div style="margin-top:20px; margin-bottom:16px; border-bottom:2px solid #e5e7eb; padding-bottom:12px; color:#14b8a6; font-weight:700;">Chief Complaint & Symptoms</div>
            <div style="background:#f9fafb; padding:10px; border-radius:8px; margin-bottom:10px;">
              <div style="font-size:12px; color:#6b7280; font-weight:600;">Chief Complaint</div>
              <div style="font-size:14px; color:#111827; font-weight:500;">${record.chiefComplaint}</div>
            </div>
            ${record.symptoms ? `
            <div style="background:#f9fafb; padding:10px; border-radius:8px;">
              <div style="font-size:12px; color:#6b7280; font-weight:600;">Symptoms</div>
              <div style="font-size:14px; color:#111827; font-weight:500;">${record.symptoms}</div>
            </div>` : ''}

            ${record.vitalSigns && Object.values(record.vitalSigns).some(v => v) ? `
            <div style="margin-top:20px; margin-bottom:16px; border-bottom:2px solid #e5e7eb; padding-bottom:12px; color:#14b8a6; font-weight:700;">Vital Signs</div>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;">
              ${record.vitalSigns.bloodPressure ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Blood Pressure</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.vitalSigns.bloodPressure}</div></div>` : ''}
              ${record.vitalSigns.heartRate ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Heart Rate</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.vitalSigns.heartRate} bpm</div></div>` : ''}
              ${record.vitalSigns.temperature ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Temperature</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.vitalSigns.temperature}°F</div></div>` : ''}
              ${record.vitalSigns.respiratoryRate ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Respiratory Rate</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.vitalSigns.respiratoryRate} /min</div></div>` : ''}
              ${record.vitalSigns.oxygenSaturation ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">O2 Saturation</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.vitalSigns.oxygenSaturation}%</div></div>` : ''}
            </div>` : ''}

            ${(record.medicalHistory || record.allergies) ? `
              <div style=\"margin-top:20px; margin-bottom:16px; border-bottom:2px solid #e5e7eb; padding-bottom:12px; color:#14b8a6; font-weight:700;\">Medical History</div>
              ${record.medicalHistory ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px; margin-bottom:10px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Medical History</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.medicalHistory}</div></div>` : ''}
              ${record.allergies ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Allergies</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.allergies}</div></div>` : ''}
            ` : ''}

            <div style="margin-top:20px; margin-bottom:16px; border-bottom:2px solid #e5e7eb; padding-bottom:12px; color:#14b8a6; font-weight:700;">Diagnosis</div>
            <div style="background:#f9fafb; padding:10px; border-radius:8px; margin-bottom:10px;">
              <div style="font-size:12px; color:#6b7280; font-weight:600;">Primary Diagnosis</div>
              <div style="font-size:14px; color:#111827; font-weight:500;">${record.diagnosis}</div>
            </div>

            ${(record.currentMedications || record.prescribedMedications || record.labTests) ? `
              <div style=\"margin-top:20px; margin-bottom:16px; border-bottom:2px solid #e5e7eb; padding-bottom:12px; color:#14b8a6; font-weight:700;\">Medications & Treatment</div>
              ${record.currentMedications ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px; margin-bottom:10px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Current Medications</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.currentMedications}</div></div>` : ''}
              ${record.prescribedMedications ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px; margin-bottom:10px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Prescribed Medications</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.prescribedMedications}</div></div>` : ''}
              ${record.labTests ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Lab Tests Ordered</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.labTests}</div></div>` : ''}
            ` : ''}

            ${(record.recommendations || record.notes || record.followUpDate) ? `
              <div style=\"margin-top:20px; margin-bottom:16px; border-bottom:2px solid #e5e7eb; padding-bottom:12px; color:#14b8a6; font-weight:700;\">Recommendations & Follow-up</div>
              ${record.recommendations ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px; margin-bottom:10px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Recommendations</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.recommendations}</div></div>` : ''}
              ${record.notes ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px; margin-bottom:10px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Additional Notes</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${record.notes}</div></div>` : ''}
              ${record.followUpDate ? `<div style=\"background:#f9fafb; padding:10px; border-radius:8px;\"><div style=\"font-size:12px; color:#6b7280; font-weight:600;\">Follow-up Date</div><div style=\"font-size:14px; color:#111827; font-weight:500;\">${new Date(record.followUpDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>` : ''}
            ` : ''}
          </div>

          <div style="background:#f9fafb; padding:16px; text-align:center; font-size:12px; color:#6b7280; border-top:2px solid #e5e7eb;">
            <div><strong>HealthSync Medical Records</strong></div>
            <div>This is a computer-generated document and does not require a signature.</div>
            <div>Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      `;

      document.body.appendChild(container);
      const canvas = await window.html2canvas(container, { scale: 2, useCORS: true });
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'pt', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = canvas.height * (imgWidth / canvas.width);

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `medical_record_${(record.patientName || 'patient').replace(/\s+/g, '_')}_${record.consultationDate}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar token={token} setToken={setToken} />

      <div className="flex-1 ml-64 px-8 pb-8">
        <Header token={token} setToken={setToken} />

        <div className="py-8">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="text-primary" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Medical Records</h1>
                  <p className="text-gray-600 mt-1">Manage patient medical records and consultations</p>
                </div>
              </div>
              {role === 'DOCTOR' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium shadow-md"
                >
                  <Plus size={20} />
                  New Record
                </button>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Records
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by patient name, diagnosis, or complaint..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            {(searchTerm || filterDate) && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing {filteredRecords.length} of {records.length} records
                </span>
                {(searchTerm || filterDate) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterDate('');
                    }}
                    className="text-sm text-primary hover:text-green-600 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Paramedic Condition Reports (Patient) */}
          {role === 'PATIENT' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-100 p-2 rounded-lg"><Activity className="text-sky-700" size={20} /></div>
                  <h2 className="text-xl font-semibold text-gray-800">Paramedic Condition Reports</h2>
                </div>
                {loadingCR && <span className="text-sm text-gray-500">Loading...</span>}
              </div>
              {(!conditionReports || conditionReports.length === 0) ? (
                <div className="text-sm text-gray-600">No condition reports yet.</div>
              ) : (
                <div className="space-y-2">
                  {conditionReports.map((r, idx) => (
                    <div key={(r.id||r._id||idx)+':cr'} className="border rounded p-3 text-sm text-gray-700">
                      <div className="text-gray-500 text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                      <div className="mt-1">Vitals: BP {r.bpSystolic??'—'}/{r.bpDiastolic??'—'}, Pulse {r.pulse??'—'} bpm, Resp {r.respRate??'—'} rpm, SpO2 {r.spo2??'—'}%, Temp {r.temperature??'—'}°C</div>
                      <div>Consciousness: {r.consciousnessLevel || '—'} • Pain: {r.painScale ?? '—'}</div>
                      <div>Allergies: {r.allergies || '—'}</div>
                      <div>Medications Given: {r.medicationsGiven || '—'}</div>
                      <div>Injuries: {r.injuries || '—'}</div>
                      {r.notes && <div className="text-gray-600">Notes: {r.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Records List */}
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Medical Records Found</h3>
                <p className="text-gray-600 mb-6">
                  {records.length === 0 
                    ? "Start by creating a new medical record for your patients."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {records.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Create First Record
                  </button>
                )}
              </div>
            ) : (
              filteredRecords.map((record, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <User className="text-primary" size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{record.patientName}</h3>
                            <p className="text-sm text-gray-600">
                              {record.patientAge} years • {record.patientGender}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-start gap-2">
                            <Calendar className="text-gray-400 mt-1" size={16} />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Consultation Date</p>
                              <p className="text-sm text-gray-800">{new Date(record.consultationDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Stethoscope className="text-gray-400 mt-1" size={16} />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Chief Complaint</p>
                              <p className="text-sm text-gray-800">{record.chiefComplaint}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Activity className="text-gray-400 mt-1" size={16} />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Diagnosis</p>
                              <p className="text-sm text-gray-800">{record.diagnosis}</p>
                            </div>
                          </div>
                          
                          {record.prescribedMedications && (
                            <div className="flex items-start gap-2">
                              <Pill className="text-gray-400 mt-1" size={16} />
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Prescribed Medications</p>
                                <p className="text-sm text-gray-800 line-clamp-2">{record.prescribedMedications}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewPatientRecords(record)}
                          className="p-2 text-primary hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleDownloadRecord(record)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Record"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Patient Records List Modal */}
      {patientListModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8">
            <div className="bg-gradient-to-r from-primary to-primary text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={24} />
                <div>
                  <h2 className="text-xl font-bold">Records for {patientListModal.patientName}</h2>
                  {patientListModal.items?.length >= 0 && (
                    <p className="text-green-100 text-sm">{patientListModal.items.length} record(s)</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPatientListModal({ open: false, patientName: '', patientId: '', items: [] })}
                className="text-white hover:bg-green-700 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-240px)] overflow-y-auto">
              {patientListModal.items.length === 0 ? (
                <div className="text-center text-gray-600 py-12">No records found for this patient.</div>
              ) : (
                <div className="space-y-3">
                  {patientListModal.items.map((item, i) => (
                    <div key={i} className="border rounded-lg p-4 flex items-start justify-between hover:bg-gray-50">
                      <div className="space-y-1">
                        <div className="text-gray-900 font-semibold">{item.diagnosis}</div>
                        <div className="text-sm text-gray-600">Consultation: {new Date(item.consultationDate).toLocaleDateString()}</div>
                        {item.chiefComplaint && (
                          <div className="text-sm text-gray-700 line-clamp-2">{item.chiefComplaint}</div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleDownloadRecord(item)}
                          className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => { setSelectedRecord(item); setPatientListModal({ open: false, patientName: '', patientId: '', items: [] }); }}
                          className="px-3 py-2 text-primary hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Medical Record Form Modal */}
      {showForm && (
        <MedicalRecordForm
          onClose={() => setShowForm(false)}
          onSave={handleSaveRecord}
        />
      )}

      {/* View Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={28} />
                <div>
                  <h2 className="text-2xl font-bold">Medical Record Details</h2>
                  <p className="text-green-100 text-sm">{selectedRecord.patientName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-white hover:bg-green-700 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Patient Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-800">{selectedRecord.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium text-gray-800">{selectedRecord.patientAge} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium text-gray-800">{selectedRecord.patientGender}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Consultation Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-800">{new Date(selectedRecord.consultationDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chief Complaint</p>
                    <p className="font-medium text-gray-800">{selectedRecord.chiefComplaint}</p>
                  </div>
                  {selectedRecord.symptoms && (
                    <div>
                      <p className="text-sm text-gray-600">Symptoms</p>
                      <p className="font-medium text-gray-800">{selectedRecord.symptoms}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vital Signs */}
              {Object.values(selectedRecord.vitalSigns).some(v => v) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Vital Signs
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedRecord.vitalSigns.bloodPressure && (
                      <div>
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.bloodPressure}</p>
                      </div>
                    )}
                    {selectedRecord.vitalSigns.heartRate && (
                      <div>
                        <p className="text-sm text-gray-600">Heart Rate</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.heartRate}</p>
                      </div>
                    )}
                    {selectedRecord.vitalSigns.temperature && (
                      <div>
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.temperature}</p>
                      </div>
                    )}
                    {selectedRecord.vitalSigns.respiratoryRate && (
                      <div>
                        <p className="text-sm text-gray-600">Respiratory Rate</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.respiratoryRate}</p>
                      </div>
                    )}
                    {selectedRecord.vitalSigns.oxygenSaturation && (
                      <div>
                        <p className="text-sm text-gray-600">O2 Saturation</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.oxygenSaturation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical History & Diagnosis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Stethoscope size={20} className="text-primary" />
                  Medical History & Diagnosis
                </h3>
                <div className="space-y-3">
                  {selectedRecord.medicalHistory && (
                    <div>
                      <p className="text-sm text-gray-600">Medical History</p>
                      <p className="font-medium text-gray-800">{selectedRecord.medicalHistory}</p>
                    </div>
                  )}
                  {selectedRecord.allergies && (
                    <div>
                      <p className="text-sm text-gray-600">Allergies</p>
                      <p className="font-medium text-gray-800">{selectedRecord.allergies}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Diagnosis</p>
                    <p className="font-medium text-gray-800">{selectedRecord.diagnosis}</p>
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Pill size={20} className="text-primary" />
                  Medications & Treatment
                </h3>
                <div className="space-y-3">
                  {selectedRecord.currentMedications && (
                    <div>
                      <p className="text-sm text-gray-600">Current Medications</p>
                      <p className="font-medium text-gray-800">{selectedRecord.currentMedications}</p>
                    </div>
                  )}
                  {selectedRecord.prescribedMedications && (
                    <div>
                      <p className="text-sm text-gray-600">Prescribed Medications</p>
                      <p className="font-medium text-gray-800">{selectedRecord.prescribedMedications}</p>
                    </div>
                  )}
                  {selectedRecord.labTests && (
                    <div>
                      <p className="text-sm text-gray-600">Lab Tests Ordered</p>
                      <p className="font-medium text-gray-800">{selectedRecord.labTests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {(selectedRecord.recommendations || selectedRecord.notes) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    Recommendations & Notes
                  </h3>
                  <div className="space-y-3">
                    {selectedRecord.recommendations && (
                      <div>
                        <p className="text-sm text-gray-600">Recommendations</p>
                        <p className="font-medium text-gray-800">{selectedRecord.recommendations}</p>
                      </div>
                    )}
                    {selectedRecord.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Additional Notes</p>
                        <p className="font-medium text-gray-800">{selectedRecord.notes}</p>
                      </div>
                    )}
                    {selectedRecord.followUpDate && (
                      <div>
                        <p className="text-sm text-gray-600">Follow-up Date</p>
                        <p className="font-medium text-gray-800">{new Date(selectedRecord.followUpDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => handleDownloadRecord(selectedRecord)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
