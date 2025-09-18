"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Position,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { useConversation } from "@/app/providers";

const nodeWidth = 240;
const nodeHeight = 120;
const horizontalSpacing = 140;
const verticalSpacing = 80;
const suggestionOffsetX = 160;
const suggestionSpacingY = 40;

export default function TalkFlowGraph() {
  const { conversation, scriptSuggestions } = useConversation();

  const { nodes, edges } = useMemo(() => {
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    conversation.blocks.forEach((block, index) => {
      const isAgent = block.speaker === "agent";
      const xOffset = index * (nodeWidth + horizontalSpacing);
      const yOffset = isAgent ? 0 : nodeHeight + verticalSpacing;

      generatedNodes.push({
        id: block.id,
        position: {
          x: xOffset,
          y: yOffset,
        },
        data: {
          label: block.text,
          speaker: isAgent ? "Agent" : "Customer",
        },
        style: {
          width: nodeWidth,
          borderRadius: 16,
          padding: 18,
          border: `1px solid ${isAgent ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.25)"}`,
          backgroundColor: isAgent ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.02)",
          color: "#000000",
          fontSize: "16px",
          lineHeight: 1.5,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
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
            width: 22,
            height: 22,
            color: "#000000",
          },
          animated: true,
          style: {
            strokeWidth: 2,
            stroke: "rgba(0,0,0,0.45)",
          },
          pathOptions: {
            borderRadius: 12,
          },
        });
      }
    });

    const latestCustomerIndex = [...conversation.blocks]
      .reverse()
      .findIndex((block) => block.speaker === "customer");

    if (scriptSuggestions.length && latestCustomerIndex !== -1) {
      const anchorIndex = conversation.blocks.length - 1 - latestCustomerIndex;
      const anchorBlock = conversation.blocks[anchorIndex];
      const baseX = (anchorIndex + 1) * (nodeWidth + horizontalSpacing) + suggestionOffsetX;
      const anchorIsAgent = anchorBlock.speaker === "agent";
      const anchorY = anchorIsAgent ? 0 : nodeHeight + verticalSpacing;

      scriptSuggestions.forEach((suggestion, suggestionIndex) => {
        const suggestionId = `suggestion-${suggestion.id}`;
        generatedNodes.push({
          id: suggestionId,
          position: {
            x: baseX,
            y: anchorY + suggestionIndex * (nodeHeight + suggestionSpacingY),
          },
          data: {
            label: suggestion.body,
            speaker: "候補",
          },
          style: {
            width: nodeWidth,
            borderRadius: 16,
            padding: 18,
            border: "1px dashed rgba(0,0,0,0.3)",
            backgroundColor: "rgba(0,0,0,0.04)",
            color: "#000000",
            fontSize: "16px",
            lineHeight: 1.5,
          },
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
        });

        generatedEdges.push({
          id: `${anchorBlock.id}-${suggestionId}`,
          source: anchorBlock.id,
          target: suggestionId,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 22,
            height: 22,
            color: "#000000",
          },
          animated: true,
          style: {
            strokeWidth: 2,
            stroke: "rgba(0,0,0,0.35)",
            strokeDasharray: "6 6",
          },
          pathOptions: {
            borderRadius: 12,
          },
        });
      });
    }

    if (!conversation.blocks.length) {
      generatedNodes.push({
        id: "empty",
        position: { x: 60, y: nodeHeight / 2 },
        data: {
          label: "最初の顧客発話を追加するとフローが生成されます",
          speaker: "System",
        },
        style: {
          width: nodeWidth,
          padding: 18,
          borderRadius: 16,
          border: "1px dashed rgba(0,0,0,0.2)",
          backgroundColor: "rgba(0,0,0,0.03)",
          color: "rgba(0,0,0,0.6)",
          fontSize: "16px",
          lineHeight: 1.5,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    }

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [conversation.blocks, scriptSuggestions]);

  return (
    <div className="h-full">
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        panOnScroll
        panOnDrag
        zoomOnScroll
        fitViewOptions={{ padding: 0.3 }}
        className="rounded-2xl"
      >
        <MiniMap className="!bg-white" zoomable pannable maskColor="rgba(0,0,0,0.05)" />
        <Controls className="rounded-full border border-neutral-border bg-white/90 text-neutral-muted" />
        <Background color="rgba(0,0,0,0.08)" gap={32} />
      </ReactFlow>
    </div>
  );
}
