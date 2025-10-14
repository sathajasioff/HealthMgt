import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AppointmentList from '../components/AppointmentList';
import Overview from '../components/Overview';
import ProductsAvailability from '../components/ProductsAvailability';

const Dashboard = () => {
    const [token, setToken] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar token={token} setToken={setToken} />

            <div className="flex-1 ml-64 px-8 pb-8">
                <Header token={token} setToken={setToken} />

                <div className="py-8 space-y-8">
                    <Overview />
                    <AppointmentList/>
                    
                    <ProductsAvailability />
                    
                </div>
            </div>
        </div>
    );
};

export default Dashboard;