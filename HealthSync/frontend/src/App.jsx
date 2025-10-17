import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Order from "./pages/Order";
import PaymentGateway from "./pages/PaymentGateway";
import VirtualVideoConference from "./pages/VirtualVideoConference";
import PharmacyLocator from "./pages/PharmacyLocator";
import MedicalRecords from "./pages/MedicalRecords";
import Pharmacy from "./pages/Pharmacy";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import HospitalStaffDashboard from "./pages/HospitalStaffDashboard";
import ParamedicsDashboard from "./pages/ParamedicsDashboard";
import Room from "./pages/Room/Room";
import HomeRoom from "./pages/Room/HomeRoom";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Track from "./pages/Track";

// Protected route component
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
    <NotificationProvider>
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
          path="/staff-dashboard"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "STAFF", "PHARMACY", "ADMIN"]}>
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
            <ProtectedRoute allowedRoles={["STAFF","DOCTOR", "PATIENT"]}>
              <VirtualVideoConference />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy"
          element={
            <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "PATIENT"]}>
              <Pharmacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy-dashboard"
          element={
            <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "PHARMACY"]}>
              <PharmacyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-dashboard"
          element={
            <ProtectedRoute allowedRoles={["HOSPITAL_STAFF", "ADMIN"]}>
              <HospitalStaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paramedics-dashboard"
          element={
            <ProtectedRoute allowedRoles={["PARAMEDIC", "ADMIN"]}>
              <ParamedicsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "STAFF", "ADMIN"]}>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* Tracking */}
        <Route
          path="/track/:id"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "PARAMEDIC", "ADMIN", "HOSPITAL_STAFF"]}>
              <Track />
            </ProtectedRoute>
          }
        />

        {/* Additional Dashboard Pages */}
        <Route path="/recruitment" element={<Dashboard />} />
        <Route path="/interview" element={<Dashboard />} />
        <Route path="/onboarding" element={<Dashboard />} />
        <Route path="/interview-task" element={<Dashboard />} />
        <Route path="/appointments" element={<Dashboard />} />
        <Route path="/training" element={<Dashboard />} />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/my-appointments" element={<Dashboard />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </NotificationProvider>
  );
};

export default App;
