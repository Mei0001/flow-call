"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";

import { useConversation } from "@/app/providers";

type TalkFlowNodeMeta = {
  speaker: string;
  emotion?: string;
  suggested?: string;
  nextTokens?: string[];
  appointmentProbability?: number;
};

type TalkFlowNodeData = {
  label: string;
  meta: TalkFlowNodeMeta;
};

function toPercent(probability?: number) {
  if (probability === undefined) return null;
  return `${Math.round(probability * 100)}%`;
}

function TalkFlowNode({ data }: NodeProps<TalkFlowNodeData>) {
  const { label, meta } = data;
  const appointmentRate = toPercent(meta.appointmentProbability);
  const hasHoverInfo =
    !!meta.nextTokens?.length || !!meta.suggested || appointmentRate !== null;

  return (
    <div className="group relative w-full max-w-[260px]">
      <div className="rounded-2xl border border-neutral-border bg-white p-5 shadow-card transition group-hover:-translate-y-1 group-hover:shadow-lg">
        <div className="flex items-center justify-between text-base uppercase tracking-[0.3em] text-neutral-muted">
          <span>{meta.speaker}</span>
          {meta.emotion && <span className="font-medium">{meta.emotion}</span>}
        </div>
        <p className="mt-3 text-base leading-relaxed text-neutral-foreground">{label}</p>
      </div>

      {hasHoverInfo && (
        <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 hidden w-max min-w-[240px] -translate-x-1/2 rounded-2xl border border-neutral-border bg-white p-4 text-base text-neutral-foreground shadow-xl group-hover:block">
          {meta.nextTokens?.length ? (
            <div className="mb-3">
              <p className="font-semibold uppercase tracking-[0.25em] text-neutral-muted">
                次の語候補
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {meta.nextTokens.map((token) => (
                  <span
                    key={token}
                    className="rounded-full border border-neutral-border px-3 py-1 text-base"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {meta.suggested ? (
            <div className="mb-3">
              <p className="font-semibold uppercase tracking-[0.25em] text-neutral-muted">
                推奨トーク
              </p>
              <p className="mt-2 leading-relaxed">{meta.suggested}</p>
            </div>
          ) : null}
          {appointmentRate ? (
            <div className="flex items-center justify-between rounded-xl border border-neutral-border bg-black/5 px-3 py-2">
              <span className="font-semibold uppercase tracking-[0.25em] text-neutral-muted">
                アポ成約率
              </span>
              <span className="text-base font-semibold text-neutral-foreground">
                {appointmentRate}
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

const nodeWidth = 260;
const nodeHeight = 140;

export default function TalkFlowGraph() {
  const { conversation } = useConversation();

  const nodeTypes = useMemo(() => ({ talkFlow: TalkFlowNode }), []);

  const { nodes, edges } = useMemo(() => {
    const generatedNodes: Node<TalkFlowNodeData>[] = [];
    const generatedEdges: Edge[] = [];

    conversation.blocks.forEach((block, index) => {
      const yOffset = index * (nodeHeight + 24);
      const isAgent = block.speaker === "agent";

      generatedNodes.push({
        id: block.id,
        type: "talkFlow",
        position: {
          x: isAgent ? nodeWidth + 120 : 0,
          y: yOffset,
        },
        data: {
          label: block.text,
          meta: {
            speaker: isAgent ? "Agent" : "Customer",
            emotion: block.emotion,
            suggested: block.suggestedResponse,
            nextTokens: block.nextTokens,
            appointmentProbability: block.appointmentProbability,
          },
        },
        style: {
          width: nodeWidth,
        },
      });

      const previousBlock = conversation.blocks[index - 1];
      if (previousBlock) {
        generatedEdges.push({
          id: `${previousBlock.id}-${block.id}`,
          source: previousBlock.id,
          target: block.id,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#000000",
          },
          animated: isAgent,
          style: {
            strokeWidth: 2,
            stroke: "rgba(0, 0, 0, 0.45)",
          },
        });
      }
    });

    if (!conversation.blocks.length) {
      generatedNodes.push({
        id: "empty",
        type: "talkFlow",
        position: { x: 60, y: 120 },
        data: {
          label: "音声をアップロードすると会話フローが生成されます",
          meta: {
            speaker: "System",
          },
        },
        style: {
          width: nodeWidth,
        },
      });
    }

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [conversation.blocks]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        proOptions={{ hideFitView: true }}
        panOnScroll
        panOnDrag
        zoomOnScroll
        minZoom={0.6}
        maxZoom={1.4}
        fitViewOptions={{ padding: 0.3 }}
        className="rounded-2xl bg-white"
      >
        <MiniMap className="!bg-white" zoomable pannable maskColor="rgba(0,0,0,0.05)" />
        <Controls className="rounded-full border border-neutral-border bg-white/90 text-neutral-muted" />
        <Background color="rgba(0,0,0,0.08)" gap={48} />
      </ReactFlow>
    </div>
  );
}
