import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Phone, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const SosAlertsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isConfirming, setIsConfirming] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const handleTriggerSOS = () => {
    // In Phase 6, this triggers POST /api/v1/sos
    setTriggered(true);
    setIsConfirming(false);
    setTimeout(() => setTriggered(false), 5000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Prominent Emergency Action Section */}
      <div className="bg-red-50/80 border-2 border-red-200 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full text-red-600 mb-2">
          <ShieldAlert className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-red-950">Emergency Assistance</h2>
        <p className="text-sm text-red-800 max-w-md mx-auto">
          Tapping SOS sends an instant priority alert with your exact coordinates to all connected family members.
        </p>

        {triggered ? (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center justify-center gap-2 max-w-md mx-auto text-sm font-bold">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>SOS Alert Broadcasted to Family Members!</span>
          </div>
        ) : !isConfirming ? (
          <div className="pt-2">
            <button
              onClick={() => setIsConfirming(true)}
              className="py-4 px-8 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-lg sm:text-xl rounded-2xl shadow-xl shadow-red-500/30 transition-all uppercase tracking-wider"
            >
              Trigger SOS Alert
            </button>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-2xl border border-red-300 max-w-md mx-auto space-y-3">
            <p className="font-bold text-red-900 text-sm">Are you sure you want to broadcast SOS?</p>
            <div className="flex gap-2">
              <button
                onClick={handleTriggerSOS}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl"
              >
                Yes, Send Emergency Alert
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Native phone dialer alternative */}
        <div className="pt-4 border-t border-red-200/60 max-w-xs mx-auto">
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call National Emergency (112)</span>
          </a>
        </div>
      </div>

      {/* Recent Alerts Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-500" />
          <span>Recent SOS History</span>
        </h3>
        <div className="text-center py-8 text-slate-400 text-sm">
          No recent emergency alerts triggered in your family group.
        </div>
      </div>
    </div>
  );
};

