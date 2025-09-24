"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Position,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { ScriptSuggestion, useConversation } from "@/app/providers";

const nodeWidth = 240;
const nodeHeight = 120;
const horizontalSpacing = 140;
const verticalSpacing = 80;
const suggestionOffsetX = 160;
const suggestionSpacingY = 40;
const preferredZoom = 1.05;

type ConversationNodeData = {
  label: string;
  speaker: string;
  type: "conversation" | "suggestion" | "system";
  suggestion?: ScriptSuggestion;
};

type ConversationNode = Node<ConversationNodeData>;

function TalkFlowGraphInner() {
  const { conversation, scriptSuggestions, acceptSuggestion } = useConversation();
  const [pendingSuggestionId, setPendingSuggestionId] = useState<string | null>(null);
  const { fitView, setCenter, zoomTo } = useReactFlow();
  const isInitializedRef = useRef(false);
  const previousBlockCountRef = useRef(conversation.blocks.length);

  const { nodes, edges } = useMemo(() => {
    const generatedNodes: ConversationNode[] = [];
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
          type: "conversation",
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
        const isDisabled = Boolean(pendingSuggestionId && pendingSuggestionId !== suggestionId);

        generatedNodes.push({
          id: suggestionId,
          position: {
            x: baseX,
            y: anchorY + suggestionIndex * (nodeHeight + suggestionSpacingY),
          },
          data: {
            label: suggestion.body,
            speaker: "候補",
            type: "suggestion",
            suggestion,
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
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.5 : 1,
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
          type: "system",
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
  }, [conversation.blocks, scriptSuggestions, pendingSuggestionId]);

  const handleInit = useCallback(() => {
    isInitializedRef.current = true;
    fitView({ padding: 0.22 });
    zoomTo(preferredZoom, { duration: 0 });
  }, [fitView, zoomTo]);

  const handleNodeClick = useCallback(
    async (_event: unknown, node: ConversationNode) => {
      if (node.data?.type !== "suggestion" || !node.data.suggestion || pendingSuggestionId) {
        return;
      }

      setPendingSuggestionId(node.id);
      try {
        await acceptSuggestion(node.data.suggestion);
      } finally {
        setPendingSuggestionId(null);
      }
    },
    [acceptSuggestion, pendingSuggestionId]
  );

  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    const previousCount = previousBlockCountRef.current;
    const currentCount = conversation.blocks.length;
    if (currentCount === 0) {
      previousBlockCountRef.current = currentCount;
      return;
    }

    if (currentCount > previousCount) {
      const lastBlock = conversation.blocks[currentCount - 1];
      const targetNode = nodes.find((node) => node.id === lastBlock.id);

      if (targetNode) {
        const centerX = targetNode.position.x + nodeWidth / 2;
        const centerY = targetNode.position.y + nodeHeight / 2;
        setCenter(centerX, centerY, { zoom: preferredZoom, duration: 400 });
      }
    }

    previousBlockCountRef.current = currentCount;
  }, [conversation.blocks, nodes, setCenter]);

  return (
    <div className="h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={handleInit}
        onNodeClick={handleNodeClick}
        panOnScroll
        panOnDrag
        zoomOnScroll
        minZoom={0.6}
        maxZoom={1.6}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        className="rounded-2xl"
      >
        <MiniMap className="!bg-white" zoomable pannable maskColor="rgba(0,0,0,0.05)" />
        <Controls className="rounded-full border border-neutral-border bg-white/90 text-neutral-muted" />
        <Background color="rgba(0,0,0,0.08)" gap={32} />
      </ReactFlow>
    </div>
  );
}

export default function TalkFlowGraph() {
  return (
    <ReactFlowProvider>
      <TalkFlowGraphInner />
    </ReactFlowProvider>
  );
}
