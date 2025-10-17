import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import API from '../services/api';
import { FlaskConical, Scan, Ambulance, Plus, Pencil, CheckCircle2, XCircle } from 'lucide-react';

const HospitalStaffDashboard = () => {
  const [token, setToken] = useState(true);
  const [tab, setTab] = useState('wards'); // wards | nurses | facilities | equipment | support
  const [wards, setWards] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [support, setSupport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [showNurseModal, setShowNurseModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [editWard, setEditWard] = useState(null);
  const [editNurse, setEditNurse] = useState(null);
  const [editEquipment, setEditEquipment] = useState(null);
  const [editSupport, setEditSupport] = useState(null);

  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [w, n, f, e, s] = await Promise.all([
        API.get('/hospital/wards'),
        API.get('/hospital/nurses'),
        API.get('/hospital/facilities'),
        API.get('/hospital/equipment'),
        API.get('/hospital/support'),
      ]);
      setWards(Array.isArray(w.data) ? w.data : []);
      setNurses(Array.isArray(n.data) ? n.data : []);
      setFacilities(Array.isArray(f.data) ? f.data : []);
      setEquipment(Array.isArray(e.data) ? e.data : []);
      setSupport(Array.isArray(s.data) ? s.data : []);
    } catch (_) {
      setWards([]); setNurses([]); setFacilities([]); setEquipment([]); setSupport([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createWard = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name'), department: fd.get('department'), floor: fd.get('floor'), capacity: Number(fd.get('capacity')||0), occupancy: 0, notes: fd.get('notes')
    };
    await API.post('/hospital/wards', payload); load(); e.currentTarget.reset(); setShowWardModal(false);
  };
  const createNurse = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), wardId: fd.get('wardId'), shift: fd.get('shift'), licenseNumber: fd.get('licenseNumber'), status: 'Active'
    };
    await API.post('/hospital/nurses', payload); load(); e.currentTarget.reset(); setShowNurseModal(false);
  };
  const createFacility = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name'), type: fd.get('type'), location: fd.get('location'), status: fd.get('status'), metadata: fd.get('metadata')
    };
    await API.post('/hospital/facilities', payload); load(); e.currentTarget.reset(); setShowFacilityModal(false);
  };

  const updateFacilityStatus = async (f, next) => {
    const body = { ...f, status: next };
    await API.put(`/hospital/facilities/${f.id || f._id}`, body);
    load();
  };

  const createEquipment = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name'),
      type: fd.get('type'),
      quantity: Number(fd.get('quantity')||0),
      available: Number(fd.get('available')||0),
      status: fd.get('status'),
      location: fd.get('location'),
      lastMaintenance: fd.get('lastMaintenance') ? new Date(fd.get('lastMaintenance')).toISOString() : null,
      notes: fd.get('notes')
    };
    await API.post('/hospital/equipment', payload);
    load(); e.currentTarget.reset(); setShowEquipmentModal(false);
  };

  const saveEquipment = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      type: fd.get('type'),
      quantity: Number(fd.get('quantity')||0),
      available: Number(fd.get('available')||0),
      status: fd.get('status'),
      location: fd.get('location'),
      lastMaintenance: fd.get('lastMaintenance') ? new Date(fd.get('lastMaintenance')).toISOString() : null,
      notes: fd.get('notes')
    };
    if (editEquipment) {
      await API.put(`/hospital/equipment/${editEquipment.id||editEquipment._id}`, body);
    } else {
      await API.post('/hospital/equipment', body);
    }
    setShowEquipmentModal(false); setEditEquipment(null); load();
  };

  const deleteEquipment = async (item) => {
    await API.delete(`/hospital/equipment/${item.id||item._id}`);
    load();
  };

  const statusColor = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'operational' || v === 'available') return 'bg-emerald-100 text-emerald-700';
    if (v === 'occupied' || v === 'maintenance') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  };

  const iconForType = (t) => {
    const v = (t || '').toLowerCase();
    if (v.includes('lab') || v.includes('laboratory')) return <FlaskConical className="w-5 h-5 text-emerald-600" />;
    if (v.includes('mri') || v.includes('scan')) return <Scan className="w-5 h-5 text-sky-600" />;
    if (v.includes('ambulance') || v.includes('transport')) return <Ambulance className="w-5 h-5 text-teal-600" />;
    return <FlaskConical className="w-5 h-5 text-gray-500" />;
  };

  const createSupport = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name'),
      category: fd.get('category'),
      quantity: Number(fd.get('quantity')||0),
      available: Number(fd.get('available')||0),
      status: fd.get('status'),
      location: fd.get('location'),
      notes: fd.get('notes')
    };
    await API.post('/hospital/support', payload);
    load(); e.currentTarget.reset(); setShowSupportModal(false);
  };

  const saveSupport = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      category: fd.get('category'),
      quantity: Number(fd.get('quantity')||0),
      available: Number(fd.get('available')||0),
      status: fd.get('status'),
      location: fd.get('location'),
      notes: fd.get('notes')
    };
    if (editSupport) {
      await API.put(`/hospital/support/${editSupport.id||editSupport._id}`, body);
    } else {
      await API.post('/hospital/support', body);
    }
    setShowSupportModal(false); setEditSupport(null); load();
  };

  const deleteSupport = async (item) => {
    await API.delete(`/hospital/support/${item.id||item._id}`);
    load();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar token={token} setToken={setToken} />
      <div className="flex-1 ml-64 px-8 pb-8">
        <Header token={token} setToken={setToken} />

        <div className="py-6">
          <div className="flex gap-3 mb-4">
            {['wards','nurses','facilities','equipment','support'].map(t => (
              <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded ${tab===t?'bg-primary text-white':'bg-white border'}`}>{t.toUpperCase()}</button>
            ))}
            {loading && <span className="text-sm text-gray-500">Loading...</span>}
          </div>

          {tab==='wards' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Hospital Wards</h3>
                  <p className="text-sm text-gray-500">Manage capacity, occupancy and details</p>
                </div>
                <button onClick={()=>{setEditWard(null); setShowWardModal(true);}} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
                  <Plus className="w-4 h-4" /> Add Ward
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wards.map(w => (
                  <div key={w.id || w._id} className="bg-white rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{w.name}</div>
                        <div className="text-xs text-gray-600">{w.department || '—'} • Floor {w.floor || '—'}</div>
                      </div>
                      <button onClick={()=>{setEditWard(w); setShowWardModal(true);}} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm"><span className="font-semibold">Occupancy:</span> {w.occupancy||0}/{w.capacity||0}</div>
                      <div className="flex gap-2">
                        <button onClick={async()=>{const occ = Math.min((w.occupancy||0)+1, w.capacity||0); await API.put(`/hospital/wards/${w.id||w._id}`, {...w, occupancy:occ}); load();}} className="text-xs px-2 py-1 rounded border">Admit +1</button>
                        <button onClick={async()=>{const occ = Math.max((w.occupancy||0)-1, 0); await API.put(`/hospital/wards/${w.id||w._id}`, {...w, occupancy:occ}); load();}} className="text-xs px-2 py-1 rounded border">Discharge -1</button>
                      </div>
                    </div>
                    {w.notes && (<div className="mt-2 text-xs text-gray-500">{w.notes}</div>)}
                  </div>
                ))}
              </div>

              {showWardModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl w-full max-w-lg p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">{editWard? 'Edit Ward':'Add Ward'}</h4>
                      <button onClick={()=>setShowWardModal(false)} className="text-gray-500">✕</button>
                    </div>
                    <form onSubmit={async (e)=>{
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const body = {
                        name: fd.get('name'), department: fd.get('department'), floor: fd.get('floor'), capacity: Number(fd.get('capacity')||0), occupancy: Number(fd.get('occupancy')||0), notes: fd.get('notes')
                      };
                      if (editWard) await API.put(`/hospital/wards/${editWard.id||editWard._id}`, body); else await API.post('/hospital/wards', body);
                      setShowWardModal(false); setEditWard(null); load();
                    }} className="grid grid-cols-2 gap-3">
                      <input name="name" defaultValue={editWard?.name||''} placeholder="Name" className="border p-2 rounded col-span-2" required />
                      <input name="department" defaultValue={editWard?.department||''} placeholder="Department" className="border p-2 rounded" />
                      <input name="floor" defaultValue={editWard?.floor||''} placeholder="Floor" className="border p-2 rounded" />
                      <input name="capacity" type="number" defaultValue={editWard?.capacity||0} placeholder="Capacity" className="border p-2 rounded" />
                      <input name="occupancy" type="number" defaultValue={editWard?.occupancy||0} placeholder="Occupancy" className="border p-2 rounded" />
                      <input name="notes" defaultValue={editWard?.notes||''} placeholder="Notes" className="border p-2 rounded col-span-2" />
                      <div className="col-span-2 flex justify-end gap-2 mt-2">
                        <button type="button" onClick={()=>setShowWardModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                        <button className="px-4 py-2 rounded bg-primary text-white">{editWard? 'Update':'Create'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==='support' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Support Services</h3>
                  <p className="text-sm text-gray-500">Manage wheelchairs, stretchers, and transport staff</p>
                </div>
                <button type="button" onClick={()=>{ setTab('support'); setEditSupport(null); setShowSupportModal(true); }} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
                  <Plus className="w-4 h-4" /> Add Support
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {support.map(s => (
                  <div key={s.id || s._id} className="bg-white rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-xs text-gray-600">{s.category || '—'} • {s.location || '—'}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(s.status)}`}>{(s.status||'').toLowerCase()||'unknown'}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm"><span className="font-semibold">Available:</span> {s.available||0}/{s.quantity||0}</div>
                      <div className="flex gap-2">
                        <button onClick={()=>{setEditSupport(s); setShowSupportModal(true);}} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border"><Pencil className="w-3 h-3" /> Edit</button>
                        <button onClick={()=>deleteSupport(s)} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border"><XCircle className="w-3 h-3 text-rose-600" /> Delete</button>
                      </div>
                    </div>
                    {s.notes && (<div className="mt-2 text-xs text-gray-500">{s.notes}</div>)}
                  </div>
                ))}
              </div>
              {/* modal moved to page root */}
            </div>
          )}

          {tab==='nurses' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Nursing Staff</h3>
                  <p className="text-sm text-gray-500">Manage nurses, shifts and assignments</p>
                </div>
                <button onClick={()=>{setEditNurse(null); setShowNurseModal(true);}} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
                  <Plus className="w-4 h-4" /> Add Nurse
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nurses.map(n => (
                  <div key={n.id || n._id} className="bg-white rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{n.name} <span className="text-xs text-gray-500">({n.shift||'—'})</span></div>
                        <div className="text-xs text-gray-600">{n.email||'—'} • {n.phone||'—'}</div>
                        <div className="text-xs text-gray-600">Ward: {wards.find(w=> (w.id||w._id) === n.wardId)?.name || 'Unassigned'}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(n.status)}`}>{(n.status||'').toLowerCase()||'unknown'}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={()=>{setEditNurse(n); setShowNurseModal(true);}} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={async()=>{await API.put(`/hospital/nurses/${n.id||n._id}`, {...n, status:'Active'}); load();}} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Set Active
                      </button>
                      <button onClick={async()=>{await API.put(`/hospital/nurses/${n.id||n._id}`, {...n, status:'OnLeave'}); load();}} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <XCircle className="w-3 h-3 text-amber-600" /> On Leave
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showNurseModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl w-full max-w-lg p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">{editNurse? 'Edit Nurse':'Add Nurse'}</h4>
                      <button onClick={()=>setShowNurseModal(false)} className="text-gray-500">✕</button>
                    </div>
                    <form onSubmit={async (e)=>{
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const body = {
                        name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), wardId: fd.get('wardId')||'', shift: fd.get('shift'), licenseNumber: fd.get('licenseNumber'), status: fd.get('status')||'Active'
                      };
                      if (editNurse) await API.put(`/hospital/nurses/${editNurse.id||editNurse._id}`, body); else await API.post('/hospital/nurses', body);
                      setShowNurseModal(false); setEditNurse(null); load();
                    }} className="grid grid-cols-2 gap-3">
                      <input name="name" defaultValue={editNurse?.name||''} placeholder="Name" className="border p-2 rounded col-span-2" required />
                      <input name="email" type="email" defaultValue={editNurse?.email||''} placeholder="Email" className="border p-2 rounded col-span-2" />
                      <input name="phone" defaultValue={editNurse?.phone||''} placeholder="Phone" className="border p-2 rounded col-span-2" />
                      <select name="wardId" defaultValue={editNurse?.wardId||''} className="border p-2 rounded col-span-2">
                        <option value="">Unassigned</option>
                        {wards.map(w => (<option key={w.id||w._id} value={w.id||w._id}>{w.name}</option>))}
                      </select>
                      <select name="shift" defaultValue={editNurse?.shift||'DAY'} className="border p-2 rounded"><option>DAY</option><option>NIGHT</option></select>
                      <input name="licenseNumber" defaultValue={editNurse?.licenseNumber||''} placeholder="License Number" className="border p-2 rounded" />
                      <select name="status" defaultValue={editNurse?.status||'Active'} className="border p-2 rounded"><option>Active</option><option>OnLeave</option><option>Inactive</option></select>
                      <div className="col-span-2 flex justify-end gap-2 mt-2">
                        <button type="button" onClick={()=>setShowNurseModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                        <button className="px-4 py-2 rounded bg-primary text-white">{editNurse? 'Update':'Create'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==='facilities' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Hospital Facilities</h3>
                  <p className="text-sm text-gray-500">Manage equipment, labs, and other facilities</p>
                </div>
                <button onClick={()=>setShowFacilityModal(true)} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
                  <Plus className="w-4 h-4" /> Add Facility
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map(f => (
                  <div key={f.id || f._id} className="bg-white rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          {iconForType(f.type)}
                        </div>
                        <div>
                          <div className="font-semibold">{f.name}</div>
                          <div className="text-xs text-gray-500">{f.type || 'Facility'}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(f.status)}`}>{(f.status||'').toLowerCase() || 'unknown'}</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-xs text-gray-600">{f.location}</div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={()=>updateFacilityStatus(f, 'Operational')} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Set Operational
                      </button>
                      <button onClick={()=>updateFacilityStatus(f, 'Maintenance')} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <Pencil className="w-3 h-3 text-amber-600" /> Maintenance
                      </button>
                      <button onClick={()=>updateFacilityStatus(f, 'Closed')} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border">
                        <XCircle className="w-3 h-3 text-rose-600" /> Close
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showFacilityModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl w-full max-w-lg p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Add Facility</h4>
                      <button onClick={()=>setShowFacilityModal(false)} className="text-gray-500">✕</button>
                    </div>
                    <form onSubmit={createFacility} className="grid grid-cols-2 gap-3">
                      <input name="name" placeholder="Name" className="border p-2 rounded col-span-2" required />
                      <input name="type" placeholder="Type (e.g., Laboratory, MRI Scanner)" className="border p-2 rounded col-span-2" />
                      <input name="location" placeholder="Location" className="border p-2 rounded col-span-2" />
                      <select name="status" className="border p-2 rounded col-span-2"><option>Operational</option><option>Maintenance</option><option>Closed</option></select>
                      <input name="metadata" placeholder="Notes/Metadata" className="border p-2 rounded col-span-2" />
                      <div className="col-span-2 flex justify-end gap-2 mt-2">
                        <button type="button" onClick={()=>setShowFacilityModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                        <button className="px-4 py-2 rounded bg-primary text-white">Create</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==='equipment' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Medical Equipment</h3>
                  <p className="text-sm text-gray-500">Manage ventilators, dialysis machines, oxygen tanks</p>
                </div>
                <button onClick={()=>{setEditEquipment(null); setShowEquipmentModal(true);}} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
                  <Plus className="w-4 h-4" /> Add Equipment
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipment.map(e => (
                  <div key={e.id || e._id} className="bg-white rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{e.name}</div>
                        <div className="text-xs text-gray-600">{e.type || '—'} • {e.location || '—'}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(e.status)}`}>{(e.status||'').toLowerCase()||'unknown'}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm"><span className="font-semibold">Available:</span> {e.available||0}/{e.quantity||0}</div>
                      <div className="flex gap-2">
                        <button onClick={()=>{setEditEquipment(e); setShowEquipmentModal(true);}} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border"><Pencil className="w-3 h-3" /> Edit</button>
                        <button onClick={()=>deleteEquipment(e)} className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded border"><XCircle className="w-3 h-3 text-rose-600" /> Delete</button>
                      </div>
                    </div>
                    {e.notes && (<div className="mt-2 text-xs text-gray-500">{e.notes}</div>)}
                  </div>
                ))}
              </div>

              {showEquipmentModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl w-full max-w-lg p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">{editEquipment? 'Edit Equipment':'Add Equipment'}</h4>
                      <button onClick={()=>{setShowEquipmentModal(false); setEditEquipment(null);}} className="text-gray-500">✕</button>
                    </div>
                    <form onSubmit={saveEquipment} className="grid grid-cols-2 gap-3">
                      <input name="name" defaultValue={editEquipment?.name||''} placeholder="Name (e.g., Ventilator)" className="border p-2 rounded col-span-2" required />
                      <input name="type" defaultValue={editEquipment?.type||''} placeholder="Type/Model" className="border p-2 rounded col-span-2" />
                      <input name="quantity" type="number" defaultValue={editEquipment?.quantity||0} placeholder="Quantity" className="border p-2 rounded" />
                      <input name="available" type="number" defaultValue={editEquipment?.available||0} placeholder="Available" className="border p-2 rounded" />
                      <select name="status" defaultValue={editEquipment?.status||'Operational'} className="border p-2 rounded col-span-2"><option>Operational</option><option>Maintenance</option><option>OutOfService</option></select>
                      <input name="location" defaultValue={editEquipment?.location||''} placeholder="Location (e.g., Building A - ICU)" className="border p-2 rounded col-span-2" />
                      <input name="lastMaintenance" type="datetime-local" defaultValue={editEquipment?.lastMaintenance? new Date(editEquipment.lastMaintenance).toISOString().slice(0,16):''} className="border p-2 rounded col-span-2" />
                      <input name="notes" defaultValue={editEquipment?.notes||''} placeholder="Notes" className="border p-2 rounded col-span-2" />
                      <div className="col-span-2 flex justify-end gap-2 mt-2">
                        <button type="button" onClick={()=>{setShowEquipmentModal(false); setEditEquipment(null);}} className="px-4 py-2 rounded border">Cancel</button>
                        <button className="px-4 py-2 rounded bg-primary text-white">{editEquipment? 'Update':'Create'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {showSupportModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-lg p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">{editSupport? 'Edit Support':'Add Support'}</h4>
                  <button type="button" onClick={()=>{setShowSupportModal(false); setEditSupport(null);}} className="text-gray-500">✕</button>
                </div>
                <form onSubmit={saveSupport} className="grid grid-cols-2 gap-3">
                  <input name="name" defaultValue={editSupport?.name||''} placeholder="Name (e.g., Wheelchair A)" className="border p-2 rounded col-span-2" required />
                  <select name="category" defaultValue={editSupport?.category||'WHEELCHAIR'} className="border p-2 rounded col-span-2">
                    <option>WHEELCHAIR</option>
                    <option>STRETCHER</option>
                    <option>TRANSPORT_STAFF</option>
                  </select>
                  <input name="quantity" type="number" defaultValue={editSupport?.quantity||0} placeholder="Quantity/Headcount" className="border p-2 rounded" />
                  <input name="available" type="number" defaultValue={editSupport?.available||0} placeholder="Available" className="border p-2 rounded" />
                  <select name="status" defaultValue={editSupport?.status||'Available'} className="border p-2 rounded col-span-2">
                    <option>Available</option>
                    <option>InUse</option>
                    <option>Maintenance</option>
                    <option>OffDuty</option>
                  </select>
                  <input name="location" defaultValue={editSupport?.location||''} placeholder="Location/Department" className="border p-2 rounded col-span-2" />
                  <input name="notes" defaultValue={editSupport?.notes||''} placeholder="Notes" className="border p-2 rounded col-span-2" />
                  <div className="col-span-2 flex justify-end gap-2 mt-2">
                    <button type="button" onClick={()=>{setShowSupportModal(false); setEditSupport(null);}} className="px-4 py-2 rounded border">Cancel</button>
                    <button className="px-4 py-2 rounded bg-primary text-white">{editSupport? 'Update':'Create'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HospitalStaffDashboard;
