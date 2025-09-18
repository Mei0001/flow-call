import AudioUpload from "@/components/AudioUpload";
import AnalyticsSummary from "@/components/AnalyticsSummary";
import LearningDataManager from "@/components/LearningDataManager";
import ScriptSuggestionPanel from "@/components/ScriptSuggestionPanel";
import TalkFlowGraph from "@/components/TalkFlowGraph";
import TranscriptionTimeline from "@/components/TranscriptionTimeline";

export default function DashboardPage() {
  return (
    <>
      <section className="glass-panel flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-foreground">
            会話ログ
          </h2>
          <span className="text-xs uppercase tracking-[0.3em] text-neutral-muted">
            Upload &amp; Transcript
          </span>
        </div>
        <AudioUpload />
        <TranscriptionTimeline />
      </section>

      <section className="glass-panel flex h-full flex-col overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-foreground">
            トークフロー
          </h2>
          <span className="text-xs uppercase tracking-[0.3em] text-neutral-muted">
            Conversation Graph
          </span>
        </div>
        <div className="mt-6 h-full min-h-[420px] rounded-2xl border border-neutral-border bg-surface-muted/60 p-2">
          <TalkFlowGraph />
        </div>
      </section>

      <section className="flex h-full flex-col gap-6">
        <div className="glass-panel flex flex-col gap-6 p-6">
          <h2 className="text-xl font-semibold text-neutral-foreground">
            次の推奨トーク
          </h2>
          <ScriptSuggestionPanel />
        </div>
        <div className="glass-panel flex flex-col gap-6 p-6">
          <h2 className="text-xl font-semibold text-neutral-foreground">
            成果サマリー
          </h2>
          <AnalyticsSummary />
        </div>
        <div className="glass-panel flex flex-col gap-6 p-6">
          <h2 className="text-xl font-semibold text-neutral-foreground">
            学習データ管理
          </h2>
          <LearningDataManager />
        </div>
      </section>
    </>
  );
}
