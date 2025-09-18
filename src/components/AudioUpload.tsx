"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useConversation } from "@/app/providers";

export default function AudioUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { transcribeAudio, isTranscribing } = useConversation();
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!/(mp3|wav|m4a|aac)$/i.test(file.name)) {
      setErrorMessage("mp3 / wav / m4a / aac の音声ファイルを選択してください");
      return;
    }

    setErrorMessage("");
    setFileName(file.name);

    try {
      await transcribeAudio(file);
    } catch (error) {
      console.error(error);
      setErrorMessage("文字起こし処理中にエラーが発生しました");
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-border bg-surface-muted/60 p-4">
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-neutral-muted">
          録音済みの通話データをアップロードすると、自動で文字起こしと台本生成が実行されます。
        </p>
        <div className="flex w-full items-center justify-between gap-4 rounded-xl bg-surface px-4 py-3">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-muted">
              File Selected
            </span>
            <span className="text-sm text-neutral-foreground">
              {fileName || "未選択"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSelectFile}
            className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-brand-foreground shadow-card transition hover:bg-brand-strong"
            disabled={isTranscribing}
          >
            {isTranscribing ? "処理中..." : "音声を選択"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
          {errorMessage}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="rounded-xl bg-brand-subtle px-3 py-2 text-xs text-neutral-muted">
        デモ用に `demo-call.wav` を使用すると、フローチャートが自動で更新されます。
      </p>
    </div>
  );
}
