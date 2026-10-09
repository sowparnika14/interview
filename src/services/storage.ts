import { User, InterviewSession, DailyTip } from '../types';

const USERS_KEY = 'bubbleprep_users';
const CURRENT_USER_KEY = 'bubbleprep_current_user';
const SESSIONS_KEY_PREFIX = 'bubbleprep_sessions_';

// Default mock questions for initial seed session
const seedDate = new Date();
const yesterday = new Date(seedDate);
yesterday.setDate(seedDate.getDate() - 1);
const twoDaysAgo = new Date(seedDate);
twoDaysAgo.setDate(seedDate.getDate() - 2);

const INITIAL_DEMO_USER: User = {
  id: 'demo-user-1',
  email: 'demo@bubbleprep.ai',
  name: 'Alex Morgan',
  role: 'Full Stack Engineer',
  level: 'Senior',
  targetCompany: 'Google, Stripe, Linear',
  streakDays: 4,
  lastActiveDate: seedDate.toISOString().split('T')[0],
  password: 'password123',
  avatarColor: 'from-sky-400 to-indigo-500',
};

const INITIAL_DEMO_SESSIONS: InterviewSession[] = [
  {
    id: 'session-demo-1',
    userId: 'demo-user-1',
    date: seedDate.toISOString(),
    role: 'Full Stack Engineer',
    level: 'Senior',
    topic: 'System Architecture & Concurrency',
    averageScore: 88,
    status: 'completed',
    questions: [
      {
        question: {
          id: 'q-seed-1',
          text: 'How would you design an idempotent payment processing API to prevent duplicate transactions during network timeouts?',
          category: 'System Architecture',
          hint: 'Discuss idempotency keys, distributed locks, database unique constraints, and transaction state machines.',
          criteria: 'Clear idempotency key handling, ACID compliance, failure recovery.',
          sampleFollowUp: 'What happens if the client sends the exact same idempotency key with different payload parameters?'
        },
        userAnswer: 'I design payment endpoints with an Idempotency-Key header. When a request arrives, we store the key in Redis with a 24-hour TTL and acquire an atomic distributed lock. If the key is already processing, subsequent requests receive a 409 Conflict or poll the in-progress status. Upon successful charging with Stripe, we store the full payload and response in PostgreSQL under a unique key constraint. Any repeated request simply fetches the previously finalized response.',
        durationSeconds: 115,
        timestamp: seedDate.toISOString(),
        feedback: {
          overallScore: 92,
          breakdown: {
            clarity: 94,
            technicalDepth: 95,
            structure: 90,
            relevance: 95,
            confidence: 86
          },
          strongPoints: [
            'Immediate clarity regarding idempotency key header mechanics.',
            'Effective combination of fast distributed lock (Redis) and durable source of truth (PostgreSQL).',
            'Addressed race conditions and polling for duplicate concurrent requests.'
          ],
          weakAreas: [
            'Could explicitly mention payload fingerprint hashing (SHA-256) to detect conflicting payloads with same key.',
            'Touch upon webhook reconciliation in case the connection drops before client receives the ACK.'
          ],
          improvementTips: [
            'Always verify payload checksum match to catch client-side idempotency misuse.',
            'Mention outbox pattern or event sourcing for guaranteed payment audit trails.'
          ],
          modelAnswer: 'To ensure idempotent payments, require an Idempotency-Key header. We store this key alongside a SHA-256 hash of the request body in our primary datastore. Using an atomic lock or INSERT ON CONFLICT, we ensure only one execution proceeds. The final response is cached; duplicate requests return the cached result immediately.',
          keywordsUsed: ['Idempotency-Key', 'Redis TTL', 'PostgreSQL unique constraint', 'atomic lock', '409 Conflict'],
          keywordsMissed: ['payload hash / SHA-256', 'outbox pattern', 'reconciliation worker']
        }
      },
      {
        question: {
          id: 'q-seed-2',
          text: 'Tell me about a time you had to push back on a product manager regarding an unrealistic project deadline.',
          category: 'Behavioral (STAR)',
          hint: 'Use the STAR format: highlight data-backed trade-offs, scope negotiation, and transparent communication.',
          criteria: 'Constructive dialogue, customer focus, team sustainability, win-win compromise.',
          sampleFollowUp: 'How did you keep the rest of the engineering team motivated during that crunch?'
        },
        userAnswer: 'Last quarter, our PM proposed shipping a complete real-time collaborative editor in three weeks for an executive summit. I scheduled a working session with the PM and broke down the engineering risks, particularly the OT/CRDT conflict resolution synchronization edge cases. Instead of an outright no, I proposed a phased release: we launched a robust live-read-and-comment mode for the summit, and scheduled full multi-cursor co-editing for the subsequent sprint. The summit demo was flawless and our team avoided burnout.',
        durationSeconds: 98,
        timestamp: seedDate.toISOString(),
        feedback: {
          overallScore: 84,
          breakdown: {
            clarity: 88,
            technicalDepth: 82,
            structure: 86,
            relevance: 88,
            confidence: 82
          },
          strongPoints: [
            'Great application of the STAR method with clear business context.',
            'Collaborative problem-solving: offered an phased compromise rather than a binary refusal.',
            'Highlighted team health and risk mitigation.'
          ],
          weakAreas: [
            'Quantify the result further: mention client or executive feedback metrics from the summit.',
            'Could explain how you ensured the team delivered phase two on time.'
          ],
          improvementTips: [
            'Mention how you documented the decision (e.g. an RFC or Jira roadmap revision) to align stakeholders.',
            'State the long-term relationship outcome with the PM to show sustained trust.'
          ],
          modelAnswer: 'When faced with a 3-week timeline for a complex real-time editor, I analyzed the architecture and showed that state sync required 5 weeks of rigor. I partnered with the PM to decouple the release: delivering high-polish commenting for the demo, followed by real-time sync. Both executive stakeholders and the engineering team praised the balance.',
          keywordsUsed: ['STAR framework', 'risk breakdown', 'phased rollout', 'CRDT sync', 'team burnout'],
          keywordsMissed: ['executive feedback metrics', 'decision doc/RFC', 'post-mortem reflection']
        }
      }
    ]
  },
  {
    id: 'session-demo-2',
    userId: 'demo-user-1',
    date: yesterday.toISOString(),
    role: 'Full Stack Engineer',
    level: 'Senior',
    topic: 'React Core, DOM & Performance',
    averageScore: 82,
    status: 'completed',
    questions: [
      {
        question: {
          id: 'q-seed-3',
          text: 'How does React 19 handle concurrency and Transitions under heavy render workloads?',
          category: 'Frontend Performance',
          hint: 'Explain useTransition, action scheduling, non-blocking rendering, and prioritizing urgent user inputs.',
          criteria: 'Technical precision, virtual DOM scheduling, user perceived performance.'
        },
        userAnswer: 'React 19 separates urgent updates like typing or clicking from non-urgent state updates via startTransition or the useTransition hook. Urgent updates execute synchronously to prevent input lag, while transition updates render concurrently in memory without blocking the browser main thread. If new user input occurs mid-render, React yields and discards outdated stale renders.',
        durationSeconds: 85,
        timestamp: yesterday.toISOString(),
        feedback: {
          overallScore: 82,
          breakdown: {
            clarity: 85,
            technicalDepth: 84,
            structure: 80,
            relevance: 86,
            confidence: 78
          },
          strongPoints: [
            'Clean distinction between urgent and non-urgent state transitions.',
            'Good grasp of non-blocking concurrency and yielding main thread.'
          ],
          weakAreas: [
            'Could contrast with older shouldComponentUpdate or useMemo patterns.',
            'Give a real-world scenario such as heavy data table filtering or graph re-layouts.'
          ],
          improvementTips: [
            'Illustrate with a quick mental code example (e.g. search input vs result list).',
            'Mention Suspense integration and Actions API in React 19.'
          ],
          modelAnswer: 'React transitions allow developers to mark updates as non-urgent. While user inputs execute immediately, transition work is interrupted if fresh events arrive. This maintains 60fps responsiveness during intensive re-renders.',
          keywordsUsed: ['useTransition', 'non-blocking rendering', 'main thread yielding', 'urgent vs non-urgent'],
          keywordsMissed: ['Suspense integration', 'React 19 Actions', 'profiler flamegraphs']
        }
      }
    ]
  },
  {
    id: 'session-demo-3',
    userId: 'demo-user-1',
    date: twoDaysAgo.toISOString(),
    role: 'Full Stack Engineer',
    level: 'Senior',
    topic: 'Microservices vs Monoliths',
    averageScore: 78,
    status: 'completed',
    questions: [
      {
        question: {
          id: 'q-seed-4',
          text: 'When is it appropriate to decompose a monolithic application into microservices, and what are the hidden operational costs?',
          category: 'System Architecture',
          hint: 'Highlight organizational scaling, independent deployment, network latency, distributed transactions, and observability costs.',
          criteria: 'Pragmatic trade-offs, Conway Law, observability overhead.'
        },
        userAnswer: 'Decomposing a monolith should be driven by team size and independent deployment cadence rather than technical vanity. The hidden costs are immense: distributed tracing, network latency, eventual consistency, complex deployment pipelines, and failure cascade risks.',
        durationSeconds: 70,
        timestamp: twoDaysAgo.toISOString(),
        feedback: {
          overallScore: 78,
          breakdown: {
            clarity: 82,
            technicalDepth: 75,
            structure: 78,
            relevance: 82,
            confidence: 76
          },
          strongPoints: [
            'Correctly identified team topology as the primary driver.',
            'Succinct list of operational complexities.'
          ],
          weakAreas: [
            'Answer was a bit too brief; expand on strategies like Strangler Fig pattern.',
            'Mention distributed saga transactions or compensation workflows.'
          ],
          improvementTips: [
            'Aim for 90-120 seconds to provide structured depth on senior system design questions.',
            'Mention specific tools (OpenTelemetry, Kafka, gRPC).'
          ],
          modelAnswer: 'Microservices solve organizational scaling when multiple squads bottleneck on a shared deployment pipeline. However, they introduce distributed data consistency challenges, telemetry overhead, and network serialization costs. Start modular and adopt the Strangler Fig pattern incrementally.',
          keywordsUsed: ['independent deployment', 'distributed tracing', 'eventual consistency'],
          keywordsMissed: ['Strangler Fig pattern', 'Saga pattern', 'OpenTelemetry', 'Conway Law']
        }
      }
    ]
  }
];

