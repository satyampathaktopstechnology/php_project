import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalMode, setAuthModalMode, login, register, switchDemoRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('subscriber');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message);
        }
      } else {
        const res = await register(name, email, password, phone, role);
        if (!res.success) {
          setError(res.message);
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoRole: UserRole) => {
    if (demoRole === 'admin') {
      setEmail('admin@essence.com');
      setPassword('admin123');
    } else if (demoRole === 'editor') {
      setEmail('editor@essence.com');
      setPassword('editor123');
    } else {
      setEmail('customer@essence.com');
      setPassword('customer123');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-100 relative">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 pb-5">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700/50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-rose-500 font-extrabold text-lg tracking-wider">ESSENCE</span>
            <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Security</span>
          </div>
          <h2 className="text-xl font-bold font-serif">
            {authModalMode === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
          </h2>
          <p className="text-xs text-neutral-300 mt-1">
            Protected with parameterized queries &amp; encrypted sessions.
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-neutral-950/60 p-1 rounded-lg mt-4 text-xs font-semibold">
            <button
              onClick={() => { setAuthModalMode('login'); setError(null); }}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                authModalMode === 'login' ? 'bg-white text-neutral-900 shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalMode('register'); setError(null); }}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                authModalMode === 'register' ? 'bg-white text-neutral-900 shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign Up (Register)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Assign User Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['subscriber', 'editor', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center capitalize transition-all ${
                        role === r
                          ? 'border-rose-500 bg-rose-50 text-rose-700 font-semibold ring-1 ring-rose-500'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  {role === 'admin' && 'Full dashboard, analytics, order & product management.'}
                  {role === 'editor' && 'Can manage catalog and content; no deletion of users.'}
                  {role === 'subscriber' && 'Standard shopper account with profile & orders.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{authModalMode === 'login' ? 'Sign In Securely' : 'Complete Registration'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          {authModalMode === 'login' && (
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-500 mb-2 font-medium">Quick Demo Credentials:</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin')}
                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[11px] font-medium"
                >
                  Admin (Alexander)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('editor')}
                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[11px] font-medium"
                >
                  Editor (Sophia)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('subscriber')}
                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[11px] font-medium"
                >
                  Subscriber (Jessica)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
