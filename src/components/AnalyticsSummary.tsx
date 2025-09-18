"use client";

import { useMemo } from "react";
import { useConversation } from "@/app/providers";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function AnalyticsSummary() {
  const { conversation } = useConversation();

  const stats = useMemo(() => {
    const totalBlocks = conversation.blocks.length;
    const agentBlocks = conversation.blocks.filter((block) => block.speaker === "agent");
    const customerBlocks = totalBlocks - agentBlocks.length;
    const positiveBlocks = conversation.blocks.filter(
      (block) => block.emotion === "positive"
    );

    const averageResponseTime = agentBlocks.length
      ? agentBlocks.reduce((sum, block) => sum + (block.responseTime ?? 6), 0) /
        agentBlocks.length
      : 0;

    return {
      totalBlocks,
      agentShare: totalBlocks ? agentBlocks.length / totalBlocks : 0,
      customerShare: totalBlocks ? customerBlocks / totalBlocks : 0,
      positiveRatio: totalBlocks ? positiveBlocks.length / totalBlocks : 0,
      averageResponseTime: Number(averageResponseTime.toFixed(1)),
      duration: conversation.metadata.duration,
      outcome: conversation.outcome,
    };
  }, [conversation]);

  const cards = [
    {
      label: "会話ブロック数",
      value: stats.totalBlocks,
      caption: "過去10分のブロック総数",
    },
    {
      label: "担当トーク比率",
      value: formatPercent(stats.agentShare),
      caption: "担当者が話している割合",
    },
    {
      label: "顧客発話比率",
      value: formatPercent(stats.customerShare),
      caption: "顧客側のリアクション比率",
    },
    {
      label: "ポジティブ反応",
      value: formatPercent(stats.positiveRatio),
      caption: "ポジティブ判定の割合",
    },
    {
      label: "平均応答速度",
      value: `${stats.averageResponseTime}s`,
      caption: "担当者の平均レスポンス時間",
    },
    {
      label: "通話経過",
      value: `${Math.round(stats.duration / 60)}分`,
      caption: `ステータス: ${stats.outcome}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-neutral-border bg-surface-muted/70 px-4 py-3"
        >
          <p className="text-base uppercase tracking-[0.3em] text-neutral-muted">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-foreground">
            {card.value}
          </p>
          <p className="mt-1 text-base text-neutral-muted">{card.caption}</p>
        </div>
      ))}
    </div>
  );
}
