import React, { useState } from 'react';
import { InterviewSession, User } from '../types';
import { 
  Search, 
  History as HistoryIcon, 
  ArrowUpDown, 
  ChevronRight, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle, 
  HelpCircle, 
  Lightbulb,
  FileText,
  RotateCcw
} from 'lucide-react';

interface HistoryViewProps {
  currentUser: User | null;
  sessions: InterviewSession[];
  onDeleteSession: (sessionId: string) => void;
  onRetakeSession: (session: InterviewSession) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentUser,
  sessions,
  onDeleteSession,
  onRetakeSession
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(sessions[0]?.id || null);

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      (s.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.questions || []).some(q => (q?.question?.text || '').toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (scoreFilter === 'high') return s.averageScore >= 85;
    if (scoreFilter === 'mid') return s.averageScore >= 70 && s.averageScore < 85;
    if (scoreFilter === 'low') return s.averageScore < 70;
    return true;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bubbleprep_history_${currentUser?.name || 'interview'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* History Header Banner */}
      <div className="bubble-glass rounded-3xl p-6 border border-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-1">
            <HistoryIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Saved Transcripts & Scores</span>
          </div>
          <h2 className="text-xl font-bold font-display text-slate-800">
            Interview History ({sessions.length})
          </h2>
          <p className="text-xs text-slate-500">
            Stored under account <span className="font-semibold text-slate-700">{currentUser?.email || 'Current Session'}</span>
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          disabled={sessions.length === 0}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-sky-600" />
          <span>Export All History (JSON)</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bubble-glass rounded-2xl p-3 border border-white/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by role, topic, or question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Score category filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setScoreFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              scoreFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Scores
          </button>
          <button
            onClick={() => setScoreFilter('high')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              scoreFilter === 'high' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            $\ge$ 85 High
          </button>
          <button
            onClick={() => setScoreFilter('mid')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              scoreFilter === 'mid' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            70-84 Mid
          </button>
          <button
            onClick={() => setScoreFilter('low')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              scoreFilter === 'low' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            &lt; 70 Polish
          </button>
        </div>
      </div>

      {/* Session list */}
      {filteredSessions.length === 0 ? (
        <div className="bubble-glass rounded-3xl p-12 text-center border border-white/80">
          <HistoryIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No mock sessions found</h3>
          <p className="text-xs text-slate-400 mt-1">Try tweaking your search filters or start a new mock interview.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            return (
              <div
                key={session.id}
                className="bubble-glass rounded-3xl border border-white/80 shadow-xs overflow-hidden transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{session.role}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-600">{session.level}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Topic: {session.topic} ({session.questions.length} questions answered)
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-display font-bold text-slate-800 font-mono">
                        {session.averageScore}
                        <span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600">
                        {session.averageScore >= 85 ? 'Exceptional' : 'Solid Performance'}
                      </span>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Session Transcript Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100/80 space-y-4 bg-slate-50/40 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-slate-700">Detailed Question Transcripts</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRetakeSession(session)}
                          className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retake Setup</span>
                        </button>
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="px-3 py-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {session.questions.map((qResult, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-3"
                        >
                          {/* Question header */}
                          <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100">
                            <div>
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px]">
                                  {qIdx + 1}
                                </span>
                                <span>{qResult.question?.text || 'Interview Scenario Drill'}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 pl-7 flex items-center gap-2">
                                <span>{qResult.question?.category || 'General'}</span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {qResult.durationSeconds || 60}s duration
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-base font-bold font-mono text-sky-600">
                                {qResult.feedback?.overallScore || 80}
                              </span>
                              <span className="text-[10px] text-slate-400">/100</span>
                            </div>
                          </div>

                          {/* Candidate Answer Transcript */}
                          <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed italic">
                            <span className="font-semibold text-slate-500 not-italic block mb-1">
                              Spoken Transcript:
                            </span>
                            "{qResult.userAnswer || 'No response recorded'}"
                          </div>

                          {/* Breakdown cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Strong Points */}
                            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                              <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                Strong Points
                              </span>
                              <ul className="space-y-1 text-emerald-950 text-[11px]">
                                {(qResult.feedback?.strongPoints || ['Clear articulation of core concept.']).map((sp, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <span>{sp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Weak Areas & Improvement */}
                            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                              <span className="font-bold text-amber-800 flex items-center gap-1 mb-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                                Areas to Polish
                              </span>
                              <ul className="space-y-1 text-amber-950 text-[11px]">
                                {(qResult.feedback?.weakAreas || ['Quantify results with concrete metrics.']).map((wa, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span>{wa}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Expert Model Answer */}
                          {qResult.feedback?.modelAnswer && (
                            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
                              <span className="font-bold text-indigo-900 flex items-center gap-1 mb-1">
                                <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                                Model Exemplar Answer
                              </span>
                              <p className="text-[11px] text-indigo-950 leading-relaxed">
                                {qResult.feedback.modelAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
