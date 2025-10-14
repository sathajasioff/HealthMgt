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

const Pharmacy = () => {
  const [token, setToken] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notes, setNotes] = useState('');
  const { showToast } = useNotification();

  const pharmacies = [
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
  ];

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = () => {
    const saved = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    setPrescriptions(saved);
  };

  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPrescription = () => {
    if (!prescriptionFile || !selectedPharmacy) {
      showToast('Please select a file and pharmacy', 'error');
      return;
    }

    const newPrescription = {
      id: Date.now(),
      pharmacy: selectedPharmacy,
      fileName: prescriptionFile.name,
      filePreview: prescriptionPreview,
      notes: notes,
      status: 'Pending',
      statusColor: 'bg-yellow-500',
      submittedDate: new Date().toISOString(),
      patientName: 'Current Patient' // In real app, get from auth
    };

    const updated = [newPrescription, ...prescriptions];
    setPrescriptions(updated);
    localStorage.setItem('prescriptions', JSON.stringify(updated));

    showToast('Prescription submitted successfully!', 'success');
    
    // Reset form
    setShowUploadModal(false);
    setSelectedPharmacy(null);
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
    setNotes('');
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
                  <div key={prescription.id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <FileText className="text-blue-600" size={28} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{prescription.pharmacy.name}</h3>
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
                          <div>
                            <p className="text-gray-500">Pharmacy Contact</p>
                            <p className="font-medium text-gray-800">{prescription.pharmacy.phone}</p>
                          </div>
                        </div>

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
