import React, { useState } from 'react';
import { Users, UserPlus, Shield, Copy, Check, Clock, Key } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const FamilyMembersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateInvite = () => {
    // In Phase 2, this calls POST /api/v1/families/:id/invitations
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInviteCode(code);
  };

  const copyToClipboard = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Family Members</h2>
          <p className="text-slate-500 text-sm">Manage group participants and roles</p>
        </div>

        <button
          onClick={generateInvite}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Invitation Box Modal/Card */}
      {inviteCode && (
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200/80 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
            <Key className="h-4 w-4 text-blue-600" />
            <span>New Family Invitation Code</span>
          </div>
          <p className="text-xs text-blue-700">
            Share this 8-character code with your family member. They can join using their Android app or Web dashboard. Code expires in 48 hours.
          </p>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              readOnly
              value={inviteCode}
              className="flex-1 bg-white border border-blue-300 font-mono font-bold tracking-widest text-center text-lg py-2 rounded-xl text-blue-900 select-all"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Members Grid / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-base">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                  {user?.fullName}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Owner
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Location Sharing On
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

