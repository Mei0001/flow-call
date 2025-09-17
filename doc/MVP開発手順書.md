# アウトバウンドコールセンターMVP 開発手順書

本手順書は要件定義書（`要件定義書.md`）を基に、Next.js（App Router）でMVPを構築するための実施ステップをまとめたものです。

## 1. 環境準備
1. Node.js 18.17 以上と npm / pnpm のバージョンを確認。
2. プロジェクトルートで `npx create-next-app@latest` を実行し、以下オプションを選択：
   - TypeScript: はい
   - ESLint: はい
   - Tailwind CSS: はい
   - App Router: はい
   - 実験的機能: いいえ
3. セットアップ後、`npm run dev` で初期画面が起動することを確認。

## 2. 依存関係・スタイル設定
1. 追加ライブラリを導入：
   ```bash
   npm install react-flow openai crypto-js
   ```
2. `tailwind.config.ts` にカラーやフォントなど共通トークンを設定し、`src/styles/globals.css` へベーススタイルを追加。
3. `postcss.config.mjs` / `tailwind.config.ts` が正しく参照するようパスを調整。

## 3. App Router レイアウト構成
1. `app/layout.tsx` で全体レイアウト・メタデータ・グローバル CSS を設定。
2. `app/(dashboard)/layout.tsx` を作成し、3 カラムのグリッドレイアウトを定義。
3. `app/(dashboard)/page.tsx` を作成し、チャット・フロー・サイドパネルを配置。
4. `app/providers.tsx` を作成し、コンテキストプロバイダ（会話状態 / 学習データ）をラップする。

## 4. コンポーネント実装
`src/components/` に以下コンポーネントを分割実装。
- `AudioUpload`（Client）：音声アップロード UI & FormData 送信
- `TranscriptionTimeline`（Client）：会話ブロックのチャット表示
- `ScriptSuggestionPanel`（Client）：台本候補・代替案を表示
- `TalkFlowGraph`（Client）：`react-flow` でフローチャート表示
- `AnalyticsSummary`（Server/Client）：成果指標を集計表示
- `LearningDataManager`（Client）：成功パターン抽出 UI
必要箇所に `use client` を付与。

## 5. API Route Handler
1. `app/api/transcribe/route.ts`：POST で音声ファイルを受け取り、Whisper API へ連携し文字起こし結果を返す。
2. `app/api/generate-script/route.ts`：POST で最新トークブロックを受け取り、LLM から台本生成。
3. `app/api/analyze/route.ts`：GET/POST で成果指標を計算し返却。
4. `app/api/learning/route.ts`：POST で成功パターンを蓄積。
5. API では `.env.local` のキーを参照し、レスポンスは `NextResponse.json()` を利用（Next.js App Router ガイド参照）。

## 6. サービス層・型定義
1. `src/lib/services/` に音声→テキスト、台本生成、分析、学習処理のモジュールを作成。
2. `fetch` は用途に応じて `cache: 'no-store'` や `next: { revalidate }` を設定（App Router データ取得ガイド参照）。
3. `src/types/` に要件定義の `Conversation`, `TalkBlock`, `LearningData` を TypeScript 型として定義。
4. ローカル保存は暗号化付きのブラウザストレージ（`crypto-js`）を利用し、コンテキスト経由で UI に反映。

## 7. ダミーデータ・テスト
1. `seed/` にサンプル会話データと音声ファイル（またはモック）を配置。
2. `npm run dev` で画面の動作を確認し、音声アップロード → 文字起こし → 台本生成 → フロー更新が行えることを手動テスト。
3. 可能であれば React Testing Library でコンポーネント単位テストを追加。

## 8. 運用メモ
- API キーは `.env.local` に保存し、Git 管理対象外にする。
- Whisper/GPT 呼び出しのタイムアウト・リトライ制御をサービス層に実装。
- KPI（成功率、平均応答時間）集計結果をロギングし、将来の分析・ダッシュボードに備える。

