"use client";

import { useMemo } from "react";
import { useConversation } from "@/app/providers";

export default function ScriptSuggestionPanel() {
  const {
    conversation,
    scriptSuggestions,
    requestScriptSuggestions,
    isGeneratingScript,
  } = useConversation();

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

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-brand/30 bg-brand-subtle/40 p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base uppercase tracking-[0.3em] text-neutral-muted">
              推奨案（信頼度 {primaryConfidence}% ）
            </p>
            <h3 className="mt-2 text-lg font-semibold text-neutral-foreground">
              {primary?.title ?? "推奨案を取得できません"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => requestScriptSuggestions(latestUtterance)}
            className="rounded-full border border-brand px-4 py-2 text-base font-semibold uppercase tracking-[0.3em] text-brand-foreground transition hover:bg-brand hover:text-brand-foreground disabled:opacity-60"
            disabled={isGeneratingScript}
          >
            {isGeneratingScript ? "生成中..." : "更新"}
          </button>
        </div>
        <p className="mt-3 text-base leading-relaxed text-neutral-foreground">
          {primary?.body ?? "会話ログを元に台本生成を実行してください。"}
        </p>
        <div className="mt-3 flex items-center gap-3 text-base text-neutral-muted">
          <span className="rounded-full bg-brand/20 px-3 py-1 uppercase tracking-[0.3em]">
            {primary?.tone ?? "friendly"}
          </span>
          <span>直近の顧客発話: {latestUtterance || "---"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {alternatives.map((suggestion) => (
          <article
            key={suggestion.id}
            className="rounded-2xl border border-neutral-border bg-surface-muted/60 p-4"
          >
            <div className="flex items-center justify-between text-base text-neutral-muted">
              <span className="uppercase tracking-[0.3em]">代替案</span>
              <span>信頼度 {(suggestion.confidence * 100).toFixed(0)}%</span>
            </div>
            <h4 className="mt-2 text-base font-semibold text-neutral-foreground">
              {suggestion.title}
            </h4>
            <p className="mt-2 text-base leading-relaxed text-neutral">
              {suggestion.body}
            </p>
          </article>
        ))}

        {!scriptSuggestions.length && (
          <div className="rounded-xl border border-neutral-border bg-surface-muted/40 px-3 py-4 text-base text-neutral-muted">
            直近の顧客発話に応じて台本生成を実行すると候補が表示されます。
          </div>
        )}
      </div>
    </div>
  );
}
