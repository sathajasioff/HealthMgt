import React, { useEffect, useMemo, useState } from 'react';
import { Search, Bell, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useNotification } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import API from '../services/api';

const Header = ({ token, setToken }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const { unreadCount } = useNotification();

    const scrollToAppointments = () => {
        const appointmentsSection = document.getElementById('appointments-section');
        if (appointmentsSection) {
            appointmentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const parseUser = () => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } };
    const [userState, setUserState] = useState(parseUser());
    useEffect(() => {
        const handler = () => setUserState(parseUser());
        window.addEventListener('user:updated', handler);
        window.addEventListener('storage', handler);
        window.addEventListener('focus', handler);
        return () => {
            window.removeEventListener('user:updated', handler);
            window.removeEventListener('storage', handler);
            window.removeEventListener('focus', handler);
        };
    }, []);

    const user = userState;
    const role = user?.role?.toUpperCase?.() || '';
    const name = user?.name || 'Guest';
    const displayName = role === 'DOCTOR' ? (name.startsWith('Dr.') ? name : `Dr. ${name}`) : name;
    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 5) return 'Good Night';
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    })();

    const [todayCount, setTodayCount] = useState(0);
    const [todayPatients, setTodayPatients] = useState(0);
    const todayStr = useMemo(() => {
        const d = new Date();
        const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const userId = user?.id || user?._id;
                if (!userId) return;
                if (role === 'DOCTOR') {
                    // Resolve doctorId by userId
                    const docsRes = await API.get('/doctors');
                    const docs = Array.isArray(docsRes.data) ? docsRes.data : [];
                    const me = docs.find(d => d.userId === userId);
                    const doctorId = me ? (me.id || me._id) : userId; // fallback
                    const res = await API.get(`/checkups/doctor/${doctorId}`);
                    const items = Array.isArray(res.data) ? res.data : [];
                    const todays = items.filter(c => (c.scheduledDate || '').startsWith(todayStr));
                    setTodayCount(todays.length);
                    const uniquePatients = new Set(todays.map(c => c.patientId).filter(Boolean));
                    setTodayPatients(uniquePatients.size);
                } else {
                    const res = await API.get(`/checkups/patient/${userId}`);
                    const items = Array.isArray(res.data) ? res.data : [];
                    const todays = items.filter(c => (c.scheduledDate || '').startsWith(todayStr));
                    setTodayCount(todays.length);
                }
            } catch (e) {
                // noop
            }
        };
        fetchCounts();
    }, [role, user, todayStr]);

    const apiBase = API.defaults?.baseURL || '';
    const origin = apiBase.replace(/\/?api\/?$/, '');
    const toAbsolute = (url) => {
        if (!url) return null;
        if (/^https?:\/\//i.test(url)) return url;
        return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
    };
    const profileImage = toAbsolute(user?.imageUrl) || assets.profile_pic;

    return (
        <div className="bg-white py-8 border-b border-gray-200">
            <div className="flex items-center justify-between gap-6 mb-6 mx-8">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl">
                    <div className={`relative transition-all duration-200 ${
                        isSearchFocused ? 'ring-2 ring-green-500 ring-opacity-20 rounded-xl' : ''
                    }`}>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search patients, doctors, appointments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={16} className="text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-12">
                    <button 
                        onClick={() => setIsNotificationPanelOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                    >
                        <Bell size={20} className="text-gray-700" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {token ? (
                        <div className='flex items-center gap-2 cursor-pointer group relative'>
                            <img className='w-8 h-8 object-cover rounded-full' src={profileImage} alt="profile" />
                            <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
                                <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                                    <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                                    <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>
                            Create account
                        </button>
                    )}
                </div>
            </div>

            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-primary rounded-lg via-primary to-primary px-10 py-8 flex items-center justify-between overflow-hidden relative mx-8">
                {/* Left Content */}
                <div className="flex-1 z-10">
                    <h1 className="text-white text-3xl font-bold mb-6">
                        {greeting}, {displayName}
                    </h1>
                    <div className="flex items-center gap-3 mb-6">
                        <img src={assets.group_profiles} alt="Profiles" className="h-10" />
                        <p className="text-white text-opacity-90 text-md">
                            {role === 'DOCTOR'
                                ? `You have ${todayCount} appointments today. ${todayPatients} patients scheduled.`
                                : `You have ${todayCount} checkups scheduled today.`}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={scrollToAppointments}
                            className="bg-white text-primary px-6 py-2 rounded-lg text-sm font-semibold"
                        >
                            View Appointments
                        </button>
                        <button className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary transition-colors border border-green-400">
                            Emergency Cases
                        </button>
                    </div>
                </div>

                {/* Right Image */}
                <div className="relative flex items-end justify-end z-10 -mb-8 -mr-10">
                    <img
                        src={assets.header_img}
                        alt="Healthcare Dashboard"
                        className="h-64 w-auto object-cover object-top"
                    />
                </div>
            </div>

            {/* Notification Panel */}
            <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
            />
        </div>
    );
};

export default Header;