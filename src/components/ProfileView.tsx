import React, { useState } from 'react';
import { User, InterviewSession } from '../types';
import { saveUser } from '../services/storage';
import { 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  Award, 
  Target, 
  Flame, 
  Lock, 
  Check, 
  Building2, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User | null;
  sessions: InterviewSession[];
  onUserUpdate: (updated: User) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  sessions,
  onUserUpdate,
  onLogout,
  onOpenAuth
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [role, setRole] = useState(currentUser?.role || 'Full Stack Engineer');
  const [level, setLevel] = useState(currentUser?.level || 'Senior');
  const [targetCompany, setTargetCompany] = useState(currentUser?.targetCompany || 'Google, Stripe, Linear');
  const [password, setPassword] = useState(currentUser?.password || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      role: role.trim() || currentUser.role,
      level: level || currentUser.level,
      targetCompany: targetCompany.trim(),
      password: password || currentUser.password
    };

    saveUser(updated);
    onUserUpdate(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const avgScore = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.averageScore, 0) / sessions.length)
    : 0;

  const totalQuestions = sessions.reduce((acc, s) => acc + s.questions.length, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Profile Header Banner */}
      <div className="bubble-glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${currentUser?.avatarColor || 'from-sky-400 to-indigo-500'} flex items-center justify-center text-white font-display font-extrabold text-3xl shadow-lg shadow-sky-200 shrink-0`}>
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-800">
              {currentUser?.name || 'Interview Candidate'}
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 self-center sm:self-auto">
              {currentUser?.level} {currentUser?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{currentUser?.email}</span>
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Stats Summary Bubble Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bubble-glass rounded-2xl p-4 text-center border border-white/80 shadow-xs">
          <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1 fill-amber-400" />
          <div className="text-xl font-bold font-mono text-slate-800">{currentUser?.streakDays || 1}</div>
          <div className="text-[11px] text-slate-400 font-medium">Day Streak</div>
        </div>
        <div className="bubble-glass rounded-2xl p-4 text-center border border-white/80 shadow-xs">
          <Target className="w-5 h-5 text-sky-500 mx-auto mb-1" />
          <div className="text-xl font-bold font-mono text-slate-800">{totalQuestions || 8}</div>
          <div className="text-[11px] text-slate-400 font-medium">Drills Finished</div>
        </div>
        <div className="bubble-glass rounded-2xl p-4 text-center border border-white/80 shadow-xs">
          <Award className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
          <div className="text-xl font-bold font-mono text-slate-800">{avgScore || 85}</div>
          <div className="text-[11px] text-slate-400 font-medium">Avg Composite Score</div>
        </div>
      </div>

      {/* Edit Profile & Password Form */}
      <div className="bubble-glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-xs">
        <h3 className="font-display font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-500" />
          <span>Account Settings & Target Parameters</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seniority Level</label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="Junior">Junior (0-2y)</option>
                  <option value="Mid-level">Mid-level (2-5y)</option>
                  <option value="Senior">Senior (5+y)</option>
                  <option value="Staff / Lead">Staff / Lead</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Companies / Style</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, Datadog, Early-Stage Startups"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to store history securely"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Used to log in and preserve your interview history on this device.</p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </span>
            )}
            {!isSaved && <span></span>}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-sky-200 hover:shadow-lg transition-all cursor-pointer"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
