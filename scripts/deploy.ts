#!/usr/bin/env npx ts-node --esm
/**
 * deploy.ts — Deploy-and-verify script for abundancetransmission.com
 *
 * Usage:
 *   npx ts-node scripts/deploy.ts
 *   npx ts-node scripts/deploy.ts --dry-run
 */

import { execSync, spawnSync } from "child_process";

// ── Config ────────────────────────────────────────────────────────────────────

const SITE = "https://www.abundancetransmission.com";

const HEALTH_ROUTES = [
  { path: "/api/instagram/post", method: "GET", expectStatus: [200, 401, 405] },
  { path: "/api/radio",          method: "GET", expectStatus: [200, 401, 404] },
  { path: "/api/dashboard",      method: "GET", expectStatus: [200, 401, 404] },
];

const WAIT_TIMEOUT_MS  = 120_000; // 2 min max wait for deployment to go live
const POLL_INTERVAL_MS = 5_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

const isDryRun = process.argv.includes("--dry-run");

function log(msg: string)  { console.log(`\n✅ ${msg}`); }
function warn(msg: string) { console.log(`\n⚠️  ${msg}`); }
function fail(msg: string) { console.error(`\n❌ ${msg}`); }
function info(msg: string) { console.log(`   ${msg}`); }

function run(cmd: string, label: string): string {
  if (isDryRun) {
    info(`[dry-run] would run: ${cmd}`);
    return "";
  }
  info(`$ ${cmd}`);
  const result = spawnSync(cmd, { shell: true, encoding: "utf8", stdio: "pipe" });
  if (result.status !== 0) {
    fail(`${label} failed`);
    if (result.stdout) console.error(result.stdout);
    if (result.stderr) console.error(result.stderr);
    process.exit(1);
  }
  return result.stdout?.trim() ?? "";
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForUrl(url: string): Promise<boolean> {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;
  process.stdout.write(`   Waiting for ${url} to return 200`);
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
      if (res.status === 200) {
        process.stdout.write(" ✓\n");
        return true;
      }
    } catch {
      // not up yet
    }
    process.stdout.write(".");
    await sleep(POLL_INTERVAL_MS);
  }
  process.stdout.write(" timed out\n");
  return false;
}

async function checkRoutes(base: string): Promise<{ path: string; status: number; ok: boolean }[]> {
  const results = [];
  for (const route of HEALTH_ROUTES) {
    try {
      const res = await fetch(`${base}${route.path}`, {
        method: route.method,
        signal: AbortSignal.timeout(10_000),
      });
      const ok = route.expectStatus.includes(res.status);
      results.push({ path: route.path, status: res.status, ok });
    } catch (err) {
      results.push({ path: route.path, status: 0, ok: false });
    }
  }
  return results;
}

function getPreviousDeploymentUrl(): string | null {
  try {
    const output = execSync("vercel ls --limit 5 2>/dev/null", { encoding: "utf8" });
    // Parse deployment URLs from vercel ls output
    const lines = output.split("\n").filter(l => l.includes(".vercel.app"));
    // Skip the first (current) deployment, return second
    if (lines.length >= 2) {
      const match = lines[1].match(/https:\/\/\S+\.vercel\.app/);
      return match ? match[0] : null;
    }
  } catch {
    // ignore
  }
  return null;
}

function rollback(previousUrl: string | null) {
  if (!previousUrl) {
    warn("No previous deployment found — cannot auto-rollback.");
    info("Manually roll back via: vercel rollback");
    return;
  }
  warn(`Rolling back to: ${previousUrl}`);
  if (!isDryRun) {
    try {
      execSync(`vercel alias set ${previousUrl} ${SITE.replace("https://", "")} 2>&1`, { stdio: "inherit" });
      log("Rollback complete.");
    } catch {
      fail("Rollback failed. Run manually: vercel rollback");
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 Deploy & Verify — abundancetransmission.com`);
  if (isDryRun) console.log("   (dry-run mode — no changes will be made)\n");

  // ── Step 1: Local build ────────────────────────────────────────────────────
  console.log("\n── Step 1: Local build ──────────────────────────────────────");
  run("npm run build", "Local build");
  log("Build passed");

  // ── Step 2: Capture previous deployment (for rollback) ────────────────────
  console.log("\n── Step 2: Capture previous deployment URL ──────────────────");
  const previousUrl = isDryRun ? "https://example.vercel.app" : getPreviousDeploymentUrl();
  info(`Previous deployment: ${previousUrl ?? "none found"}`);

  // ── Step 3: Deploy ─────────────────────────────────────────────────────────
  console.log("\n── Step 3: Deploy to production ─────────────────────────────");
  const deployOutput = run("vercel --prod --yes 2>&1", "Vercel deploy");

  // Extract the deployment URL from vercel output
  let deployUrl = SITE;
  if (!isDryRun) {
    const urlMatch = deployOutput.match(/https:\/\/\S+\.vercel\.app/);
    if (urlMatch) deployUrl = urlMatch[0];
    log(`Deployed: ${deployUrl}`);
  }

  // ── Step 4: Wait for live ──────────────────────────────────────────────────
  console.log("\n── Step 4: Wait for deployment to go live ───────────────────");
  if (!isDryRun) {
    const isLive = await waitForUrl(SITE);
    if (!isLive) {
      fail("Deployment did not come online within 2 minutes.");
      rollback(previousUrl);
      process.exit(1);
    }
    log("Site is live");
  } else {
    info("[dry-run] would poll: " + SITE);
  }

  // ── Step 5: Health check critical routes ──────────────────────────────────
  console.log("\n── Step 5: Health check API routes ──────────────────────────");
  if (!isDryRun) {
    const checks = await checkRoutes(SITE);
    let allPassed = true;

    for (const check of checks) {
      if (check.ok) {
        info(`✓  ${check.path} → ${check.status}`);
      } else {
        fail(`${check.path} → ${check.status} (unexpected)`);
        allPassed = false;
      }
    }

    if (!allPassed) {
      console.log("\n── Diagnostic Summary ────────────────────────────────────────");
      fail("One or more API routes returned unexpected status codes.");
      info("Failed routes:");
      checks.filter(c => !c.ok).forEach(c => info(`  ${c.path} → HTTP ${c.status}`));
      info("\nPossible causes:");
      info("  • Missing environment variables in Vercel (run: vercel env ls)");
      info("  • Route file not deployed correctly");
      info("  • Supabase connection issue");
      rollback(previousUrl);
      process.exit(1);
    }

    log("All API routes healthy");
  } else {
    HEALTH_ROUTES.forEach(r => info(`[dry-run] would check: ${r.method} ${r.path}`));
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────────────────");
  console.log("🎉 Deployment complete and verified.");
  console.log(`   Live at: ${SITE}\n`);
}

main().catch(err => {
  fail(`Unexpected error: ${err.message}`);
  process.exit(1);
});
