"use client";

import { FormEvent, useMemo, useState } from "react";
import { useConversation, useLearningData } from "@/app/providers";

export default function LearningDataManager() {
  const { patterns, addPattern, recordResponseOutcome } = useLearningData();
  const { conversation } = useConversation();
  const [triggerPhrase, setTriggerPhrase] = useState("");
  const [responseText, setResponseText] = useState("");
  const [tags, setTags] = useState("初回接触, 時間制約");

  const latestCustomerText = useMemo(() => {
    const reversed = [...conversation.blocks].reverse();
    const customerBlock = reversed.find((block) => block.speaker === "customer");
    return customerBlock?.text ?? "";
  }, [conversation.blocks]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!triggerPhrase || !responseText) {
      return;
    }

    addPattern({
      triggerPhrase,
      successfulResponses: [
        {
          text: responseText,
          successRate: 0.5,
          usageCount: 1,
        },
      ],
      contextTags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    setTriggerPhrase("");
    setResponseText("");
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-neutral-border bg-surface p-4">
        <div className="grid gap-3">
          <label className="flex flex-col gap-2 text-base text-neutral-foreground">
            トリガーフレーズ
            <input
              type="text"
              value={triggerPhrase}
              onChange={(event) => setTriggerPhrase(event.target.value)}
              placeholder={latestCustomerText || "例: もう少し検討させて"}
              className="rounded-xl border border-neutral-border bg-surface-muted px-3 py-2 text-base text-neutral-foreground focus:border-brand focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-base text-neutral-foreground">
            成功トーク
            <textarea
              value={responseText}
              onChange={(event) => setResponseText(event.target.value)}
              rows={3}
              placeholder="例: 2,3ヶ月で成果が出た企業様の事例をご紹介させてください"
              className="rounded-xl border border-neutral-border bg-surface-muted px-3 py-2 text-base text-neutral-foreground focus:border-brand focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-base text-neutral-foreground">
            コンテキストタグ
            <input
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="rounded-xl border border-neutral-border bg-surface-muted px-3 py-2 text-base text-neutral-foreground focus:border-brand focus:outline-none"
            />
          </label>
        </div>
        <button
          type="submit"
          className="self-end rounded-full bg-accent px-5 py-2 text-base font-semibold uppercase tracking-[0.3em] text-accent-foreground transition hover:opacity-90"
        >
          パターンを登録
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {patterns.map((pattern) => (
          <article key={pattern.patternId} className="rounded-2xl border border-neutral-border bg-surface-muted/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-foreground">
                {pattern.triggerPhrase}
              </h3>
              <div className="flex gap-2 text-base text-neutral-muted">
                {pattern.contextTags.map((tag) => (
                  <span
                    key={`${pattern.patternId}-${tag}`}
                    className="rounded-full bg-surface px-2 py-1 uppercase tracking-[0.3em]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {pattern.successfulResponses.map((response) => (
                <div
                  key={`${pattern.patternId}-${response.text}`}
                  className="rounded-xl border border-brand/20 bg-brand-subtle/30 px-3 py-3 text-base text-neutral-foreground"
                >
                  <p>{response.text}</p>
                  <div className="mt-2 flex items-center justify-between text-base text-neutral-muted">
                    <span>成功率 {(response.successRate * 100).toFixed(0)}%</span>
                    <span>使用回数 {response.usageCount}回</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        recordResponseOutcome(pattern.patternId, response.text, true)
                      }
                      className="rounded-full border border-success px-3 py-1 text-base text-success-foreground hover:bg-success/20"
                    >
                      成功
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        recordResponseOutcome(pattern.patternId, response.text, false)
                      }
                      className="rounded-full border border-danger px-3 py-1 text-base text-danger-foreground hover:bg-danger/20"
                    >
                      失敗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}

        {!patterns.length && (
          <div className="rounded-xl border border-neutral-border bg-surface-muted/40 px-4 py-6 text-base text-neutral-muted">
            パターンが登録されていません。成功したトークを登録すると、台本生成に活用されます。
          </div>
        )}
      </div>
    </div>
  );
}
