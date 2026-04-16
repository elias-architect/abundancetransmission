#!/usr/bin/env python3
"""
higgsfield_agent.py
───────────────────
Computer-use agent that operates HiggsField AI in Chrome.
For each transmission, it:
  1. Opens HiggsField AI in Chrome (or uses the existing tab)
  2. Selects the Niko Soul ID avatar
  3. Pastes the video script
  4. Clicks Generate
  5. Waits for the video to finish
  6. Downloads it to /output/videos/

Usage:
  python3 higgsfield_agent.py                    # process all transmissions from Supabase
  python3 higgsfield_agent.py --limit 5          # process only 5
  python3 higgsfield_agent.py --dry-run          # preview scripts without generating
"""

import os, sys, time, json, base64, subprocess, argparse
from pathlib import Path
from datetime import datetime

import anthropic
import pyautogui
import PIL.Image
import urllib.request

# ── Config ────────────────────────────────────────────────────────────────────

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY") or open(Path(__file__).parent.parent.parent / ".env.local").read().split("ANTHROPIC_API_KEY=")[1].split("\n")[0].strip()
SB_URL        = "https://pnscqkhtzxqdxpyzxnbq.supabase.co"
SB_KEY        = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or open(Path(__file__).parent.parent.parent / ".env.local").read().split("SUPABASE_SERVICE_ROLE_KEY=")[1].split("\n")[0].strip()
HIGGSFIELD_URL = "https://higgsfield.ai"
OUTPUT_DIR     = Path(__file__).parent.parent.parent / "output" / "videos"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

pyautogui.PAUSE        = 0.5   # pause between actions
pyautogui.FAILSAFE     = True  # move mouse to top-left to abort

# ── Helpers ───────────────────────────────────────────────────────────────────

def log(msg):  print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")
def ok(msg):   print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ {msg}")
def warn(msg): print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚠️  {msg}")
def fail(msg): print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ {msg}")

def screenshot_b64() -> str:
    """Take a screenshot and return as base64 PNG."""
    path = "/tmp/higgsfield_screen.png"
    subprocess.run(["screencapture", "-x", "-t", "png", path], check=True)
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def get_screen_size():
    size = pyautogui.size()
    return size.width, size.height

def execute_action(action: dict):
    """Execute a computer-use action from Claude."""
    t = action.get("type")

    if t == "screenshot":
        return screenshot_b64()

    elif t == "mouse_move":
        x, y = action["coordinate"]
        pyautogui.moveTo(x, y, duration=0.3)

    elif t == "left_click":
        x, y = action["coordinate"]
        pyautogui.click(x, y)
        time.sleep(0.3)

    elif t == "double_click":
        x, y = action["coordinate"]
        pyautogui.doubleClick(x, y)

    elif t == "right_click":
        x, y = action["coordinate"]
        pyautogui.rightClick(x, y)

    elif t == "type":
        pyautogui.write(action["text"], interval=0.03)

    elif t == "key":
        key = action["key"].replace("Return", "enter").replace("Tab", "tab").replace("ctrl+a", "ctrl+a")
        pyautogui.hotkey(*key.split("+")) if "+" in key else pyautogui.press(key)

    elif t == "scroll":
        x, y    = action["coordinate"]
        direction = action.get("direction", "down")
        amount  = action.get("amount", 3)
        pyautogui.moveTo(x, y)
        pyautogui.scroll(-amount if direction == "down" else amount)

    elif t == "wait":
        time.sleep(action.get("seconds", 2))

def open_higgsfield_in_chrome():
    """Open HiggsField AI in Chrome."""
    log("Opening HiggsField AI in Chrome…")
    script = f'''tell application "Google Chrome"
        activate
        set found to false
        repeat with w in windows
            repeat with t in tabs of w
                if URL of t contains "higgsfield.ai" then
                    set active tab index of w to index of t
                    set index of w to 1
                    set found to true
                    exit repeat
                end if
            end repeat
            if found then exit repeat
        end repeat
        if not found then
            open location "{HIGGSFIELD_URL}"
        end if
    end tell'''
    subprocess.run(["osascript", "-e", script])
    time.sleep(3)

def fetch_transmissions(limit: int = 30) -> list:
    """Fetch unprocessed transmissions from Supabase."""
    import urllib.request, json
    url = f"{SB_URL}/rest/v1/transmissions?video_url=is.null&status=eq.draft&select=id,raw_input,instagram_caption,audio_url&order=created_at.asc&limit={limit}"
    req = urllib.request.Request(url, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"
    })
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def mark_video_done(transmission_id: str, video_url: str):
    """Save video path back to Supabase."""
    import urllib.request, json
    url  = f"{SB_URL}/rest/v1/transmissions?id=eq.{transmission_id}"
    data = json.dumps({"video_url": video_url, "status": "video_ready"}).encode()
    req  = urllib.request.Request(url, data=data, method="PATCH", headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "return=minimal"
    })
    urllib.request.urlopen(req)

