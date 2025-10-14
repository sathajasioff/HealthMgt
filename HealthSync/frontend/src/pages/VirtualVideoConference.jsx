import React, { useState } from 'react'
import DoctorsVirtual from '../components/DoctorsVirtual'
import Sidebar from '../components/Sidebar'

const VirtualVideoConference = () => {
  const [token, setToken] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar token={token} setToken={setToken} />
      
      {/* Main Content */}
      <div className="ml-64 flex-1">
        <DoctorsVirtual />
      </div>
    </div>
  )
}

export default VirtualVideoConference
