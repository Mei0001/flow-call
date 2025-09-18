import AudioUpload from "@/components/AudioUpload";
import AnalyticsSummary from "@/components/AnalyticsSummary";
import LearningDataManager from "@/components/LearningDataManager";
import ScriptSuggestionPanel from "@/components/ScriptSuggestionPanel";
import TalkFlowGraph from "@/components/TalkFlowGraph";
import TranscriptionTimeline from "@/components/TranscriptionTimeline";

export default function DashboardPage() {
  return (
    <>
      <section className="flex flex-col gap-6">
        <div className="glass-panel flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-neutral-foreground">会話ログ</h2>
              <p className="text-base text-neutral-muted">リアルタイムで記録された通話内容を振り返ります。</p>
            </div>
            <span className="text-base uppercase tracking-[0.3em] text-neutral-muted">
              Upload &amp; Transcript
            </span>
          </div>
          <AudioUpload />
          <TranscriptionTimeline />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="glass-panel flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-foreground">トークフロー</h2>
              <p className="text-base text-neutral-muted">発話の分岐と推奨トークの流れを俯瞰します。</p>
            </div>
            <div className="flex items-center gap-3 text-base text-neutral-muted">
              <span className="rounded-full border border-neutral-border px-3 py-1 font-semibold text-neutral-foreground">
                アポ成約率 平均 42%
              </span>
              <span className="rounded-full border border-neutral-border px-3 py-1">ホバーで次の語を確認</span>
            </div>
          </div>
          <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-neutral-border bg-surface-muted/20 p-2">
            <TalkFlowGraph />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel flex flex-col gap-6 p-6">
            <h2 className="text-xl font-semibold text-neutral-foreground">次の推奨トーク</h2>
            <ScriptSuggestionPanel />
          </div>
          <div className="glass-panel flex flex-col gap-6 p-6">
            <h2 className="text-xl font-semibold text-neutral-foreground">成果サマリー</h2>
            <AnalyticsSummary />
          </div>
        </div>

        <div className="glass-panel flex flex-col gap-6 p-6">
          <h2 className="text-xl font-semibold text-neutral-foreground">学習データ管理</h2>
          <LearningDataManager />
        </div>
      </section>
    </>
  );
}
