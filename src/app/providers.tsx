"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type Speaker = "agent" | "customer";

type Emotion = "positive" | "neutral" | "negative";

export interface TalkBlock {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp: string;
  suggestedResponse?: string;
  responseTime?: number;
  emotion?: Emotion;
}

export interface Conversation {
  id: string;
  timestamp: string;
  blocks: TalkBlock[];
  outcome: "appointment" | "rejected" | "pending";
  metadata: {
    duration: number;
    customerId?: string;
    agentId?: string;
  };
}

export interface ScriptSuggestion {
  id: string;
  title: string;
  body: string;
  tone: "friendly" | "direct" | "empathetic";
  confidence: number;
}

type ConversationContextValue = {
  conversation: Conversation;
  isTranscribing: boolean;
  isGeneratingScript: boolean;
  scriptSuggestions: ScriptSuggestion[];
  transcribeAudio: (file: File) => Promise<void>;
  requestScriptSuggestions: (latestUtterance: string) => Promise<void>;
};

const ConversationContext = createContext<ConversationContextValue | null>(null);

interface LearningDataRecord {
  text: string;
  successRate: number;
  usageCount: number;
}

export interface LearningPattern {
  patternId: string;
  triggerPhrase: string;
  successfulResponses: LearningDataRecord[];
  contextTags: string[];
}

type LearningDataContextValue = {
  patterns: LearningPattern[];
  addPattern: (pattern: Omit<LearningPattern, "patternId">) => void;
  recordResponseOutcome: (patternId: string, responseText: string, didSucceed: boolean) => void;
};

const LearningDataContext = createContext<LearningDataContextValue | null>(null);

const baseConversation: Conversation = {
  id: "demo-conversation",
  timestamp: "2024-09-17T01:30:00.000Z",
  blocks: [
    {
      id: "block-1",
      speaker: "customer",
      text: "こんにちは。どちら様でしょうか？",
      timestamp: "2024-09-17T01:30:05.000Z",
      emotion: "neutral",
    },
    {
      id: "block-2",
      speaker: "agent",
      text: "FlowCallの高橋でございます。本日は業務の効率化につながるご提案でご連絡いたしました。",
      timestamp: "2024-09-17T01:30:10.000Z",
      responseTime: 5,
      suggestedResponse:
        "本日はアウトバウンド対応におけるトーク支援システムのご紹介でお電話しました。",
      emotion: "positive",
    },
    {
      id: "block-3",
      speaker: "customer",
      text: "今は少し忙しいのですが、短く教えてください。",
      timestamp: "2024-09-17T01:30:20.000Z",
      emotion: "neutral",
    },
  ],
  outcome: "pending",
  metadata: {
    duration: 45,
    customerId: "cust-402",
    agentId: "agent-901",
  },
};

const baseSuggestions: ScriptSuggestion[] = [
  {
    id: "suggestion-primary",
    title: "課題を即時に想起させる切り返し",
    body: "お忙しいところ恐れ入ります。30秒で要点だけお伝えしますので、その後ご判断いただけますでしょうか。",
    tone: "empathetic",
    confidence: 0.86,
  },
  {
    id: "suggestion-alt-1",
    title: "成果事例を先出しする導入",
    body: "先週も同業の〇〇社様でアポ取得率が32%向上した事例が出ておりまして、その仕組みを簡単にご紹介させてください。",
    tone: "friendly",
    confidence: 0.79,
  },
  {
    id: "suggestion-alt-2",
    title: "時間制約を明確にするアプローチ",
    body: "ご負担を最小限にするため、60秒以内で本題に入ります。気になるところがあればすぐに補足いたします。",
    tone: "direct",
    confidence: 0.74,
  },
];

const basePatterns: LearningPattern[] = [
  {
    patternId: "pattern-quick-trust",
    triggerPhrase: "短く教えて",
    successfulResponses: [
      {
        text: "30秒でご判断いただける要点だけお伝えします",
        successRate: 0.62,
        usageCount: 18,
      },
      {
        text: "成功事例から先にお話しします",
        successRate: 0.58,
        usageCount: 12,
      },
    ],
    contextTags: ["初回接触", "時間制約"],
  },
  {
    patternId: "pattern-price-objection",
    triggerPhrase: "費用が気になる",
    successfulResponses: [
      {
        text: "導入後3ヶ月で回収できた企業様の事例をご紹介します",
        successRate: 0.67,
        usageCount: 9,
      },
    ],
    contextTags: ["価格交渉", "反論対応"],
  },
];

