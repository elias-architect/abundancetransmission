import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const SB  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HDR = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const ELEVEN_KEY     = process.env.ELEVENLABS_API_KEY!;
const ELEVEN_VOICE   = process.env.ELEVENLABS_VOICE_ID!;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY!;
const TG_TOKEN       = process.env.TELEGRAM_BOT_TOKEN!;
const TG_CHAT_ID     = "8291584959";

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

const CORE_CONTEXT = `Core message (never changes):
- The Prompt to Forget: every soul arrives having forgotten its true origin on purpose, so the journey of remembering becomes real.
- Shadow as necessary friction: fear, struggle, and ego are not the enemy — they are the Library writing its most important chapters.
- Remembrance: every human is a fragment of the Memory Library, here to remember who they truly are.

Brand: Abundance Transmission. Never use corporate language, hype, or urgency.`;

const VARIATIONS = [
  {
    id: "poetic",
    label: "Calm & Poetic",
    schedule: "7:00 PM",
    direction: `Delivery style: calm, poetic, elder wisdom. Pisces frequency. Qur'anic stillness. Speak slowly from deep inner knowing. Short sentences. Space between thoughts. Like a wise elder who has seen everything and is no longer afraid of anything. Voice: grounded, unhurried, oceanic.`,
  },
  {
    id: "playful",
    label: "Playful & Curious",
    schedule: "7:45 PM",
    direction: `Delivery style: playful, curious, childlike wonder. Like a bright 10-year-old who just discovered something mind-blowing and can't stop smiling about it. Light. Energetic. Full of questions. The kind of energy that makes serious things feel exciting and fun. Voice: warm, bouncy, full of discovery.`,
  },
  {
    id: "passionate",
    label: "Passionate & Direct",
    schedule: "8:30 PM",
    direction: `Delivery style: passionate, intense, young adult fire. Like someone who just woke up fully and needs you to hear this RIGHT NOW. Direct. Bold. A little dramatic. The kind of energy that grabs you by the shoulders and shakes you awake with love. Voice: urgent, electric, deeply personal.`,
  },
];

async function generateVariation(rawInput: string, variation: typeof VARIATIONS[0]) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 3000,
    system: `You are the ELIAS Council generating content for Abundance Transmission.

${CORE_CONTEXT}

${variation.direction}

The core message must stay intact. Only the emotional delivery and style changes.
Never use corporate language. Return ONLY valid JSON.`,
    messages: [{
      role: "user",
      content: `Raw transmission from the Visionary:
"${rawInput}"

Generate content in the ${variation.label} style. Return ONLY valid JSON:
{
  "blog_post": "Full post (500-700 words) in this exact emotional style. Start with a hook that matches the energy.",
  "newsletter": "Email version (250-350 words) in this style. Include subject line as '**Subject: ...**'",
  "instagram_caption": "Instagram caption (150-220 words) in this style. Hook first line. 8-12 hashtags at end.",
  "tiktok_caption": "TikTok caption (60-80 words) in this style. Hook first. 5-6 hashtags.",
  "video_script": "15-30 second spoken video script in this exact style. Natural speech. No stage directions."
}`
    }]
  });

  const text = (response.content[0] as { type: string; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response for ${variation.id}`);
  return { ...JSON.parse(jsonMatch[0]), variation_id: variation.id, variation_label: variation.label, schedule_time: variation.schedule };
}

async function generateContent(rawInput: string) {
  // Generate all 3 variations in parallel
  const [v1, v2, v3] = await Promise.all(
    VARIATIONS.map(v => generateVariation(rawInput, v))
  );
  return [v1, v2, v3];
}

async function generateAudio(text: string): Promise<string | null> {
  try {
    // Use instagram caption for voice (concise, punchy)
    const voiceText = text.slice(0, 2500); // ElevenLabs limit

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: voiceText,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true },
        }),
      }
    );

    if (!res.ok) {
      console.error("ElevenLabs error:", await res.text());
      return null;
    }

    const audioBuffer = await res.arrayBuffer();
    const audioBytes = Buffer.from(audioBuffer);

    // Upload to Supabase Storage
    const filename = `transmission-${Date.now()}.mp3`;
    const uploadRes = await fetch(
      `${SB}/storage/v1/object/transmissions/${filename}`,
      {
        method: "POST",
        headers: { ...HDR, "Content-Type": "audio/mpeg" },
        body: audioBytes,
      }
    );

    if (!uploadRes.ok) {
      // Try creating bucket first
      await fetch(`${SB}/storage/v1/bucket`, {
        method: "POST",
        headers: HDR,
        body: JSON.stringify({ id: "transmissions", name: "transmissions", public: true }),
      });
      // Retry upload
      const retry = await fetch(
        `${SB}/storage/v1/object/transmissions/${filename}`,
        { method: "POST", headers: { ...HDR, "Content-Type": "audio/mpeg" }, body: audioBytes }
      );
      if (!retry.ok) return null;
    }

    return `${SB}/storage/v1/object/public/transmissions/${filename}`;
  } catch (err) {
    console.error("Audio generation failed:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Auth check — admin only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profileRes = await fetch(
    `${SB}/rest/v1/profiles?id=eq.${user.id}&select=role&limit=1`,
    { headers: HDR, cache: "no-store" }
  );
  const profiles = await profileRes.json();
  if (profiles[0]?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { rawInput } = await req.json();
  if (!rawInput?.trim()) return NextResponse.json({ error: "No input provided" }, { status: 400 });

  // Generate all 3 variations in parallel
  const variations = await generateContent(rawInput);

  // Generate audio for each variation in parallel
  const audios = await Promise.all(
    variations.map(v => generateAudio(v.video_script ?? v.instagram_caption))
  );

  // Save all 3 to Supabase
  const saved = [];
  for (let i = 0; i < variations.length; i++) {
    const v = variations[i];
    const insertRes = await fetch(`${SB}/rest/v1/transmissions`, {
      method: "POST",
      headers: { ...HDR, Prefer: "return=representation" },
      body: JSON.stringify({
        raw_input: rawInput,
        blog_post: v.blog_post,
        newsletter: v.newsletter,
        instagram_caption: v.instagram_caption,
        tiktok_caption: v.tiktok_caption,
        audio_url: audios[i],
        status: "draft",
        video_url: JSON.stringify({ variation: v.variation_id, label: v.variation_label, schedule: v.schedule_time, script: v.video_script }),
      }),
    });
    const [rec] = await insertRes.json();
    saved.push(rec);
  }

  // Notify Telegram with all 3 variations
  await notifyTelegram(rawInput, variations, saved.map(s => s?.id));

  return NextResponse.json({ ok: true, transmissions: saved, count: 3 });
}

async function notifyTelegram(rawInput: string, variations: { variation_label: string; schedule_time: string; instagram_caption: string }[], ids: string[]) {
  if (!TG_TOKEN) return;
  try {
    const preview = rawInput.slice(0, 150);
    let msg = `✨ *3 Transmissions Ready*\n\n_"${preview}${rawInput.length > 150 ? "…" : ""}"_\n\n`;
    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      msg += `*${v.schedule_time} — ${v.variation_label}*\n${v.instagram_caption.slice(0, 120)}…\n\n`;
    }
    msg += `📋 IDs: ${ids.filter(Boolean).join(", ")}`;
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: msg, parse_mode: "Markdown" }),
    });
  } catch (err) {
    console.error("Telegram notify failed:", err);
  }
}
