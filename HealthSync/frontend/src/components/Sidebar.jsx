import React from 'react';
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Video,
  FileText,
  MessageSquare,
  Calendar,
  GraduationCap,
  LogOut,
  ClipboardList,
  CalendarCheck,
  Pill
} from 'lucide-react';

const Sidebar = ({ token, setToken }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Virtual Conference', icon: Video, path: '/virtual' },
    { name: 'Medical Records', icon: ClipboardList, path: '/medical-records' },
    { name: 'Pharmacy', icon: Pill, path: '/pharmacy' },
    { name: 'Products', icon: ShoppingBag, path: '/order' },
    { name: 'Check-Ups', icon: CalendarCheck, path: '/appointments', scrollTo: 'appointments-section' },
  ];

  const handleNavClick = (e, item) => {
    if (item.scrollTo) {
      e.preventDefault();
      navigate('/dashboard');
      setTimeout(() => {
        const element = document.getElementById(item.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between py-6 px-3 z-40">
      {/* Logo Section */}
      <div>
        <div className="flex justify-start mb-8">
          <img
            className="w-44 cursor-pointer"
            src={assets.Logo}
            alt="Smart Healthcare"
            onClick={() => navigate('/')}
          />
        </div>


        {/* Menu Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-primary shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
                    )}
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                      className={`transition-all duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}
                    />
                    <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Section */}
      <div className="px-1 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            setToken(false);
          }}
          className="flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full py-3 px-4 rounded-xl group"
        >
          <LogOut size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;