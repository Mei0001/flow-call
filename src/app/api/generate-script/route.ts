import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "edge";

interface TalkBlock {
  id: string;
  speaker: "agent" | "customer";
  text: string;
  timestamp: string;
}

interface ConversationPayload {
  id: string;
  blocks: TalkBlock[];
  outcome: string;
  metadata: Record<string, unknown>;
}

interface GenerateScriptRequest {
  utterance?: string;
  conversationId?: string;
  conversation?: ConversationPayload;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function buildTranscript(conversation?: ConversationPayload): string {
  if (!conversation?.blocks?.length) {
    return "(会話ブロックはまだありません)";
  }

  return conversation.blocks
    .map((block) => `${block.speaker === "agent" ? "Agent" : "Customer"}: ${block.text}`)
    .join("\n");
}

function sanitizeTone(value: unknown): "friendly" | "direct" | "empathetic" {
  if (value === "direct" || value === "empathetic") {
    return value;
  }
  return "friendly";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 }
    );
  }

  let payload: GenerateScriptRequest;
  try {
    payload = (await request.json()) as GenerateScriptRequest;
  } catch (error) {
    console.error("generate-script: invalid JSON", error);
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const latestUtterance = payload.utterance?.trim();
  if (!latestUtterance) {
    return NextResponse.json(
      { error: "最新の顧客発話が必要です。" },
      { status: 400 }
    );
  }

  const conversationTranscript = buildTranscript(payload.conversation);

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "あなたはアウトバウンド営業のトークを提案するアシスタントです。会話履歴を踏まえ、相手の懸念に寄り添いながら、短く・具体的に返答案を3つ提示してください。各案は50〜120文字程度で、提案の狙いがわかる短い題名も付けてください。",
        },
        {
          role: "user",
          content: `会話履歴:\n${conversationTranscript}\n\n最新の顧客発話: ${latestUtterance}\n\nJSON形式で次のキーを持つ"suggestions"配列を返してください。各要素は{\n  "title": string, // 題名\n  "body": string,  // 実際の返答文\n  "tone": "friendly" | "direct" | "empathetic",\n  "confidence": number // 0から1の間\n} で構成されます。`,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAIからコンテンツが返却されませんでした。");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error("generate-script: JSON parse error", error, content);
      throw new Error("LLMのレスポンスをJSONとして解析できませんでした。");
    }

    const suggestions = Array.isArray((parsed as Record<string, unknown>).suggestions)
      ? ((parsed as Record<string, unknown>).suggestions as Record<string, unknown>[])
      : [];

    const normalized = suggestions.slice(0, 3).map((item, index) => ({
      id: `llm-suggestion-${index + 1}`,
      title: typeof item.title === "string" && item.title.trim() ? item.title.trim() : `提案${index + 1}`,
      body: typeof item.body === "string" && item.body.trim() ? item.body.trim() : latestUtterance,
      tone: sanitizeTone(item.tone),
      confidence:
        typeof item.confidence === "number" && Number.isFinite(item.confidence)
          ? Math.min(Math.max(item.confidence, 0.3), 0.95)
          : 0.7,
    }));

    if (!normalized.length) {
      throw new Error("LLMから提案が取得できませんでした。");
    }

    return NextResponse.json({ suggestions: normalized });
  } catch (error) {
    console.error("generate-script: OpenAI error", error);
    return NextResponse.json({ error: "台本生成に失敗しました。" }, { status: 500 });
  }
}
