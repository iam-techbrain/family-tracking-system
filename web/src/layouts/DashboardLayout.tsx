import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  AlertTriangle,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Live Map', icon: MapPin },
    { to: '/members', label: 'Family Members', icon: Users },
    { to: '/sos', label: 'SOS Alerts', icon: AlertTriangle, badge: 'SOS' },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">Family Circle</h1>
            <p className="text-xs text-slate-500">Live GPS & Safety</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* SOS Panic Shortcut Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => navigate('/sos')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-500/20"
          >
            <ShieldAlert className="h-5 w-5" />
            <span>Emergency SOS</span>
          </button>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-blue-200">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <span className="font-bold text-slate-900 md:hidden">Family Circle</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Tracking Active
            </div>

            <button
              title="Notifications"
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 relative"
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 relative overflow-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden h-16 border-t border-slate-200 bg-white flex items-center justify-around px-2 shrink-0 z-20">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-500'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

