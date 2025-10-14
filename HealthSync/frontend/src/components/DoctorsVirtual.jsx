import React, { useState } from 'react';
import { Search, Grid, List, Calendar, Phone, X } from 'lucide-react';
import { doctors } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import PatientAvailabilityModal from './PatientAvailabilityModal';
import { useNotification } from '../context/NotificationContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const DoctorsVirtual = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();
  const { showToast, addNotification } = useNotification();

  const handleAvailabilityClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handlePatientSubmit = (patientData) => {
    // Use the selected time from the form
    const appointmentTime = patientData.selectedTime;

    // Create new appointment object with selected doctor info
    const newAppointment = {
      name: selectedDoctor.name,
      specialization: selectedDoctor.speciality,
      time: appointmentTime,
      patient: patientData.patientName,
      patientAge: patientData.age,
      patientGender: patientData.gender,
      healthIssue: patientData.healthIssue,
      status: 'Waiting',
      statusColor: 'bg-yellow-500',
      type: 'Scheduled',
      isNew: true
    };

    // Get existing appointments from localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('newPatients') || '[]');
    
    // Add new appointment at the beginning
    const updatedAppointments = [newAppointment, ...existingAppointments];
    
    // Save to localStorage
    localStorage.setItem('newPatients', JSON.stringify(updatedAppointments));
    
    // Show beautiful toast notification
    const toastMessage = `Appointment booked successfully with ${selectedDoctor.name}!\nPatient: ${patientData.patientName}\nTime: ${appointmentTime}`;
    showToast(toastMessage, 'success', 5000);
    
    // Add to notification center
    addNotification({
      type: 'appointment',
      title: 'New Appointment Booked',
      message: `${patientData.patientName} has booked an appointment with ${selectedDoctor.name}`,
      details: {
        doctor: selectedDoctor.name,
        patient: patientData.patientName,
        time: appointmentTime,
        specialization: selectedDoctor.speciality,
        healthIssue: patientData.healthIssue
      }
    });
  };

  const categories = [
    'ALL',
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesCategory = activeCategory === 'ALL' || doctor.speciality === activeCategory;
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Doctors</h1>
          
          {/* Search Bar and View Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 max-w-2xl relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search Doctor"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-8 py-3 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
                style={{
                  borderRadius: '50px'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className={`grid ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        } gap-5`}>
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100  group hover:-translate-y-1"
            >
              {/* Rating Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
                  <span className="text-gray-500 text-base"><i className="bi bi-star-fill"></i></span>
                  <span className="text-gray-500 font-bold text-sm">{doctor.rating}</span>
                </div>
              </div>

              {/* Doctor Image */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="text-center mb-5">
                <h3 className="font-bold text-gray-900 mb-1.5 text-lg">{doctor.name}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-1">{doctor.degree} - {doctor.experience}</p>
                
                {/* Specialty Badge */}
                <div className="inline-block">
                  <span className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                    {doctor.speciality}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-5 border-t border-gray-100">
                <button 
                  onClick={() => handleAvailabilityClick(doctor)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <Calendar size={16} />
                  <span>Availability</span>
                </button>
                <button 
                  onClick={() => navigate('/homeroom', { state: { doctor } })}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white bg-primary hover:bg-primary/90 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <Phone size={16} />
                  <span>Make a call</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No doctors found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Patient Availability Modal */}
      <PatientAvailabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePatientSubmit}
        selectedDoctor={selectedDoctor}
      />
    </div>
  );
};

export default DoctorsVirtual;
