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