def run_agent_for_script(script_text: str, output_path: Path, dry_run: bool = False) -> bool:
    """
    Use Claude computer-use to generate one video on HiggsField.
    Returns True if successful.
    """
    if dry_run:
        log(f"[dry-run] Would generate video for: {script_text[:80]}…")
        return True

    w, h = get_screen_size()

    system = f"""You are controlling a Mac screen ({w}x{h} pixels) to generate a video on HiggsField AI.

The user is logged in to HiggsField AI in Chrome with a subscription that includes a custom avatar called "Niko Soul ID".

Your goal:
1. Make sure you are on higgsfield.ai — if not, navigate there
2. Find the video generation section (look for "Create" or "Generate" or the main input area)
3. Select or confirm the "Niko Soul ID" avatar is active
4. Clear any existing text in the script/prompt field
5. Type the video script provided
6. Click the Generate button
7. Wait for the video to complete (progress bar will fill, or a "Download" button will appear)
8. Click Download to save the video
9. Report done

The video script to enter:
"{script_text}"

Rules:
- Take a screenshot first to see the current state
- Be methodical — one action at a time
- If a modal or popup appears, close it first
- If you don't see the input field, scroll down or look for a "New Video" / "Create" button
- Wait patiently for video generation (can take 2-5 minutes)
- When done, say COMPLETE"""

    messages = []
    max_steps = 60
    step = 0

    while step < max_steps:
        step += 1

        # Take screenshot
        screenshot = screenshot_b64()

        messages.append({
            "role": "user",
            "content": [{
                "type": "image",
                "source": {"type": "base64", "media_type": "image/png", "data": screenshot}
            }, {
                "type": "text",
                "text": "What do you see? What is your next action?" if step > 1 else "Take stock of what's on screen and begin."
            }]
        })

        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=system,
            messages=messages,
        )

        reply = response.content[0].text if response.content else ""
        log(f"  Step {step}: {reply[:120]}")

        # Check if done
        if "COMPLETE" in reply.upper():
            ok("Video generation complete")
            return True

        # Parse action from reply
        action = parse_action(reply)
        if action:
            result = execute_action(action)
            messages.append({"role": "assistant", "content": reply})
            if action.get("type") == "wait":
                time.sleep(action.get("seconds", 5))
        else:
            # No clear action, just wait and try again
            time.sleep(3)
            messages.append({"role": "assistant", "content": reply})

    warn("Max steps reached without completion")
    return False

def parse_action(text: str) -> dict | None:
    """Extract action from Claude's response text."""
    text_lower = text.lower()

    # Look for JSON action block
    if "```json" in text:
        try:
            start = text.index("```json") + 7
            end   = text.index("```", start)
            return json.loads(text[start:end].strip())
        except:
            pass

    # Heuristic parsing
    if "click" in text_lower and ("," in text or "coordinate" in text_lower):
        import re
        coords = re.findall(r'\((\d+),\s*(\d+)\)', text)
        if coords:
            x, y = int(coords[0][0]), int(coords[0][1])
            return {"type": "left_click", "coordinate": [x, y]}

    if "type" in text_lower and '"' in text:
        import re
        match = re.search(r'"([^"]+)"', text)
        if match:
            return {"type": "type", "text": match.group(1)}

    if "wait" in text_lower or "loading" in text_lower or "generating" in text_lower:
        return {"type": "wait", "seconds": 10}

    if "screenshot" in text_lower:
        return {"type": "screenshot"}

    return None

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit",   type=int, default=30, help="Max transmissions to process")
    parser.add_argument("--dry-run", action="store_true",  help="Preview without generating")
    args = parser.parse_args()

    log("HiggsField Agent — Abundance Transmission Pipeline")
    log(f"Output directory: {OUTPUT_DIR}")

    transmissions = fetch_transmissions(args.limit)
    log(f"Found {len(transmissions)} transmissions to process")

    if not transmissions:
        warn("No unprocessed transmissions found. Run the Transmission Pipeline first.")
        sys.exit(0)

    open_higgsfield_in_chrome()

    results = {"success": 0, "failed": 0, "skipped": 0}

    for i, t in enumerate(transmissions, 1):
        tid    = t["id"]
        script = t["raw_input"]
        log(f"\n── Transmission {i}/{len(transmissions)} ──────────────────────")
        log(f"Script: {script[:100]}…")

        output_path = OUTPUT_DIR / f"transmission-{tid[:8]}.mp4"

        if output_path.exists():
            log("Video already exists — skipping")
            results["skipped"] += 1
            continue

        success = run_agent_for_script(script, output_path, dry_run=args.dry_run)

        if success and not args.dry_run:
            video_url = f"local://{output_path}"
            mark_video_done(tid, str(output_path))
            results["success"] += 1
            ok(f"Saved: {output_path.name}")
        elif not success:
            results["failed"] += 1
            fail(f"Failed for transmission {tid[:8]}")

        # Pause between generations to avoid rate limiting
        if i < len(transmissions) and not args.dry_run:
            log("Waiting 15s before next generation…")
            time.sleep(15)

    print(f"\n{'─'*50}")
    print(f"✅ Success: {results['success']}")
    print(f"⏭  Skipped: {results['skipped']}")
    print(f"❌ Failed:  {results['failed']}")
    print(f"Videos saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
