import React, { useState } from 'react';
import { ChevronRight, MoreVertical, Video, Stethoscope, Edit2, Trash2 } from 'lucide-react';
import { appointmentsData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const AppointmentList = ({ newPatients = [], onEditAppointment, onDeleteAppointment }) => {
    const [showAllAppointments, setShowAllAppointments] = useState(false);
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const navigate = useNavigate();

    // Combine new patients with existing appointments
    const allAppointments = [...newPatients, ...appointmentsData];

    // Show only first 5 items or all items based on showAllAppointments state
    const displayedAppointments = showAllAppointments ? allAppointments : allAppointments.slice(0, 5);

    // Handle checkup click to navigate to homeroom
    const handleCheckupClick = (appointment) => {
        // Only navigate if status is confirmed or in progress
        if (appointment.status === 'Confirmed' || appointment.status === 'In Progress') {
            navigate('/homeroom', { state: { appointment } });
        }
    };

    const handleEdit = (appointment, index) => {
        if (appointment.isNew && onEditAppointment) {
            onEditAppointment(appointment, index);
        }
        setOpenDropdownIndex(null);
    };

    const handleDelete = (appointment, index) => {
        if (appointment.isNew && onDeleteAppointment) {
            if (window.confirm(`Are you sure you want to delete the appointment for ${appointment.patient}?`)) {
                onDeleteAppointment(index);
            }
        }
        setOpenDropdownIndex(null);
    };

    const toggleDropdown = (index, e) => {
        e.stopPropagation();
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
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
                    <p className="text-4xl font-bold text-white">{allAppointments.length}</p>
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
                {displayedAppointments.map((appointment, index) => (
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
                                {appointment.isNew && (
                                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                        NEW
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">{appointment.type}</div>
                        </div>
                        <div className="col-span-3">
                            <div className="text-sm font-medium text-gray-800">{appointment.name}</div>
                        </div>
                        <div className="col-span-2 text-sm text-gray-600">{appointment.specialization}</div>
                        <div className="col-span-2">
                            <div className="text-sm font-medium text-gray-800">{appointment.patient}</div>
                            {appointment.isNew && (
                                <div className="text-xs text-gray-500">
                                    {appointment.patientAge} yrs, {appointment.patientGender}
                                </div>
                            )}
                            {appointment.healthIssue && (
                                <div className="text-xs text-blue-600 mt-1 italic" title={appointment.healthIssue}>
                                    Issue: {appointment.healthIssue.length > 20 
                                        ? appointment.healthIssue.substring(0, 20) + '...' 
                                        : appointment.healthIssue}
                                </div>
                            )}
                        </div>
                        <div className="col-span-2">
                            <span className={`inline-flex items-center gap-2 text-xs font-medium text-white ${appointment.statusColor} px-3 py-1.5 rounded-full`}>
                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                {appointment.status}
                            </span>
                        </div>
                        <div className="col-span-1 flex justify-end items-center gap-2">
                            {(appointment.status === 'Confirmed' || appointment.status === 'In Progress') && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCheckupClick(appointment);
                                    }}
                                    className="p-2 hover:bg-primary hover:text-white bg-primary/10 text-primary rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                                    title="Start Video Consultation"
                                >
                                    <Video size={14} />
                                    Join
                                </button>
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
                                            {appointment.isNew ? (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(appointment, index);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <Edit2 size={16} className="text-blue-500" />
                                                        <span>Edit Appointment</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(appointment, index);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <Trash2 size={16} className="text-red-500" />
                                                        <span>Delete Appointment</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="px-4 py-2.5 text-sm text-gray-400 italic">
                                                    No actions available
                                                </div>
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