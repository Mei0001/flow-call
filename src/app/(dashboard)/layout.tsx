import type { ReactNode } from "react";

const LAST_UPDATED_LABEL = "01:36";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <div className="min-h-screen bg-canvas/95">
      <div className="mx-auto flex min-h-screen w-full max-w-container flex-col gap-10 px-gutter py-10">
        <header className="flex flex-col gap-2 text-neutral-foreground">
          <span className="section-title">FlowCall Dashboard</span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-foreground">
              リアルタイム台本生成オペレーション
            </h1>
            <div className="flex gap-3 text-sm text-neutral-muted">
              <span>最終更新: {LAST_UPDATED_LABEL}</span>
              <span>会話ID: FC-2024-09-001</span>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-[minmax(320px,_2fr)_minmax(420px,_3fr)_minmax(280px,_1.6fr)] gap-gutter pb-10">
          {children}
        </div>
      </div>
    </div>
  );
}
