import React, { useEffect, useState } from 'react';
import { ClipboardList, PlusCircle, Trash2, Save } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';

const StaffManageDoctor = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      try {
        const res = await API.get('/doctors');
        setDoctors(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  useEffect(() => {
    const doc = doctors.find(d => d.id === selectedDoctorId || d._id === selectedDoctorId);
    if (doc) {
      setAvailability(doc.availability && Array.isArray(doc.availability) ? doc.availability : []);
    } else {
      setAvailability([]);
    }
  }, [selectedDoctorId, doctors]);

  const handleAddSlot = () => {
    setAvailability((prev) => [...prev, { day: 'MONDAY', startTime: '09:00', endTime: '12:00' }]);
  };
  const handleSlotChange = (index, field, value) => {
    setAvailability((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };
  const handleRemoveSlot = (index) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    if (!selectedDoctorId) {
      alert('Please select a doctor');
      return;
    }
    setSaving(true);
    try {
      const id = selectedDoctorId;
      await API.put(`/doctors/${id}/availability`, availability);
      showToast('Availability updated');
    } catch (e) {
      console.error(e);
      alert('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-teal-500 px-6 py-5 flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <ClipboardList size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Doctor Availability</h2>
          <p className="text-white/90 text-sm">Staff can modify available time slots</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
          <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" disabled={loading}>
            <option value="">{loading ? 'Loading doctors...' : 'Choose a doctor'}</option>
            {doctors.map((d) => (
              <option key={d.id || d._id} value={d.id || d._id}>{d.name} — {d.speciality}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability Slots</label>
          {selectedDoctorId ? (
            <div className="space-y-3">
              {availability.map((slot, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                  <div className="md:col-span-4">
                    <select value={slot.day} onChange={(e) => handleSlotChange(idx, 'day', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <input type="time" value={slot.startTime} onChange={(e) => handleSlotChange(idx, 'startTime', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="md:col-span-3">
                    <input type="time" value={slot.endTime} onChange={(e) => handleSlotChange(idx, 'endTime', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="button" onClick={() => handleRemoveSlot(idx)} className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <button type="button" onClick={handleAddSlot} className="inline-flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                  <PlusCircle size={16} />
                  Add Slot
                </button>
                <button type="button" onClick={saveAvailability} disabled={saving} className={`inline-flex items-center gap-2 px-4 py-2 ${saving ? 'bg-emerald-300 cursor-not-allowed' : 'bg-primary hover:bg-emerald-600'} text-white rounded-lg`}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Select a doctor to edit availability.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManageDoctor;