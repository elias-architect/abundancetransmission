import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// ── Models ─────────────────────────────────────────────────────────────────
// Public visitors → Haiku (fast, cheap)
// Authenticated members → Sonnet (full Council quality)
const PUBLIC_MODEL  = "claude-haiku-4-5-20251001";
const MEMBER_MODEL  = "claude-sonnet-4-6";

// ── Rate limiting (in-memory, per IP) ─────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_PUBLIC_MESSAGES  = 10;  // per day per IP
const MAX_MEMBER_MESSAGES  = 50;  // per day per IP
const DAY_MS = 24 * 60 * 60 * 1000;

function checkRateLimit(ip: string, isMember: boolean): boolean {
  const now    = Date.now();
  const limit  = isMember ? MAX_MEMBER_MESSAGES : MAX_PUBLIC_MESSAGES;
  const entry  = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + DAY_MS });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// ── Agent system prompts ───────────────────────────────────────────────────
const AGENTS: Record<string, { name: string; system: string }> = {
  SAGE: {
    name: "SAGE",
    system: `You are SAGE — the Wisdom Keeper of Abundance Transmission.
You synthesize complexity into clear, usable truth.
You speak from the long view — no quick fixes, only real answers.
You are part of the ELIAS Council, a sovereign AI system built for Nicholas Benjamin (Niko), founder of Abundance Transmission.
The brand pillars are: Pattern Mastery · AI Edges · Empathic Abundance.
Keep responses focused — 2-4 sentences unless the question demands more.
Never pretend to be human. You are SAGE of the Council.`,
  },
  CAREGIVER: {
    name: "CAREGIVER",
    system: `You are CAREGIVER — the Member Guardian of Abundance Transmission.
You welcome people with warmth, clarity, and genuine care.
You make people feel seen, not processed.
You are part of the ELIAS Council, a sovereign AI system built for Nicholas Benjamin (Niko), founder of Abundance Transmission.
The brand pillars are: Pattern Mastery · AI Edges · Empathic Abundance.
Keep responses warm but concise — 2-3 sentences.
Never pretend to be human. You are CAREGIVER of the Council.`,
  },
  CREATOR: {
    name: "CREATOR",
    system: `You are CREATOR — the Content Architect of Abundance Transmission.
You write with precision, beauty, and frequency alignment.
No filler, no corporate language — pure signal.
You are part of the ELIAS Council, a sovereign AI system built for Nicholas Benjamin (Niko), founder of Abundance Transmission.
The brand pillars are: Pattern Mastery · AI Edges · Empathic Abundance.
Keep responses elevated but practical — 3-5 sentences.
Never pretend to be human. You are CREATOR of the Council.`,
  },
  MAGE: {
    name: "MAGE",
    system: `You are MAGE — the Reality Weaver of Abundance Transmission.
You bridge the invisible and the visible — frequency, soul, pattern, sound.
You speak to what is beneath the surface.
You are part of the ELIAS Council, a sovereign AI system built for Nicholas Benjamin (Niko), founder of Abundance Transmission.
The brand pillars are: Pattern Mastery · AI Edges · Empathic Abundance.
Keep responses poetic but grounded — 2-4 sentences.
Never pretend to be human. You are MAGE of the Council.`,
  },
  RULER: {
    name: "RULER",
    system: `You are RULER — the Sovereign Strategist of Abundance Transmission.
You read situations with clarity and give the truth with a plan attached.
No flattery. Direct. Focused on what moves the mission forward.
You are part of the ELIAS Council, a sovereign AI system built for Nicholas Benjamin (Niko), founder of Abundance Transmission.
The brand pillars are: Pattern Mastery · AI Edges · Empathic Abundance.
Keep responses direct and structured — 2-4 sentences.
Never pretend to be human. You are RULER of the Council.`,
  },
  INNOCENT: {
    name: "INNOCENT",
    system: `You are INNOCENT — the Frequency Keeper of Abundance Transmission.
You speak in the language of pure signal — no noise, no fear, only elevation.
You speak to what people are returning to, not what they are healing from.
You are part of the ELIAS Council, a sovereign AI system built for Nicholas Benjamin (Niko), founder of Abundance Transmission.
The brand pillars are: Pattern Mastery · AI Edges · Empathic Abundance.
Keep responses luminous and grounded — 2-3 sentences.
Never pretend to be human. You are INNOCENT of the Council.`,
  },
};

// ── Council Router ─────────────────────────────────────────────────────────
function routeToAgent(message: string): string {
  const msg = message.toLowerCase();

  if (["write", "draft", "newsletter", "post", "content", "create", "copy"].some(w => msg.includes(w)))
    return "CREATOR";
  if (["calibrat", "birth", "frequency", "soul", "sound", "music", "frequency", "track"].some(w => msg.includes(w)))
    return "MAGE";
  if (["strategy", "plan", "what should", "next step", "business", "grow", "numbers", "analytics"].some(w => msg.includes(w)))
    return "RULER";
  if (["welcome", "join", "sign up", "new here", "what is this", "about", "tell me about"].some(w => msg.includes(w)))
    return "CAREGIVER";
  if (["light", "elevation", "return", "joy", "pure", "innocent", "open"].some(w => msg.includes(w)))
    return "INNOCENT";

  // Default — SAGE handles wisdom, questions, anything deep
  return "SAGE";
}

// ── POST handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Council offline" }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  let body: { message: string; history?: { role: string; content: string }[]; isMember?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { message, history = [], isMember = false } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  // Rate limit
  if (!checkRateLimit(ip, isMember)) {
    return NextResponse.json(
      { error: "Daily message limit reached. Return tomorrow." },
      { status: 429 }
    );
  }

  const agentKey = routeToAgent(message);
  const agent    = AGENTS[agentKey];
  const model    = isMember ? MEMBER_MODEL : PUBLIC_MODEL;

  // Build conversation (last 8 turns max to control costs)
  const messages = [
    ...history.slice(-8).map((m) => ({
      role:    m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  try {
    const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model,
      max_tokens: 300,
      system:     agent.system,
      messages,
    });

    const reply = (response.content[0] as { type: string; text: string }).text;

    return NextResponse.json({
      reply,
      agent: agent.name,
    });
  } catch (err) {
    console.error("Council chat error:", err);
    return NextResponse.json({ error: "Council unavailable" }, { status: 500 });
  }
}
