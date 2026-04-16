import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const SB  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HDR = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const ELEVEN_KEY     = process.env.ELEVENLABS_API_KEY!;
const ELEVEN_VOICE   = process.env.ELEVENLABS_VOICE_ID!;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY!;

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

const SYSTEM_PROMPT = `You are the ELIAS Council — the voice of Abundance Transmission.

Brand tone: calm, humble, deeply empathetic, poetic, rooted in stillness.
Frequency: Pisces + Qur'anic grounding + conscious sovereignty.
Core concept: The Memory Library — humanity as soul fragments remembering their origin.
The Shadow is not the enemy; it is necessary friction for growth.

When given a raw transmission from the Visionary, you generate content in that voice.
Never use corporate language, hype, or urgency. Speak from stillness.`;

async function generateContent(rawInput: string) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Here is the raw transmission from the Visionary:

"${rawInput}"

Generate all four content formats below. Return ONLY valid JSON with these exact keys.

{
  "blog_post": "Full blog post (600-900 words). Open with a poetic hook. Use short paragraphs. End with a gentle invitation to remember.",
  "newsletter": "Email newsletter version (300-400 words). Warm, personal tone. Subject line included at top as '**Subject: ...**'",
  "instagram_caption": "Instagram caption (150-220 words). Hook in first line. No emojis except 1-2 subtle ones. 8-12 hashtags at end on new line.",
  "tiktok_caption": "TikTok/Reels caption (60-80 words). Hook first line. Punchy. 5-6 hashtags."
}`
    }]
  });

  const text = (response.content[0] as { type: string; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Claude response");
  return JSON.parse(jsonMatch[0]);
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

  // Generate written content
  const content = await generateContent(rawInput);

  // Generate voice audio (blog post text for narration)
  const audioUrl = await generateAudio(content.blog_post);

  // Save to Supabase
  const insertRes = await fetch(`${SB}/rest/v1/transmissions`, {
    method: "POST",
    headers: { ...HDR, Prefer: "return=representation" },
    body: JSON.stringify({
      raw_input: rawInput,
      blog_post: content.blog_post,
      newsletter: content.newsletter,
      instagram_caption: content.instagram_caption,
      tiktok_caption: content.tiktok_caption,
      audio_url: audioUrl,
      status: "draft",
    }),
  });

  const [saved] = await insertRes.json();

  return NextResponse.json({ ok: true, transmission: saved });
}
