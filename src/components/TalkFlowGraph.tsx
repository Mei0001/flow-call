"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { useConversation } from "@/app/providers";

const nodeWidth = 220;
const nodeHeight = 120;

export default function TalkFlowGraph() {
  const { conversation } = useConversation();

  const { nodes, edges } = useMemo(() => {
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    conversation.blocks.forEach((block, index) => {
      const yOffset = index * (nodeHeight + 40);
      const isAgent = block.speaker === "agent";

      generatedNodes.push({
        id: block.id,
        position: {
          x: isAgent ? nodeWidth + 80 : 0,
          y: yOffset,
        },
        data: {
          label: block.text,
          meta: {
            speaker: isAgent ? "Agent" : "Customer",
            emotion: block.emotion,
            suggested: block.suggestedResponse,
          },
        },
        style: {
          width: nodeWidth,
          borderRadius: 16,
          padding: 16,
          border: `1px solid ${isAgent ? "var(--color-brand)" : "var(--color-neutral-border)"}`,
          backgroundColor: isAgent
            ? "rgba(37, 99, 235, 0.12)"
            : "rgba(15, 23, 42, 0.54)",
          color: "var(--color-neutral-foreground)",
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
            width: 24,
            height: 24,
          },
          animated: !isAgent,
          style: {
            strokeWidth: 2,
          },
        });
      }
    });

    if (!conversation.blocks.length) {
      generatedNodes.push({
        id: "empty",
        position: { x: 60, y: 120 },
        data: {
          label: "音声をアップロードすると会話フローが生成されます",
          meta: {
            speaker: "System",
            emotion: "neutral",
          },
        },
        style: {
          width: nodeWidth,
          padding: 16,
          borderRadius: 16,
          border: "1px dashed var(--color-neutral-border)",
          backgroundColor: "rgba(148, 163, 184, 0.08)",
          color: "var(--color-neutral-muted)",
        },
      });
    }

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [conversation.blocks]);

  return (
    <div className="h-full">
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        proOptions={{ hideFitView: true }}
        panOnScroll
        panOnDrag
        zoomOnScroll
        className="rounded-2xl"
      >
        <MiniMap className="!bg-surface-muted/80" zoomable pannable />
        <Controls className="rounded-full bg-surface-muted/80 text-neutral-muted" />
        <Background color="rgba(148,163,184,0.2)" gap={24} />
      </ReactFlow>
    </div>
  );
}
