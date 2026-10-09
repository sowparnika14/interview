import React, { useState, useEffect, useRef } from 'react';
import { InterviewQuestion, AnswerFeedback, QuestionResult } from '../types';
import { evaluateAnswer } from '../services/api';
import { startSpeechRecognition, stopActiveRecognition, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../services/speech';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  Sparkles, 
  Clock, 
  RotateCcw, 
  ArrowRight, 
  Loader2, 
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';

interface ActiveInterviewViewProps {
  questions: InterviewQuestion[];
  role: string;
  level: string;
  onFinishInterview: (results: QuestionResult[]) => void;
  onCancel: () => void;
}

export const ActiveInterviewView: React.FC<ActiveInterviewViewProps> = ({
  questions,
  role,
  level,
  onFinishInterview,
  onCancel
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed results across questions
  const [sessionResults, setSessionResults] = useState<QuestionResult[]>([]);
  // Current active feedback modal if shown
  const [currentFeedback, setCurrentFeedback] = useState<AnswerFeedback | null>(null);

  const activeRecognitionRef = useRef<{ stop: () => void } | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex] || questions[0];
  const isSpeechSupported = isSpeechRecognitionSupported();

  // Reset state when moving between questions
  useEffect(() => {
    setUserAnswer('');
    setShowHint(false);
    setTimerSeconds(0);
    setErrorMessage(null);
    setCurrentFeedback(null);
    stopSpeaking();
    setIsSpeakingQuestion(false);
    stopRecording();

    // Auto-read question if desired
    const speaker = speakText(currentQuestion.text, () => {
      setIsSpeakingQuestion(false);
    });
    setIsSpeakingQuestion(true);

    return () => {
      speaker.cancel();
      stopSpeaking();
      stopRecording();
    };
  }, [currentIndex]);

  // Duration timer
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setErrorMessage(null);
    stopSpeaking();
    setIsSpeakingQuestion(false);

    const rec = startSpeechRecognition({
      onResult: (transcript, isFinal) => {
        setUserAnswer(prev => {
          // If starting from scratch or continuing
          return isFinal ? `${prev} ${transcript}`.trim() : `${prev} ${transcript}`.trim();
        });
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });

    if (rec) {
      activeRecognitionRef.current = rec;
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (activeRecognitionRef.current) {
      activeRecognitionRef.current.stop();
      activeRecognitionRef.current = null;
    }
    stopActiveRecognition();
    setIsRecording(false);
  };

  const handleToggleSpeak = () => {
    if (isSpeakingQuestion) {
      stopSpeaking();
      setIsSpeakingQuestion(false);
    } else {
      stopRecording();
      setIsSpeakingQuestion(true);
      speakText(currentQuestion.text, () => {
        setIsSpeakingQuestion(false);
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer || userAnswer.trim().length === 0) {
      setErrorMessage('Please speak or type your answer before submitting.');
      return;
    }

    stopRecording();
    stopSpeaking();
    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const feedback = await evaluateAnswer(
        currentQuestion.text,
        userAnswer,
        role,
        level,
        currentQuestion.category
      );

      const result: QuestionResult = {
        question: currentQuestion,
        userAnswer,
        durationSeconds: timerSeconds,
        feedback,
        timestamp: new Date().toISOString()
      };

      setCurrentFeedback(feedback);
      setSessionResults(prev => [...prev, result]);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed all questions in the session!
      onFinishInterview(sessionResults);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Progress Bubble Bar */}
      <div className="bubble-glass rounded-3xl p-5 border border-white/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-display font-bold text-sm shadow-xs">
            {currentIndex + 1}/{questions.length}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Mock Session in Progress</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {level} {role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Live AI audio evaluation and criteria analysis</p>
          </div>
        </div>

        {/* Progress track */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < currentIndex
                    ? 'bg-emerald-400'
                    : i === currentIndex
                    ? 'bg-sky-500 ring-2 ring-sky-200 ring-offset-1'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Exit Session
          </button>
        </div>
      </div>

      {/* Main Question & AI Avatar Orb Card */}
      <div className="relative bubble-glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* Animated AI Interviewer Orb */}
            <div className="relative">
              <div 
                className={`w-14 h-14 rounded-3xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-teal-300 flex items-center justify-center shadow-lg transition-transform duration-500 ${
                  isSpeakingQuestion ? 'scale-110 shadow-sky-300 ring-4 ring-sky-100' : 'animate-float'
                }`}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              {isSpeakingQuestion && (
                <div className="absolute -inset-1 rounded-3xl bg-sky-400/20 animate-ping pointer-events-none"></div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 font-display">Interviewer AI</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {currentQuestion.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isSpeakingQuestion ? 'Speaking question...' : isRecording ? 'Listening to your response...' : 'Awaiting your answer'}
              </p>
            </div>
          </div>

          {/* Text-to-speech button */}
          <button
            onClick={handleToggleSpeak}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all ${
              isSpeakingQuestion
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs'
            }`}
          >
            {isSpeakingQuestion ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span>Mute Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-sky-500" />
                <span>Listen to Question</span>
              </>
            )}
          </button>
        </div>

        {/* Question Text */}
        <div className="py-6">
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-800 leading-relaxed">
            "{currentQuestion.text}"
          </h2>
        </div>

        {/* Hint Accordion Bubble */}
        <div className="pt-2">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/60 px-3.5 py-1.5 rounded-xl transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Need a hint or criteria?</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-900 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Interview Coaching Hint:
                </span>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-[11px] text-amber-600 hover:underline font-medium"
                >
                  Hide
                </button>
              </div>
              <p className="leading-relaxed">{currentQuestion.hint}</p>
              {currentQuestion.criteria && (
                <div className="pt-1 text-[11px] text-amber-700/90 border-t border-amber-200/50">
                  <span className="font-semibold">Criteria: </span>
                  {currentQuestion.criteria}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Answer Workspace Card (Voice + Text) */}
      <div className="bubble-glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Your Response</span>
            <span className="text-[11px] text-slate-400">· Speak naturally or type below</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
            <div className="bg-slate-100 px-2.5 py-1 rounded-xl">
              <span>{wordCount} words</span>
            </div>
          </div>
        </div>

        {/* Big Bubbly Voice Toggle Bar */}
        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRecording}
              className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse'
                  : 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-200 hover:scale-105'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isRecording && (
                <div className="absolute -inset-1 rounded-2xl border-2 border-rose-400 animate-ping pointer-events-none"></div>
              )}
            </button>

            <div>
              <div className="text-xs font-bold text-slate-800">
                {isRecording ? 'Listening live... speak your answer' : 'Click microphone to answer via voice'}
              </div>
              <p className="text-[11px] text-slate-500">
                {isSpeechSupported 
                  ? 'Web Speech API continuously transcribes in real-time'
                  : 'Microphone recognition unsupported; please type your answer'}
              </p>
            </div>
          </div>

          {/* Sound wave visualizer when recording */}
          {isRecording && (
            <div className="flex items-center gap-1 h-6 px-3 py-1 rounded-xl bg-rose-50 border border-rose-100">
              {[0.4, 0.9, 0.5, 0.8, 0.3, 0.7, 1.0, 0.6, 0.4].map((h, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-rose-500 rounded-full animate-bounce"
                  style={{
                    height: `${h * 18}px`,
                    animationDelay: `${idx * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Text / Transcript Editor Area */}
        <div className="relative">
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your spoken transcript or typed answer will appear here. Feel free to refine or edit before submitting for evaluation..."
            rows={6}
            className="w-full p-4 rounded-2xl bg-white/95 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all leading-relaxed resize-y"
          />

          {userAnswer && (
            <button
              onClick={() => {
                setUserAnswer('');
                setTimerSeconds(0);
              }}
              className="absolute bottom-3 right-3 text-[11px] font-semibold text-slate-400 hover:text-slate-600 bg-white/80 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Submit Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            AI evaluates Clarity, Technical Depth, STAR Structure, and Keywords.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleNextQuestion}
              disabled={isEvaluating}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
            >
              Skip Question
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={isEvaluating || !userAnswer.trim()}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500 hover:from-sky-600 hover:via-indigo-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Answer with AI...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer for AI Feedback</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Feedback Overlay / Modal */}
      {currentFeedback && (
        <FeedbackModal
          feedback={currentFeedback}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onProceed={handleNextQuestion}
        />
      )}
    </div>
  );
};

// Subcomponent: Feedback Modal with Strong Points, Weak Areas, Tips, and Expert Answer
interface FeedbackModalProps {
  feedback: AnswerFeedback;
  questionNumber: number;
  totalQuestions: number;
  onProceed: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  feedback,
  questionNumber,
  totalQuestions,
  onProceed
}) => {
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-400 to-teal-500 text-emerald-800';
    if (score >= 70) return 'from-sky-400 to-indigo-500 text-sky-800';
    return 'from-amber-400 to-orange-500 text-amber-800';
  };

  const isFinalQuestion = questionNumber === totalQuestions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bubble-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/95 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header with Overall Score Gauge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Question {questionNumber} of {totalQuestions} Feedback</span>
            </div>
            <h3 className="text-xl font-bold font-display text-slate-800">
              Evaluation & Analysis
            </h3>
          </div>

          {/* Big Score Bubble */}
          <div className="flex items-center gap-3 bg-white/90 p-3 rounded-2xl border border-slate-200/80 shadow-xs self-start sm:self-auto">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${getScoreColor(feedback.overallScore)} flex items-center justify-center text-white font-display font-extrabold text-2xl shadow-md`}>
              {feedback.overallScore}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {feedback.overallScore >= 85 ? 'Exceptional Delivery' : feedback.overallScore >= 70 ? 'Solid Response' : 'Room to Polish'}
              </div>
              <div className="text-[11px] text-slate-500">Overall AI Score</div>
            </div>
          </div>
        </div>

        {/* 5-Dimension Competency Scores */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: 'Clarity', val: feedback.breakdown.clarity },
            { label: 'Tech Depth', val: feedback.breakdown.technicalDepth },
            { label: 'Structure', val: feedback.breakdown.structure },
            { label: 'Relevance', val: feedback.breakdown.relevance },
            { label: 'Confidence', val: feedback.breakdown.confidence }
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-sm font-bold font-mono text-slate-800">{item.val}%</div>
              <div className="text-[10px] font-medium text-slate-500 truncate">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Strong Points & Weak Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strong Points */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Strong Points Highlighted</span>
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-950">
              {feedback.strongPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weak Areas */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Areas Needing Polish</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-950">
              {feedback.weakAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Personalized Improvement Tips */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
            <Lightbulb className="w-4 h-4 text-sky-600" />
            <span>Personalized Improvement Tips</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {feedback.improvementTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-sky-500 font-bold">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Keywords Comparison */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-700 block mb-1">Keywords Used:</span>
            <div className="flex flex-wrap gap-1">
              {feedback.keywordsUsed.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="font-semibold text-slate-700 block mb-1">Keywords to Include:</span>
            <div className="flex flex-wrap gap-1">
              {feedback.keywordsMissed.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Expert Model Answer (Expandable) */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white/80">
          <button
            type="button"
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>How an Expert Would Deliver This Answer</span>
            </span>
            <span className="text-sky-600 font-semibold">{showModelAnswer ? 'Collapse' : 'Reveal Model Answer'}</span>
          </button>
          {showModelAnswer && (
            <p className="mt-3 text-xs text-slate-600 leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-100 italic">
              "{feedback.modelAnswer}"
            </p>
          )}
        </div>

        {/* Proceed Action Button */}
        <div className="pt-2">
          <button
            onClick={onProceed}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500 hover:from-sky-600 hover:via-indigo-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isFinalQuestion ? 'Complete Interview & View Summary' : 'Proceed to Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
