"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_url?: string | null;
}

interface PlayerState {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoaded: boolean;
}

interface PlayerActions {
  play:     () => void;
  pause:    () => void;
  toggle:   () => void;
  next:     () => void;
  prev:     () => void;
  seekTo:   (time: number) => void;
  setVol:   (v: number) => void;
  jumpTo:   (index: number) => void;
  setTracks:(tracks: Track[]) => void;
}

const PlayerContext = createContext<(PlayerState & PlayerActions) | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracksState]       = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(0.8);
  const [isLoaded, setIsLoaded]         = useState(false);

  // Create audio element once on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio      = new Audio();
    audio.volume     = 0.8;
    audio.preload    = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration   = () => setDuration(audio.duration || 0);
    const onEnded      = () => {
      setCurrentIndex((i) => {
        const next = (i + 1) % (audioRef.current ? tracks.length || 1 : 1);
        return next;
      });
    };
    const onCanPlay = () => setIsLoaded(true);

    audio.addEventListener("timeupdate",        onTimeUpdate);
    audio.addEventListener("durationchange",    onDuration);
    audio.addEventListener("ended",             onEnded);
    audio.addEventListener("canplaythrough",    onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate",     onTimeUpdate);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("ended",          onEnded);
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load new track whenever currentIndex or tracks change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    const track = tracks[currentIndex];
    if (!track) return;
    const wasPlaying = isPlaying;
    setIsLoaded(false);
    audio.src = track.audio_url;
    audio.load();
    if (wasPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, tracks]);

  const play = useCallback(() => {
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause(); else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIndex((i) => (i + 1) % tracks.length);
  }, [tracks.length]);

  const prev = useCallback(() => {
    if (tracks.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
    }
  }, [tracks.length]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVol = useCallback((v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const jumpTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const setTracks = useCallback((t: Track[]) => {
    setTracksState(t);
    setCurrentIndex(0);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        tracks,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        isLoaded,
        play,
        pause,
        toggle,
        next,
        prev,
        seekTo,
        setVol,
        jumpTo,
        setTracks,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
