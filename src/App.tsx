import React, { useState, useEffect } from 'react';
import { User, InterviewSession, QuestionResult, InterviewQuestion } from './types';
import { getCurrentUser, setCurrentUser, getUserSessions, saveUserSession, deleteUserSession } from './services/storage';
import { fetchQuestions } from './services/api';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { InterviewSetupModal } from './components/InterviewSetupModal';
import { ActiveInterviewView } from './components/ActiveInterviewView';
import { InterviewSummaryView } from './components/InterviewSummaryView';
import { CoachView } from './components/CoachView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'interview' | 'coach' | 'history' | 'profile'>('dashboard');
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Active Interview State
  const [activeQuestions, setActiveQuestions] = useState<InterviewQuestion[]>([]);
  const [activeRole, setActiveRole] = useState('Full Stack Engineer');
  const [activeLevel, setActiveLevel] = useState('Senior');
  const [activeTopic, setActiveTopic] = useState('System Architecture & Problem Solving');
  const [activeSessionCompleted, setActiveSessionCompleted] = useState<InterviewSession | null>(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  // Initial load
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      const userSessions = getUserSessions(user.id);
      setSessions(userSessions);
    }
  }, []);

  // When user changes
  const handleUserLogin = (user: User) => {
    setCurrentUserState(user);
    const userSessions = getUserSessions(user.id);
    setSessions(userSessions);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    setSessions([]);
    setActiveTab('dashboard');
    setIsAuthOpen(true);
  };

  // Launch New Interview Flow
  const handleOpenInterviewSetup = () => {
    setActiveSessionCompleted(null);
    setIsInterviewActive(false);
    setIsSetupOpen(true);
  };

  const handleStartInterviewSession = async (
    role: string,
    level: string,
    topic: string,
    count: number,
    companyFocus: string
  ) => {
    setIsGeneratingQuestions(true);
    setActiveRole(role);
    setActiveLevel(level);
    setActiveTopic(topic);

    try {
      const generated = await fetchQuestions(role, level, topic, count, companyFocus);
      setActiveQuestions(generated);
      setIsSetupOpen(false);
      setIsInterviewActive(true);
      setActiveTab('interview');
    } catch (err) {
      console.error('Failed to generate interview questions:', err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Interview Finish Handler
  const handleFinishInterview = (results: QuestionResult[]) => {
    if (!currentUser) return;

    const avgScore = results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.feedback.overallScore, 0) / results.length)
      : 80;

    const newSession: InterviewSession = {
      id: `session-${Date.now()}`,
      userId: currentUser.id,
      date: new Date().toISOString(),
      role: activeRole,
      level: activeLevel,
      topic: activeTopic,
      averageScore: avgScore,
      questions: results,
      status: 'completed'
    };

    saveUserSession(newSession);
    const updated = getUserSessions(currentUser.id);
    setSessions(updated);

    setActiveSessionCompleted(newSession);
    setIsInterviewActive(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!currentUser) return;
    deleteUserSession(currentUser.id, sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleRetakeSession = (session: InterviewSession) => {
    setActiveRole(session.role);
    setActiveLevel(session.level);
    setActiveTopic(session.topic);
    setIsSetupOpen(true);
  };

  const handleViewSessionFromDashboard = (session: InterviewSession) => {
    setActiveTab('history');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden">
      {/* Background Ambient Pastel Floating Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft pastel bubble 1: Sky light */}
        <div className="absolute top-10 left-[8%] w-80 h-80 rounded-full bg-sky-200/35 blur-3xl animate-float"></div>
        {/* Soft pastel bubble 2: Indigo soft */}
        <div className="absolute top-[35%] right-[5%] w-96 h-96 rounded-full bg-indigo-200/25 blur-3xl animate-float-delayed"></div>
        {/* Soft pastel bubble 3: Mint light */}
        <div className="absolute bottom-[10%] left-[15%] w-88 h-88 rounded-full bg-teal-200/30 blur-3xl animate-float"></div>
        {/* Soft pastel bubble 4: Rose peach accent */}
        <div className="absolute top-[65%] right-[25%] w-72 h-72 rounded-full bg-rose-200/20 blur-3xl animate-float-delayed"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sticky Bubble Navigation Header */}
        <Navbar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'interview' && !isInterviewActive && !activeSessionCompleted) {
              setIsSetupOpen(true);
            }
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onStartNewInterview={handleOpenInterviewSetup}
        />

        {/* View Router */}
        <main className="flex-1 px-4 sm:px-8 max-w-7xl mx-auto w-full pt-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              sessions={sessions}
              onStartInterview={handleOpenInterviewSetup}
              onOpenCoach={() => setActiveTab('coach')}
              onViewSession={handleViewSessionFromDashboard}
            />
          )}

          {/* TAB 2: INTERVIEW PRACTICE */}
          {activeTab === 'interview' && (
            <>
              {isInterviewActive && activeQuestions.length > 0 ? (
                <ActiveInterviewView
                  questions={activeQuestions}
                  role={activeRole}
                  level={activeLevel}
                  onFinishInterview={handleFinishInterview}
                  onCancel={() => {
                    setIsInterviewActive(false);
                    setActiveTab('dashboard');
                  }}
                />
              ) : activeSessionCompleted ? (
                <InterviewSummaryView
                  session={activeSessionCompleted}
                  onReturnDashboard={() => {
                    setActiveSessionCompleted(null);
                    setActiveTab('dashboard');
                  }}
                  onRetake={handleOpenInterviewSetup}
                />
              ) : (
                <div className="max-w-2xl mx-auto text-center py-16 bubble-glass rounded-3xl p-8 border border-white/80 space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-teal-300 flex items-center justify-center text-white shadow-lg shadow-sky-200 animate-float">
                    <span className="text-2xl font-bold font-display">✨</span>
                  </div>
                  <h2 className="text-xl font-bold font-display text-slate-800">
                    Ready for your next mock interview?
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Choose your target role and let our AI generate fresh, realistic questions with voice recording and criteria evaluation.
                  </p>
                  <button
                    onClick={() => setIsSetupOpen(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500 hover:from-sky-600 hover:via-indigo-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-200 transition-all cursor-pointer"
                  >
                    Configure & Launch Interview
                  </button>
                </div>
              )}
            </>
          )}

          {/* TAB 3: AI COACH ARIA */}
          {activeTab === 'coach' && (
            <CoachView currentUser={currentUser} />
          )}

          {/* TAB 4: INTERVIEW HISTORY */}
          {activeTab === 'history' && (
            <HistoryView
              currentUser={currentUser}
              sessions={sessions}
              onDeleteSession={handleDeleteSession}
              onRetakeSession={handleRetakeSession}
            />
          )}

          {/* TAB 5: PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              sessions={sessions}
              onUserUpdate={(updated) => setCurrentUserState(updated)}
              onLogout={handleLogout}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}
        </main>

        {/* Quiet Minimal Footer */}
        <footer className="relative z-10 py-6 text-center text-xs text-slate-400 border-t border-slate-200/50 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>BubblePrep AI · Interactive Voice Mock Interviews</span>
            <span>Data stored securely with your account</span>
          </div>
        </footer>
      </div>

      {/* Auth Modal (Login & Register with Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleUserLogin}
      />

      {/* Interview Setup Modal */}
      <InterviewSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStart={handleStartInterviewSession}
        isLoading={isGeneratingQuestions}
        defaultRole={currentUser?.role}
        defaultLevel={currentUser?.level}
      />
    </div>
  );
}
