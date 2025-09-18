"use client";

import { useMemo, useState } from "react";
import { useConversation } from "@/app/providers";

export default function ScriptSuggestionPanel() {
  const {
    conversation,
    scriptSuggestions,
    requestScriptSuggestions,
    isGeneratingScript,
    acceptSuggestion,
  } = useConversation();

  const [pendingSuggestionId, setPendingSuggestionId] = useState<string | null>(null);

  const latestUtterance = useMemo(() => {
    const reversed = [...conversation.blocks].reverse();
    const customerBlock = reversed.find((block) => block.speaker === "customer");
    return customerBlock?.text ?? "";
  }, [conversation.blocks]);

  const [primary, ...alternatives] = scriptSuggestions;
  const primaryConfidence = useMemo(
    () => Math.round((primary?.confidence ?? 0) * 100),
    [primary?.confidence]
  );

  const isAccepting = Boolean(pendingSuggestionId);

  const handleAccept = async (suggestionId: string) => {
    const suggestion = scriptSuggestions.find((item) => item.id === suggestionId);
    if (!suggestion) {
      return;
    }
    setPendingSuggestionId(suggestionId);
    try {
      await acceptSuggestion(suggestion);
    } finally {
      setPendingSuggestionId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-neutral-border bg-black/5 p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[200px]">
            <h3 className="text-lg font-semibold text-neutral-foreground">次の推奨トーク候補</h3>
            <p className="mt-1 text-base text-neutral-muted">
              最新の顧客発話をもとにLLMが候補を生成します。
            </p>
          </div>
          <button
            type="button"
            onClick={() => requestScriptSuggestions(latestUtterance)}
            className="rounded-full border border-neutral-border px-4 py-2 text-base font-semibold uppercase tracking-[0.3em] text-neutral-foreground transition hover:bg-black/10 disabled:opacity-60"
            disabled={isGeneratingScript || !latestUtterance}
          >
            {isGeneratingScript ? "生成中..." : "再生成"}
          </button>
        </div>

        {!scriptSuggestions.length && (
          <p className="mt-4 text-base text-neutral-muted">
            まず「相手からの返答」を入力して顧客発話を追加してください。
          </p>
        )}

        {primary && (
          <div className="mt-4 rounded-2xl border border-neutral-border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base uppercase tracking-[0.3em] text-neutral-muted">
                  信頼度 {primaryConfidence}%
                </p>
                <h4 className="mt-2 text-xl font-semibold text-neutral-foreground">
                  {primary.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => handleAccept(primary.id)}
                className="rounded-full bg-black px-6 py-2 text-base font-semibold text-white shadow-card transition hover:opacity-80 disabled:opacity-60"
                disabled={isAccepting}
              >
                {isAccepting && pendingSuggestionId === primary.id ? "反映中..." : "この案を採用"}
              </button>
            </div>
            <p className="mt-3 text-base leading-relaxed text-neutral-foreground">
              {primary.body}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-base text-neutral-muted">
              <span className="rounded-full border border-neutral-border px-3 py-1 uppercase tracking-[0.3em]">
                {primary.tone}
              </span>
              <span>直近の顧客発話: {latestUtterance || "---"}</span>
            </div>
          </div>
        )}
      </div>

      {alternatives.length > 0 && (
        <div className="grid gap-4">
          {alternatives.map((suggestion) => (
            <article
              key={suggestion.id}
              className="rounded-2xl border border-neutral-border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base uppercase tracking-[0.3em] text-neutral-muted">
                    信頼度 {(suggestion.confidence * 100).toFixed(0)}%
                  </p>
                  <h5 className="mt-2 text-lg font-semibold text-neutral-foreground">
                    {suggestion.title}
                  </h5>
                </div>
                <button
                  type="button"
                  onClick={() => handleAccept(suggestion.id)}
                  className="rounded-full border border-neutral-border px-4 py-2 text-base font-semibold uppercase tracking-[0.3em] text-neutral-foreground transition hover:bg-black/10 disabled:opacity-60"
                  disabled={isAccepting}
                >
                  {isAccepting && pendingSuggestionId === suggestion.id ? "反映中..." : "採用"}
                </button>
              </div>
              <p className="mt-3 text-base leading-relaxed text-neutral">
                {suggestion.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
