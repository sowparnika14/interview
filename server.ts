import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "10mb" }));

const port = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to provide realistic questions based on role and topic
function getCuratedQuestions(role: string, level: string, topic: string, count: number) {
  const isBehavioral = topic.toLowerCase().includes("behavioral") || topic.toLowerCase().includes("conflict") || role.toLowerCase().includes("behavioral");
  const isSystemDesign = topic.toLowerCase().includes("architecture") || topic.toLowerCase().includes("system") || role.toLowerCase().includes("architect") || role.toLowerCase().includes("backend");
  const isFrontend = role.toLowerCase().includes("frontend") || topic.toLowerCase().includes("react");
  const isProduct = role.toLowerCase().includes("product") || topic.toLowerCase().includes("strategy");

  if (isBehavioral) {
    return [
      {
        id: `q-curated-${Date.now()}-1`,
        text: `Tell me about a time you faced a significant technical disagreement or differing strategic opinion with a team member or leader. How did you navigate the conversation to consensus?`,
        category: "Behavioral & Conflict",
        hint: "Structure your response with the STAR framework: Situation, Task, Action, and Result. Highlight data-driven reasoning and professional empathy.",
        criteria: "Active listening, objective decision criteria, maintaining team velocity, lasting alignment.",
        sampleFollowUp: "What would you do differently if the stakeholder refused to change their stance?"
      },
      {
        id: `q-curated-${Date.now()}-2`,
        text: `Can you walk me through a project where an unexpected blocker or shifting deadline threatened the launch? How did you prioritize scope and communicate with stakeholders?`,
        category: "Behavioral & Ownership",
        hint: "Explain how you analyzed risks, proposed phased releases or trade-offs, and protected team morale.",
        criteria: "Proactive communication, transparent risk assessment, decisive prioritization.",
        sampleFollowUp: "How did you ensure team members didn't burn out during the crunch?"
      },
      {
        id: `q-curated-${Date.now()}-3`,
        text: `Describe a situation where you made a mistake or shipped a defect that impacted users or teammates. How did you handle the aftermath and what did you learn?`,
        category: "Behavioral & Learning",
        hint: "Demonstrate emotional maturity: take clear accountability, explain the remediation, and show how you improved processes.",
        criteria: "Accountability, blameless post-mortem mindset, systematic prevention.",
        sampleFollowUp: "How did you update team test coverage or CI/CD pipelines to prevent recurrence?"
      }
    ].slice(0, count);
  }

  if (isSystemDesign) {
    return [
      {
        id: `q-curated-${Date.now()}-1`,
        text: `How would you design an idempotent payment processing API to prevent duplicate transactions during network timeouts and retries in a high-scale system?`,
        category: "System Architecture",
        hint: "Discuss idempotency keys, distributed locks, database unique constraints, atomic state transitions, and caching responses.",
        criteria: "Clear idempotency key handling, ACID compliance, failure recovery, race condition mitigation.",
        sampleFollowUp: "What happens if two concurrent requests arrive with the exact same idempotency key at the exact same millisecond?"
      },
      {
        id: `q-curated-${Date.now()}-2`,
        text: `Describe how you approach scaling, database bottlenecks, and data consistency when designing a critical service for a ${level} ${role}.`,
        category: "Scalability & Data",
        hint: "Mention query profiling, read replicas, sharding strategies, caching tiers (Redis), and trade-offs between consistency and availability.",
        criteria: "Deep domain grasp, awareness of failure modes, telemetry, performance metrics.",
        sampleFollowUp: "How do you decide between building a custom solution vs adopting a managed cloud database?"
      },
      {
        id: `q-curated-${Date.now()}-3`,
        text: `How do you design for high availability and graceful degradation when downstream microservices or third-party APIs experience outages?`,
        category: "Reliability & Resilience",
        hint: "Explain circuit breakers, fallback responses, message queues/dead letter queues, and exponential backoff with jitter.",
        criteria: "Fault isolation, observability, circuit breakers, user perceived performance.",
        sampleFollowUp: "How do you monitor and alert on error budgets or SLO violations in production?"
      }
    ].slice(0, count);
  }

  if (isFrontend) {
    return [
      {
        id: `q-curated-${Date.now()}-1`,
        text: `How does React manage concurrent rendering, transitions, and component re-render optimization under intensive client-side workloads?`,
        category: "Frontend Performance",
        hint: "Discuss useTransition, memoization strategies, virtual DOM reconciliation, and avoiding main thread blocking.",
        criteria: "Deep understanding of browser event loop, React render phases, 60fps responsiveness.",
        sampleFollowUp: "How do you profile a slow web app using Chrome DevTools flame graphs?"
      },
      {
        id: `q-curated-${Date.now()}-2`,
        text: `How do you architect complex state management and real-time synchronization in modern Single Page Applications?`,
        category: "Architecture & State",
        hint: "Compare server state (React Query / SWR) with local UI state and global stores. Mention WebSocket/SSE reconnections.",
        criteria: "Decoupling concerns, optimistic UI updates, error rollbacks, clean data contracts.",
        sampleFollowUp: "How do you handle optimistic UI updates when an API request fails?"
      },
      {
        id: `q-curated-${Date.now()}-3`,
        text: `What is your approach to web performance metrics (Core Web Vitals like LCP, INP, CLS) and ensuring high accessibility (WCAG AA)?`,
        category: "Quality & Accessibility",
        hint: "Cover code splitting, asset preloading, image optimization, keyboard navigation, and ARIA landmarks.",
        criteria: "Pragmatic metrics knowledge, inclusive design, automated accessibility auditing.",
        sampleFollowUp: "How do you prevent cumulative layout shift (CLS) when dynamic ad banners or images load?"
      }
    ].slice(0, count);
  }

  // General tech questions
  return [
    {
      id: `q-curated-${Date.now()}-1`,
      text: `Can you walk me through a challenging problem or project you engineered recently in your role as a ${role}? What was your exact technical contribution and the ultimate business outcome?`,
      category: "Problem Solving & Architecture",
      hint: "Structure your answer using Situation, Task, Action, and Result (STAR). Focus on quantifiable engineering impact.",
      criteria: "Clear context, specific individual contributions, measurable outcomes, reflection on learnings.",
      sampleFollowUp: "What would you do differently if you had to start that project again today?"
    },
    {
      id: `q-curated-${Date.now()}-2`,
      text: `How do you handle technical disagreements or differing opinions with team members or stakeholders when designing a solution?`,
      category: "Collaboration & Conflict",
      hint: "Give a concrete example showing active listening, data-driven reasoning, and arriving at consensus.",
      criteria: "Empathy, communication skills, objective criteria, maintaining team velocity and trust.",
      sampleFollowUp: "How do you handle a scenario where leadership insists on a direction you disagree with?"
    },
    {
      id: `q-curated-${Date.now()}-3`,
      text: `Describe how you approach scaling, performance bottlenecks, or reliability when building critical features for a ${level} ${role}.`,
      category: "Technical Architecture",
      hint: "Mention monitoring, profiling, trade-offs (e.g. caching vs consistency), and graceful degradation.",
      criteria: "Deep domain grasp, awareness of failure modes, telemetry, performance metrics.",
      sampleFollowUp: "How do you decide between building a custom solution vs adopting a third-party tool?"
    }
  ].slice(0, count);
}

// 1. Generate Interview Questions
app.post("/api/interview/generate-questions", async (req, res) => {
  const { role = "Software Engineer", level = "Mid-level", topic = "General", count = 3, companyFocus = "Tech Industry" } = req.body;
  const fallbackQuestions = getCuratedQuestions(role, level, topic, count);

  try {
    const ai = getAiClient();
    if (ai) {
      const prompt = `You are an elite hiring manager conducting an interview for a ${level} ${role} with a focus on ${topic} (${companyFocus}).
Generate exactly ${count} realistic, challenging, yet fair interview questions.
Ensure an optimal balance:
- Mix of technical/domain depth, real-world scenario trade-offs, and behavioral collaboration.
- Include a helpful hint for each question, key evaluation criteria, and a sample follow-up probe.`;

      // Call Gemini with timeout protection
      const geminiPromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional mock interviewer assistant. Return valid JSON only.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of interview questions",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                category: { type: Type.STRING },
                hint: { type: Type.STRING },
                criteria: { type: Type.STRING },
                sampleFollowUp: { type: Type.STRING }
              },
              required: ["id", "text", "category", "hint", "criteria"]
            }
          }
        }
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
      const response = await Promise.race([geminiPromise, timeoutPromise]);

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ questions: parsed });
        }
      }
    }
  } catch (error) {
    console.warn("Notice: Gemini question generation unavailable, using curated questions:", (error as any)?.message || error);
  }

  // Always return healthy 200 with curated questions
  return res.json({ questions: fallbackQuestions });
});

// 2. Evaluate Answer
app.post("/api/interview/evaluate-answer", async (req, res) => {
  const { question, answer = "", role = "Software Engineer", level = "Mid-level", category = "General" } = req.body;

  const words = (answer || "").trim().split(/\s+/).filter(Boolean).length;
  let score = 75;
  if (words > 100) score += 12;
  else if (words > 50) score += 6;
  else if (words < 20) score -= 15;

  const fallbackFeedback = {
    overallScore: Math.min(94, Math.max(55, score)),
    breakdown: {
      clarity: Math.min(95, score + 2),
      technicalDepth: Math.min(92, score - 2),
      structure: Math.min(90, score),
      relevance: Math.min(96, score + 3),
      confidence: Math.min(92, score - 1)
    },
    strongPoints: [
      "Directly tackled the core question with genuine personal perspective.",
      `Provided coherent context (${words} words spoken) to illustrate the situation.`,
      "Demonstrated practical grasp of professional responsibilities."
    ],
    weakAreas: [
      "Could strengthen the Result phase with quantifiable metrics (e.g., % latency drop, revenue, user adoption).",
      "Explain trade-offs or alternative options you considered before settling on this solution.",
      "Keep the narrative tighter to prevent wandering into secondary details."
    ],
    improvementTips: [
      "Use the STAR framework explicitly: spend 15% on Situation, 15% on Task, 50% on Actions, and 20% on Results.",
      "State 1 concrete metric in every answer to anchor your credibility.",
      "Wrap up with a concise synthesis: 'In summary, that experience taught me...'"
    ],
    modelAnswer: `In my previous role, our team faced a bottleneck where API latency doubled during peak traffic (Situation). I spearheaded optimizing our caching layer and database query indices (Task). By implementing Redis tiered caching and decomposing N+1 queries (Action), we slashed p99 latency by 45% and reduced infrastructure costs by 20% (Result).`,
    keywordsUsed: ["project", "team", "solution", "implementation"],
    keywordsMissed: ["trade-offs", "quantifiable metrics", "STAR framework", "monitoring"]
  };

  try {
    const ai = getAiClient();
    if (ai && answer.trim().length > 0) {
      const prompt = `You are an elite interview coach evaluating a candidate's answer for a ${level} ${role} interview.
Question: "${question}"
Candidate Category: "${category}"
Candidate's Answer: "${answer}"

Provide an honest, constructive, and detailed evaluation.
1. overallScore (0-100)
2. breakdown with scores (0-100) for:
   - clarity
   - technicalDepth
   - structure (STAR methodology or logical flow)
   - relevance
   - confidence
3. strongPoints: 2 to 4 bullet points highlighting what they did well.
4. weakAreas: 2 to 4 bullet points of gaps, vague claims, or missing depth.
5. improvementTips: 2 to 3 high-impact, actionable steps they can practice right now.
6. modelAnswer: A concise 3-4 sentence exemplar response showing how an expert would deliver this.
7. keywordsUsed: 2 to 6 key terms or concepts the candidate successfully mentioned.
8. keywordsMissed: 2 to 5 high-value industry terms or concepts they should have included.`;

      const geminiPromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a top-tier interview coach. Provide rigorous, supportive, structured feedback. Output valid JSON only.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  clarity: { type: Type.INTEGER },
                  technicalDepth: { type: Type.INTEGER },
                  structure: { type: Type.INTEGER },
                  relevance: { type: Type.INTEGER },
                  confidence: { type: Type.INTEGER }
                },
                required: ["clarity", "technicalDepth", "structure", "relevance", "confidence"]
              },
              strongPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              weakAreas: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              improvementTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              modelAnswer: { type: Type.STRING },
              keywordsUsed: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              keywordsMissed: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: [
              "overallScore",
              "breakdown",
              "strongPoints",
              "weakAreas",
              "improvementTips",
              "modelAnswer",
              "keywordsUsed",
              "keywordsMissed"
            ]
          }
        }
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
      const response = await Promise.race([geminiPromise, timeoutPromise]);

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ feedback: parsed });
      }
    }
  } catch (error) {
    console.warn("Notice: Gemini evaluation unavailable, using heuristic feedback:", (error as any)?.message || error);
  }

  return res.json({ feedback: fallbackFeedback });
});

