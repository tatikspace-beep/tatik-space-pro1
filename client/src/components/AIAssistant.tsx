import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Bot, Send, Loader2, User, Sparkles, Zap, Crown,
  Lock, ChevronRight, AlertCircle, Copy, Check, Bug, ArrowLeft, Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCopy, getComponentCopy, getModelCopy } from '@/lib/assistantUiCopy';

// ---------------------------------------------------------------------------
// Constants & Configuration
// ---------------------------------------------------------------------------

const FREE_DAILY_LIMIT = 10;
const STORAGE_KEY_USAGE = 'ai_assistant_usage';

const MODELS = [
  {
    id: 'qwen',
    name: 'Qwen2.5-Coder',
    label: '32B',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dotColor: 'bg-blue-400',
    tier: 'free' as const,
    hfModel: 'Qwen/Qwen2.5-Coder-32B-Instruct',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek-Coder',
    label: 'V2',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dotColor: 'bg-emerald-400',
    tier: 'free' as const,
    hfModel: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
  },
  {
    id: 'gemini',
    name: 'Gemini Flash',
    label: '2.0',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    dotColor: 'bg-violet-400',
    tier: 'free' as const,
    hfModel: null as null,
  },
  {
    id: 'gpt4',
    name: 'GPT-4o',
    label: 'Pro',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dotColor: 'bg-amber-400',
    tier: 'pro' as const,
    hfModel: null as null,
  },
] as const;

type ModelId = (typeof MODELS)[number]['id'];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelId?: ModelId;
  error?: boolean;
}

interface DailyUsage {
  date: string;
  count: number;
}

interface AIAssistantProps {
  onCodeInsert?: (code: string) => void;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function getDailyUsage(): DailyUsage {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY_USAGE);
    if (stored) {
      const parsed: DailyUsage = JSON.parse(stored);
      if (parsed.date === today) return parsed;
    }
    return { date: today, count: 0 };
  } catch {
    return { date: new Date().toISOString().split('T')[0], count: 0 };
  }
}

