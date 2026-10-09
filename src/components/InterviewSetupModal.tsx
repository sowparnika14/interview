import React, { useState } from 'react';
import { Sparkles, Briefcase, Award, Compass, Layers, X, ArrowRight, Loader2 } from 'lucide-react';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (role: string, level: string, topic: string, count: number, companyFocus: string) => void;
  isLoading: boolean;
  defaultRole?: string;
  defaultLevel?: string;
}

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  isOpen,
  onClose,
  onStart,
  isLoading,
  defaultRole = 'Full Stack Engineer',
  defaultLevel = 'Senior'
}) => {
  const [role, setRole] = useState(defaultRole);
  const [customRole, setCustomRole] = useState('');
  const [level, setLevel] = useState(defaultLevel);
  const [topic, setTopic] = useState('System Architecture & Problem Solving');
  const [count, setCount] = useState(3);
  const [companyFocus, setCompanyFocus] = useState('Tech Giants & High-Growth Startups');

  if (!isOpen) return null;

  const popularRoles = [
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'System Design Architect',
    'Product Manager',
    'Data Scientist & AI',
    'Behavioral & Leadership'
  ];

  const popularTopics = [
    'System Architecture & Problem Solving',
    'Behavioral & STAR Leadership Scenarios',
    'Algorithms, Data Structures & Concurrency',
    'API Design, Scalability & Database Indexing',
    'Conflict Resolution & Stakeholder Negotiation',
    'Product Strategy, Metrics & Prioritization'
  ];

  const handleLaunch = () => {
    const finalRole = customRole.trim() || role;
    onStart(finalRole, level, topic, count, companyFocus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bubble-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
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
            Configure Your Mock Interview
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Our AI interviewer generates fresh, challenging questions tailored to your exact target loop.
          </p>
        </div>

        <div className="space-y-5">
          {/* 1. Target Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-500" />
              <span>Target Role</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {popularRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setCustomRole(''); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    role === r && !customRole
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or enter custom role (e.g. Staff iOS Engineer, Solutions Architect)"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* 2. Experience Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>Experience Level</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Junior', desc: '0-2 yrs' },
                { label: 'Mid-level', desc: '2-5 yrs' },
                { label: 'Senior', desc: '5+ yrs' },
                { label: 'Staff / Lead', desc: 'Leadership' }
              ].map((lvl) => (
                <button
                  key={lvl.label}
                  type="button"
                  onClick={() => setLevel(lvl.label)}
                  className={`p-2.5 rounded-2xl text-center transition-all ${
                    level === lvl.label
                      ? 'bg-indigo-500 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{lvl.label}</div>
                  <div className={`text-[10px] ${level === lvl.label ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Focus Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-500" />
              <span>Interview Focus Area</span>
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {popularTopics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 4. Question Count & Company Profile */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Question Drill Size</span>
              </label>
              <div className="flex gap-2">
                {[
                  { countVal: 3, text: '3 Questions (Sprint)' },
                  { countVal: 5, text: '5 Questions (Full)' }
                ].map((item) => (
                  <button
                    key={item.countVal}
                    type="button"
                    onClick={() => setCount(item.countVal)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      count === item.countVal
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Company Style</label>
              <select
                value={companyFocus}
                onChange={(e) => setCompanyFocus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="Tech Giants & High-Growth Startups">Tech Giants & Unicorns</option>
                <option value="Early-Stage Startup (Fast Velocity)">Early-Stage Startup</option>
                <option value="Enterprise & High-Reliability Systems">Enterprise & Fintech</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleLaunch}
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500 hover:from-sky-600 hover:via-indigo-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Generating Real Interview Questions...</span>
              </>
            ) : (
              <>
                <span>Launch Mock Interview Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
