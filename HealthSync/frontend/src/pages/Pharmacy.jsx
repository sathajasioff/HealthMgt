import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  MapPin, 
  Star, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package,
  Phone,
  Mail,
  Search,
  Filter,
  Download,
  Eye,
  X
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const Pharmacy = () => {
  const [token, setToken] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notes, setNotes] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedApprovedPrescription, setSelectedApprovedPrescription] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('home'); // 'home' | 'pickup'
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const userId = user?.id || user?._id;
  const patientName = user?.name || user?.fullName || user?.username || 'Patient';
  const [pharmacies, setPharmacies] = useState([
    {
      id: 1,
      name: 'City Pharmacy',
      distance: '1.2 km away',
      rating: 4.8,
      stock: 'Full Stock',
      stockColor: 'bg-blue-500',
      address: '123 Main Street, Downtown',
      phone: '+92 300 1234567',
      email: 'city@pharmacy.com',
      hours: '24/7'
    },
    {
      id: 2,
      name: 'MediCare Plus',
      distance: '2.5 km away',
      rating: 4.6,
      stock: 'Partial Stock',
      stockColor: 'bg-teal-500',
      address: '456 Health Avenue, Medical District',
      phone: '+92 300 7654321',
      email: 'medicare@pharmacy.com',
      hours: '8 AM - 10 PM'
    },
    {
      id: 3,
      name: 'HealthHub Pharmacy',
      distance: '3.1 km away',
      rating: 4.9,
      stock: 'Full Stock',
      stockColor: 'bg-blue-500',
      address: '789 Wellness Road, Health Plaza',
      phone: '+92 300 9876543',
      email: 'healthhub@pharmacy.com',
      hours: '24/7'
    },
    {
      id: 4,
      name: 'QuickMed Pharmacy',
      distance: '4.0 km away',
      rating: 4.7,
      stock: 'Full Stock',
      stockColor: 'bg-blue-500',
      address: '321 Express Lane, City Center',
      phone: '+92 300 5551234',
      email: 'quickmed@pharmacy.com',
      hours: '7 AM - 11 PM'
    }
  ]);

  useEffect(() => {
    loadPharmacies();
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      if (!userId) return setPrescriptions([]);
      const res = await API.get(`/prescriptions/patient/${userId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      const withUi = list.map(p => ({
        ...p,
        statusColor: (p.status === 'Approved') ? 'bg-green-500' : (p.status === 'Rejected') ? 'bg-red-500' : 'bg-yellow-500',
      }));
      setPrescriptions(withUi);
    } catch (e) {
      setPrescriptions([]);
    }
  };

  const openDeliveryModal = (prescription) => {
    setSelectedApprovedPrescription(prescription);
    setDeliveryMethod('home');
    setShowDeliveryModal(true);
  };

  const proceedToPayment = async () => {
    if (!selectedApprovedPrescription) return;
    try {
      const rx = selectedApprovedPrescription;
      // If quoted bill exists, create payment snapshot from prescription and use its totals
      if (rx.status === 'Quoted' || (Array.isArray(rx.items) && rx.items.length > 0)) {
        const payRes = await API.post(`/payments/from-prescription/${rx.id || rx._id}`, {
          method: 'creditCard',
          deliveryMethod
        });
        const payment = payRes.data;
        const items = payment.items || rx.items || [];
        const cart = items.map((it, idx) => ({
          id: it.productId || `${idx}`,
          name: it.medicineName,
          image: '',
          price: it.unitPrice || 0,
          quantity: it.quantity || 1
        }));
        const totalPrice = payment.grandTotal ?? payment.totalPrice ?? 0;
        navigate('/pay', { state: { cart, totalPrice, deliveryMethod, paymentId: payment.id } });
        return;
      }

      // Fallback: legacy approved without items
      const price = 0;
      const cart = [{
        id: rx.id || rx._id,
        name: rx.fileName || 'Prescription',
        image: '',
        price,
        quantity: 1
      }];
      navigate('/pay', { state: { cart, totalPrice: price, deliveryMethod } });
    } catch (e) {
      showToast('Failed to prepare payment', 'error');
    }
  };

  const loadPharmacies = async () => {
    try {
      const res = await API.get('/pharmacies');
      const list = Array.isArray(res.data) ? res.data : [];
      // Map to UI fields expected below
      const mapped = list.map((p, idx) => ({
        id: p.id || p._id || idx,
        name: p.name,
        distance: '',
        rating: p.rating ?? 4.7,
        stock: p.stock || 'Full Stock',
        stockColor: 'bg-blue-500',
        address: p.address || '-',
        phone: p.phone || '-',
        email: p.email || '-',
        hours: p.hours || '-',
      }));
      if (mapped.length) setPharmacies(mapped);
    } catch (e) {
      // keep defaults
    }
  };

  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate type and size (<=5MB)
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) {
        showToast('Only images or PDF are allowed', 'error');
        e.target.value = '';
        return;
      }
      if (!isValidSize) {
        showToast('File too large. Max 5MB allowed', 'error');
        e.target.value = '';
        return;
      }
      setPrescriptionFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPrescription = async () => {
    if (!prescriptionFile || !selectedPharmacy) {
      showToast('Please select a file and pharmacy', 'error');
      return;
    }
    if (!userId) {
      showToast('Login required', 'error');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('patientId', userId);
      fd.append('patientName', patientName);
      fd.append('file', prescriptionFile);
      if (notes) fd.append('notes', notes);
      fd.append('pharmacyName', selectedPharmacy.name);
      if (selectedPharmacy.address) fd.append('pharmacyAddress', selectedPharmacy.address);
      if (selectedPharmacy.phone) fd.append('pharmacyPhone', selectedPharmacy.phone);
      if (selectedPharmacy.email) fd.append('pharmacyEmail', selectedPharmacy.email);
      if (selectedPharmacy.hours) fd.append('pharmacyHours', selectedPharmacy.hours);
      if (selectedPharmacy.rating != null) fd.append('pharmacyRating', selectedPharmacy.rating);
      if (selectedPharmacy.stock) fd.append('pharmacyStock', selectedPharmacy.stock);

      await API.post('/prescriptions/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Prescription submitted successfully!', 'success');
      await loadPrescriptions();
      // Reset form
      setShowUploadModal(false);
      setSelectedPharmacy(null);
      setPrescriptionFile(null);
      setPrescriptionPreview(null);
      setNotes('');
    } catch (e) {
      showToast('Failed to submit prescription', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'Rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar token={token} setToken={setToken} />

      <div className="flex-1 ml-64 px-8 pb-8">
        <Header token={token} setToken={setToken} />

        <div className="py-8">
          {/* Page Header */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Package className="text-primary" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Pharmacy Services</h1>
                <p className="text-gray-600 mt-1">Select a pharmacy and upload your prescription</p>
              </div>
            </div>
          </div>

          {/* Select Pharmacy Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Pharmacy</h2>
            <p className="text-gray-600 mb-6">Choose a nearby pharmacy with stock availability</p>

            <div className="space-y-4">
              {pharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  onClick={() => handlePharmacySelect(pharmacy)}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                      <MapPin size={28} className="text-primary group-hover:text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{pharmacy.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{pharmacy.distance}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500 fill-yellow-500" size={16} />
                          <span className="text-sm font-semibold text-gray-700">{pharmacy.rating}</span>
                        </div>
                        
                        <span className={`${pharmacy.stockColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                          {pharmacy.stock}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium">
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Prescriptions Section */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">My Prescriptions</h2>
            <p className="text-gray-600 mb-6">Track your prescription submissions and approvals</p>

            {prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Prescriptions Yet</h3>
                <p className="text-gray-600">Select a pharmacy above to submit your first prescription</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id || prescription._id}
                    className={`border-2 border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow ${prescription.status === 'Approved' ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (prescription.status === 'Approved' || prescription.status === 'Quoted') openDeliveryModal(prescription);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <FileText className="text-blue-600" size={28} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{prescription.pharmacy?.name || prescription.pharmacyName || 'Pharmacy'}</h3>
                            <p className="text-sm text-gray-600">{prescription.fileName}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getStatusIcon(prescription.status)}
                            <span className={`${prescription.statusColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                              {prescription.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Submitted</p>
                            <p className="font-medium text-gray-800">
                              {new Date(prescription.submittedDate).toLocaleDateString()}
                            </p>
                          </div>
                          {prescription.pharmacy?.phone && (
                            <div>
                              <p className="text-gray-500">Pharmacy Contact</p>
                              <p className="font-medium text-gray-800">{prescription.pharmacy.phone}</p>
                            </div>
                          )}
                        </div>
                        {(prescription.status === 'Approved' || prescription.status === 'Quoted') && (
                          <div className="mt-3">
                            <span className="inline-block text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">{prescription.status === 'Quoted' ? 'Quoted • Click to review and choose delivery' : 'Approved • Click to choose delivery method'}</span>
                          </div>
                        )}
                        {prescription.status === 'Quoted' && Array.isArray(prescription.items) && (
                          <div className="mt-4">
                            <div className="text-sm font-semibold text-gray-800 mb-2">Quoted Items</div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="text-left text-gray-500">
                                    <th className="py-1 pr-4">Medicine</th>
                                    <th className="py-1 pr-4">Dosage</th>
                                    <th className="py-1 pr-4">Qty</th>
                                    <th className="py-1 pr-4">Unit</th>
                                    <th className="py-1 pr-4">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {prescription.items.map((it, i) => (
                                    <tr key={i} className="border-t border-gray-100">
                                      <td className="py-1 pr-4">{it.medicineName}</td>
                                      <td className="py-1 pr-4">{it.dosage}</td>
                                      <td className="py-1 pr-4">{it.quantity}</td>
                                      <td className="py-1 pr-4">Rs.{(it.unitPrice || 0).toFixed(2)}</td>
                                      <td className="py-1 pr-4">Rs.{(it.lineTotal || ((it.unitPrice||0)*(it.quantity||0))).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="mt-2 text-sm text-gray-700">
                              <div>Subtotal: <span className="font-semibold">Rs.{(prescription.subtotal ?? 0).toFixed(2)}</span></div>
                              <div>Tax: <span className="font-semibold">Rs.{(prescription.taxAmount ?? 0).toFixed(2)}</span></div>
                              <div>Delivery: <span className="font-semibold">Rs.{(prescription.deliveryFee ?? 0).toFixed(2)}</span></div>
                              <div className="font-bold">Grand Total: <span className="text-primary">Rs.{(prescription.grandTotal ?? prescription.totalPrice ?? 0).toFixed(2)}</span></div>
                            </div>
                          </div>
                        )}
                        {prescription.notes && (
                          <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{prescription.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Method Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Delivery Method</h3>
              <p className="text-gray-600 text-sm">How would you like to receive your medicines?</p>
            </div>
            <div className="p-6 space-y-4">
              <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer ${deliveryMethod === 'home' ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-primary/50'}`}>
                <input type="radio" name="delivery" className="mt-1" checked={deliveryMethod === 'home'} onChange={() => setDeliveryMethod('home')} />
                <div>
                  <div className="font-semibold text-gray-900">Home Delivery</div>
                  <div className="text-sm text-gray-500">Delivered within 2-4 hours</div>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer ${deliveryMethod === 'pickup' ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-primary/50'}`}>
                <input type="radio" name="delivery" className="mt-1" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} />
                <div>
                  <div className="font-semibold text-gray-900">Store Pickup</div>
                  <div className="text-sm text-gray-500">Ready in 30 minutes</div>
                </div>
              </label>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={() => { setShowDeliveryModal(false); setSelectedApprovedPrescription(null); }} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold">Cancel</button>
              <button onClick={proceedToPayment} className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Prescription Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-teal-500 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Upload size={28} className="text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Upload Prescription</h2>
                  <p className="text-white/90 text-sm">{selectedPharmacy?.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedPharmacy(null);
                  setPrescriptionFile(null);
                  setPrescriptionPreview(null);
                  setNotes('');
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Pharmacy Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3">Pharmacy Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-gray-700">{selectedPharmacy?.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-gray-700">{selectedPharmacy?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-gray-700">{selectedPharmacy?.hours}</span>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Prescription <span className="text-red-500">*</span>
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="prescription-upload"
                  />
                  <label htmlFor="prescription-upload" className="cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-700 font-medium mb-1">
                      {prescriptionFile ? prescriptionFile.name : 'Click to upload prescription'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPG, PNG, PDF (Max 5MB)
                    </p>
                  </label>
                </div>

                {/* Preview */}
                {prescriptionPreview && (
                  <div className="mt-4 border-2 border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
                    {prescriptionFile.type.startsWith('image/') ? (
                      <img 
                        src={prescriptionPreview} 
                        alt="Prescription preview" 
                        className="w-full h-64 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                        <FileText className="text-red-500" size={32} />
                        <div>
                          <p className="font-medium text-gray-800">{prescriptionFile.name}</p>
                          <p className="text-sm text-gray-500">PDF Document</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or requirements..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedPharmacy(null);
                    setPrescriptionFile(null);
                    setPrescriptionPreview(null);
                    setNotes('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPrescription}
                  disabled={!prescriptionFile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
