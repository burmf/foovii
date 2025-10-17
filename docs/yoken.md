# Foovii 要件定義 v1.0（Software Requirements Specification）

> 方針：**説明・仕様は日本語**、**画面・UIラベル・文言は英語**で統一する。
> スコープはMVP（Phase 1）中心。将来機能はPhase 2/3に区分。

---

## 1. 目的・背景

* Fooviiは**AR × QR ordering SaaS**。来店客はQRから英語UIの注文サイトにアクセス、店舗はWebダッシュボードでリアルタイム管理。
* 初期は**多店舗（multi-tenant）共通基盤**上で店舗テーマ/メニューを切替。

### 目標

* PoC/MVPで**1店舗導入・本番運用**可能な品質。
* デモ〜営業に耐えうる**英語UI**、**高速応答**、**シンプルな注文体験**。

---

## 2. スコープ

### In Scope（MVP / Phase 1）

* Customer Facing（/menu/[storeSlug]）

  * Menu browsing（カテゴリ固定バー、カードグリッド）
  * Item detail modal（サイズ/スパイス/トッピング）
  * Cart（モバイル固定バー、PCは右ドロワー）
  * Checkout（注文レビュー、テーブルNo.入力、特記事項）
  * AR button（`<model-viewer>`で3D表示）※表示のみ
* Staff Dashboard（/staff）

  * Live order feed（新規/調理中/提供/完了）
  * テーブル/ステータス変更、サウンド通知
* Manager View（/manager）

  * 日次/週次売上、人気商品Top、ピーク時間帯
* Multi-tenant

  * storeSlugでテーマ/ロゴ/メニュー切替、RLS前提の権限制御（Phase2で有効化）
* Hosting/Build

  * Next.js + Tailwind、Vercelデプロイ

### Out of Scope（MVP外）

* 決済実運用（Stripe Connect 決済・自動配分）→ Phase 2
* 席決済/割り勘、領収書PDF → Phase 2/3
* POS正式連携、在庫管理 → Phase 2/3

---

## 3. 関係者・ペルソナ

* Guest（来店客）: スマホで英語UIを操作、ARで料理を確認、席からオーダー。
* Staff（ホール/キッチン）: 新規注文の把握、調理・提供ステータス更新。
* Manager/Owner: 売上・回転率・人気商品確認、営業時間/テーマ更新。
* Foovii Admin: 店舗作成、テーマ・権限・料金管理。

---

## 4. ユーザーストーリー（抜粋）

* Guest: “As a guest, I can scan a QR and see **English** menu with photos/AR and add items with options.”
* Staff: “As staff, I can see incoming orders in real time and change status with one click.”
* Manager: “As a manager, I can view daily revenue and best sellers without exporting CSV.”
* Admin: “As an admin, I can onboard a new store by uploading logo/theme/menu JSON.”

---

## 5. 機能要件（Functional Requirements）

### 5.1 Customer（/menu/[storeSlug]）

* **Header**: Store logo/name（英語表記）、Dine-in table indicator、Cart access
* **Category Bar**: Sticky, horizontal scroll, active state保持
* **Menu Grid**: 画像、タイトル、説明、価格、Addボタン
* **Item Modal**: required/optional modifiers、価格差分計算、数量変更
* **Cart**: line items、数量増減、削除、subtotal、notes欄
* **Checkout**: "Review order"→"Place order"、モック成功画面
* **AR Button**: “View in 3D” で `<model-viewer>` 表示（GLB/USDZ）

#### 主要UIラベル（英語固定）

* Buttons: `Add`, `View in AR`, `Review order`, `Place order`, `Remove`
* Sections: `Korean Fried Chicken`, `Tteokbokki`, `Sides`, `Drinks`
* Cart: `Your order`, `Subtotal`, `Notes for kitchen`

### 5.2 Staff（/staff）

* **Board**: Columns {`New`, `In Progress`, `Ready`, `Served`}
* **Ticket**: table、time、items、notes、合計、音通知
* **操作**: ドラッグ&ドロップ or ボタンでステータス遷移

### 5.3 Manager（/manager）

* KPIカード: Revenue（Day/Week）、Orders、AOV、Top 5 Items
* チャート: 時間帯別オーダー

