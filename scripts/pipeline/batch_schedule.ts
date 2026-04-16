#!/usr/bin/env npx ts-node
/**
 * batch_schedule.ts
 * ─────────────────
 * Schedules all ready transmissions to Instagram at peak times.
 * France peak times: 7:00 PM, 7:45 PM, 8:30 PM (CEST = UTC+2)
 *
 * Usage:
 *   npx ts-node scripts/pipeline/batch_schedule.ts
 *   npx ts-node scripts/pipeline/batch_schedule.ts --dry-run
 *   npx ts-node scripts/pipeline/batch_schedule.ts --start-date 2026-04-20
 */

import * as fs from "fs";
import * as path from "path";

const SB_URL = "https://pnscqkhtzxqdxpyzxnbq.supabase.co";
const SB_KEY = (() => {
  const env = fs.readFileSync(path.join(__dirname, "../../.env.local"), "utf8");
  return env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() ?? "";
})();

const IG_TOKEN = (() => {
  const env = fs.readFileSync(path.join(__dirname, "../../.env.local"), "utf8");
  return env.match(/INSTAGRAM_ACCESS_TOKEN=(.+)/)?.[1]?.trim() ?? "";
})();

const IG_ACCOUNT = "17841401889763541";
const HDR = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" };

// France peak times (UTC+2 = CEST in summer)
// We store as UTC offsets so scheduling is timezone-correct
const PEAK_TIMES_CEST = [
  { hour: 19, minute: 0  },  // 7:00 PM
  { hour: 19, minute: 45 },  // 7:45 PM
  { hour: 20, minute: 30 },  // 8:30 PM
];

const isDryRun    = process.argv.includes("--dry-run");
const startArg    = process.argv.find(a => a.startsWith("--start-date="))?.split("=")[1];
const startDate   = startArg ? new Date(startArg) : getNextMonday();

function log(msg: string)  { console.log(`✅ ${msg}`); }
function warn(msg: string) { console.log(`⚠️  ${msg}`); }
function info(msg: string) { console.log(`   ${msg}`); }

function getNextMonday(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildSchedule(count: number): Date[] {
  const slots: Date[] = [];
  let day = new Date(startDate);

  while (slots.length < count) {
    for (const t of PEAK_TIMES_CEST) {
      if (slots.length >= count) break;
      const slot = new Date(day);
      // CEST = UTC+2, so subtract 2 hours to get UTC
      slot.setUTCHours(t.hour - 2, t.minute, 0, 0);
      slots.push(slot);
    }
    day.setDate(day.getDate() + 1);
  }

  return slots;
}

async function fetchReadyTransmissions() {
  const res = await fetch(
    `${SB_URL}/rest/v1/transmissions?status=eq.video_ready&select=id,instagram_caption,video_url,audio_url&order=created_at.asc`,
    { headers: HDR }
  );
  return res.json() as Promise<{ id: string; instagram_caption: string; video_url: string | null; audio_url: string | null }[]>;
}

async function fetchDraftTransmissions() {
  // Also grab drafts that at least have captions (for image/carousel posts)
  const res = await fetch(
    `${SB_URL}/rest/v1/transmissions?status=eq.draft&select=id,instagram_caption,video_url&order=created_at.asc`,
    { headers: HDR }
  );
  return res.json() as Promise<{ id: string; instagram_caption: string; video_url: string | null }[]>;
}

async function saveSchedule(transmissionId: string, scheduledFor: Date) {
  await fetch(
    `${SB_URL}/rest/v1/transmissions?id=eq.${transmissionId}`,
    {
      method: "PATCH",
      headers: { ...HDR, Prefer: "return=minimal" },
      body: JSON.stringify({
        status: "scheduled",
        published_at: scheduledFor.toISOString(),
      }),
    }
  );
}

async function scheduleIGPost(caption: string, videoPath: string | null, scheduledTime: Date): Promise<boolean> {
  // Instagram requires a public URL for media
  // Videos need to be uploaded to Supabase storage first
  if (!videoPath) {
    warn("No video for this post — skipping IG scheduling (caption saved to queue)");
    return false;
  }

  // For now, save the schedule to a local queue file
  // Full IG API scheduling requires the video to be publicly hosted
  const queueEntry = {
    caption,
    video_url: videoPath,
    scheduled_for: scheduledTime.toISOString(),
    scheduled_cest: scheduledTime.toLocaleString("fr-FR", { timeZone: "Europe/Paris" }),
  };

  const queueFile = path.join(__dirname, "../../output/schedule-queue.jsonl");
  fs.appendFileSync(queueFile, JSON.stringify(queueEntry) + "\n");
  return true;
}

async function main() {
  console.log("\n── Batch Scheduler — Abundance Transmission ─────────────────");
  if (isDryRun) console.log("   (dry-run — no changes will be made)\n");
  console.log(`   Start date: ${startDate.toDateString()}`);
  console.log(`   Peak times: 7:00 PM, 7:45 PM, 8:30 PM (France/CEST)\n`);

  const ready = await fetchReadyTransmissions();
  const drafts = await fetchDraftTransmissions();

  // Combine — video_ready first, then drafts
  const all = [
    ...ready,
    ...drafts.filter(d => !ready.find(r => r.id === d.id))
  ];

  log(`Found ${ready.length} video-ready + ${drafts.length} drafts = ${all.length} total`);

  if (all.length === 0) {
    warn("No transmissions to schedule. Generate some first in the Admin → Transmit tab.");
    return;
  }

  const schedule = buildSchedule(all.length);

  console.log("\n── Schedule Preview ──────────────────────────────────────────");

  const queueFile = path.join(__dirname, "../../output/schedule-queue.jsonl");
  if (fs.existsSync(queueFile)) fs.unlinkSync(queueFile); // reset queue

  for (let i = 0; i < all.length; i++) {
    const t    = all[i];
    const slot = schedule[i];
    const cest = slot.toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
    const caption_preview = (t.instagram_caption ?? "").slice(0, 60);

    info(`Post ${String(i + 1).padStart(2, "0")} | ${cest} | ${caption_preview}…`);

    if (!isDryRun) {
      await saveSchedule(t.id, slot);
      await scheduleIGPost(t.instagram_caption, t.video_url, slot);
    }
  }

  if (!isDryRun) {
    const days = Math.ceil(all.length / 3);
    console.log(`\n── Summary ───────────────────────────────────────────────────`);
    log(`${all.length} posts scheduled across ${days} days`);
    log(`Queue file: output/schedule-queue.jsonl`);
    log(`First post: ${schedule[0].toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} (France)`);
    log(`Last post:  ${schedule[all.length - 1].toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} (France)`);
  } else {
    log(`[dry-run] Would schedule ${all.length} posts`);
  }
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
