import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import UserQRCode from '../components/UserQRCode';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Profile = () => {
  const [token, setToken] = useState(true);
  const { showToast } = useNotification();
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);
  const role = user?.role?.toUpperCase?.() || '';
  const userId = user?.id || user?._id;
  const qrValue = role === 'PATIENT' ? `patient:${userId || ''}` : `user:${role || ''}:${userId || ''}`;

  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', imageUrl: '' });
  const [userImageFile, setUserImageFile] = useState(null);
  const [doctorForm, setDoctorForm] = useState({ speciality: '', experience: '', phone: '', fees: '', rating: '', imageUrl: '' });
  const [doctorImageFile, setDoctorImageFile] = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Load user profile
        const ures = await API.get(`/users/${userId}`);
        const u = ures.data || {};
        setUserForm({ name: u.name || '', email: u.email || '', password: '', imageUrl: u.imageUrl || '' });
        // Load doctor profile if applicable
        if (role === 'DOCTOR') {
          const dres = await API.get(`/doctors/by-user/${userId}`);
          const d = dres.data || {};
          if (d && (d.id || d._id)) setDoctorId(d.id || d._id);
          setDoctorForm({
            speciality: d.speciality || '',
            experience: d.experience ?? '',
            phone: d.phone || '',
            fees: d.fees ?? '',
            rating: d.rating ?? '',
            imageUrl: d.imageUrl || ''
          });
        }
      } catch (e) {
        // no-op
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, role]);

  const saveUser = async () => {
    try {
      // upload image first if selected
      if (userImageFile) {
        const fd = new FormData();
        fd.append('image', userImageFile);
        const imgRes = await API.put(`/users/${userId}/image`, fd);
        const updated = imgRes.data || {};
        setUserForm(prev => ({ ...prev, imageUrl: updated.imageUrl || prev.imageUrl }));
        localStorage.setItem('user', JSON.stringify(updated));
        showToast('Profile image updated');
        window.dispatchEvent(new Event('user:updated'));
      }
      const payload = { name: userForm.name, email: userForm.email };
      if (userForm.password) payload.password = userForm.password;
      const res = await API.put(`/users/${userId}`, payload);
      localStorage.setItem('user', JSON.stringify(res.data));
      showToast('Profile updated');
      window.dispatchEvent(new Event('user:updated'));
    } catch (e) {
      showToast('Failed to update profile');
    }
  };

  const saveDoctor = async () => {
    if (!doctorId) return;
    try {
      // If a new image is selected, upload first
      if (doctorImageFile) {
        const fd = new FormData();
        fd.append('image', doctorImageFile);
        const imgRes = await API.put(`/doctors/${doctorId}/image`, fd);
        const updated = imgRes.data || {};
        setDoctorForm(prev => ({ ...prev, imageUrl: updated.imageUrl || prev.imageUrl }));
        showToast('Profile image updated');
      }
      const payload = {
        speciality: doctorForm.speciality,
        experience: doctorForm.experience ? parseInt(doctorForm.experience, 10) : 0,
        phone: doctorForm.phone,
        fees: doctorForm.fees ? parseFloat(doctorForm.fees) : 0,
        rating: doctorForm.rating ? parseFloat(doctorForm.rating) : 0,
        imageUrl: doctorForm.imageUrl,
      };
      await API.put(`/doctors/${doctorId}`, payload);
      showToast('Doctor details updated');
    } catch (e) {
      showToast('Failed to update doctor details');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar token={token} setToken={setToken} />

      <div className="flex-1 ml-64 px-8 pb-8">
        <Header token={token} setToken={setToken} />

        <div className="py-8 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Account Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input value={userForm.name} onChange={(e)=>setUserForm({...userForm,name:e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
              </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Your QR Code</h2>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <UserQRCode value={qrValue} label={`QR for ${role || 'USER'}`} size={180} />
                <div className="text-sm text-gray-700">
                  <div className="font-medium">Encoded Value</div>
                  <div className="font-mono break-all text-gray-600 mt-1">{qrValue}</div>
                  <div className="mt-3">
                    <button onClick={()=>{navigator.clipboard?.writeText?.(qrValue);}} className="px-3 py-1.5 rounded border bg-white text-sm">Copy</button>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Patients use this QR to be scanned by paramedics. Format for patients: <code>patient:&lt;id&gt;</code>
              </div>
            </div>
          </div>

            
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input type="email" value={userForm.email} onChange={(e)=>setUserForm({...userForm,email:e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">New Password</label>
                <input type="password" value={userForm.password} onChange={(e)=>setUserForm({...userForm,password:e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Profile Image</label>
                <input type="file" accept="image/*" onChange={(e)=> setUserImageFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                {userForm.imageUrl && (
                  <div className="mt-2 text-xs text-gray-500">Current: {userForm.imageUrl}</div>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={saveUser} className="px-5 py-2.5 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-lg">Save</button>
            </div>
          </div>

          {role === 'DOCTOR' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Doctor Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Speciality</label>
                  <input value={doctorForm.speciality} onChange={(e)=>setDoctorForm({...doctorForm,speciality:e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Experience (years)</label>
                  <input type="number" min={0} value={doctorForm.experience} onChange={(e)=>setDoctorForm({...doctorForm,experience:e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Phone</label>
                  <input value={doctorForm.phone} onChange={(e)=>setDoctorForm({...doctorForm,phone:e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Fees</label>
                  <input type="number" min={0} value={doctorForm.fees} onChange={(e)=>setDoctorForm({...doctorForm,fees:e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Rating</label>
                  <input type="number" step="0.1" min={0} max={5} value={doctorForm.rating} onChange={(e)=>setDoctorForm({...doctorForm,rating:e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Profile Image</label>
                  <input type="file" accept="image/*" onChange={(e)=> setDoctorImageFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                  {doctorForm.imageUrl && (
                    <div className="mt-2 text-xs text-gray-500">Current: {doctorForm.imageUrl}</div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={saveDoctor} className="px-5 py-2.5 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-lg">Save Doctor Details</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
