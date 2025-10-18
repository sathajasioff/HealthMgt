import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AppointmentList from '../components/AppointmentList';
import Overview from '../components/Overview';
import ProductsAvailability from '../components/ProductsAvailability';
import PatientAvailabilityModal from '../components/PatientAvailabilityModal';
import StaffManageDoctor from '../components/StaffManageDoctor';
import API from '../services/api';

const StaffDashboard = () => {
  const [token, setToken] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatients, setNewPatients] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [createdAccounts, setCreatedAccounts] = useState([]);

  const [provisionForm, setProvisionForm] = useState({
    fullName: '', email: '', password: '', role: 'HOSPITAL_STAFF'
  });

  const handleProvision = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: provisionForm.fullName,
        email: provisionForm.email,
        password: provisionForm.password,
        role: provisionForm.role
      };
      const res = await API.post('/users/register', payload);
      setCreatedAccounts(prev => [{ id: res.data.id || res.data._id, name: res.data.name, email: res.data.email, role: res.data.role }, ...prev]);
      setProvisionForm({ fullName: '', email: '', password: '', role: provisionForm.role });
      alert(`Created ${res.data.role} account for ${res.data.name}`);
    } catch (err) {
      alert('Failed to create account. Ensure you are STAFF/ADMIN.');
    }
  };

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
      const updatedPatients = [...newPatients];
      updatedPatients[editingIndex] = {
        ...updatedPatients[editingIndex],
        patient: patientData.patientName,
        patientAge: patientData.age,
        patientGender: patientData.gender,
        healthIssue: patientData.healthIssue,
        time: patientData.selectedTime || updatedPatients[editingIndex].time,
      };
      setNewPatients(updatedPatients);
      localStorage.setItem('newPatients', JSON.stringify(updatedPatients));
      setEditingAppointment(null);
      setEditingIndex(null);
    } else {
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
        isNew: true,
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
          {/* Provision Hospital Staff / Paramedic Accounts */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Provision Hospital Staff / Paramedic</h2>
            </div>
            <form onSubmit={handleProvision} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input value={provisionForm.fullName} onChange={(e)=>setProvisionForm({...provisionForm, fullName: e.target.value})} placeholder="Full Name" className="border p-2 rounded" required />
              <input type="email" value={provisionForm.email} onChange={(e)=>setProvisionForm({...provisionForm, email: e.target.value})} placeholder="Email" className="border p-2 rounded" required />
              <input type="password" value={provisionForm.password} onChange={(e)=>setProvisionForm({...provisionForm, password: e.target.value})} placeholder="Temp Password" className="border p-2 rounded" required />
              <select value={provisionForm.role} onChange={(e)=>setProvisionForm({...provisionForm, role: e.target.value})} className="border p-2 rounded">
                <option value="HOSPITAL_STAFF">Hospital Staff</option>
                <option value="PARAMEDIC">Paramedic</option>
              </select>
              <button className="bg-primary text-white rounded px-4">Create</button>
            </form>
            {createdAccounts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Recently Created</h3>
                <div className="space-y-1">
                  {createdAccounts.map(acc => (
                    <div key={acc.id} className="text-sm text-gray-700">{acc.name} • {acc.email} • {acc.role}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Overview />

          <AppointmentList
            newPatients={newPatients}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />

          <ProductsAvailability />

          <StaffManageDoctor />
        </div>
      </div>

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

export default StaffDashboard;
