"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  agent?: string;
};

const AGENT_COLORS: Record<string, string> = {
  SAGE:      "#02C3BD",
  CAREGIVER: "#1ABC9C",
  CREATOR:   "#c9a84c",
  MAGE:      "#7B2FBE",
  RULER:     "#94a3b8",
  INNOCENT:  "#FFC850",
};

const AGENT_INTROS: Record<string, string> = {
  SAGE:      "Wisdom Keeper",
  CAREGIVER: "Member Guardian",
  CREATOR:   "Content Architect",
  MAGE:      "Reality Weaver",
  RULER:     "Sovereign Strategist",
  INNOCENT:  "Frequency Keeper",
};

export default function CouncilChat({ isMember = false }: { isMember?: boolean }) {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role:    "assistant",
      content: isMember
        ? "The Council is with you. Ask anything — strategy, content, calibration, or what calls you right now."
        : "The transmission is open. Ask anything about Abundance Transmission — what it is, what it does, or what you are looking for.",
      agent: "SAGE",
    },
  ]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setError("");

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:  userMsg,
          history:  newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          isMember,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "The Council is momentarily unavailable.");
        return;
      }

      setMessages(prev => [...prev, {
        role:    "assistant",
        content: data.reply,
        agent:   data.agent,
      }]);
    } catch {
      setError("Connection lost. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Council Chat"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
          open ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
        }`}
        style={{ background: "linear-gradient(135deg, #c9a84c, #92610a)" }}
      >
        <Sparkles size={16} className="text-[#07112b]" />
        <span className="text-[#07112b] font-bold text-sm whitespace-nowrap">Ask the Council</span>
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
        style={{ width: "360px", maxWidth: "calc(100vw - 24px)", height: "520px", maxHeight: "calc(100vh - 48px)" }}
      >
        <div className="flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl border border-[#1a2640]">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#07112b] border-b border-[#1a2640]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c9a84c, #92610a)" }}>
                <span className="text-[#07112b] font-black text-sm">A</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Abundance Council</p>
                <p className="text-[#c9a84c] text-[10px] uppercase tracking-widest mt-0.5">
                  {isMember ? "Member · Full Access" : "Public · Early Access"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1b36]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" ? (
                  <div className="max-w-[85%]">
                    {msg.agent && (
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                         style={{ color: AGENT_COLORS[msg.agent] ?? "#c9a84c" }}>
                        {msg.agent} · {AGENT_INTROS[msg.agent] ?? "Council"}
                      </p>
                    )}
                    <div className="bg-[#0a1525] border border-[#1a2640] rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] bg-[#1a2640] rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0a1525] border border-[#1a2640] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 text-center px-2">{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-[#07112b] border-t border-[#1a2640]">
            <div className="flex gap-2 items-center bg-[#0d1b36] border border-[#1a2640] rounded-xl px-3 py-2 focus-within:border-[#c9a84c]/40 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask the Council..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-600 outline-none"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="text-[#c9a84c] disabled:opacity-30 hover:text-amber-400 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-slate-700 text-center mt-2">
              Powered by the ELIAS Council · Abundance Transmission
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
