# TODO — Foovii Development To-Do (Initial Setup)

> 状況：Foovii の構想・要件定義は完了、実装は未着手。  
> 目的：Phase 1 (MVP) を最短で形にするための優先タスク一覧。  
> 言語ポリシー：ドキュメント/開発指示＝日本語、UI テキスト＝英語。

---

## 🏁 0. プロジェクト環境の初期化
- [x] Create new Next.js project with TypeScript + Tailwind  
  ```bash
  npx create-next-app@latest foovii --typescript --tailwind
  ```
- [x] Setup shadcn/ui（UI components）  
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] GitHub リポジトリ作成・Vercel 接続
- [x] `README.md` に英語UI前提の概要と要件定義リンクを追記

## 🧩 1. ディレクトリ構成の準備
- [x] 下記フォルダを作成し、ベースとなる空ファイルを用意
  ```
  app/
    menu/[storeSlug]/
    staff/
    manager/
    api/orders/
  components/
    menu/
    order/
  lib/
    types.ts
    getStoreConfig.ts
  stores/
    dodam.json
    soy38.json
  public/
    logos/
    menu-images/
  ```
- [x] Tailwind config にテーマカラー変数（`--theme-color`）を追加
- [x] `globals.css` に共通フォントとベーススタイルを定義

## 🍱 2. `/menu/[storeSlug]/`（顧客用 UI）
- [x] ページレイアウト構築（Header / Category bar / Menu grid）
- [x] `data.ts` にダミーメニューを実装 ※実際は `stores/dodam.json` / `stores/soy38.json` で管理
- [x] `MenuItemCard.tsx`（写真・説明・価格・Add ボタン）作成
- [x] DODAM メニューにローカル画像パスを紐付け
- [x] 下部固定 `CartBar` コンポーネントを追加
- [x] カート状態を `useContext` で管理し数量更新を可能にする
- [x] Add クリック時に商品詳細モーダル（Dialog）を表示
- [x] `Place order` で `/api/orders` のモック API を呼び出す

## 🧠 3. マルチテナント対応（MVP 範囲）
- [x] `stores/{slug}.json` を `getStoreConfig(slug)` で読み込み
- [x] Header やテーマカラーへ反映
- [x] `/menu/dodam`・`/menu/soy38` などの URL パターンを確認
- [ ] Supabase DB へ移行（`menu_categories` / `menu_items` と Storage バケット整備）
- [x] Supabase メニュー同期スクリプト（`scripts/sync-supabase-menu.ts`）を追加
- [x] Supabase メニュー取得時にローカル画像メタデータへフォールバック
- [x] Supabase スキーマ DDL（`supabase/sql/menu-schema.sql`）のポリシー／トリガーを整理

## 🧑‍🍳 4. `/staff/`（店舗スタッフ用）
- [x] カンバン UI（New / In Progress / Ready / Served）を実装
- [x] ダミー注文データを 3〜5 件生成
- [x] カラム内操作でステータス変更（クリック式）を実装
- [ ] Phase 2 で Supabase Realtime を導入予定

## 📊 5. `/manager/`（店舗マネージャー用）
- [x] KPI カード（Revenue, Orders, Avg Order Value）を静的値で表示
- [x] Recharts で時間別オーダーグラフを描画
- [ ] Phase 2 で Supabase 集計データへ接続

## ⚙️ 6. `/api/orders/`（MVP モック）
- [ ] `POST` 受信時にペイロードをログ
- [ ] 固定成功レスポンスを返却  
  ```json
  { "orderId": "mock123", "status": "ok" }
  ```
- [ ] Phase 2 で Supabase `orders` テーブル保存に置き換え

## 💳 7. Stripe（Phase 2 プレースホルダ）
- [ ] `lib/stripe.ts` を作成し SDK を読み込む
- [ ] モック用チェックアウト関数を定義
- [ ] 実決済は Phase 2 で有効化

## 🧠 8. 非機能系設定
- [ ] ESLint / Prettier を導入しフォーマッターを統一
- [ ] `env.example` を作成（Phase 2 で鍵追加予定）
- [ ] PWA 化の検討（Add to Home Screen 対応）
- [ ] 画像圧縮と Lazy Load 設定で Lighthouse 指標を改善

## 🚀 9. デプロイ・テスト
- [ ] Vercel に接続して `main` ブランチを自動デプロイ
- [ ] Lighthouse でパフォーマンス計測（LCP < 2.5s）
- [ ] iPhone Safari / Android Chrome / Mac Chrome で UI を手動確認
- [ ] Demo URL: `https://foovii-demo.vercel.app/menu/dodam`（仮）

## 🧾 10. ドキュメント
- [ ] `docs/AGENTS.md`（AI 支援開発ガイド）を最新化
- [ ] `docs/yoken`（SRS）および本 `docs/todo.md` をリポジトリ直下から参照可能にする
- [ ] 仕様変更は `docs/changelog.md` へ追記
- [ ] 各フェーズ完了時に「Phase Report」を作成
- [x] `docs/dodam-menu.md` に DODAM オンラインメニューを記録する（2025-10-17）

## ✅ 11. MVP 完了条件
- [ ] `/menu/dodam` が英語 UI で正常動作
- [ ] 商品追加 → カート → 注文モック完了まで完走
- [ ] `/staff` に注文が（ダミーでも）反映される
- [ ] `/manager` にダミー集計が表示される
- [ ] デモ URL を営業・PoC に提示可能

## 💡 12. 次フェーズ To-Be（参考）
- Supabase Auth / RLS / Realtime 導入
- Stripe Connect 連携
- 店舗作成 UI（Admin Portal）
- POS / 在庫連携 API
- AI レコメンド（顧客履歴ベース）

---

この `docs/todo.md` を進行管理テンプレートにして日付欄などを追加したい場合は、別途テンプレート版を作成してください。
