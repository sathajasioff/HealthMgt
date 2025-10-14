import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Stethoscope, Clock } from 'lucide-react';

const PatientAvailabilityModal = ({ isOpen, onClose, onSubmit, selectedDoctor, editingAppointment }) => {
    const [formData, setFormData] = useState({
        patientName: '',
        age: '',
        gender: '',
        healthIssue: '',
        selectedTime: ''
    });

    const [errors, setErrors] = useState({});
    const [availableTimes, setAvailableTimes] = useState([]);

    // Generate random available times when modal opens
    useEffect(() => {
        if (isOpen) {
            const times = generateRandomTimes();
            setAvailableTimes(times);
        }
    }, [isOpen]);

    // Pre-fill form when editing
    useEffect(() => {
        if (editingAppointment && isOpen) {
            setFormData({
                patientName: editingAppointment.patient || '',
                age: editingAppointment.patientAge || '',
                gender: editingAppointment.patientGender || '',
                healthIssue: editingAppointment.healthIssue || '',
                selectedTime: editingAppointment.time || ''
            });
        } else if (!isOpen) {
            // Reset form when modal closes
            setFormData({
                patientName: '',
                age: '',
                gender: '',
                healthIssue: '',
                selectedTime: ''
            });
        }
    }, [editingAppointment, isOpen]);

    const generateRandomTimes = () => {
        const timeSlots = [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Generate time slots for today and tomorrow
        const startHour = currentHour < 18 ? currentHour + 1 : 9; // Start from next hour or 9 AM
        const hours = [9, 10, 11, 12, 14, 15, 16, 17, 18]; // Available hours (skipping 13 for lunch)
        
        // Filter hours that are in the future
        const futureHours = hours.filter(h => h >= startHour || currentHour >= 18);
        
        // Randomly select 4-6 time slots
        const numSlots = Math.floor(Math.random() * 3) + 4; // 4 to 6 slots
        const selectedHours = [];
        
        while (selectedHours.length < numSlots && futureHours.length > 0) {
            const randomIndex = Math.floor(Math.random() * futureHours.length);
            selectedHours.push(futureHours.splice(randomIndex, 1)[0]);
        }
        
        // Convert to time strings and sort
        selectedHours.sort((a, b) => a - b).forEach(hour => {
            const minutes = Math.random() > 0.5 ? '00' : '30';
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            timeSlots.push(`${displayHour}:${minutes} ${ampm}`);
        });
        
        return timeSlots;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.patientName.trim()) {
            newErrors.patientName = 'Patient name is required';
        }
        
        if (!formData.age) {
            newErrors.age = 'Age is required';
        } else if (isNaN(formData.age) || formData.age < 0 || formData.age > 150) {
            newErrors.age = 'Please enter a valid age';
        }
        
        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }
        
        if (!formData.healthIssue.trim()) {
            newErrors.healthIssue = 'Health issue is required';
        }
        
        if (!formData.selectedTime) {
            newErrors.selectedTime = 'Please select an available time';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            onSubmit(formData);
            // Reset form
            setFormData({
                patientName: '',
                age: '',
                gender: '',
                healthIssue: '',
                selectedTime: ''
            });
            setErrors({});
            onClose();
        }
    };

    const handleClose = () => {
        setFormData({
            patientName: '',
            age: '',
            gender: '',
            healthIssue: '',
            selectedTime: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-teal-500 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Stethoscope size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {editingAppointment ? 'Edit Appointment' : 'Patient Availability'}
                            </h2>
                            <p className="text-white/90 text-sm">
                                {editingAppointment ? 'Update appointment details' : 'Add new patient details'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Patient Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Patient Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                placeholder="Enter patient name"
                                className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                    errors.patientName ? 'border-red-500' : 'border-gray-200'
                                }`}
                            />
                        </div>
                        {errors.patientName && (
                            <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>
                        )}
                    </div>

                    {/* Age */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Age <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Enter age"
                                min="0"
                                max="150"
                                className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                    errors.age ? 'border-red-500' : 'border-gray-200'
                                }`}
                            />
                        </div>
                        {errors.age && (
                            <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            {['Male', 'Female', 'Other'].map((option) => (
                                <label
                                    key={option}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                                        formData.gender === option
                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={option}
                                        checked={formData.gender === option}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                        {errors.gender && (
                            <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                        )}
                    </div>

                    {/* Health Issue */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Health Issue <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="healthIssue"
                            value={formData.healthIssue}
                            onChange={handleChange}
                            placeholder="Describe the health issue"
                            rows="2"
                            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none ${
                                errors.healthIssue ? 'border-red-500' : 'border-gray-200'
                            }`}
                        />
                        {errors.healthIssue && (
                            <p className="text-red-500 text-xs mt-1">{errors.healthIssue}</p>
                        )}
                    </div>

                    {/* Available Times */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                <span>Available Times <span className="text-red-500">*</span></span>
                            </div>
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {availableTimes.map((time, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, selectedTime: time }));
                                        if (errors.selectedTime) {
                                            setErrors(prev => ({ ...prev, selectedTime: '' }));
                                        }
                                    }}
                                    className={`px-3 py-2 border-2 rounded-lg text-xs font-semibold transition-all ${
                                        formData.selectedTime === time
                                            ? 'border-primary bg-primary text-white shadow-md'
                                            : 'border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5'
                                    }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        {errors.selectedTime && (
                            <p className="text-red-500 text-xs mt-2">{errors.selectedTime}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            {selectedDoctor ? `Available slots for ${selectedDoctor.name}` : 'Select your preferred time slot'}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientAvailabilityModal;
