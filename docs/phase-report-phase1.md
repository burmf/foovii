# Phase 1 Report — Customer Ordering MVP

- **期間**: 2025-10-01 〜 2025-11-01
- **作成日**: 2025-11-01
- **担当**: Foovii Core Team

## 概要
Phase 1 (MVP) は顧客向けオーダー UI と店舗オペレーション向けダッシュボードのプロトタイプ完成を目標に進行した。Next.js ベースの UI と Supabase 連携の準備が完了し、主要フローはローカルデータで動作検証済み。

## 完了した主な項目
- プロジェクト初期化: Next.js + Tailwind + shadcn/ui の導入とディレクトリ構成の整備。
- 顧客 UI: `/menu/[storeSlug]/` のレイアウト、テーマ切替、カート管理、注文モーダル、成功/失敗トーストの実装。
- 店舗 UI: `/staff/` カンバンと `/manager/` ダッシュボードの主要コンポーネント、履歴フィルター、モーダル群。
- Supabase 準備: メニュー同期スクリプト、注文スキーマ (`supabase/sql/orders-schema.sql`)、シードスクリプトのドラフト作成。
- ドキュメント: `docs/todo.md`、`docs/AGENTS.md` の最新化とワークフロー定義。

## 進行中 / 未完了
- Supabase への実データ移行とダッシュボード集計の接続。
- Vercel 連携およびパフォーマンス検証 (Lighthouse、主要ブラウザ手動 QA)。
- リアルタイム更新 (Supabase Realtime) と Stripe 決済統合は Phase 2 へ持ち越し。
- PWA 対応、画像最適化、Phase Report の定期更新体制。

## リスク・課題
- Supabase 認証情報が `.env.local` に残存し公開リポジトリへ流出するリスクがあった。ファイルは削除済みだが、鍵のローテーションと秘密管理体制の再確認が必要。
- Supabase 連携機能が未接続のため、ダッシュボード数値と実データの乖離が発生し得る。

## 次のステップ
1. Supabase へメニュー/注文データを適用し、`scripts/apply-orders-schema.ts` と `scripts/seed-sample-orders.ts` をドキュメント化して運用ラインに載せる。
2. `/manager/` と `/staff/` のデータ取得を Supabase ビューへ切り替え、Realtime 更新を検証。
3. Vercel との接続と自動デプロイ、Lighthouse 計測、主要ブラウザ QA を完了し、デモ URL を確定。
4. 画像最適化と PWA 対応の検討を進め、Phase 2 の Stripe / Realtime 実装計画をアップデートする。
