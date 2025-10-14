import React, { useState } from 'react'
import Products from '../components/Products'
import Sidebar from '../components/Sidebar'

const Order = () => {
  const [token, setToken] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar token={token} setToken={setToken} />
      
      {/* Main Content */}
      <div className="ml-64 flex-1">
        <Products />
      </div>
    </div>
  )
}

export default Order
