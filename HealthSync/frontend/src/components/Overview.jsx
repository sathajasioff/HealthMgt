import React, { useState } from 'react';
import { ChevronRight, Activity, TrendingUp } from 'lucide-react';
import { healthcareStats, quickStats } from '../assets/assets';

const Overview = () => {
    const [showAll, setShowAll] = useState(false);

    // Show only first 6 items or all items based on showAll state
    const displayedItems = showAll ? healthcareStats : healthcareStats.slice(0, 6);

    return (
        <>
            {/* Quick Stats Section */}
            <div className="mb-8 px-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Today's Overview</h2>
                    <button className="text-primary text-sm font-medium hover:text-primary flex items-center gap-1">
                        View all stats
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {quickStats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                    <Activity size={24} className={stat.color.replace('bg-', 'text-')} />
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-primary' : 'text-red-600'}`}>
                                <TrendingUp size={14} className={stat.trend === 'down' ? 'rotate-180' : ''} />
                                <span className="font-medium">{stat.change}</span>
                                <span className="text-gray-500">from yesterday</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Healthcare Overview Section */}
            <div className="mb-8 px-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Healthcare Overview</h2>
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-primary text-sm font-medium hover:text-primary flex items-center gap-1"
                    >
                        {showAll ? 'View less' : 'View all'}
                        <ChevronRight size={16} className={`transition-transform ${showAll ? 'rotate-90' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {displayedItems.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-gray-800 font-semibold text-sm mb-2">{item.title}</p>
                                    <p className="text-gray-600 text-xl font-bold mb-1">{item.count}</p>
                                    <p className="text-gray-500 text-xs">{item.available}</p>
                                </div>
                                <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center p-2 ml-4`}>
                                    <img src={item.icon} alt={item.title} className="w-full h-full object-contain" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Overview;