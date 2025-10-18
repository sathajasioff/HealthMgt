import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Stethoscope, Clock } from 'lucide-react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const PatientAvailabilityModal = ({ isOpen, onClose, onSubmit, selectedDoctor, editingAppointment }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patientName: '',
        age: '',
        gender: '',
        healthIssue: '',
        selectedTime: ''
    });

    const [errors, setErrors] = useState({});
    const [availableTimes, setAvailableTimes] = useState([]);
    const [doctorSlots, setDoctorSlots] = useState([]); // resolved availability for selected doctor
    const [bookedTimes, setBookedTimes] = useState([]); // times already booked for selected date
    const [slotsDayLabel, setSlotsDayLabel] = useState('');
    const [weekDays, setWeekDays] = useState([]); // next 7 days
    const [selectedDate, setSelectedDate] = useState(null); // Date object

    // Load doctor's availability into time slots when opened
    useEffect(() => {
        const load = async () => {
            if (!isOpen || !selectedDoctor) return;
            try {
                // Try to find the doctor from API to get latest availability
                const res = await API.get('/doctors');
                const list = Array.isArray(res.data) ? res.data : [];
                const id = selectedDoctor.id || selectedDoctor._id;
                const doc = list.find(d => (d.id || d._id) === id) || selectedDoctor;
                const slots = Array.isArray(doc.availability) ? doc.availability : [];
                setDoctorSlots(slots);
                initWeek(slots);
            } catch (e) {
                const fallbackSlots = Array.isArray(selectedDoctor.availability) ? selectedDoctor.availability : [];
                setDoctorSlots(fallbackSlots);
                initWeek(fallbackSlots);
            }
        };
        load();
    }, [isOpen, selectedDoctor]);

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

    const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const toDisplay = (h, m) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const dh = h % 12 || 12;
        return `${dh}:${pad(m)} ${ampm}`;
    };

    const initWeek = (slots) => {
        const start = new Date();
        const week = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
        setWeekDays(week);
        // default select first day that has any times
        let firstDay = week[0];
        for (const d of week) {
            const times = buildTimesForDate(slots, d);
            if (times.length) { firstDay = d; break; }
        }
        setSelectedDate(firstDay);
        const times = buildTimesForDate(slots, firstDay);
        setAvailableTimes(times);
        setSlotsDayLabel(`Slots for ${days[firstDay.getDay()]} ${firstDay.getFullYear()}-${pad(firstDay.getMonth()+1)}-${pad(firstDay.getDate())}`);
        // also fetch booked times for the first day
        fetchBookedTimes(firstDay, slots);
    };

    const buildTimesForDate = (slots, dateObj) => {
        const dayName = days[dateObj.getDay()];
        const daySlots = (slots || []).filter(s => s.day === dayName);
        const times = [];
        for (const s of daySlots) {
            const [sh, sm] = (s.startTime || '09:00').split(':').map(Number);
            const [eh, em] = (s.endTime || '17:00').split(':').map(Number);
            let h = sh, m = sm;
            while (h < eh || (h === eh && m < em)) {
                times.push(toDisplay(h, m));
                m += 30;
                if (m >= 60) { m = 0; h += 1; }
            }
        }
        return times;
    };

    // Fetch booked times for selected doctor/date
    const fetchBookedTimes = async (dateObj, slots) => {
        try {
            const doctorId = selectedDoctor?.id || selectedDoctor?._id;
            if (!doctorId || !dateObj) { setBookedTimes([]); return; }
            const yyyy = dateObj.getFullYear();
            const mm = pad(dateObj.getMonth()+1);
            const dd = pad(dateObj.getDate());
            const scheduledDate = `${yyyy}-${mm}-${dd}`;
            const res = await API.get(`/checkups/doctor/${doctorId}/booked`, { params: { date: scheduledDate } });
            const list = Array.isArray(res?.data) ? res.data : [];
            const dayTimes = buildTimesForDate(slots ?? doctorSlots, dateObj);
            const setTimes = new Set(list.map(String));
            setBookedTimes(dayTimes.filter(t => setTimes.has(String(t))));
        } catch (_) {
            setBookedTimes([]);
        }
    };

    // Re-fetch booked times if date/doctor changes while modal is open
    useEffect(() => {
        if (!isOpen || !selectedDate) return;
        fetchBookedTimes(selectedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, selectedDoctor, selectedDate, doctorSlots]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            try {
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const patientId = user?.id || user?._id || '';
                const payload = {
                    doctorId: selectedDoctor?.id || selectedDoctor?._id,
                    doctorName: selectedDoctor?.name,
                    speciality: selectedDoctor?.speciality,
                    patientId,
                    patientName: formData.patientName,
                    patientAge: parseInt(formData.age, 10),
                    patientGender: formData.gender,
                    healthIssue: formData.healthIssue,
                    time: formData.selectedTime,
                    scheduledDate: selectedDate ? `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth()+1)}-${pad(selectedDate.getDate())}` : '',
                    status: 'Waiting'
                };
                await API.post('/checkups', payload);
                window.dispatchEvent(new Event('checkups:updated'));
                if (onSubmit) onSubmit(formData);
                setFormData({ patientName: '', age: '', gender: '', healthIssue: '', selectedTime: '' });
                setErrors({});
                onClose();
                navigate('/dashboard');
            } catch (err) {
                alert('Failed to create checkup. Please try again.');
            }
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
                    {/* Day Selector */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Day</label>
                        <div className="grid grid-cols-7 gap-2">
                            {weekDays.map((d, idx) => {
                                const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();
                                const label = `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}\n${(d.getMonth()+1)}/${d.getDate()}`;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDate(d);
                                            setAvailableTimes(buildTimesForDate(doctorSlots, d));
                                            setSlotsDayLabel(`Slots for ${days[d.getDay()]} ${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`);
                                            setFormData(prev => ({ ...prev, selectedTime: '' }));
                                            fetchBookedTimes(d);
                                        }}
                                        className={`px-2 py-2 border-2 rounded-lg text-xs whitespace-pre-line ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-700 hover:border-primary'}`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
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
                            {availableTimes.length === 0 && (
                                <div className="col-span-3 text-sm text-gray-500">
                                    No available slots configured. Please try another day or contact support.
                                </div>
                            )}
                            {availableTimes.map((time, index) => {
                                const isBooked = bookedTimes.includes(time);
                                const isSelected = formData.selectedTime === time;
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={isBooked}
                                        onClick={() => {
                                            if (isBooked) return;
                                            setFormData(prev => ({ ...prev, selectedTime: time }));
                                            if (errors.selectedTime) {
                                                setErrors(prev => ({ ...prev, selectedTime: '' }));
                                            }
                                        }}
                                        className={`px-3 py-2 border-2 rounded-lg text-xs font-semibold transition-all ${
                                            isBooked
                                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                                                : isSelected
                                                    ? 'border-primary bg-primary text-white shadow-md'
                                                    : 'border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5'
                                        }`}
                                        title={isBooked ? 'Already booked' : 'Available'}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.selectedTime && (
                            <p className="text-red-500 text-xs mt-2">{errors.selectedTime}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            {slotsDayLabel || (selectedDoctor ? `Available slots for ${selectedDoctor.name}` : 'Select your preferred time slot')}
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
                            disabled={!formData.selectedTime}
                            className={`flex-1 px-4 py-3 bg-gradient-to-r from-primary to-teal-500 text-white font-semibold rounded-lg transition-all ${!formData.selectedTime ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
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
