import React from 'react';
import { InterviewSession, QuestionResult } from '../types';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Clock, 
  Target,
  FileCheck
} from 'lucide-react';

interface InterviewSummaryViewProps {
  session: InterviewSession;
  onReturnDashboard: () => void;
  onRetake: () => void;
}

export const InterviewSummaryView: React.FC<InterviewSummaryViewProps> = ({
  session,
  onReturnDashboard,
  onRetake
}) => {
  const avgScore = session.averageScore;
  const questionsCount = session.questions.length;

  const totalTimeSeconds = session.questions.reduce((acc, q) => acc + (q.durationSeconds || 60), 0);
  const totalMins = Math.max(1, Math.round(totalTimeSeconds / 60));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in zoom-in-95 duration-300">
      {/* Celebration Header Card */}
      <div className="relative overflow-hidden bubble-glass rounded-3xl p-8 border border-white/90 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-teal-300 flex items-center justify-center text-white shadow-lg shadow-sky-200 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            Session Completed & Saved
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800">
            Outstanding Effort, Interview Finished!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1">
            Your answers have been analyzed and your practice streak has been updated.
          </p>
        </div>

        {/* Big Score Gauge */}
        <div className="inline-flex items-center gap-4 bg-white/95 px-6 py-4 rounded-3xl border border-slate-200/80 shadow-md">
          <div className="text-4xl sm:text-5xl font-display font-extrabold text-sky-600 font-mono">
            {avgScore}
          </div>
          <div className="text-left border-l border-slate-100 pl-4">
            <div className="text-xs font-bold text-slate-800">
              {avgScore >= 85 ? '🌟 Tier 1 Candidate' : avgScore >= 70 ? '👍 Solid Delivery' : '📈 Good Foundation'}
            </div>
            <div className="text-[11px] text-slate-400">Average Composite Score</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto">
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <Target className="w-4 h-4 text-sky-500 mx-auto mb-1" />
            <div className="text-sm font-bold font-mono text-slate-800">{questionsCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">Questions</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <Clock className="w-4 h-4 text-teal-500 mx-auto mb-1" />
            <div className="text-sm font-bold font-mono text-slate-800">{totalMins} min</div>
            <div className="text-[10px] text-slate-400 font-medium">Practice Time</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <Award className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <div className="text-sm font-bold font-mono text-slate-800">+{questionsCount * 25} XP</div>
            <div className="text-[10px] text-slate-400 font-medium">Experience</div>
          </div>
        </div>
      </div>

      {/* Question Results Breakdown Card */}
      <div className="bubble-glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-sky-500" />
          <span>Question-by-Question Breakdown</span>
        </h3>

        <div className="space-y-3">
          {session.questions.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/80 border border-slate-200/70 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Q{idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {item.question?.text || 'Interview Question'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block pl-6">
                    Category: {item.question?.category || 'General'} · {item.durationSeconds || 60}s duration
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-bold font-mono text-sky-600">
                    {item.feedback?.overallScore || 80}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/100</span>
                </div>
              </div>

              {/* Quick tip preview */}
              {item.feedback.improvementTips && item.feedback.improvementTips.length > 0 && (
                <div className="text-[11px] text-slate-600 bg-sky-50/70 p-2.5 rounded-xl border border-sky-100 flex items-start gap-1.5 ml-6">
                  <span className="text-sky-600 font-bold">💡</span>
                  <span>{item.feedback.improvementTips[0]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onRetake}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start Another Practice</span>
        </button>

        <button
          onClick={onReturnDashboard}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500 hover:from-sky-600 hover:via-indigo-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-sky-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Return to Dashboard & History</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
