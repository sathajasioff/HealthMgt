import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MedicalRecordForm from '../components/MedicalRecordForm';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  User,
  Eye,
  Download,
  Filter,
  ChevronDown,
  Activity,
  Pill,
  Stethoscope,
  X
} from 'lucide-react';

const MedicalRecords = () => {
  const [token, setToken] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, filterDate, records]);

  const loadRecords = () => {
    const savedRecords = JSON.parse(localStorage.getItem('medicalRecords') || '[]');
    setRecords(savedRecords);
    setFilteredRecords(savedRecords);
  };

  const filterRecords = () => {
    let filtered = [...records];

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter(record => 
        record.consultationDate === filterDate
      );
    }

    setFilteredRecords(filtered);
  };

  const handleSaveRecord = (recordData) => {
    loadRecords();
    setShowForm(false);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
  };

  const handleDownloadRecord = (record) => {
    const recordText = `
MEDICAL RECORD
==============

Patient Information:
- Name: ${record.patientName}
- Age: ${record.patientAge}
- Gender: ${record.patientGender}
- Date: ${record.consultationDate}

Chief Complaint:
${record.chiefComplaint}

Symptoms:
${record.symptoms || 'N/A'}

Vital Signs:
- Blood Pressure: ${record.vitalSigns.bloodPressure || 'N/A'}
- Heart Rate: ${record.vitalSigns.heartRate || 'N/A'}
- Temperature: ${record.vitalSigns.temperature || 'N/A'}
- Respiratory Rate: ${record.vitalSigns.respiratoryRate || 'N/A'}
- O2 Saturation: ${record.vitalSigns.oxygenSaturation || 'N/A'}

Medical History:
${record.medicalHistory || 'N/A'}

Allergies:
${record.allergies || 'N/A'}

Diagnosis:
${record.diagnosis}

Current Medications:
${record.currentMedications || 'N/A'}

Prescribed Medications:
${record.prescribedMedications || 'N/A'}

Lab Tests:
${record.labTests || 'N/A'}

Recommendations:
${record.recommendations || 'N/A'}

Additional Notes:
${record.notes || 'N/A'}

Follow-up Date: ${record.followUpDate || 'N/A'}
    `;

    const blob = new Blob([recordText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_record_${record.patientName.replace(/\s+/g, '_')}_${record.consultationDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar token={token} setToken={setToken} />

      <div className="flex-1 ml-64 px-8 pb-8">
        <Header token={token} setToken={setToken} />

        <div className="py-8">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="text-primary" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Medical Records</h1>
                  <p className="text-gray-600 mt-1">Manage patient medical records and consultations</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium shadow-md"
              >
                <Plus size={20} />
                New Record
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Records
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by patient name, diagnosis, or complaint..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            {(searchTerm || filterDate) && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing {filteredRecords.length} of {records.length} records
                </span>
                {(searchTerm || filterDate) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterDate('');
                    }}
                    className="text-sm text-primary hover:text-green-600 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Medical Records Found</h3>
                <p className="text-gray-600 mb-6">
                  {records.length === 0 
                    ? "Start by creating a new medical record for your patients."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {records.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Create First Record
                  </button>
                )}
              </div>
            ) : (
              filteredRecords.map((record, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <User className="text-primary" size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{record.patientName}</h3>
                            <p className="text-sm text-gray-600">
                              {record.patientAge} years • {record.patientGender}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-start gap-2">
                            <Calendar className="text-gray-400 mt-1" size={16} />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Consultation Date</p>
                              <p className="text-sm text-gray-800">{new Date(record.consultationDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Stethoscope className="text-gray-400 mt-1" size={16} />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Chief Complaint</p>
                              <p className="text-sm text-gray-800">{record.chiefComplaint}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Activity className="text-gray-400 mt-1" size={16} />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Diagnosis</p>
                              <p className="text-sm text-gray-800">{record.diagnosis}</p>
                            </div>
                          </div>
                          
                          {record.prescribedMedications && (
                            <div className="flex items-start gap-2">
                              <Pill className="text-gray-400 mt-1" size={16} />
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Prescribed Medications</p>
                                <p className="text-sm text-gray-800 line-clamp-2">{record.prescribedMedications}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="p-2 text-primary hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleDownloadRecord(record)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Record"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Medical Record Form Modal */}
      {showForm && (
        <MedicalRecordForm
          onClose={() => setShowForm(false)}
          onSave={handleSaveRecord}
        />
      )}

      {/* View Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={28} />
                <div>
                  <h2 className="text-2xl font-bold">Medical Record Details</h2>
                  <p className="text-green-100 text-sm">{selectedRecord.patientName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-white hover:bg-green-700 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Patient Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-800">{selectedRecord.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium text-gray-800">{selectedRecord.patientAge} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium text-gray-800">{selectedRecord.patientGender}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Consultation Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-800">{new Date(selectedRecord.consultationDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chief Complaint</p>
                    <p className="font-medium text-gray-800">{selectedRecord.chiefComplaint}</p>
                  </div>
                  {selectedRecord.symptoms && (
                    <div>
                      <p className="text-sm text-gray-600">Symptoms</p>
                      <p className="font-medium text-gray-800">{selectedRecord.symptoms}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vital Signs */}
              {Object.values(selectedRecord.vitalSigns).some(v => v) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Vital Signs
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedRecord.vitalSigns.bloodPressure && (
                      <div>
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.bloodPressure}</p>
                      </div>
                    )}
                    {selectedRecord.vitalSigns.heartRate && (
                      <div>
                        <p className="text-sm text-gray-600">Heart Rate</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.heartRate}</p>
                      </div>
                    )}
                    {selectedRecord.vitalSigns.temperature && (
                      <div>
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.temperature}</p>
                      </div>
                    )}
                    {selectedRecord.vitalSigns.respiratoryRate && (
                      <div>
                        <p className="text-sm text-gray-600">Respiratory Rate</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.respiratoryRate}</p>
                      </div>
                    )}
                    {selectedRecord.vitalSigns.oxygenSaturation && (
                      <div>
                        <p className="text-sm text-gray-600">O2 Saturation</p>
                        <p className="font-medium text-gray-800">{selectedRecord.vitalSigns.oxygenSaturation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical History & Diagnosis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Stethoscope size={20} className="text-primary" />
                  Medical History & Diagnosis
                </h3>
                <div className="space-y-3">
                  {selectedRecord.medicalHistory && (
                    <div>
                      <p className="text-sm text-gray-600">Medical History</p>
                      <p className="font-medium text-gray-800">{selectedRecord.medicalHistory}</p>
                    </div>
                  )}
                  {selectedRecord.allergies && (
                    <div>
                      <p className="text-sm text-gray-600">Allergies</p>
                      <p className="font-medium text-gray-800">{selectedRecord.allergies}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Diagnosis</p>
                    <p className="font-medium text-gray-800">{selectedRecord.diagnosis}</p>
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Pill size={20} className="text-primary" />
                  Medications & Treatment
                </h3>
                <div className="space-y-3">
                  {selectedRecord.currentMedications && (
                    <div>
                      <p className="text-sm text-gray-600">Current Medications</p>
                      <p className="font-medium text-gray-800">{selectedRecord.currentMedications}</p>
                    </div>
                  )}
                  {selectedRecord.prescribedMedications && (
                    <div>
                      <p className="text-sm text-gray-600">Prescribed Medications</p>
                      <p className="font-medium text-gray-800">{selectedRecord.prescribedMedications}</p>
                    </div>
                  )}
                  {selectedRecord.labTests && (
                    <div>
                      <p className="text-sm text-gray-600">Lab Tests Ordered</p>
                      <p className="font-medium text-gray-800">{selectedRecord.labTests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {(selectedRecord.recommendations || selectedRecord.notes) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    Recommendations & Notes
                  </h3>
                  <div className="space-y-3">
                    {selectedRecord.recommendations && (
                      <div>
                        <p className="text-sm text-gray-600">Recommendations</p>
                        <p className="font-medium text-gray-800">{selectedRecord.recommendations}</p>
                      </div>
                    )}
                    {selectedRecord.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Additional Notes</p>
                        <p className="font-medium text-gray-800">{selectedRecord.notes}</p>
                      </div>
                    )}
                    {selectedRecord.followUpDate && (
                      <div>
                        <p className="text-sm text-gray-600">Follow-up Date</p>
                        <p className="font-medium text-gray-800">{new Date(selectedRecord.followUpDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => handleDownloadRecord(selectedRecord)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