function saveDailyUsage(usage: DailyUsage) {
  try { localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(usage)); } catch { }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMarkdown(text: string): string {
  return text
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
      const label = lang ? `<span class="code-lang">${escapeHtml(lang)}</span>` : '';
      return `<pre class="code-block">${label}<code>${escapeHtml(code.trim())}</code></pre>`;
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/^#{1,3} (.+)$/gm, '<p class="md-heading">$1</p>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

function extractCodeBlock(text: string): string | null {
  const match = text.match(/```(?:\w+)?\n?([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

// ---------------------------------------------------------------------------
// API callers
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an expert web developer, UI/UX designer, and SEO specialist integrated into Tatik.space Pro code editor.
Your expertise: HTML5, CSS3, JavaScript ES2024, React, TypeScript, Tailwind CSS, SEO, accessibility (WCAG), Core Web Vitals, performance optimization.
Rules:
- Respond in the same language as the user (Italian or English)
- Always wrap code in triple backtick fences with language identifier
- Be direct and practical — skip unnecessary preambles
- For layouts: provide complete, copy-paste ready code with comments
- For bugs: identify root cause, then provide the fix
- For SEO/UX: give concrete, measurable improvements (e.g., "Improves LCP by 20%")
- Suggest accessibility improvements automatically (alt text, ARIA, semantic HTML)
- For performance: mention Lighthouse scores and Web Vitals impact`;

async function callHuggingFace(
  model: string,
  history: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
        max_tokens: 2048,
        temperature: 0.3,
        stream: false,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error ?? `HuggingFace error ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '(no response)';
}

async function callGemini(
  history: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `Gemini error ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '(no response)';
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AIAssistant({ onCodeInsert }: AIAssistantProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const copy = getComponentCopy(language);
  const modelCopy = getModelCopy(language);
  const isPro = Boolean(user?.hasProAccess || user?.role === 'admin' || user?.subscriptionType === 'pro');
  const chatMutation = trpc.ai.chat.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>('qwen');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>(getDailyUsage);
  const [showProBanner, setShowProBanner] = useState(false);

  // Bug fix mode states
  const [bugFixMode, setBugFixMode] = useState(false);
  const [bugFixData, setBugFixData] = useState({
    code: '',
    error: '',
    language: 'javascript',
  });
  const [bugFixAnalysis, setBugFixAnalysis] = useState<{
    analysis: string;
    correctedCode: string;
  } | null>(null);

  // Bug fix mutation
  const analyzeBugMutation = trpc.ai.analyzeBugAndSuggestFix.useMutation({
    onSuccess: (result) => {
      setBugFixAnalysis({
        analysis: result.analysis,
        correctedCode: result.correctedCode,
      });
      toast.success(copy.ai.bugSuccess);
    },
    onError: (error) => {
      toast.error(copy.ai.bugFailure + error.message);
      setBugFixAnalysis({
        analysis: copy.ai.bugFailure + error.message,
        correctedCode: '',
      });
    },
  });

  // Optimization mode states
  const [optimizationMode, setOptimizationMode] = useState(false);
  const [optimizationData, setOptimizationData] = useState({
    code: '',
    language: 'javascript',
  });
  const [optimizationResults, setOptimizationResults] = useState<{
    suggestions: string;
    count: number;
  } | null>(null);

  // Optimization mutation
  const optimizeCodeMutation = trpc.ai.optimizeCode.useMutation({
    onSuccess: (result) => {
      setOptimizationResults({
        suggestions: result.suggestions,
        count: result.count,
      });
      toast.success(formatCopy(copy.ai.optimizeSuccess, { count: result.count }));
    },
    onError: (error) => {
      toast.error(copy.ai.optimizeFailure + error.message);
      setOptimizationResults({
        suggestions: copy.ai.optimizeFailure + error.message,
        count: 0,
      });
    },
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentModel = MODELS.find((m) => m.id === selectedModel)!;
  const remainingMessages = FREE_DAILY_LIMIT - dailyUsage.count;
  const isLimitReached = !isPro && remainingMessages <= 0;

  // ---------------------------------------------------------------------------
  // Scroll to bottom
  // ---------------------------------------------------------------------------
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLDivElement | null;
      if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isLoading, isOpen, scrollToBottom]);

  // Init welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: formatCopy(copy.ai.welcome, {
          model: `${currentModel.name} ${currentModel.label}`,
          description: modelCopy.descriptions[MODELS.indexOf(currentModel)],
          strengths: modelCopy.strengths[MODELS.indexOf(currentModel)].join(' · '),
        }),
        timestamp: new Date(),
        modelId: selectedModel,
      }]);
    }
  }, [isOpen, currentModel, selectedModel]);

  // ---------------------------------------------------------------------------
  // Model change
  // ---------------------------------------------------------------------------
  const handleModelChange = (id: ModelId) => {
    const model = MODELS.find((m) => m.id === id)!;
    if (model.tier === 'pro' && !isPro) { setShowProBanner(true); return; }
    setSelectedModel(id);
    const modelIndex = MODELS.indexOf(model);
    setMessages((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        role: 'assistant',
        content: formatCopy(copy.ai.modelChanged, {
          model: `${model.name} ${model.label}`,
          description: modelCopy.descriptions[modelIndex],
          strengths: modelCopy.strengths[modelIndex].join(' · '),
        }),
        timestamp: new Date(),
        modelId: id,
      },
    ]);
  };

  // ---------------------------------------------------------------------------
  // Send message
  // ---------------------------------------------------------------------------
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    if (isLimitReached) { setShowProBanner(true); return; }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const newUsage = { ...dailyUsage, count: dailyUsage.count + 1 };
    setDailyUsage(newUsage);
    saveDailyUsage(newUsage);

    try {
      const apiHistory = nextMessages
        .filter((m) => m.id !== 'welcome' && !m.id.startsWith('switch-'))
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await chatMutation.mutateAsync({
        model: selectedModel === 'gemini' ? 'gemini' : selectedModel === 'deepseek' ? 'deepseek' : 'qwen',
        messages: apiHistory,
      });
      const reply = response.content;

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        modelId: selectedModel,
      }]);
    } catch (err: any) {
      const failedUsage = { ...dailyUsage, count: Math.max(0, dailyUsage.count) };
      setDailyUsage(failedUsage);
      saveDailyUsage(failedUsage);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**${copy.ai.chatError}** ${err.message}`,
        timestamp: new Date(),
        modelId: selectedModel,
        error: true,
      }]);
      toast.error(copy.ai.chatError + err.message);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, isLoading, messages, selectedModel, dailyUsage, isLimitReached, chatMutation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleAnalyzeBug = async () => {
    if (!bugFixData.code.trim() || !bugFixData.error.trim()) {
      toast.error(copy.ai.bugEmpty);
      return;
    }

    analyzeBugMutation.mutate({
      code: bugFixData.code,
      error: bugFixData.error,
      language: bugFixData.language,
    });
  };

  const handleOptimizeCode = async () => {
    if (!optimizationData.code.trim()) {
      toast.error(copy.ai.optimizeEmpty);
      return;
    }

    optimizeCodeMutation.mutate({
      code: optimizationData.code,
      language: optimizationData.language,
    });
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Trigger button */}
      <Button onClick={() => setIsOpen(true)} size="sm" className="gap-1 px-2 py-1" variant="outline">
        <Bot className="h-4 w-4" />
        {copy.ai.button}
        {!isPro && remainingMessages <= 3 && remainingMessages > 0 && (
          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4 ml-1">{remainingMessages}</Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden flex flex-col gap-0 h-[600px] max-h-[85vh]">

          {/* Header */}
          <DialogHeader className="px-5 pt-4 pb-0 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                {copy.ai.title}
                {isPro && (
                  <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] gap-1">
                    <Crown className="h-2.5 w-2.5" /> PRO
                  </Badge>
                )}
              </DialogTitle>
              {!isPro && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min((dailyUsage.count / FREE_DAILY_LIMIT) * 100, 100)}%` }}
                    />
                  </div>
                  <span>{Math.max(remainingMessages, 0)}/{FREE_DAILY_LIMIT}</span>
                </div>
              )}
            </div>

            {/* Model tabs */}
            <div className="flex gap-0.5 border-b">
              {MODELS.map((model) => {
                const isActive = selectedModel === model.id;
                const isLocked = model.tier === 'pro' && !isPro;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md transition-all border-b-2 -mb-px',
                      isActive && !bugFixMode
                        ? 'border-primary text-foreground bg-background'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
                      isLocked && 'opacity-60'
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', isActive && !bugFixMode ? model.dotColor : 'bg-muted-foreground/40')} />
                    {model.name}
                    <span className="text-[9px] opacity-60">{model.label}</span>
                    {isLocked && <Lock className="h-2.5 w-2.5 ml-0.5" />}
                  </button>
                );
              })}

              {/* Bug Analysis Tab */}
              <button
                onClick={() => setBugFixMode(true)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md transition-all border-b-2 -mb-px',
                  bugFixMode
                    ? 'border-primary text-foreground bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Bug className="h-3.5 w-3.5" />
                <span>{copy.ai.bugTab}</span>
              </button>

              {/* Optimization Tab */}
              <button
                onClick={() => setOptimizationMode(true)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md transition-all border-b-2 -mb-px',
                  optimizationMode
                    ? 'border-primary text-foreground bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>{copy.ai.optimizeTab}</span>
              </button>
            </div>
          </DialogHeader>

          {/* Model info strip */}
          <div className="flex items-center gap-2 px-5 py-2 bg-muted/30 border-b shrink-0 flex-wrap">
            {!bugFixMode && !optimizationMode ? (
              <>
                <Badge variant="outline" className={cn('text-[10px] gap-1 px-2', currentModel.badgeColor)}>
                  <Zap className="h-2.5 w-2.5" />
                  {modelCopy.badges[MODELS.indexOf(currentModel)]}
                </Badge>
                <span className="text-[11px] text-muted-foreground">{modelCopy.descriptions[MODELS.indexOf(currentModel)]}</span>
                <div className="ml-auto flex gap-1 flex-wrap">
                  {modelCopy.strengths[MODELS.indexOf(currentModel)].map((s) => (
                    <span key={s} className="text-[9px] bg-muted border rounded px-1.5 py-0.5 text-muted-foreground">{s}</span>
                  ))}
                </div>
              </>
            ) : bugFixMode ? (
              <>
                <Badge variant="outline" className="text-[10px] gap-1 px-2 bg-red-500/10 text-red-400 border-red-500/20">
                  <Bug className="h-2.5 w-2.5" />
                  {copy.ai.bugTab}
                </Badge>
                <span className="text-[11px] text-muted-foreground">{copy.ai.bugTitle}</span>
              </>
            ) : (
              <>
                <Badge variant="outline" className="text-[10px] gap-1 px-2 bg-orange-500/10 text-orange-400 border-orange-500/20">
                  <Flame className="h-2.5 w-2.5" />
                  {copy.ai.optimizeTab}
                </Badge>
                <span className="text-[11px] text-muted-foreground">{copy.ai.optimizeTitle}</span>
              </>
            )}
          </div>

          {/* Pro banner */}
          {showProBanner && !isPro && (
            <div className="mx-4 mt-3 shrink-0 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
              <Crown className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-500">{copy.ai.proTitle}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {copy.ai.proBenefits}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white gap-1">
                  {copy.promo.upgrade} <ChevronRight className="h-3 w-3" />
                </Button>
                <button onClick={() => setShowProBanner(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
              </div>
            </div>
          )}

          {/* Messages / Bug Fix Form */}
          <div ref={scrollAreaRef} className="flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4 p-5">
                {bugFixMode ? (
                  // Bug fix form
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => {
                          setBugFixMode(false);
                          setBugFixAnalysis(null);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <h3 className="text-sm font-semibold">{copy.ai.bugTitle}</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">{copy.ai.language}</label>
                        <select
                          value={bugFixData.language}
                          onChange={(e) => setBugFixData(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-3 py-2 bg-muted border border-input rounded-md text-sm"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                          <option value="rust">Rust</option>
                          <option value="go">Go</option>
                          <option value="csharp">C#</option>
                          <option value="ruby">Ruby</option>
                          <option value="php">PHP</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="sql">SQL</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-1 block">{copy.ai.code}</label>
                        <Textarea
                          value={bugFixData.code}
                          onChange={(e) => setBugFixData(prev => ({ ...prev, code: e.target.value }))}
                          placeholder={copy.ai.codePlaceholder}
                          className="w-full h-32 resize-none text-sm font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-1 block">{copy.ai.errorLabel}</label>
                        <Textarea
                          value={bugFixData.error}
                          onChange={(e) => setBugFixData(prev => ({ ...prev, error: e.target.value }))}
                          placeholder={copy.ai.errorPlaceholder}
                          className="w-full h-24 resize-none text-sm"
                        />
                      </div>
                    </div>

                    {bugFixAnalysis && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="bg-muted/50 rounded-lg p-3 border border-input">
                          <p className="text-xs font-semibold mb-2 text-foreground">🔍 {copy.ai.analysis}:</p>
                          <div className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                            {bugFixAnalysis.analysis}
                          </div>
                        </div>

                        {bugFixAnalysis.correctedCode && (
                          <div className="bg-muted/50 rounded-lg p-3 border border-input">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-foreground">✅ {copy.ai.correctedCode}:</p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(bugFixAnalysis.correctedCode);
                                  toast.success(copy.ai.copied);
                                }}
                                className="text-[10px] text-primary hover:underline"
                              >
                                {copy.ai.copy}
                              </button>
                            </div>
                            <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap break-words">
                              <code className="font-mono">{bugFixAnalysis.correctedCode}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : optimizationMode ? (
                  // Optimization form
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => {
                          setOptimizationMode(false);
                          setOptimizationResults(null);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <h3 className="text-sm font-semibold">{copy.ai.optimizeTitle}</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">{copy.ai.language}</label>
                        <select
                          value={optimizationData.language}
                          onChange={(e) => setOptimizationData(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-3 py-2 bg-muted border border-input rounded-md text-sm"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                          <option value="rust">Rust</option>
                          <option value="go">Go</option>
                          <option value="csharp">C#</option>
                          <option value="ruby">Ruby</option>
                          <option value="php">PHP</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="sql">SQL</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-1 block">{copy.ai.optimizeCode}</label>
                        <Textarea
                          value={optimizationData.code}
                          onChange={(e) => setOptimizationData(prev => ({ ...prev, code: e.target.value }))}
                          placeholder={copy.ai.codePlaceholder}
                          className="w-full h-40 resize-none text-sm font-mono"
                        />
                      </div>
                    </div>

                    {optimizationResults && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="bg-muted/50 rounded-lg p-3 border border-input">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-foreground">⚡ {copy.ai.suggestions} ({optimizationResults.count}):</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(optimizationResults.suggestions);
                                toast.success(copy.ai.copied);
                              }}
                              className="text-[10px] text-primary hover:underline"
                            >
                              {copy.ai.copy}
                            </button>
                          </div>
                          <div className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground max-h-64 overflow-y-auto">
                            {optimizationResults.suggestions}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Chat messages
                  <>
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        model={MODELS.find((m) => m.id === msg.modelId)}
                        onInsertCode={
                          onCodeInsert && msg.role === 'assistant' && /```/.test(msg.content)
                            ? () => {
                              const code = extractCodeBlock(msg.content);
                              if (code) { onCodeInsert(code); toast.success(copy.ai.codeInserted); }
                            }
                            : undefined
                        }
                      />
                    ))}

                    {/* Sponsored suggestion under assistant responses */}
                    {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                      <div className="rounded-lg border border-slate-700 bg-gradient-to-r from-yellow-900/20 to-slate-900/10 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-yellow-200 font-semibold">💡 {copy.ai.deploy}</div>
                          <div className="text-xs text-slate-400">{copy.ai.suggested}</div>
                        </div>
                        <div className="mt-1 text-xs text-slate-300"><a href="https://vercel.com" target="_blank" rel="noreferrer noopener" className="underline">Vercel</a> · {copy.ai.linter} <a href="https://example.com/linter" target="_blank" rel="noreferrer noopener" className="underline">Linter Pro</a></div>
                      </div>
                    )}

                    {isLoading && (
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                          <span className={cn('h-2 w-2 rounded-full animate-pulse', currentModel.dotColor)} />
                        </div>
                        <div className="rounded-xl rounded-tl-sm bg-muted px-4 py-3">
                          <div className="flex gap-1.5 items-center">
                            <span className="block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                            <span className="block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                            <span className="block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {isLimitReached && (
                      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{copy.ai.dailyLimit}</span>
                        <Button size="sm" variant="destructive" className="ml-auto h-6 text-[11px]" onClick={() => setShowProBanner(true)}>
                          {copy.promo.upgrade}
                        </Button>
                      </div>
                    )}
                  </>
                )}

                <div id="ai-scroll-anchor" />
              </div>
            </ScrollArea>
          </div>

          {/* Input */}
          {/* Input / Analyze Button */}
          {!bugFixMode && !optimizationMode ? (
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2 px-4 py-3 border-t bg-background/60 items-end shrink-0"
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isLimitReached
                    ? copy.ai.limitPlaceholder
                    : formatCopy(copy.ai.askModel, { model: currentModel.name })
                }
                className="flex-1 resize-none min-h-[40px] max-h-32 text-sm"
                rows={1}
                disabled={isLoading || isLimitReached}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading || isLimitReached}
                className="h-10 w-10 shrink-0"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          ) : bugFixMode ? (
            <div className="flex gap-2 px-4 py-3 border-t bg-background/60 shrink-0">
              <Button
                onClick={handleAnalyzeBug}
                disabled={analyzeBugMutation.isPending || !bugFixData.code.trim() || !bugFixData.error.trim()}
                className="w-full gap-2"
              >
                {analyzeBugMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {copy.ai.analyzing}
                  </>
                ) : (
                  <>
                    <Bug className="h-4 w-4" />
                    {copy.ai.analyze}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 px-4 py-3 border-t bg-background/60 shrink-0">
              <Button
                onClick={handleOptimizeCode}
                disabled={optimizeCodeMutation.isPending || !optimizationData.code.trim()}
                className="w-full gap-2"
              >
                {optimizeCodeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {copy.ai.analyzing}
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    {copy.ai.optimize}
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Markdown styles */}
      <style>{`
        .ai-msg .code-block {
          position: relative;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          padding: 0.85rem 1rem;
          margin: 0.6rem 0;
          overflow-x: auto;
          font-size: 0.78rem;
          line-height: 1.7;
        }
        .ai-msg .code-block code {
          font-family: ui-monospace, 'Fira Code', 'Cascadia Code', monospace;
          white-space: pre;
          display: block;
        }
        .ai-msg .code-lang {
          display: inline-block;
          font-size: 0.6rem;
          font-family: ui-monospace, monospace;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.35rem;
          background: hsl(var(--muted));
          padding: 1px 6px;
          border-radius: 3px;
        }
        .ai-msg .inline-code {
          font-family: ui-monospace, monospace;
          font-size: 0.82em;
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          padding: 0.1em 0.35em;
          border-radius: 3px;
        }
        .ai-msg .md-heading {
          font-weight: 600;
          font-size: 0.9em;
          margin: 0.5rem 0 0.25rem;
        }
        .ai-msg ul { padding-left: 1.2rem; margin: 0.4rem 0; }
        .ai-msg li { margin: 0.2rem 0; }
        .ai-msg strong { font-weight: 600; color: hsl(var(--foreground)); }
        .ai-msg p { margin: 0.25rem 0; }
      `}</style>
    </>
  );
}

// ---------------------------------------------------------------------------
// MessageBubble
// ---------------------------------------------------------------------------

interface MessageBubbleProps {
  message: Message;
  model?: (typeof MODELS)[number];
  onInsertCode?: () => void;
}

function MessageBubble({ message, model, onInsertCode }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { language } = useLanguage();
  const copy = getComponentCopy(language);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex items-start gap-2.5 group', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-1', message.error ? 'bg-destructive/10' : 'bg-primary/10')}>
          {message.error
            ? <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            : model
              ? <span className={cn('h-2 w-2 rounded-full', model.dotColor)} />
              : <Sparkles className="h-3.5 w-3.5 text-primary" />
          }
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[82%]">
        <div className={cn(
          'rounded-xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : message.error
              ? 'bg-destructive/10 text-destructive rounded-tl-sm'
              : 'bg-muted text-foreground rounded-tl-sm'
        )}>
          {isUser
            ? <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            : <div className="ai-msg text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
          }
        </div>

        {/* Footer – visible on hover */}
        <div className={cn(
          'flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {message.timestamp.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
          </span>
          {model && !isUser && (
            <span className="text-[10px] text-muted-foreground">· {model.name}</span>
          )}
          {!isUser && (
            <button onClick={handleCopy} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
              {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
              {copied ? copy.ai.copied : copy.ai.copy}
            </button>
          )}
          {onInsertCode && (
            <button onClick={onInsertCode} className="text-[10px] text-primary hover:underline font-medium">
              {copy.ai.insertCode}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary mt-1">
          <User className="h-3.5 w-3.5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
