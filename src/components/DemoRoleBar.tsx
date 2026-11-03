import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, ShoppingBag, LogOut, Check, Info } from 'lucide-react';
import { UserRole } from '../types';

export const DemoRoleBar: React.FC = () => {
  const { user, switchDemoRole, logout, setIsAuthModalOpen, setAuthModalMode } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRoleSwitch = async (role: UserRole) => {
    const res = await switchDemoRole(role);
    if (res.success) {
      setFeedback(`Switched to ${role.toUpperCase()}`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 text-neutral-300 text-xs py-2 px-4 shadow-sm z-40 relative">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role explanation indicator */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white tracking-wide uppercase text-[11px]">Role-Based Access:</span>
          {user ? (
            <span className="inline-flex items-center gap-1 bg-neutral-800 text-white font-medium px-2 py-0.5 rounded border border-neutral-700">
              <span className={`h-1.5 w-1.5 rounded-full ${user.role === 'admin' ? 'bg-rose-500' : user.role === 'editor' ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
              {user.name} ({user.role.toUpperCase()})
            </span>
          ) : (
            <span className="text-neutral-400">Guest / Unauthenticated</span>
          )}

          {feedback && (
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-medium flex items-center gap-1 animate-pulse">
              <Check className="w-3 h-3" /> {feedback}
            </span>
          )}
        </div>

        {/* Right: Instant Role Switcher for Testing */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-neutral-400 hidden sm:inline mr-1 text-[11px]">Switch Profile:</span>

          {/* Admin button */}
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              user?.role === 'admin'
                ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
            title="Full Administrator: Admin Dashboard, Analytics, User & Order Management, Product Deletions"
          >
            <Shield className="w-3 h-3 text-rose-300" />
            <span>Admin</span>
          </button>

          {/* Editor button */}
          <button
            onClick={() => handleRoleSwitch('editor')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              user?.role === 'editor'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
            title="Editor: Add & edit products, manage blogs, update orders. Restricted from deleting users/system settings."
          >
            <UserCheck className="w-3 h-3 text-blue-300" />
            <span>Editor</span>
          </button>

          {/* Subscriber button */}
          <button
            onClick={() => handleRoleSwitch('subscriber')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              user?.role === 'subscriber'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
            title="Subscriber: Customer account with Order Tracking, Profile, Wishlist. Dashboard access is guarded."
          >
            <ShoppingBag className="w-3 h-3 text-emerald-300" />
            <span>Subscriber</span>
          </button>

          {/* Log Out / In */}
          {user ? (
            <button
              onClick={() => logout()}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded text-[11px] border border-neutral-700 transition-colors ml-1 flex items-center gap-1"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold transition-colors ml-1"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
