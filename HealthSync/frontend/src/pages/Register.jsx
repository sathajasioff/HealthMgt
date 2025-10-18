import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Upload,
  Lock,
  Plus,
  Stethoscope,
  User,
  Mail,
  Briefcase
} from 'lucide-react';
import { assets } from '../assets/assets';
import API from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userRole: 'patient'
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const currentRole = currentUser?.role?.toUpperCase?.() || '';
  const canProvisionStaff = currentRole === 'STAFF' || currentRole === 'ADMIN';
  const [profileImage, setProfileImage] = useState(null); // used as doctor's profile image when role=doctor
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Doctor-specific fields (moved from staff form)
  const [doctorDetails, setDoctorDetails] = useState({
    speciality: 'General Physician',
    experience: '',
    phone: '',
    fees: 1500,
    availableToday: true,
    rating: 4.8,
  });
  const [availability, setAvailability] = useState([
    { day: 'MONDAY', startTime: '09:00', endTime: '12:00' }
  ]);

  // Pharmacy-specific fields
  const [pharmacyDetails, setPharmacyDetails] = useState({
    name: '',
    address: '',
    phone: '',
    hours: '24/7',
    rating: 4.7,
    stock: 'Full Stock'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Pharmacy-specific validations
    const selectedRole = formData.userRole.toUpperCase();
    if (selectedRole === 'PHARMACY') {
      const nameOk = (formData.fullName || '').trim().length > 0;
      const phoneOk = (pharmacyDetails.phone || '').trim().length > 0;
      const hoursOk = (pharmacyDetails.hours || '').trim().length > 0;
      if (!nameOk || !phoneOk || !hoursOk) {
        alert('Please fill all required pharmacy fields: name, phone, hours');
        return;
      }
      // Email is taken from account email (formData.email), which is already required
      const emailVal = (formData.email || '').trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(emailVal)) {
        alert('Enter a valid email');
        return;
      }
    }

    try {
      setLoading(true);
      const userPayload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.userRole.toUpperCase()
      };
      const userRes = await API.post('/users/register', userPayload);
      if (userRes.status === 200) {
        const role = userPayload.role;
        if (role === 'DOCTOR') {
          // Create doctor profile with extra details
          const req = {
            name: formData.fullName,
            email: formData.email,
            speciality: doctorDetails.speciality,
            experience: doctorDetails.experience ? parseInt(doctorDetails.experience, 10) : 0,
            phone: doctorDetails.phone,
            fees: doctorDetails.fees ? parseFloat(doctorDetails.fees) : 0,
            availableToday: !!doctorDetails.availableToday,
            rating: doctorDetails.rating ? parseFloat(doctorDetails.rating) : 4.8,
            availability
          };
          const fd = new FormData();
          const blob = new Blob([JSON.stringify(req)], { type: 'application/json' });
          fd.append('request', blob);
          if (profileImage) {
            fd.append('image', profileImage);
          }
          await API.post('/doctors', fd);
        } else if (role === 'PHARMACY') {
          // Create pharmacy profile linked to user
          const payload = {
            userId: userRes.data.id || userRes.data._id,
            name: formData.fullName,
            address: pharmacyDetails.address,
            phone: pharmacyDetails.phone,
            email: formData.email,
            hours: pharmacyDetails.hours,
            rating: pharmacyDetails.rating,
            stock: pharmacyDetails.stock
          };
          await API.post('/pharmacies', payload);
        }
        alert(`Registration successful! Welcome ${userRes.data.name} (${userRes.data.role})`);
        navigate('/');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.response && err.response.data) {
        alert(err.response.data.message || 'Error: ' + err.response.data);
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log('Google Sign Up clicked');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-10">
            <h2 className="text-4xl font-bold text-primary text-center mb-2">
              Create Account
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Join our healthcare community today
            </p>

            {/* Profile Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden bg-gray-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserPlus className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 bg-primary hover:bg-emerald-600 text-white p-2 rounded-full cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2 mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Patient */}
                <label
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.userRole === 'patient'
                      ? 'border-primary bg-green-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value="patient"
                    checked={formData.userRole === 'patient'}
                    onChange={handleChange}
                    className="absolute top-3 right-3 w-4 h-4 text-primary"
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      formData.userRole === 'patient'
                        ? 'bg-primary/10'
                        : 'bg-gray-100'
                    }`}
                  >
                    <User
                      size={24}
                      className={
                        formData.userRole === 'patient'
                          ? 'text-primary'
                          : 'text-gray-400'
                      }
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      formData.userRole === 'patient'
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}
                  >
                    Patient
                  </span>
                </label>

                {/* Doctor */}
                <label
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.userRole === 'doctor'
                      ? 'border-primary bg-green-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value="doctor"
                    checked={formData.userRole === 'doctor'}
                    onChange={handleChange}
                    className="absolute top-3 right-3 w-4 h-4 text-primary"
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      formData.userRole === 'doctor'
                        ? 'bg-primary/10'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Stethoscope
                      size={24}
                      className={
                        formData.userRole === 'doctor'
                          ? 'text-primary'
                          : 'text-gray-400'
                      }
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      formData.userRole === 'doctor'
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}
                  >
                    Doctor
                  </span>
                </label>

                {/* Staff */}
                <label
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.userRole === 'staff'
                      ? 'border-primary bg-green-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value="staff"
                    checked={formData.userRole === 'staff'}
                    onChange={handleChange}
                    className="absolute top-3 right-3 w-4 h-4 text-primary"
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      formData.userRole === 'staff'
                        ? 'bg-primary/10'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Briefcase
                      size={24}
                      className={
                        formData.userRole === 'staff'
                          ? 'text-primary'
                          : 'text-gray-400'
                      }
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      formData.userRole === 'staff'
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}
                  >
                    Staff
                  </span>
                </label>

                {/* Pharmacy */}
                <label
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.userRole === 'pharmacy'
                      ? 'border-primary bg-green-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value="pharmacy"
                    checked={formData.userRole === 'pharmacy'}
                    onChange={handleChange}
                    className="absolute top-3 right-3 w-4 h-4 text-primary"
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      formData.userRole === 'pharmacy'
                        ? 'bg-primary/10'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Stethoscope
                      size={24}
                      className={
                        formData.userRole === 'pharmacy'
                          ? 'text-primary'
                          : 'text-gray-400'
                      }
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      formData.userRole === 'pharmacy'
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}
                  >
                    Pharmacy
                  </span>
                </label>

                {/* Hospital Staff (visible only for STAFF/ADMIN when provisioning) */}
                {canProvisionStaff && (
                <label
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.userRole === 'hospital_staff'
                      ? 'border-primary bg-green-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value="hospital_staff"
                    checked={formData.userRole === 'hospital_staff'}
                    onChange={handleChange}
                    className="absolute top-3 right-3 w-4 h-4 text-primary"
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      formData.userRole === 'hospital_staff'
                        ? 'bg-primary/10'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Briefcase
                      size={24}
                      className={
                        formData.userRole === 'hospital_staff'
                          ? 'text-primary'
                          : 'text-gray-400'
                      }
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      formData.userRole === 'hospital_staff'
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}
                  >
                    Hospital Staff
                  </span>
                </label>
                )}

                {/* Paramedic (visible only for STAFF/ADMIN when provisioning) */}
                {canProvisionStaff && (
                <label
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.userRole === 'paramedic'
                      ? 'border-primary bg-green-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value="paramedic"
                    checked={formData.userRole === 'paramedic'}
                    onChange={handleChange}
                    className="absolute top-3 right-3 w-4 h-4 text-primary"
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      formData.userRole === 'paramedic'
                        ? 'bg-primary/10'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Stethoscope
                      size={24}
                      className={
                        formData.userRole === 'paramedic'
                          ? 'text-primary'
                          : 'text-gray-400'
                      }
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      formData.userRole === 'paramedic'
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}
                  >
                    Paramedic
                  </span>
                </label>
                )}
              </div>
            </div>

            {/* Pharmacy extra fields (visible when role is Pharmacy) */}
            {formData.userRole === 'pharmacy' && (
              <div className="space-y-3 mb-5 border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">Pharmacy Details</h3>
                <p className="text-xs text-gray-500">Pharmacy will use your account Name and Email. Provide contact details below.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input value={pharmacyDetails.address} onChange={(e) => setPharmacyDetails({ ...pharmacyDetails, address: e.target.value })} className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input value={pharmacyDetails.phone} onChange={(e) => setPharmacyDetails({ ...pharmacyDetails, phone: e.target.value })} className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                    <input value={pharmacyDetails.hours} onChange={(e) => setPharmacyDetails({ ...pharmacyDetails, hours: e.target.value })} className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  required
                />
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* Doctor extra fields */}
              {formData.userRole === 'doctor' && (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                      <select
                        value={doctorDetails.speciality}
                        onChange={(e) => setDoctorDetails({ ...doctorDetails, speciality: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {['General Physician','Cardiologist','Neurologist','Dentist','Dermatologist','Pediatrician','Orthopedic','ENT Specialist','Psychiatrist','Gastroenterologist'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                      <input type="number" min={0} value={doctorDetails.experience} onChange={(e) => setDoctorDetails({ ...doctorDetails, experience: e.target.value })} className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fees (Rs.)</label>
                      <input type="number" min={0} value={doctorDetails.fees} onChange={(e) => setDoctorDetails({ ...doctorDetails, fees: e.target.value })} className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input value={doctorDetails.phone} onChange={(e) => setDoctorDetails({ ...doctorDetails, phone: e.target.value })} className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="071 234 5678" />
                    </div>
                    <div className="flex items-center gap-3">
                      <input id="docAvailableToday" type="checkbox" checked={doctorDetails.availableToday} onChange={(e) => setDoctorDetails({ ...doctorDetails, availableToday: e.target.checked })} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                      <label htmlFor="docAvailableToday" className="text-sm text-gray-700">Available Today</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <input type="number" step="0.1" min={0} max={5} value={doctorDetails.rating} onChange={(e) => setDoctorDetails({ ...doctorDetails, rating: e.target.value })} className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Profile Image</label>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability Slots</label>
                    <div className="space-y-2">
                      {availability.map((slot, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                          <div className="md:col-span-4">
                            <select value={slot.day} onChange={(e) => setAvailability(prev => prev.map((s,i)=> i===idx?{...s, day:e.target.value}:s))} className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                              {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-3">
                            <input type="time" value={slot.startTime} onChange={(e) => setAvailability(prev => prev.map((s,i)=> i===idx?{...s, startTime:e.target.value}:s))} className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div className="md:col-span-3">
                            <input type="time" value={slot.endTime} onChange={(e) => setAvailability(prev => prev.map((s,i)=> i===idx?{...s, endTime:e.target.value}:s))} className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div className="md:col-span-2">
                            <button type="button" onClick={() => setAvailability(prev => prev.filter((_,i)=> i!==idx))} className="px-3 py-2 border-2 border-red-300 text-red-600 rounded-lg">Remove</button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => setAvailability(prev => [...prev, { day:'MONDAY', startTime:'09:00', endTime:'12:00'}])} className="mt-1 px-4 py-2 border-2 border-primary text-primary rounded-lg">Add Slot</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms checkbox */}
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary text-white font-bold py-3 px-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl uppercase tracking-wide mt-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600'
                }`}
              >
                {loading ? 'Registering...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-emerald-400 to-teal-500 relative overflow-hidden">
        {/* Logo */}
        <div className="absolute top-8 right-8 z-10">
          <img
            src={assets.LogoWHITE}
            alt="logo"
            className="h-16 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        {/* Decorative icons */}
        <Plus className="absolute top-20 w-60 h-60 text-white opacity-10" strokeWidth={3} />
        <Plus className="absolute bottom-20 right-10 w-48 h-48 text-white opacity-10" strokeWidth={3} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full"></div>

        {/* Right Content */}
        <div className="flex flex-col items-center justify-center w-full px-12 z-10 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">Hello, Friend!</h1>
          <p className="text-white text-lg mb-8 opacity-90">
            Already have an account?<br />Sign in to access your health dashboard
          </p>
          <button
            onClick={() => navigate('/')}
            className="border-2 border-white text-white px-12 py-3 rounded-full font-medium hover:bg-white hover:text-primary transition-all duration-300"
          >
            SIGN IN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
