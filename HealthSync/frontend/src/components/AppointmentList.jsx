import React, { useEffect, useState } from 'react';
import { ChevronRight, MoreVertical, Video, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AppointmentList = () => {
    const [showAllAppointments, setShowAllAppointments] = useState(false);
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const [checkups, setCheckups] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const role = user?.role?.toUpperCase?.() || 'PATIENT';
    const userId = user?.id || user?._id;

    const fetchData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            if (role === 'DOCTOR') {
                // Map logged-in user to doctor document via userId
                const docsRes = await API.get('/doctors');
                const docs = Array.isArray(docsRes.data) ? docsRes.data : [];
                const me = docs.find(d => (d.userId === userId));
                if (me) {
                    const res = await API.get(`/checkups/doctor/${me.id || me._id}`);
                    setCheckups(Array.isArray(res.data) ? res.data : []);
                } else {
                    // Fallback: try using userId directly as doctorId for legacy data
                    const res = await API.get(`/checkups/doctor/${userId}`);
                    setCheckups(Array.isArray(res.data) ? res.data : []);
                }
            } else {
                const res = await API.get(`/checkups/patient/${userId}`);
                setCheckups(Array.isArray(res.data) ? res.data : []);
            }
        } catch (e) {
            console.error(e);
            setCheckups([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handler = () => fetchData();
        window.addEventListener('checkups:updated', handler);
        window.addEventListener('focus', handler);
        document.addEventListener('visibilitychange', handler);
        return () => window.removeEventListener('checkups:updated', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case 'pending':
            case 'waiting': return 'bg-yellow-500';
            case 'confirmed': return 'bg-emerald-500';
            case 'in progress': return 'bg-blue-500';
            case 'completed': return 'bg-gray-500';
            case 'cancelled':
            case 'declined': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    const displayStatus = (status) => {
        if (!status) return '';
        if (status.toLowerCase() === 'waiting') return 'Pending';
        return status;
    };

    const displayedAppointments = showAllAppointments ? checkups : checkups.slice(0, 5);

    const goToRoom = (roomId) => navigate(`/room/${roomId}?type=one-on-one`);

    const handleCheckupClick = (appointment) => {
        if (!(appointment.status === 'Confirmed' || appointment.status === 'In Progress')) return;
        if (appointment.roomId) {
            goToRoom(appointment.roomId);
        } else if (role === 'DOCTOR') {
            navigate('/homeroom', { state: { appointment } });
        }
    };

    const toggleDropdown = (index, e) => {
        e.stopPropagation();
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    const updateStatus = async (appointment, newStatus) => {
        try {
            await API.put(`/checkups/${appointment.id || appointment._id}/status`, { status: newStatus });
            // Update local state optimistically
            setCheckups(prev => prev.map(c => (c.id === appointment.id || c._id === appointment._id) ? { ...c, status: newStatus } : c));
            // Notify other tabs/components (e.g., patient dashboard)
            window.dispatchEvent(new Event('checkups:updated'));
            setOpenDropdownIndex(null);
        } catch (e) {
            console.error(e);
            alert('Failed to update status');
        }
    };

    const startOrJoin = async (appointment) => {
        if (role === 'DOCTOR') {
            if (appointment.roomId) {
                if (appointment.status !== 'In Progress') await updateStatus(appointment, 'In Progress');
                goToRoom(appointment.roomId);
            } else {
                // Navigate to room generator with context
                if (appointment.status !== 'In Progress') await updateStatus(appointment, 'In Progress');
                navigate('/homeroom', { state: { appointment } });
            }
        } else {
            if (appointment.roomId) {
                goToRoom(appointment.roomId);
            }
        }
    };

    return (
        <div id="appointments-section" className="bg-white shadow-sm overflow-hidden rounded-2xl">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary to-teal-500 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                        <Stethoscope size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Today's Check-ups</h2>
                        <p className="text-white/90 text-sm mt-1">Real-time patient monitoring</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-white/80 text-sm font-medium">Total Check-ups:</p>
                    <p className="text-4xl font-bold text-white">{checkups.length}</p>
                </div>
            </div>

            {/* View All/Less Toggle */}
            <div className="flex items-center justify-end px-6 py-3 bg-gray-50 border-b border-gray-200">
                <button 
                    onClick={() => setShowAllAppointments(!showAllAppointments)}
                    className="text-primary text-sm font-medium hover:text-teal-600 flex items-center gap-1 transition-colors mr-2"
                >
                    {showAllAppointments ? 'View less' : 'View all'}
                    <ChevronRight size={16} className={`transition-transform ${showAllAppointments ? 'rotate-90' : ''}`} />
                </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white border-b border-gray-200 text-sm font-semibold text-gray-600">
                <div className="col-span-2">Time</div>
                <div className="col-span-3">Doctor</div>
                <div className="col-span-2">Specialization</div>
                <div className="col-span-2">Patient</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
                {loading && (
                    <div className="px-6 py-4 text-gray-500">Loading checkups...</div>
                )}
                {!loading && displayedAppointments.map((appointment, index) => (
                    <div
                        key={index}
                        onClick={() => handleCheckupClick(appointment)}
                        className={`grid grid-cols-12 gap-4 px-6 py-4 transition-colors ${
                            appointment.status === 'Confirmed' || appointment.status === 'In Progress' 
                                ? 'cursor-pointer hover:bg-gray-50' 
                                : appointment.status === 'Waiting'
                                ? 'cursor-default'
                                : 'cursor-not-allowed opacity-60'
                        }`}
                    >
                        <div className="col-span-2">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-800">{appointment.time}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                                {appointment.scheduledDate ? `On ${appointment.scheduledDate}` : (appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString() : '')}
                            </div>
                        </div>
                        <div className="col-span-3">
                            <div className="text-sm font-medium text-gray-800">{appointment.doctorName}</div>
                        </div>
                        <div className="col-span-2 text-sm text-gray-600">{appointment.speciality}</div>
                        <div className="col-span-2">
                            <div className="text-sm font-medium text-gray-800">{appointment.patientName}</div>
                            <div className="text-xs text-gray-500">
                                {appointment.patientAge} yrs, {appointment.patientGender}
                            </div>
                            {appointment.healthIssue && (
                                <div className="text-xs text-blue-600 mt-1 italic" title={appointment.healthIssue}>
                                    Issue: {appointment.healthIssue.length > 20 
                                        ? appointment.healthIssue.substring(0, 20) + '...' 
                                        : appointment.healthIssue}
                                </div>
                            )}
                        </div>
                        <div className="col-span-2">
                            <span className={`inline-flex items-center gap-2 text-xs font-medium text-white ${getStatusColor(appointment.status)} px-3 py-1.5 rounded-full`}>
                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                {displayStatus(appointment.status)}
                            </span>
                        </div>
                        <div className="col-span-1 flex justify-end items-center gap-2">
                            {role === 'DOCTOR' && (appointment.status === 'Waiting' || appointment.status === 'Pending') && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); updateStatus(appointment, 'Confirmed'); }}
                                    className="px-2 py-1 bg-emerald-500 text-white rounded-md text-xs hover:bg-emerald-600"
                                >
                                    Confirm
                                </button>
                            )}
                            {role === 'DOCTOR' && appointment.status === 'Confirmed' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); startOrJoin(appointment); }}
                                    className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600"
                                >
                                    {appointment.roomId ? 'Join' : 'Start'}
                                </button>
                            )}
                            {role === 'DOCTOR' && (appointment.status === 'Confirmed' || appointment.status === 'Declined') && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); updateStatus(appointment, 'Pending'); }}
                                    className="px-2 py-1 bg-yellow-500 text-white rounded-md text-xs hover:bg-yellow-600"
                                >
                                    Pending
                                </button>
                            )}
                            {role === 'DOCTOR' && (appointment.status === 'Waiting' || appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); updateStatus(appointment, 'Declined'); }}
                                    className="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                                >
                                    Decline
                                </button>
                            )}
                            {(appointment.status === 'Confirmed' || appointment.status === 'In Progress') && (
                                appointment.roomId ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); goToRoom(appointment.roomId); }}
                                        className="p-2 hover:bg-primary hover:text-white bg-primary/10 text-primary rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                                        title="Join Video Consultation"
                                    >
                                        <Video size={14} />
                                        Join
                                    </button>
                                ) : (
                                    role === 'DOCTOR' ? (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); navigate('/homeroom', { state: { appointment } }); }}
                                            className="p-2 hover:bg-blue-600 hover:text-white bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                                            title="Generate Room"
                                        >
                                            <Video size={14} />
                                            Generate
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Waiting for doctor to start</span>
                                    )
                                )
                            )}
                            {/* Three-dot menu with dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={(e) => toggleDropdown(index, e)}
                                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <MoreVertical size={18} className="text-gray-500" />
                                </button>
                                {/* Dropdown Menu */}
                                {openDropdownIndex === index && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setOpenDropdownIndex(null)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                            {role === 'DOCTOR' ? (
                                                <>
                                                    {['Pending','Waiting','Confirmed','In Progress','Completed','Declined','Cancelled'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={(e) => { e.stopPropagation(); updateStatus(appointment, s); }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            Set {s}
                                                        </button>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="px-4 py-2.5 text-sm text-gray-400 italic">No actions</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppointmentList;