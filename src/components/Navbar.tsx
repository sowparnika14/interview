import React from 'react';
import { User } from '../types';
import { 
  Sparkles, 
  Flame, 
  User as UserIcon, 
  LayoutDashboard, 
  PlayCircle, 
  MessageSquare, 
  History as HistoryIcon,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'dashboard' | 'interview' | 'coach' | 'history' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'interview' | 'coach' | 'history' | 'profile') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onStartNewInterview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onStartNewInterview
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-7xl mx-auto w-full transition-all">
      <div className="bubble-glass rounded-3xl px-5 py-3.5 flex items-center justify-between border border-white/70 shadow-[0_12px_40px_-12px_rgba(148,163,184,0.18)]">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-teal-300 flex items-center justify-center shadow-md shadow-sky-200 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl text-slate-800 tracking-tight">Bubble<span className="text-sky-600">Prep</span></span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-sky-100/80 text-sky-700">AI</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Intelligent Mock Interviews</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-sky-500" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('interview');
              onStartNewInterview();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'interview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <PlayCircle className="w-4 h-4 text-indigo-500" />
            <span>Mock Session</span>
          </button>

          <button
            onClick={() => setActiveTab('coach')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'coach'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-teal-500" />
            <span>AI Coach</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <HistoryIcon className="w-4 h-4 text-amber-500" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <UserIcon className="w-4 h-4 text-rose-500" />
            <span>Profile</span>
          </button>
        </nav>

        {/* Right Controls: Streak & User Account */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div 
              title={`${currentUser.streakDays} Day Practice Streak`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-800 shadow-xs"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-400 animate-bounce" />
              <span className="text-xs font-bold font-mono">{currentUser.streakDays}</span>
              <span className="text-[11px] font-medium text-amber-700 hidden lg:inline">day streak</span>
            </div>
          )}

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentUser.avatarColor || 'from-sky-400 to-indigo-500'} flex items-center justify-center text-white font-bold text-xs shadow-xs`}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[100px]">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[100px]">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bubble-glass rounded-2xl shadow-xl border border-white/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-sky-500" />
                      Manage Profile & Goals
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('history');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl flex items-center gap-2"
                    >
                      <HistoryIcon className="w-3.5 h-3.5 text-amber-500" />
                      Interview Transcripts
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                      Switch / New Account
                    </button>
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-sky-200 hover:shadow-lg hover:from-sky-600 hover:to-indigo-700 transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="flex md:hidden items-center justify-around mt-2 p-1.5 bubble-glass rounded-2xl border border-white/80 shadow-sm">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-0.5 ${
            activeTab === 'dashboard' ? 'text-sky-600 font-bold bg-white' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('interview');
            onStartNewInterview();
          }}
          className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-0.5 ${
            activeTab === 'interview' ? 'text-indigo-600 font-bold bg-white' : 'text-slate-500'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Practice</span>
        </button>
        <button
          onClick={() => setActiveTab('coach')}
          className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-0.5 ${
            activeTab === 'coach' ? 'text-teal-600 font-bold bg-white' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Coach</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-0.5 ${
            activeTab === 'history' ? 'text-amber-600 font-bold bg-white' : 'text-slate-500'
          }`}
        >
          <HistoryIcon className="w-4 h-4" />
          <span>History</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-0.5 ${
            activeTab === 'profile' ? 'text-rose-600 font-bold bg-white' : 'text-slate-500'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>
    </header>
  );
};
