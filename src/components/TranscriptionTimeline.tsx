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
    <div className="flex max-h-[420px] flex-col gap-4 overflow-y-auto rounded-2xl border border-neutral-border bg-white/80 p-5 scrollbar-thin">
      {orderedBlocks.map((block) => {
        const isAgent = block.speaker === "agent";

        return (
          <article
            key={block.id}
            className="group relative flex gap-4 rounded-2xl border border-neutral-border bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative flex flex-col items-center">
              <span
                className={`mt-1 inline-flex h-3 w-3 rounded-full border border-neutral-border ${
                  isAgent ? "bg-black" : "bg-white"
                }`}
              />
              <span className="mt-3 h-full w-px bg-neutral-border" aria-hidden />
            </div>
            <div className="flex flex-1 flex-col gap-3 text-neutral-foreground">
              <div className="flex flex-wrap items-center justify-between gap-2 text-base text-neutral-muted">
                <span className="font-semibold uppercase tracking-[0.3em]">
                  {isAgent ? "Agent" : "Customer"}
                </span>
                <span>{formatTimestamp(block.timestamp)}</span>
              </div>
              <p className="text-base leading-relaxed text-neutral-foreground">{block.text}</p>
              {block.suggestedResponse && (
                <div className="rounded-xl border border-neutral-border bg-black/5 px-4 py-2 text-base text-neutral-foreground">
                  推奨応答: {block.suggestedResponse}
                </div>
              )}
            </div>
          </article>
        );
      })}

      {isTranscribing && (
        <div className="rounded-2xl border border-dashed border-neutral-border bg-black/5 px-4 py-3 text-base text-neutral-foreground">
          文字起こしを実行中です...
        </div>
      )}
    </div>
  );
}
