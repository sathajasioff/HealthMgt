import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AppointmentList from '../components/AppointmentList';
import Overview from '../components/Overview';
import ProductsAvailability from '../components/ProductsAvailability';
import PatientAvailabilityModal from '../components/PatientAvailabilityModal';
import { UserPlus, AlertTriangle } from 'lucide-react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPatients, setNewPatients] = useState([]);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    
    // Determine user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const { showToast } = useNotification();
    const role = user?.role?.toUpperCase();
    const isDoctor = role === 'DOCTOR';
    const isPatient = role === 'PATIENT';

    // Load appointments from localStorage on component mount
    useEffect(() => {
        const loadAppointments = () => {
            const savedAppointments = JSON.parse(localStorage.getItem('newPatients') || '[]');
            setNewPatients(savedAppointments);
        };
        loadAppointments();
        const interval = setInterval(loadAppointments, 1000);
        return () => clearInterval(interval);
    }, []);

    const handlePatientSubmit = (patientData) => {
        if (editingIndex !== null) {
            // Editing existing appointment
            const updatedPatients = [...newPatients];
            updatedPatients[editingIndex] = {
                ...updatedPatients[editingIndex],
                patient: patientData.patientName,
                patientAge: patientData.age,
                patientGender: patientData.gender,
                healthIssue: patientData.healthIssue,
                time: patientData.selectedTime || updatedPatients[editingIndex].time
            };
            setNewPatients(updatedPatients);
            localStorage.setItem('newPatients', JSON.stringify(updatedPatients));
            setEditingAppointment(null);
            setEditingIndex(null);
        } else {
            // Creating new appointment
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
            const currentTime = `${displayHours}:${displayMinutes} ${ampm}`;

            const newAppointment = {
                name: 'Dr. Available',
                specialization: 'General Physician',
                time: patientData.selectedTime || currentTime,
                patient: patientData.patientName,
                patientAge: patientData.age,
                patientGender: patientData.gender,
                healthIssue: patientData.healthIssue,
                status: 'Waiting',
                statusColor: 'bg-yellow-500',
                type: 'Scheduled',
                isNew: true
            };

            const updatedPatients = [newAppointment, ...newPatients];
            setNewPatients(updatedPatients);
            localStorage.setItem('newPatients', JSON.stringify(updatedPatients));
        }
    };

    const handleEditAppointment = (appointment, index) => {
        setEditingAppointment(appointment);
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const handleDeleteAppointment = (index) => {
        const updatedPatients = newPatients.filter((_, i) => i !== index);
        setNewPatients(updatedPatients);
        localStorage.setItem('newPatients', JSON.stringify(updatedPatients));
    };

    // Emergency Request (Patient Only)
    const [showEmergency, setShowEmergency] = useState(false);
    const [erPickup, setErPickup] = useState('');
    const [erPhone, setErPhone] = useState('');
    const [erSeverity, setErSeverity] = useState('HIGH');
    const [trackId, setTrackId] = useState('');
    const [latestDispatchId, setLatestDispatchId] = useState('');
    const [latestDispatchStatus, setLatestDispatchStatus] = useState('');
    const [latestEmergencyStatus, setLatestEmergencyStatus] = useState('');
    const [pollEmergencies, setPollEmergencies] = useState(false);
    const [conditionReports, setConditionReports] = useState([]);

    // Restore latest dispatch info from sessionStorage to keep Track card visible across route changes until completion
    useEffect(() => {
        try {
            const savedId = sessionStorage.getItem('latestDispatchId') || '';
            const savedStatus = sessionStorage.getItem('latestDispatchStatus') || '';
            const savedTrack = sessionStorage.getItem('trackId') || '';
            if (savedId) setLatestDispatchId(savedId);
            if (savedStatus) setLatestDispatchStatus(savedStatus);
            if (savedTrack) setTrackId(savedTrack);
        } catch {}
    }, []);

    // Persist latest dispatch info whenever it changes
    useEffect(() => {
        try { sessionStorage.setItem('latestDispatchId', latestDispatchId || ''); } catch {}
    }, [latestDispatchId]);
    useEffect(() => {
        try { sessionStorage.setItem('latestDispatchStatus', latestDispatchStatus || ''); } catch {}
    }, [latestDispatchStatus]);
    useEffect(() => {
        try { sessionStorage.setItem('trackId', trackId || ''); } catch {}
    }, [trackId]);

    // Common finished statuses helper
    const FINISHED = ['completed','complete','finished','done','cancelled','canceled','closed','dropped'];
    const isTerminal = (status) => {
        const norm = (status || '').trim().toLowerCase();
        return FINISHED.some(k => norm.includes(k));
    };

    // Shared helpers used by polling and event listener
    const loadLatestDispatch = async () => {
        try {
            const SEEN_KEY = 'latestDispatchSeenId';
            const ARRIVED_SEEN_KEY = 'latestDispatchArrivedSeenId';
            const res = await API.get('/ambulance/dispatches/latest');
            const id = res?.data?.id || res?.data?._id || '';
            const status = res?.data?.status || '';
            const norm = (status || '').trim().toLowerCase();
            const isFinished = isTerminal(norm);
            if (!id || isFinished) {
                setLatestDispatchId('');
                setLatestDispatchStatus('');
                setTrackId('');
                try { localStorage.removeItem(SEEN_KEY); localStorage.removeItem(ARRIVED_SEEN_KEY); } catch {}
                return;
            }
            setLatestDispatchId(id);
            setLatestDispatchStatus(status);
            setTrackId((prev) => prev || id);
            // one-time confirm toast
            let seen = '';
            try { seen = localStorage.getItem(SEEN_KEY) || ''; } catch {}
            if (id && id !== seen) {
                showToast('Ambulance dispatch confirmed. Tracking ID is ready.', 'success');
                try { localStorage.setItem(SEEN_KEY, id); } catch {}
            }
            // one-time arrived toast
            const isArrived = norm === 'arrived';
            if (isArrived) {
                let arrivedSeen = '';
                try { arrivedSeen = localStorage.getItem(ARRIVED_SEEN_KEY) || ''; } catch {}
                if (id && id !== arrivedSeen) {
                    showToast('Verification successful, ambulance received.', 'success');
                    try { localStorage.setItem(ARRIVED_SEEN_KEY, id); } catch {}
                }
            }
        } catch (_) { /* ignore */ }
    };

    const loadConditionReports = async () => {
        try {
            const norm = (latestDispatchStatus||'').trim().toLowerCase();
            if (!latestDispatchId || isTerminal(norm)) { setConditionReports([]); return; }
            const res = await API.get(`/ambulance/dispatches/${latestDispatchId}/condition-reports`);
            const list = Array.isArray(res?.data) ? res.data : [];
            setConditionReports(list);
        } catch (_) {
            setConditionReports([]);
        }
    };

    const loadLatestEmergency = async () => {
        try {
            const res = await API.get('/emergency');
            const list = Array.isArray(res?.data) ? res.data : [];
            const pid = user?.id || user?._id;
            let found = false;
            for (let i = list.length - 1; i >= 0; i--) {
                const er = list[i];
                const erPid = er?.patientId || er?.patientID;
                if (String(erPid || '') === String(pid)) {
                    setLatestEmergencyStatus(er?.status || '');
                    found = true;
                    break;
                }
            }
            if (!found) {
                setLatestEmergencyStatus('');
            }
        } catch (_) { /* ignore */ }
    };
    const submitEmergency = async (e) => {
        e.preventDefault();
        try {
            if (!user || !(user.role || '').toUpperCase || (user.role || '').toUpperCase() !== 'PATIENT') {
                showToast('You must be logged in as PATIENT to send emergency.', 'error');
                return;
            }
            const payload = {
                patientId: user?.id || user?._id,
                patientName: user?.name,
                contactPhone: erPhone,
                pickupLocation: erPickup,
                severity: erSeverity,
                status: 'Requested'
            };
            await API.post('/emergency', payload);
            setShowEmergency(false);
            setErPickup(''); setErPhone(''); setErSeverity('HIGH');
            showToast('Emergency request sent. Paramedics have been notified.', 'success');
            try { localStorage.setItem('pollEmergencies', '1'); } catch {}
            setPollEmergencies(true);
        } catch (err) {
            // Surface error details
            const status = err?.response?.status;
            const msg = err?.response?.data?.message || err?.message || 'Unknown error';
            console.error('Emergency submit failed:', err);
            showToast(`Failed to send emergency request${status? ' ('+status+')':''}. ${msg}`, 'error');
        }
    };

    // For patients: one-time fetch of latest dispatch per mount (guard StrictMode double-invocation with a ref)
    const initLatestRef = useRef(false);
    useEffect(() => {
        if (!isPatient) return;
        if (!initLatestRef.current) {
            initLatestRef.current = true;
            loadLatestDispatch();
        }
    }, [isPatient]);

    // Refresh latest dispatch when the tab becomes visible (handles coming back to the dashboard)
    useEffect(() => {
        if (!isPatient) return;
        const onVis = () => { if (!document.hidden) loadLatestDispatch(); };
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, [isPatient]);

    // For patients: poll latest dispatch only when relevant (after emergency). Event- and one-time-fetch handle the rest.
    useEffect(() => {
        if (!isPatient) return;
        if (!pollEmergencies) return;
        let timer = null;
        const run = () => loadLatestDispatch();
        run();
        timer = setInterval(run, 15000);
        return () => { if (timer) clearInterval(timer); };
    }, [isPatient, pollEmergencies]);

    // For patients: poll emergencies and surface confirmation status (only after submitting an emergency)
    useEffect(() => {
        if (!isPatient || !user || !pollEmergencies) return;
        let timer = null;
        const FINISH_ER = ['completed','closed','done','cancelled','canceled','resolved'];
        const wrapped = async () => {
            await loadLatestEmergency();
            const st = (latestEmergencyStatus || '').trim().toLowerCase();
            if (FINISH_ER.includes(st) || !st) {
                setPollEmergencies(false);
                try { localStorage.removeItem('pollEmergencies'); } catch {}
            }
        };
        wrapped();
        timer = setInterval(wrapped, 10000);
        return () => { if (timer) clearInterval(timer); };
    }, [isPatient, user, pollEmergencies, latestEmergencyStatus]);

    // On mount, clear any stale persisted emergency poll flag
    useEffect(() => {
        try { localStorage.removeItem('pollEmergencies'); } catch {}
    }, []);

    // Load condition reports whenever latest dispatch changes or status updates
    useEffect(() => {
        if (!isPatient) return;
        loadConditionReports();
    }, [isPatient, latestDispatchId, latestDispatchStatus]);

    // Listen for global updates from paramedic app to refresh immediately
    useEffect(() => {
        const onUpdated = () => {
            loadLatestDispatch();
            if (pollEmergencies) { loadLatestEmergency(); }
            loadConditionReports();
        };
        window.addEventListener('dispatch:updated', onUpdated);
        return () => window.removeEventListener('dispatch:updated', onUpdated);
    }, [pollEmergencies]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar token={token} setToken={setToken} />

            <div className="flex-1 ml-64 px-8 pb-8">
                <Header token={token} setToken={setToken} />

                <div className="py-8 space-y-8">
                    <Overview />
                    {isDoctor && (
                        <AppointmentList
                            newPatients={newPatients}
                            onEditAppointment={handleEditAppointment}
                            onDeleteAppointment={handleDeleteAppointment}
                        />
                    )}
                    {isPatient && (
                        <>
                            <div className="bg-white rounded-2xl p-4 border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                                    <div>
                                        <div className="font-semibold">Emergency Assistance</div>
                                        <div className="text-xs text-gray-500">If you or someone needs urgent help, request an ambulance.</div>
                                    </div>
                                </div>
                                <button onClick={()=>setShowEmergency(true)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg">Emergency Case</button>
                            </div>

                            {(() => { const norm = (latestDispatchStatus||'').trim().toLowerCase(); return !!latestDispatchId && !isTerminal(norm) && !isTerminal(latestEmergencyStatus); })() && (
                                <div className="bg-white rounded-2xl p-4 border flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        <div className="font-semibold">Latest Dispatch</div>
                                        <div className="mt-1">ID: <code className="font-mono">{latestDispatchId || '—'}</code> • Status: {latestDispatchStatus || '—'}</div>
                                    </div>
                                </div>
                            )}

                            {(latestDispatchStatus||'').trim().toLowerCase()==='arrived' && !isTerminal(latestDispatchStatus) && !isTerminal(latestEmergencyStatus) && (
                                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200 flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-sky-800">Ambulance arrived</div>
                                        <div className="text-xs text-sky-700">Paramedics verified your identity at the scene.</div>
                                    </div>
                                </div>
                            )}


                            {latestEmergencyStatus && (
                                <div className={`rounded-2xl p-4 border flex items-center justify-between ${ (latestEmergencyStatus||'').toLowerCase()==='confirmed' ? 'bg-emerald-50 border-emerald-200' : 'bg-white' }`}>
                                    <div>
                                        <div className="font-semibold">Emergency Status</div>
                                        <div className="text-xs text-gray-700">Current status: {(latestEmergencyStatus || '—')}</div>
                                        {(latestEmergencyStatus||'').toLowerCase()==='confirmed' && (
                                            <div className="text-xs text-emerald-700 mt-1">Paramedics confirmed your emergency. You will receive a tracking link once dispatch is created.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(() => {
                                const norm = (latestDispatchStatus||'').trim().toLowerCase();
                                const showTracking = !!latestDispatchId && !isTerminal(norm) && !isTerminal(latestEmergencyStatus);
                                return showTracking;
                            })() && (
                                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-emerald-800">Ambulance dispatch confirmed</div>
                                        <div className="text-xs text-emerald-700">Tracking ID: <code className="font-mono">{latestDispatchId}</code> • Status: {latestDispatchStatus || '—'}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={()=>navigate(`/track/${latestDispatchId}`)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">Track now</button>
                                        <button onClick={()=>{navigator.clipboard?.writeText?.(window.location.origin + '/track/' + latestDispatchId); showToast('Copied tracking link', 'success');}} className="px-3 py-2 rounded border bg-white">Copy Link</button>
                                    </div>
                                </div>
                            )}

                            <ProductsAvailability />
                            <AppointmentList />
                        </>
                    )}
                </div>

                {showEmergency && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 border">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold">Emergency Details</h4>
                                <button onClick={()=>setShowEmergency(false)} className="text-gray-500">✕</button>
                            </div>
                            <form onSubmit={submitEmergency} className="space-y-3">
                                <input value={erPickup} onChange={(e)=>setErPickup(e.target.value)} placeholder="Pickup Location" className="w-full border p-2 rounded" required />
                                <input value={erPhone} onChange={(e)=>setErPhone(e.target.value)} placeholder="Contact Phone" className="w-full border p-2 rounded" required />
                                <select value={erSeverity} onChange={(e)=>setErSeverity(e.target.value)} className="w-full border p-2 rounded">
                                    <option>LOW</option>
                                    <option>MEDIUM</option>
                                    <option>HIGH</option>
                                    <option>CRITICAL</option>
                                </select>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={()=>setShowEmergency(false)} className="px-4 py-2 rounded border">Cancel</button>
                                    <button className="px-4 py-2 rounded bg-rose-600 text-white">Send Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;