import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AppointmentList from '../components/AppointmentList';
import Overview from '../components/Overview';
import ProductsAvailability from '../components/ProductsAvailability';
import PatientAvailabilityModal from '../components/PatientAvailabilityModal';
import { UserPlus } from 'lucide-react';

const Dashboard = () => {
    const [token, setToken] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPatients, setNewPatients] = useState([]);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);

    // Load appointments from localStorage on component mount
    useEffect(() => {
        const loadAppointments = () => {
            const savedAppointments = JSON.parse(localStorage.getItem('newPatients') || '[]');
            setNewPatients(savedAppointments);
        };
        
        loadAppointments();
        
        // Optional: Set up an interval to check for updates
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

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar token={token} setToken={setToken} />

            <div className="flex-1 ml-64 px-8 pb-8">
                <Header token={token} setToken={setToken} />

                <div className="py-8 space-y-8">
                    <Overview />

                    <AppointmentList 
                        newPatients={newPatients}
                        onEditAppointment={handleEditAppointment}
                        onDeleteAppointment={handleDeleteAppointment}
                    />
                    
                    <ProductsAvailability />
                    
                </div>
            </div>

            {/* Patient Availability Modal */}
            <PatientAvailabilityModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingAppointment(null);
                    setEditingIndex(null);
                }}
                onSubmit={handlePatientSubmit}
                editingAppointment={editingAppointment}
            />
        </div>
    );
};

export default Dashboard;