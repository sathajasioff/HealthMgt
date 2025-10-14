import React, { useState } from 'react';
import { ChevronRight, MoreVertical, Video, Stethoscope } from 'lucide-react';
import { appointmentsData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const AppointmentList = () => {
    const [showAllAppointments, setShowAllAppointments] = useState(false);
    const navigate = useNavigate();

    // Show only first 5 items or all items based on showAllAppointments state
    const displayedAppointments = showAllAppointments ? appointmentsData : appointmentsData.slice(0, 5);

    // Handle checkup click to navigate to homeroom
    const handleCheckupClick = (appointment) => {
        // Only navigate if status is confirmed or in progress
        if (appointment.status === 'Confirmed' || appointment.status === 'In Progress') {
            navigate('/homeroom', { state: { appointment } });
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
                    <p className="text-4xl font-bold text-white">{appointmentsData.length}</p>
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
                        className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                            appointment.status === 'Confirmed' || appointment.status === 'In Progress' 
                                ? 'cursor-pointer' 
                                : 'cursor-not-allowed opacity-60'
                        }`}
                    >
                        <div className="col-span-2">
                            <div className="text-sm font-medium text-gray-800">{appointment.time}</div>
                            <div className="text-xs text-gray-500">{appointment.type}</div>
                        </div>
                        <div className="col-span-3">
                            <div className="text-sm font-medium text-gray-800">{appointment.name}</div>
                        </div>
                        <div className="col-span-2 text-sm text-gray-600">{appointment.specialization}</div>
                        <div className="col-span-2 text-sm text-gray-600">{appointment.patient}</div>
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
                                    className="p-2 hover:bg-primary hover:text-white bg-primary/10 text-primary rounded-lg transition-colors flex items-center gap-1 text-xs font-medium mr-2"
                                    title="Start Video Consultation"
                                >
                                    <Video size={14} />
                                    Join
                                </button>
                            )}
                            <button 
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 hover:bg-gray-200 rounded transition-colors ml-1"
                            >
                                <MoreVertical size={18} className="text-gray-500" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppointmentList;