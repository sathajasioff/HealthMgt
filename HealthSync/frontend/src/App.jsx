import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import { Route, Routes } from 'react-router-dom'
import Order from './pages/Order'
import VirtualVideoConference from './pages/VirtualVideoConference'
import Room from './pages/Room/Room'
import PaymentGateway from './pages/PaymentGateway'
import HomeRoom from './pages/Room/HomeRoom'
import PharmacyLocator from './pages/PharmacyLocator'
import MedicalRecords from './pages/MedicalRecords'

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path='/' element={<Login />} />
      <Route path='/pay' element={<PaymentGateway />} />
      <Route path='/register' element={<Register />} />

      <Route path='/room/:roomId' element={<Room />} />
      <Route path='/homeroom' element={<HomeRoom />} />
      <Route path='/locator' element={<PharmacyLocator />} />

      {/* Protected Routes - Dashboard and related pages */}
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/order' element={<Order />} />
      <Route path='/virtual' element={<VirtualVideoConference />} />
      <Route path='/medical-records' element={<MedicalRecords />} />
      <Route path='/recruitment' element={<Dashboard />} />
      <Route path='/interview' element={<Dashboard />} />
      <Route path='/onboarding' element={<Dashboard />} />
      <Route path='/interview-task' element={<Dashboard />} />
      <Route path='/appointments' element={<Dashboard />} />
      <Route path='/training' element={<Dashboard />} />
      <Route path='/my-profile' element={<Dashboard />} />
      <Route path='/my-appointments' element={<Dashboard />} />
    </Routes>
  )
}

export default App