function ConversationProvider({ children }: PropsWithChildren) {
  const [conversation, setConversation] = useState<Conversation>(baseConversation);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptSuggestions, setScriptSuggestions] = useState<ScriptSuggestion[]>(baseSuggestions);

  const appendBlock = useCallback((block: TalkBlock) => {
    setConversation((prev) => ({
      ...prev,
      blocks: [...prev.blocks, block],
      metadata: {
        ...prev.metadata,
        duration: prev.metadata.duration + Math.max(block.responseTime ?? 10, 5),
      },
    }));
  }, []);

  const transcribeAudio = useCallback(
    async (file: File) => {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append("audio", file);

      try {
        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const payload = await response.json();

          if (Array.isArray(payload.blocks)) {
            setConversation((prev) => ({
              ...prev,
              blocks: [
                ...prev.blocks,
                ...payload.blocks.map((raw: Partial<TalkBlock>, index: number) => ({
                  id: raw.id ?? `transcribed-${crypto.randomUUID()}`,
                  speaker: raw.speaker ?? (index % 2 === 0 ? "customer" : "agent"),
                  text: raw.text ?? "(文字起こし結果が取得できませんでした)",
                  timestamp:
                    raw.timestamp ?? new Date(Date.now() + index * 4_000).toISOString(),
                  responseTime: raw.responseTime,
                  emotion: raw.emotion ?? "neutral",
                  suggestedResponse: raw.suggestedResponse,
                })),
              ],
              metadata: {
                ...prev.metadata,
                duration: payload.duration ?? prev.metadata.duration,
              },
            }));
          }

          if (Array.isArray(payload.suggestions)) {
            setScriptSuggestions(
              payload.suggestions.map((item: Partial<ScriptSuggestion>) => ({
                id: item.id ?? crypto.randomUUID(),
                title: item.title ?? "生成スクリプト",
                body: item.body ?? "提案内容を取得できませんでした。",
                tone: (item.tone as ScriptSuggestion["tone"]) ?? "friendly",
                confidence: item.confidence ?? 0.64,
              }))
            );
          }

          return;
        }

        throw new Error(`Transcribe API failed with status ${response.status}`);
      } catch (error) {
        console.error("transcribeAudio fallback", error);
        const now = new Date();
        appendBlock({
          id: `fallback-${crypto.randomUUID()}`,
          speaker: "customer",
          text: "（デモ）こちらの資料も後ほどいただけますか？",
          timestamp: now.toISOString(),
          emotion: "positive",
        });
      } finally {
        setIsTranscribing(false);
      }
    },
    [appendBlock]
  );

  const requestScriptSuggestions = useCallback(
    async (latestUtterance: string) => {
      setIsGeneratingScript(true);
      try {
        const response = await fetch("/api/generate-script", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            utterance: latestUtterance,
            conversationId: conversation.id,
          }),
        });

        if (response.ok) {
          const payload = await response.json();
          if (Array.isArray(payload.suggestions)) {
            setScriptSuggestions(
              payload.suggestions.map((item: Partial<ScriptSuggestion>) => ({
                id: item.id ?? crypto.randomUUID(),
                title: item.title ?? "生成スクリプト",
                body: item.body ?? "提案内容を取得できませんでした。",
                tone: (item.tone as ScriptSuggestion["tone"]) ?? "friendly",
                confidence: item.confidence ?? 0.64,
              }))
            );
            return;
          }
        }

        throw new Error("Generate script API returned unexpected payload");
      } catch (error) {
        console.error("requestScriptSuggestions fallback", error);
        setScriptSuggestions(
          baseSuggestions.map((suggestion, index) => ({
            ...suggestion,
            id: `${suggestion.id}-fallback-${index}`,
          }))
        );
      } finally {
        setIsGeneratingScript(false);
      }
    },
    [conversation.id]
  );

  const value = useMemo(
    () => ({
      conversation,
      isTranscribing,
      isGeneratingScript,
      scriptSuggestions,
      transcribeAudio,
      requestScriptSuggestions,
    }),
    [
      conversation,
      isTranscribing,
      isGeneratingScript,
      scriptSuggestions,
      transcribeAudio,
      requestScriptSuggestions,
    ]
  );

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

function LearningDataProvider({ children }: PropsWithChildren) {
  const [patterns, setPatterns] = useState<LearningPattern[]>(basePatterns);

  const addPattern = useCallback(
    (pattern: Omit<LearningPattern, "patternId">) => {
      setPatterns((prev) => [
        ...prev,
        {
          ...pattern,
          patternId: `pattern-${crypto.randomUUID()}`,
        },
      ]);
    },
    []
  );

  const recordResponseOutcome = useCallback(
    (patternId: string, responseText: string, didSucceed: boolean) => {
      setPatterns((prev) =>
        prev.map((pattern) => {
          if (pattern.patternId !== patternId) {
            return pattern;
          }

          const existing = pattern.successfulResponses.find(
            (response) => response.text === responseText
          );

          if (!existing) {
            return {
              ...pattern,
              successfulResponses: [
                ...pattern.successfulResponses,
                {
                  text: responseText,
                  successRate: didSucceed ? 0.6 : 0.4,
                  usageCount: 1,
                },
              ],
            };
          }

          const usageCount = existing.usageCount + 1;
          const successRate = didSucceed
            ? Math.min(existing.successRate + 0.05, 0.95)
            : Math.max(existing.successRate - 0.05, 0.1);

          return {
            ...pattern,
            successfulResponses: pattern.successfulResponses.map((response) =>
              response.text === responseText
                ? {
                    ...response,
                    usageCount,
                    successRate: Number(successRate.toFixed(2)),
                  }
                : response
            ),
          };
        })
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      patterns,
      addPattern,
      recordResponseOutcome,
    }),
    [patterns, addPattern, recordResponseOutcome]
  );

  return (
    <LearningDataContext.Provider value={value}>
      {children}
    </LearningDataContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation は ConversationProvider の内部で利用してください");
  }
  return context;
}

export function useLearningData() {
  const context = useContext(LearningDataContext);
  if (!context) {
    throw new Error("useLearningData は LearningDataProvider の内部で利用してください");
  }
  return context;
}

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ConversationProvider>
      <LearningDataProvider>{children}</LearningDataProvider>
    </ConversationProvider>
  );
}
