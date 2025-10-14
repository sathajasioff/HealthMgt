// PharmacyLocator.jsx
import React, { useState } from 'react';

const PharmacyLocator = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample pharmacy data
  const pharmacies = [
    {
      id: 1,
      name: "MediCare Pharmacy",
      location: "Borella",
      address: "123 Galle Road, Colombo 08",
      distance: "1.2 km",
      eta: "6 min",
      stockStatus: "all",
      rating: 4.7,
      isOpen: true,
      medicines: ["Aspirin 100mg", "Amoxicillin 250mg"],
      coordinates: { lat: 6.9271, lng: 79.8612 }
    },
    {
      id: 2,
      name: "HealthPlus",
      location: "Narahenpita",
      address: "45 Union Place, Colombo 02",
      distance: "3.5 km",
      eta: "12 min",
      stockStatus: "partial",
      rating: 4.4,
      isOpen: true,
      medicines: [],
      coordinates: { lat: 6.9018, lng: 79.8605 }
    },
    {
      id: 3,
      name: "CityCare 24/7",
      location: "Colombo Fort",
      address: "78 York Street, Colombo 01",
      distance: "2.1 km",
      eta: "8 min",
      stockStatus: "none",
      rating: 4.2,
      isOpen: true,
      medicines: [],
      coordinates: { lat: 6.9344, lng: 79.8428 }
    }
  ];

  // Filter pharmacies based on search term
  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status styles based on stock status
  const getStatusStyles = (status) => {
    switch (status) {
      case 'all':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'none':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'all':
        return 'All in Stock';
      case 'partial':
        return 'Partial';
      case 'none':
        return 'None';
      default:
        return 'Unknown';
    }
  };

  // Handle pickup action
  const handlePickup = (pharmacyName) => {
    alert(`Pickup requested from ${pharmacyName}. You will receive a confirmation shortly.`);
  };

  // Handle check stock action
  const handleCheckStock = (pharmacyName) => {
    alert(`Checking stock availability at ${pharmacyName}...`);
  };

  // Handle select action
  const handleSelect = (pharmacyName) => {
    alert(`${pharmacyName} selected. Proceeding to order details.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hospital Management System
          </h1>
          <p className="text-gray-600">Find pharmacies in Colombo, Sri Lanka</p>
        </header>

        {/* Map View Section */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Map View</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="font-medium text-gray-900">{pharmacy.name}</div>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles(pharmacy.stockStatus)}`}>
                  {getStatusText(pharmacy.stockStatus)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search pharmacy or area"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Pharmacy List */}
        <div className="space-y-6">
          {filteredPharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
              {/* Pharmacy Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pharmacy.name} — {pharmacy.location}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{pharmacy.address}</p>
                </div>
              </div>

              {/* Distance and ETA */}
              <div className="flex items-center text-gray-600 mb-4">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{pharmacy.distance} • ETA {pharmacy.eta}</span>
              </div>

              {/* Pharmacy Info */}
              <div className="flex flex-wrap items-center justify-between mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles(pharmacy.stockStatus)}`}>
                  {getStatusText(pharmacy.stockStatus)}
                </span>
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {pharmacy.rating} • {pharmacy.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              {/* Medicines */}
              {pharmacy.medicines.length > 0 && (
                <div className="mb-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {pharmacy.medicines.map((medicine, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {medicine}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {pharmacy.stockStatus === 'all' && (
                  <button
                    onClick={() => handlePickup(pharmacy.name)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Pickup
                  </button>
                )}
                
                {pharmacy.stockStatus === 'partial' && (
                  <>
                    <button
                      onClick={() => handleCheckStock(pharmacy.name)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Check Stock
                    </button>
                    <button
                      onClick={() => handleSelect(pharmacy.name)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Select
                    </button>
                  </>
                )}
                
                {pharmacy.stockStatus === 'none' && (
                  <button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredPharmacies.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyLocator;