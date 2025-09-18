"use client";

import { useMemo } from "react";
import { useConversation } from "@/app/providers";

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Tokyo",
});

function formatTimestamp(timestamp: string) {
  return timeFormatter.format(new Date(timestamp));
}

export default function TranscriptionTimeline() {
  const { conversation, isTranscribing } = useConversation();

  const orderedBlocks = useMemo(
    () =>
      [...conversation.blocks].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    [conversation.blocks]
  );

  return (
    <div className="flex max-h-[360px] flex-col gap-4 overflow-y-auto rounded-2xl border border-neutral-border bg-surface px-4 py-4 scrollbar-thin">
      {orderedBlocks.map((block) => (
        <article
          key={block.id}
          className={`flex flex-col gap-2 rounded-xl px-4 py-3 shadow-sm transition ${
            block.speaker === "agent"
              ? "bg-brand-subtle/70 text-brand-foreground"
              : "bg-surface-muted text-neutral-foreground"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-neutral-muted">
            <span className="font-semibold uppercase tracking-[0.3em]">
              {block.speaker === "agent" ? "Agent" : "Customer"}
            </span>
            <span>{formatTimestamp(block.timestamp)}</span>
          </div>
          <p className="text-sm leading-relaxed text-neutral-foreground">
            {block.text}
          </p>
          {block.suggestedResponse && (
            <div className="rounded-lg bg-brand-subtle/60 px-3 py-2 text-xs text-brand-foreground">
              推奨応答: {block.suggestedResponse}
            </div>
          )}
        </article>
      ))}

      {isTranscribing && (
        <div className="rounded-xl border border-brand/40 bg-brand-subtle/40 px-3 py-2 text-xs text-brand-foreground">
          文字起こしを実行中です...
        </div>
      )}
    </div>
  );
}
