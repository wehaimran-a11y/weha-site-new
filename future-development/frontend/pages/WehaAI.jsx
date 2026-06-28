import { useState, useRef, useEffect } from "react";
import { Send, Plus, Sparkles, Bot, User, AlertCircle } from "lucide-react";
import Seo from "@/components/Seo";
import { sendWehaAiMessage, fetchWehaAiModels } from "@/lib/api";

const SUGGESTIONS = [
  "Which of my workflows should I automate first?",
  "How can WeHA help my real estate agency?",
  "What is a compliance-grade automation?",
  "Can I automate without buying new software?",
];

const WELCOME = {
  role: "assistant",
  content:
    "Hi — I'm WeHA AI. I can help you understand how AI and automation could work in your business, and how We Help Automate can build it for you. Ask me anything about automating your workflows.",
};

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function WehaAI() {
  const [sessionId, setSessionId] = useState(newId);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [model, setModel] = useState("");
  const [mocked, setMocked] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchWehaAiModels()
      .then((d) => {
        setModels(d.models || []);
        setModel(d.default || (d.models && d.models[0]) || "");
      })
      .catch(() => setModels([]));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const hasConversation = messages.length > 1;

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const payload = next.filter((m) => m.role !== "system");
      const data = await sendWehaAiMessage({ session_id: sessionId, messages: payload, model });
      setMocked(!!data.mocked);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry — I couldn't reach the assistant right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function newChat() {
    setSessionId(newId());
    setMessages([WELCOME]);
    setInput("");
  }

  return (
    <div data-testid="weha-ai-page" className="overflow-x-hidden">
      <Seo
        title="WeHA AI — ask anything about AI & automation"
        description="Chat with WeHA AI: a focused assistant that helps you understand how AI and automation can work in your business, and how We Help Automate can build it."
        path="/weha-ai"
      />
      <div className="mt-16 md:mt-[72px] h-[calc(100dvh-64px)] md:h-[calc(100dvh-72px)] flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-weha-border bg-weha-surface">
          <div className="p-5">
            <button
              type="button"
              onClick={newChat}
              data-testid="weha-ai-new-chat"
              data-cursor="hover"
              className="btn-teal w-full justify-center"
            >
              <Plus size={16} /> New chat
            </button>
          </div>
          <div className="px-5 pb-4">
            <label className="weha-label" htmlFor="model">Model</label>
            <select
              id="model"
              className="weha-input"
              data-testid="weha-ai-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {models.length === 0 && <option value="">Loading…</option>}
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-weha-faint leading-relaxed">
              Powered by OpenRouter (placeholder). Connect a key to go live.
            </p>
          </div>
          <div className="mt-auto p-5 text-xs text-weha-faint leading-relaxed border-t border-weha-border">
            WeHA AI only answers questions about AI, automation and how We Help Automate can help your business.
          </div>
        </aside>

        {/* Chat column */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-5 md:px-8 h-14 border-b border-weha-border bg-weha-bg/80 backdrop-blur-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-weha-teal-soft text-weha-teal">
              <Sparkles size={17} />
            </span>
            <div className="leading-tight">
              <p className="font-semibold text-weha-text text-sm">WeHA AI</p>
              <p className="text-xs text-weha-faint">Your AI & automation assistant</p>
            </div>
            <button
              type="button"
              onClick={newChat}
              className="lg:hidden ml-auto btn-ghost"
              data-cursor="hover"
            >
              <Plus size={15} /> New
            </button>
          </div>

          {mocked && (
            <div className="flex items-center gap-2 px-5 md:px-8 py-2 text-xs text-weha-muted bg-weha-teal-soft border-b border-weha-border" data-testid="weha-ai-mock-banner">
              <AlertCircle size={14} className="text-weha-teal shrink-0" />
              Demo mode — responses are placeholders until an OpenRouter key &amp; model are connected.
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} data-lenis-prevent data-testid="weha-ai-messages" className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-weha-teal-soft text-weha-teal">
                      <Bot size={16} />
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-weha-teal text-white"
                        : "bg-weha-surface border border-weha-border text-weha-text"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-weha-surface border border-weha-border text-weha-muted">
                      <User size={16} />
                    </span>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start" data-testid="weha-ai-typing">
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-weha-teal-soft text-weha-teal">
                    <Bot size={16} />
                  </span>
                  <div className="rounded-2xl px-4 py-3 bg-weha-surface border border-weha-border">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-weha-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-weha-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-weha-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}

              {!hasConversation && !loading && (
                <div className="pt-4 grid gap-3 sm:grid-cols-2" data-testid="weha-ai-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      data-cursor="hover"
                      className="text-left rounded-xl border border-weha-border bg-weha-surface px-4 py-3 text-sm text-weha-text hover:border-weha-teal hover:bg-weha-teal-soft transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-weha-border bg-weha-bg px-5 md:px-8 py-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3 rounded-2xl border border-weha-border bg-weha-surface px-4 py-3 focus-within:border-weha-teal transition-colors">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask about automating your business…"
                  data-testid="weha-ai-input"
                  className="flex-1 resize-none bg-transparent outline-none text-weha-text placeholder:text-weha-faint max-h-40"
                />
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  data-testid="weha-ai-send"
                  data-cursor="hover"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-weha-teal text-white disabled:opacity-40 transition-opacity"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-weha-faint">
                WeHA AI can make mistakes. For tailored advice, book a free AI Audit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
