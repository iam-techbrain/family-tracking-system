import React, { useState } from 'react';
import { Shield, Eye, Database, Bell, Moon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [sharingCurrent, setSharingCurrent] = useState(true);
  const [sharingHistory, setSharingHistory] = useState(true);
  const [retentionDays, setRetentionDays] = useState(7);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Privacy & Settings</h2>
        <p className="text-slate-500 text-sm">Control how your location is shared with family members</p>
      </div>

      {/* Location Privacy Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 mt-0.5">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Share Live Location</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Allows family members to view your real-time coordinates on the map.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sharingCurrent}
              onChange={(e) => setSharingCurrent(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 mt-0.5">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Location History Retention</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically purge historical location breadcrumbs older than chosen days.
              </p>
            </div>
          </div>
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value={1}>1 Day</option>
            <option value={3}>3 Days</option>
            <option value={7}>7 Days (Default)</option>
            <option value={14}>14 Days</option>
            <option value={30}>30 Days</option>
          </select>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 mt-0.5">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Family Notifications</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Receive notifications when family members arrive/leave safe zones or broadcast SOS.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Account Details Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">Account Overview</h4>
        <p className="text-xs text-slate-500">Name: <span className="font-medium text-slate-800">{user?.fullName}</span></p>
        <p className="text-xs text-slate-500">Email: <span className="font-medium text-slate-800">{user?.email}</span></p>
      </div>
    </div>
  );
};

