import React, { useState, useEffect } from 'react';
import { User, InterviewSession, DailyTip } from '../types';
import { fetchDailyTip } from '../services/api';
import { 
  Flame, 
  TrendingUp, 
  Award, 
  Clock, 
  Sparkles, 
  PlayCircle, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  Target,
  BarChart2,
  Calendar,
  Layers
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User | null;
  sessions: InterviewSession[];
  onStartInterview: () => void;
  onOpenCoach: () => void;
  onViewSession: (session: InterviewSession) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  sessions,
  onStartInterview,
  onOpenCoach,
  onViewSession
}) => {
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; score: number; date: string; topic: string } | null>(null);

  useEffect(() => {
    fetchDailyTip().then(setDailyTip);
  }, []);

  // Compute key stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const avgScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((acc, s) => acc + s.averageScore, 0) / completedSessions.length)
    : 0;

  const totalQuestions = completedSessions.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
  const totalMinutes = Math.round(
    completedSessions.reduce((acc, s) => {
      const sec = (s.questions || []).reduce((qAcc, q) => qAcc + (q?.durationSeconds || 60), 0);
      return acc + sec;
    }, 0) / 60
  );

  // Compute category averages
  const categories = {
    clarity: 0,
    technicalDepth: 0,
    structure: 0,
    relevance: 0,
    confidence: 0
  };
  let feedbackCount = 0;
  completedSessions.forEach(s => {
    (s.questions || []).forEach(q => {
      if (q?.feedback?.breakdown) {
        categories.clarity += q.feedback.breakdown.clarity || 0;
        categories.technicalDepth += q.feedback.breakdown.technicalDepth || 0;
        categories.structure += q.feedback.breakdown.structure || 0;
        categories.relevance += q.feedback.breakdown.relevance || 0;
        categories.confidence += q.feedback.breakdown.confidence || 0;
        feedbackCount++;
      }
    });
  });

  const catAverages = {
    clarity: feedbackCount ? Math.round(categories.clarity / feedbackCount) : 85,
    technicalDepth: feedbackCount ? Math.round(categories.technicalDepth / feedbackCount) : 82,
    structure: feedbackCount ? Math.round(categories.structure / feedbackCount) : 84,
    relevance: feedbackCount ? Math.round(categories.relevance / feedbackCount) : 88,
    confidence: feedbackCount ? Math.round(categories.confidence / feedbackCount) : 80
  };

  // Recent 7 days activity streak visualization
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const hasPracticed = sessions.some(s => s.date.startsWith(dateStr));
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = i === 6;
    return { dateStr, dayLabel, hasPracticed, isToday };
  });

  // Trend graph data points (chronological order)
  const sortedSessions = [...completedSessions].reverse();
  const graphScores = sortedSessions.length > 0 
    ? sortedSessions.map((s, idx) => ({
        index: idx,
        score: s.averageScore,
        date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        topic: s.topic || s.role
      }))
    : [
        { index: 0, score: 75, date: 'Day 1', topic: 'Practice' },
        { index: 1, score: 82, date: 'Day 2', topic: 'Architecture' },
        { index: 2, score: 88, date: 'Today', topic: 'System Design' }
      ];

  // SVG dimensions for trend graph
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;

  const minScore = 50;
  const maxScore = 100;

  const points = graphScores.map((p, i) => {
    const x = paddingX + (i / Math.max(1, graphScores.length - 1)) * (width - 2 * paddingX);
    const normalizedY = (p.score - minScore) / (maxScore - minScore);
    const y = height - paddingY - normalizedY * (height - 2 * paddingY);
    return { ...p, x, y };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, curr, i, arr) => {
        if (i === 0) return `M ${curr.x} ${curr.y}`;
        const prev = arr[i - 1];
        const cx1 = prev.x + (curr.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (curr.x - prev.x) / 2;
        const cy2 = curr.y;
        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
      }, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Welcome Hero Bubble Banner */}
      <div className="relative overflow-hidden bubble-glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_12px_40px_-15px_rgba(186,230,253,0.3)]">
        {/* Ambient floating pastel bubbles in background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-sky-200/40 to-indigo-200/40 blur-2xl pointer-events-none animate-float"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-gradient-to-tr from-teal-200/40 to-emerald-200/40 blur-2xl pointer-events-none animate-float-delayed"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/70 border border-sky-200/60 text-sky-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Personalized AI Interview Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 tracking-tight">
              Hello, <span className="text-sky-600">{currentUser ? currentUser.name : 'Interview Candidate'}</span>!
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Targeting <span className="font-semibold text-slate-800">{currentUser?.level || 'Senior'} {currentUser?.role || 'Full Stack Engineer'}</span> roles. Keep your voice sharp with daily AI drills and real-time structured feedback.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onStartInterview}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500 hover:from-sky-600 hover:via-indigo-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-200 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Start Mock Interview</span>
            </button>
            <button
              onClick={onOpenCoach}
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200/80 shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:border-slate-300"
            >
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>Ask Coach Aria</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Bubbles Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Bubble Card */}
        <div className="bubble-glass rounded-3xl p-5 border border-white/80 shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Practice Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-extrabold text-slate-800">
              {currentUser?.streakDays || 1}
            </span>
            <span className="text-xs font-medium text-slate-500">Days Active</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-2 font-medium">
            🔥 {currentUser?.streakDays && currentUser.streakDays > 1 ? 'Streak on fire! Keep it going.' : 'Practice today to extend your streak.'}
          </p>
        </div>

        {/* Average Score */}
        <div className="bubble-glass rounded-3xl p-5 border border-white/80 shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Average Score</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-extrabold text-slate-800">
              {avgScore || 85}
            </span>
            <span className="text-xs font-medium text-slate-500">/ 100</span>
          </div>
          <p className="text-[11px] text-sky-700 mt-2 font-medium">
            {avgScore >= 85 ? '🌟 Strong candidate tier' : '📈 Up +6% from last week'}
          </p>
        </div>

        {/* Questions Answered */}
        <div className="bubble-glass rounded-3xl p-5 border border-white/80 shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Questions Answered</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-extrabold text-slate-800">
              {totalQuestions || 8}
            </span>
            <span className="text-xs font-medium text-slate-500">Drills</span>
          </div>
          <p className="text-[11px] text-indigo-700 mt-2 font-medium">
            Across {totalSessions || 3} mock interviews
          </p>
        </div>

        {/* Voice Practice Time */}
        <div className="bubble-glass rounded-3xl p-5 border border-white/80 shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Speaking Time</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-extrabold text-slate-800">
              {totalMinutes || 12}
            </span>
            <span className="text-xs font-medium text-slate-500">Mins</span>
          </div>
          <p className="text-[11px] text-teal-700 mt-2 font-medium">
            Clear, spontaneous articulation
          </p>
        </div>
      </div>

      {/* 3. Streaks & 7-Day Activity Bubble Track */}
      <div className="bubble-glass rounded-3xl p-6 border border-white/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>Weekly Practice Consistency</span>
            </h3>
            <p className="text-xs text-slate-500">Building consistent daily muscle memory before real loops</p>
          </div>
          <div className="text-xs font-semibold text-slate-600 px-3 py-1 rounded-xl bg-slate-100/80 inline-flex items-center gap-1.5 self-start sm:self-auto">
            <span>Goal: 1 Mock Drill / Day</span>
          </div>
        </div>

        {/* 7 Days Bubble Ring Sequence */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 py-2">
          {last7Days.map((day, idx) => (
            <div 
              key={idx}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                day.isToday 
                  ? 'bg-sky-50/90 border border-sky-200 shadow-xs' 
                  : 'bg-white/60 border border-slate-100'
              }`}
            >
              <span className={`text-[11px] font-semibold mb-2 ${day.isToday ? 'text-sky-700' : 'text-slate-500'}`}>
                {day.dayLabel}
              </span>
              <div 
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                  day.hasPracticed
                    ? 'bg-gradient-to-tr from-sky-400 to-indigo-500 text-white shadow-md shadow-sky-200'
                    : day.isToday
                    ? 'border-2 border-dashed border-sky-400 bg-sky-50 text-sky-500'
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                {day.hasPracticed ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <span className="text-xs font-mono font-medium">{day.dateStr.split('-')[2]}</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-medium">
                {day.hasPracticed ? 'Done' : day.isToday ? 'Today' : 'Rest'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Score Progression Graph & Category Radar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Progression Graph (2 columns) */}
        <div className="lg:col-span-2 bubble-glass rounded-3xl p-6 border border-white/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Performance Trend</span>
                </h3>
                <p className="text-xs text-slate-500">Historical scoring progression across recent mock sessions</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span>Score (0-100)</span>
              </div>
            </div>

            {/* SVG Curve Chart */}
            <div className="relative w-full h-[200px] mt-2 select-none">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bubbleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                {[60, 80, 100].map((score) => {
                  const norm = (score - minScore) / (maxScore - minScore);
                  const y = height - paddingY - norm * (height - 2 * paddingY);
                  return (
                    <g key={score}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={width - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text x={paddingX - 10} y={y + 3} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">
                        {score}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Fill under Curve */}
                {areaD && <path d={areaD} fill="url(#bubbleGradient)" />}

                {/* Curve line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Points */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="6"
                      className="fill-white stroke-sky-600 stroke-[3] cursor-pointer hover:r-[8] transition-all"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    <text
                      x={p.x}
                      y={height - 8}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {p.date}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip Bubble */}
              {hoveredPoint && (
                <div 
                  className="absolute pointer-events-none -top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs shadow-lg animate-in fade-in zoom-in-95 duration-100 flex items-center gap-2"
                >
                  <span className="font-bold text-sky-300 font-mono">{hoveredPoint.score} pts</span>
                  <span className="text-slate-300">· {hoveredPoint.topic}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Steady growth in structural STAR discipline</span>
            <span className="font-semibold text-sky-600 font-mono">Current: {graphScores[graphScores.length - 1]?.score || 88} pts</span>
          </div>
        </div>

        {/* Category Competency Breakdown (1 column) */}
        <div className="bubble-glass rounded-3xl p-6 border border-white/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-500" />
                <span>Skill Dimensions</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">Target $\ge 85$</span>
            </div>

            <div className="space-y-3.5">
              {[
                { label: 'Clarity & Delivery', val: catAverages.clarity, color: 'bg-sky-500' },
                { label: 'Technical Depth', val: catAverages.technicalDepth, color: 'bg-indigo-500' },
                { label: 'STAR Structure', val: catAverages.structure, color: 'bg-teal-500' },
                { label: 'Question Relevance', val: catAverages.relevance, color: 'bg-emerald-500' },
                { label: 'Confidence', val: catAverages.confidence, color: 'bg-amber-500' }
              ].map((skill, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{skill.label}</span>
                    <span className="text-slate-800 font-bold font-mono">{skill.val}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${skill.color} transition-all duration-500`}
                      style={{ width: `${skill.val}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <p className="text-[11px] text-slate-600 leading-normal">
              💡 <span className="font-semibold text-slate-800">Coach Insight:</span> Your relevance and clarity are outstanding. Focus on quantifying metrics in the Result phase to boost Technical Depth.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Daily AI Coach Drill Card */}
      {dailyTip && (
        <div className="bubble-glass rounded-3xl p-6 border border-sky-100/90 shadow-xs bg-gradient-to-r from-sky-50/50 via-white to-teal-50/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-800">
                  Daily Interview Tip: {dailyTip.title}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-9">
                {dailyTip.tip}
              </p>
              <div className="pl-9 pt-1">
                <span className="inline-block px-2.5 py-1 rounded-xl bg-sky-100/80 text-sky-800 text-[11px] font-medium">
                  🎯 Quick Drill: {dailyTip.drill}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenCoach}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-end sm:self-auto shrink-0"
            >
              <span>Practice With Coach</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Recent Mock Sessions Preview */}
      <div className="bubble-glass rounded-3xl p-6 border border-white/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Recent Interview Sessions</span>
            </h3>
            <p className="text-xs text-slate-500">Review past answers, audio transcripts, and feedback tips</p>
          </div>
          <button
            onClick={() => onStartInterview()}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
          >
            <span>Start New Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500 mb-3">No mock interviews completed yet.</p>
            <button
              onClick={onStartInterview}
              className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold shadow-xs hover:bg-sky-600"
            >
              Launch Your First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                onClick={() => onViewSession(session)}
                className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-slate-200/60 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{session.role}</span>
                    <span className="text-[11px] font-medium text-slate-400">·</span>
                    <span className="text-xs font-medium text-slate-600">{session.level}</span>
                    <span className="text-[11px] font-medium text-slate-400">·</span>
                    <span className="text-xs text-slate-500">
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-lg">
                    Topic: {session.topic || 'General Practice'} ({session.questions.length} questions answered)
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-lg font-display font-extrabold text-slate-800 font-mono">
                      {session.averageScore}<span className="text-xs text-slate-400">/100</span>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-600">
                      {session.averageScore >= 85 ? 'Exceptional' : 'Solid Performance'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