### 5.4 Multi-tenant

* `stores` 設定: name、slug、theme、logo、primaryColor、accentColor
* 店舗ごとメニューJSON: categories[]→items[]→modifiers[]

---

## 6. 非機能要件（Non-Functional）

* **言語**: 画面・文言は英語固定（日本語は管理者資料のみ）
* **パフォーマンス**: LCP < 2.5s（4G想定、Hero画像遅延読み込み）
* **可用性**: Vercelデプロイ、障害時ロールバック
* **セキュリティ**: Phase1は匿名利用、Phase2でAuth/RLS導入
* **拡張性**: Multi-tenant前提、テーマはCSS変数で切替
* **アクセシビリティ**: コントラスト比、キーボード操作、ARIA

---

## 7. データモデル（MVPローカル→将来Supabase）

```ts
// UI用型定義（lib/types.ts）
export interface StoreConfig { id?: number; slug: string; name: string; logo: string; primaryColor: string; accentColor?: string; }
export interface ModifierChoice { id: string; name: string; priceDelta?: number }
export interface Modifier { id: string; name: string; required?: boolean; min?: number; max?: number; type: 'single'|'multi'; choices: ModifierChoice[] }
export interface MenuItem { id: string; name: string; desc?: string; basePrice: number; image?: string; modifiers?: Modifier[] }
export interface Category { id: string; name: string; items: MenuItem[] }
export interface CartLine { key: string; itemId: string; qty: number; chosen: { modId: string; choiceIds: string[] }[]; unitPrice: number }
```

---

## 8. API方針（MVP: Mock / Phase2: 実API）

* **MVP**: `POST /api/orders` はモック（成功レスポンス固定）
* **Phase2**: Supabase SDKで `orders`, `order_items` を作成、Realtimeで配信
* **エンドポイント例**

  * `POST /api/orders` → {orderId}
  * `GET /api/stores/[slug]` → StoreConfig

---

## 9. 画面遷移・状態

* Guest Flow: `Scan QR → /menu/[storeSlug] → Browse → Add → Review → Place order (mock)`
* Staff Flow: `/staff` でリアルタイム更新（MVPはポーリング or メモリ）
* Manager Flow: `/manager` で集計（MVPはダミーデータ）

---

## 10. 受け入れ条件（Acceptance Criteria）

* `/menu/dodam` で英語UIの注文フローが**エラーなし**で最後まで体験できる
* モバイルで**下部固定カート**が動作し、数量増減・削除が可能
* Item Modalで**必須モディファイア未選択時はAdd不可**
* `/staff` で注文が**即時に可視化**（MVPはモック）
* `/manager` でダミー集計が表示

---

## 11. ロードマップ

* **Phase 1（MVP）**: フロント完了、モック注文、簡易スタッフ/集計、英語UI統一
* **Phase 2**: Supabase接続（Auth/RLS/Realtime）、Stripe Connect、CSVエクスポート
* **Phase 3**: POS連携、在庫管理、A/Bテスト、AIレコメンド、マルチ通貨

---

## 12. リスク & 対策

* 画像・3Dモデル最適化不足 → 画像の遅延読込と圧縮、`<model-viewer>`のposter活用
* 店舗ごとの権限/データ漏えい → Phase2でRLS/テナント境界テストを自動化
* 支払いの規約/税 → Stripe Connect + プラットフォーム手数料設計（法務確認）

---

## 13. KPI（初期）

* Conversion Rate（Add→Place）：≥ 25%
* Median TTI（初回操作可能まで）：≤ 2s
* Staff 応答時間（New→In Progress）：≤ 60s

---

## 14. 定義・命名

* 画面文言は**英語固定**。
* 命名規則：ファイル=kebab-case、コンポーネント=PascalCase、変数=camelCase、storeSlug=lowercase-dash。

---

## 15. 付録（UIラベル標準辞書）

* Header: `Dine-in · Table {code}`
* Buttons: `Add`, `View in AR`, `Review order`, `Place order`, `Remove`, `Clear`
* Status: `New`, `In Progress`, `Ready`, `Served`
* Messages: `Your cart is empty.`, `Required option missing.`
