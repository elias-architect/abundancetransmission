"use client";

import { useEffect, useState, useRef } from "react";
import { usePlayer, Track } from "@/lib/player-context";

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function RadioPlayer() {
  const {
    tracks,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggle,
    next,
    prev,
    seekTo,
    setVol,
    jumpTo,
    setTracks,
  } = usePlayer();

  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetch("/api/tracks")
      .then((r) => r.json())
      .then(({ tracks: t }: { tracks: Track[] }) => {
        if (t && t.length > 0) {
          setTracks(t);
          setVisible(true);
        }
      })
      .catch(() => setLoadError(true));
  }, [setTracks]);

  if (!visible || tracks.length === 0) return null;

  const track = tracks[currentIndex];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ background: "rgba(5,8,16,0.97)", borderTop: "1px solid #1a2640" }}
    >
      {/* Progress bar — full width, clickable */}
      <div
        className="w-full h-1 cursor-pointer group"
        style={{ background: "#1a2640" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct  = (e.clientX - rect.left) / rect.width;
          seekTo(pct * duration);
        }}
      >
        <div
          className="h-full transition-all group-hover:opacity-100 opacity-80"
          style={{
            width:      `${progress}%`,
            background: "linear-gradient(90deg, #f59e0b, #fde68a)",
          }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2 gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {track.cover_url ? (
            <img
              src={track.cover_url}
              alt={track.title}
              className="w-9 h-9 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded flex-shrink-0 flex items-center justify-center text-xs"
              style={{ background: "#0a0f1e", border: "1px solid #1a2640", color: "#f59e0b" }}
            >
              ♪
            </div>
          )}
          <div className="min-w-0">
            <p
              className="text-xs font-medium truncate"
              style={{ color: "#f59e0b" }}
            >
              {track.title}
            </p>
            <p className="text-xs truncate" style={{ color: "#6b7280" }}>
              {track.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={prev}
            className="opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "#f59e0b" }}
            aria-label="Previous track"
          >
            <PrevIcon />
          </button>

          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
            style={{ background: "#f59e0b" }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            onClick={next}
            className="opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "#f59e0b" }}
            aria-label="Next track"
          >
            <NextIcon />
          </button>
        </div>

        {/* Time + volume (hidden on small screens) */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <span className="text-xs tabular-nums" style={{ color: "#6b7280" }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-1">
            <VolumeIcon muted={volume === 0} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVol(parseFloat(e.target.value))}
              className="w-16 h-1 cursor-pointer accent-amber-400"
              aria-label="Volume"
            />
          </div>
        </div>

        {/* Playlist toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="hidden sm:flex opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
          style={{ color: "#f59e0b" }}
          aria-label="Toggle playlist"
        >
          <ListIcon />
        </button>
      </div>

      {/* Playlist drawer */}
      {expanded && (
        <div
          className="max-h-48 overflow-y-auto border-t"
          style={{ borderColor: "#1a2640", background: "#050810" }}
        >
          {tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              active={i === currentIndex}
              playing={i === currentIndex && isPlaying}
              onClick={() => jumpTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}


function TrackRow({
  track,
  active,
  playing,
  onClick,
}: {
  track: Track;
  active: boolean;
  playing: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-navy transition-colors"
    >
      <span className="w-4 text-xs flex-shrink-0 text-center" style={{ color: "#f59e0b" }}>
        {playing ? "▶" : active ? "·" : ""}
      </span>
      <span
        className="text-xs truncate flex-1"
        style={{ color: active ? "#f59e0b" : "#9ca3af" }}
      >
        {track.title}
      </span>
      <span className="text-xs flex-shrink-0" style={{ color: "#6b7280" }}>
        {track.artist}
      </span>
    </button>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#050810">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#050810">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zm2.5-6 6-4.5v9L8.5 12zM16 6h2v12h-2z" />
    </svg>
  );
}
function VolumeIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b7280">
      <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b7280">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
    </svg>
  );
}
