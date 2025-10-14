// import React, { useState } from 'react'
// import Dashboard from './pages/Dashboard'
// import Login from './pages/Login'
// import Register from './pages/Register'
// import { Route, Routes } from 'react-router-dom'
// import Order from './pages/Order'
// import VirtualVideoConference from './pages/VirtualVideoConference'
// import Room from './pages/Room/Room'
// import PaymentGateway from './pages/PaymentGateway'
// import HomeRoom from './pages/Room/HomeRoom'
// import PharmacyLocator from './pages/PharmacyLocator'
// import MedicalRecords from './pages/MedicalRecords'

// const App = () => {
//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route path='/' element={<Login />} />
//       <Route path='/pay' element={<PaymentGateway />} />
//       <Route path='/register' element={<Register />} />

//       <Route path='/room/:roomId' element={<Room />} />
//       <Route path='/homeroom' element={<HomeRoom />} />
//       <Route path='/locator' element={<PharmacyLocator />} />

//       {/* Protected Routes - Dashboard and related pages */}
//       <Route path='/dashboard' element={<Dashboard />} />
//       <Route path='/order' element={<Order />} />
//       <Route path='/virtual' element={<VirtualVideoConference />} />
//       <Route path='/medical-records' element={<MedicalRecords />} />
//       <Route path='/recruitment' element={<Dashboard />} />
//       <Route path='/interview' element={<Dashboard />} />
//       <Route path='/onboarding' element={<Dashboard />} />
//       <Route path='/interview-task' element={<Dashboard />} />
//       <Route path='/appointments' element={<Dashboard />} />
//       <Route path='/training' element={<Dashboard />} />
//       <Route path='/my-profile' element={<Dashboard />} />
//       <Route path='/my-appointments' element={<Dashboard />} />
//     </Routes>
//   )
// }

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Order from "./pages/Order";
import PaymentGateway from "./pages/PaymentGateway";
import VirtualVideoConference from "./pages/VirtualVideoConference";
import PharmacyLocator from "./pages/PharmacyLocator";
import MedicalRecords from "./pages/MedicalRecords";
import Room from "./pages/Room/Room";
import HomeRoom from "./pages/Room/HomeRoom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role?.toUpperCase())) {
    alert("Access denied.");
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pay" element={<PaymentGateway />} />
      <Route path="/locator" element={<PharmacyLocator />} />
      <Route path="/homeroom" element={<HomeRoom />} />
      <Route path="/room/:roomId" element={<Room />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order"
        element={
          <ProtectedRoute allowedRoles={["PATIENT", "STAFF"]}>
            <Order />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-records"
        element={
          <ProtectedRoute allowedRoles={["PATIENT", "DOCTOR"]}>
            <MedicalRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/virtual"
        element={
          <ProtectedRoute allowedRoles={["DOCTOR", "PATIENT"]}>
            <VirtualVideoConference />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
