"use client";

import { FormEvent, useState } from "react";
import { useConversation } from "@/app/providers";

export default function ManualConversationInput() {
  const { addCustomerUtterance, isGeneratingScript } = useConversation();
  const [customerInput, setCustomerInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = customerInput.trim();
    if (!trimmed) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addCustomerUtterance(trimmed);
      setCustomerInput("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-neutral-border bg-white p-5"
    >
      <div>
        <h3 className="text-lg font-semibold text-neutral-foreground">相手からの返答を記録</h3>
        <p className="mt-1 text-base text-neutral-muted">
          通話相手の発話を入力すると、会話ログに追加され次の推奨トークが自動生成されます。
        </p>
      </div>

      <label className="flex flex-col gap-2 text-base text-neutral-foreground">
        顧客の発話内容
        <textarea
          value={customerInput}
          onChange={(event) => setCustomerInput(event.target.value)}
          rows={4}
          placeholder="例: 詳しい資料があればメールで送ってください。"
          className="rounded-2xl border border-neutral-border bg-black/5 px-4 py-3 text-base text-neutral-foreground focus:border-black focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-base text-neutral-muted">
          追加後、右側のトークフローに候補矢印が表示されます。
        </span>
        <button
          type="submit"
          className="rounded-full bg-black px-6 py-2 text-base font-semibold text-white shadow-card transition hover:opacity-80 disabled:opacity-60"
          disabled={isSubmitting || isGeneratingScript || !customerInput.trim()}
        >
          {isSubmitting || isGeneratingScript ? "生成中..." : "顧客発話を追加"}
        </button>
      </div>
    </form>
  );
}