// Helper to get all users
export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify([INITIAL_DEMO_USER]));
      return [INITIAL_DEMO_USER];
    }
    return JSON.parse(raw);
  } catch {
    return [INITIAL_DEMO_USER];
  }
}

// Get current user or null
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      // Default to demo user if first time
      const users = getUsers();
      const demo = users[0] || INITIAL_DEMO_USER;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demo));
      return demo;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_USER;
  }
}

// Set current user
export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Authenticate user
export function authenticateUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const found = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!found) {
    return { success: false, error: 'No account found with this email. Please check or register.' };
  }

  if (found.password && found.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  // Update last active & streak check
  const updatedUser = updateStreakOnLogin(found);
  saveUser(updatedUser);
  setCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
}

// Register new user
export function registerUser(email: string, password: string, name: string, role: string, level: string): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const avatarPalettes = [
    'from-sky-400 to-indigo-500',
    'from-emerald-400 to-teal-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-500',
    'from-violet-400 to-purple-600'
  ];

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    name: name.trim() || 'Candidate',
    role: role || 'Software Engineer',
    level: level || 'Mid-level',
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    password,
    avatarColor: avatarPalettes[Math.floor(Math.random() * avatarPalettes.length)]
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

// Save or update user
export function saveUser(updatedUser: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index >= 0) {
    users[index] = updatedUser;
  } else {
    users.push(updatedUser);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const current = getCurrentUser();
  if (current && current.id === updatedUser.id) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }
}