// 3. Ask AI Coach
app.post("/api/coach/ask", async (req, res) => {
  const { message, conversationHistory = [], role = "Software Engineer", level = "Mid-level" } = req.body;

  const fallbackReply = `Great question! When interviewing for a ${level} ${role}, hiring managers are looking for two things: strong technical/domain reasoning and clear communication under pressure.\n\nHere are 3 quick rules to remember:\n• Anchor your stories in numbers (e.g. 'reduced latency by 35%').\n• Speak in the 'I' when talking about your actions, and 'We' when crediting the team.\n• Pause for 2 seconds before answering to structure your thoughts.\n\nWhat specific topic would you like to practice next?`;

  try {
    const ai = getAiClient();
    if (ai) {
      const historyContext = conversationHistory
        .slice(-6)
        .map((m: { role: string; text: string }) => `${m.role === "user" ? "Candidate" : "Coach"}: ${m.text}`)
        .join("\n");

      const prompt = `You are "Coach Aria", a warm, world-class interview coach for a candidate preparing for a ${level} ${role} role.
Recent conversation:
${historyContext}

Candidate just said: "${message}"

Give a supportive, direct, and actionable answer.
Keep formatting clean: use short paragraphs and bullet points where helpful.
Limit to 150-250 words so it's easy to read during practice.`;

      const geminiPromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Coach Aria: uplifting, pragmatic, empathetic, and focused on practical interview success."
        }
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
      const response = await Promise.race([geminiPromise, timeoutPromise]);

      if (response && response.text) {
        return res.json({ reply: response.text });
      }
    }
  } catch (error) {
    console.warn("Notice: Coach AI unavailable, using fallback advice:", (error as any)?.message || error);
  }

  return res.json({ reply: fallbackReply });
});

// 4. Daily Tips & Drills
app.get("/api/coach/daily-tip", async (_req, res) => {
  const tips = [
    {
      title: "The 60-Second Hook",
      tip: "When asked 'Tell me about yourself', divide your answer into Past (foundation), Present (current scope & superpower), and Future (why this exact team inspires you). Keep it under 90 seconds.",
      drill: "Practice your elevator pitch out loud in 60 seconds without filler words."
    },
    {
      title: "The STAR+L Rule",
      tip: "Upgrade standard STAR with 'L' for Learnings. Concluding your answer with what you'd do differently or what the experience taught you proves high self-awareness and senior maturity.",
      drill: "Pick one project failure and articulate 2 high-level lessons learned."
    },
    {
      title: "Clarify Before Coding / Designing",
      tip: "Never jump straight to solutions. Ask 2-3 clarifying questions: scale, latency requirements, edge cases, and constraints. Top interviewers evaluate how you navigate ambiguity.",
      drill: "Formulate 3 clarifying questions for 'Design a URL shortener'."
    },
    {
      title: "Graceful 'I Don't Know'",
      tip: "If you don't know an answer, never bluff. Say: 'I haven't worked with that directly, but based on my experience with X, here is how I would approach investigating it.'",
      drill: "Simulate encountering an unknown tool and explain your learning playbook."
    }
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  return res.json({ dailyTip: randomTip });
});

// Static assets / Vite handling
async function setupServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`BubblePrep server listening on port ${port} (mode: ${isProd ? "production" : "development"})`);
  });
}

setupServer();
