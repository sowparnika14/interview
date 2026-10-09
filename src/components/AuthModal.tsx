import React, { useState } from 'react';
import { User } from '../types';
import { authenticateUser, registerUser } from '../services/storage';
import { Sparkles, Lock, Mail, User as UserIcon, Briefcase, Award, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Full Stack Engineer');
  const [level, setLevel] = useState('Senior');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (isLogin) {
        const result = authenticateUser(email, password);
        if (result.success && result.user) {
          onSuccess(result.user);
          onClose();
        } else {
          setError(result.error || 'Authentication failed');
        }
      } else {
        if (!email || !password || !name) {
          setError('Please fill in all required fields.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }
        const result = registerUser(email, password, name, role, level);
        if (result.success && result.user) {
          onSuccess(result.user);
          onClose();
        } else {
          setError(result.error || 'Registration failed');
        }
      }
      setIsLoading(false);
    }, 400);
  };

  const handleUseDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      const result = authenticateUser('demo@bubbleprep.ai', 'password123');
      if (result.success && result.user) {
        onSuccess(result.user);
        onClose();
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bubble-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-teal-300 flex items-center justify-center shadow-md shadow-sky-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin 
              ? 'Log in to securely track your interview history & streaks'
              : 'Save your mock answers, progress curves & personalized tips'}
          </p>
        </div>

        {/* Demo Account Quick Access Card */}
        <div className="mb-6 p-3 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>Instant Demo Account</span>
            </div>
            <p className="text-[11px] text-sky-700/80 mt-0.5">Includes sample transcripts & 4-day streak</p>
          </div>
          <button
            type="button"
            onClick={handleUseDemo}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            One-Click Demo
          </button>
        </div>

        {/* Auth Toggle Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              isLogin ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              !isLogin ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Role</label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="Full Stack Engineer">Full Stack Engineer</option>
                    <option value="System Design Architect">System Design</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Behavioral / STAR">Behavioral / STAR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Level</label>
                <div className="relative">
                  <Award className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="Junior">Junior (0-2y)</option>
                    <option value="Mid-level">Mid-level (2-5y)</option>
                    <option value="Senior">Senior (5+y)</option>
                    <option value="Staff / Lead">Staff / Lead</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500 hover:from-sky-600 hover:via-indigo-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Your History' : 'Create Account & Begin'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            {isLogin ? "Don't have an account yet? " : "Already registered? "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-sky-600 font-bold hover:underline"
            >
              {isLogin ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