// Check and update streak logic
export function updateStreakOnLogin(user: User): User {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.lastActiveDate;

  if (lastActive === today) {
    return user; // already counted today
  }

  const todayDate = new Date(today);
  const lastDate = new Date(lastActive);
  const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = user.streakDays;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1; // reset streak
  }

  return {
    ...user,
    streakDays: newStreak,
    lastActiveDate: today
  };
}

// Sanitize and repair sessions to protect against any missing question fields
export function sanitizeSessions(sessions: any[]): InterviewSession[] {
  if (!Array.isArray(sessions)) return [];
  return sessions.map((session, sIdx) => {
    if (!session || typeof session !== 'object') {
      return {
        id: `session-repair-${sIdx}`,
        userId: 'demo-user-1',
        date: new Date().toISOString(),
        role: 'Software Engineer',
        level: 'Mid-level',
        topic: 'General Practice',
        averageScore: 80,
        questions: [],
        status: 'completed' as const
      };
    }
    const questionsList = Array.isArray(session.questions) ? session.questions : [];
    const sanitizedQuestions = questionsList
      .filter((q: any) => q && (q.question || q.text || q.userAnswer))
      .map((q: any, qIdx: number) => {
        if (!q.question) {
          return {
            question: {
              id: q.id || `q-repair-${sIdx}-${qIdx}`,
              text: q.text || 'Practice Interview Scenario',
              category: q.category || 'General',
              hint: q.hint || 'Structure your answer using the STAR format.',
              criteria: q.criteria || 'Clear communication, measurable outcome.',
              sampleFollowUp: q.sampleFollowUp
            },
            userAnswer: q.userAnswer || 'Spoken answer transcript recorded.',
            durationSeconds: q.durationSeconds || 75,
            feedback: q.feedback || {
              overallScore: 82,
              breakdown: { clarity: 85, technicalDepth: 80, structure: 82, relevance: 86, confidence: 78 },
              strongPoints: ['Clear presentation.'],
              weakAreas: ['Include more metrics.'],
              improvementTips: ['Use STAR method.'],
              modelAnswer: 'Clear exemplar structure.',
              keywordsUsed: [],
              keywordsMissed: []
            },
            timestamp: q.timestamp || new Date().toISOString()
          };
        }
        return {
          ...q,
          question: {
            id: q.question.id || `q-${qIdx}`,
            text: q.question.text || 'Interview Question',
            category: q.question.category || 'General',
            hint: q.question.hint || '',
            criteria: q.question.criteria || '',
            sampleFollowUp: q.question.sampleFollowUp
          }
        };
      });

    return {
      ...session,
      questions: sanitizedQuestions
    };
  });
}

// Load sessions for a user
export function getUserSessions(userId: string): InterviewSession[] {
  try {
    const key = `${SESSIONS_KEY_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (userId === 'demo-user-1') {
        localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_SESSIONS));
        return INITIAL_DEMO_SESSIONS;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeSessions(parsed);
    return sanitized;
  } catch {
    return userId === 'demo-user-1' ? INITIAL_DEMO_SESSIONS : [];
  }
}

// Save session for a user
export function saveUserSession(session: InterviewSession): void {
  const sessions = getUserSessions(session.userId);
  const index = sessions.findIndex(s => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(`${SESSIONS_KEY_PREFIX}${session.userId}`, JSON.stringify(sessions));

  // Update user streak if completed
  if (session.status === 'completed') {
    const user = getCurrentUser();
    if (user && user.id === session.userId) {
      const updated = updateStreakOnLogin(user);
      saveUser(updated);
    }
  }
}

// Delete session
export function deleteUserSession(userId: string, sessionId: string): void {
  const sessions = getUserSessions(userId).filter(s => s.id !== sessionId);
  localStorage.setItem(`${SESSIONS_KEY_PREFIX}${userId}`, JSON.stringify(sessions));
}
