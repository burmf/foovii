# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` contains the three Next.js routes we ship today: `menu/[storeSlug]`, `staff`, `manager`, and the `/api/orders` mock.
- Guest ordering UI lives under `src/components/menu/`; staff and manager dashboards live in `src/components/staff/` と `src/components/manager/`。
- Tenant fixtures stay in `stores/*.json`; Supabase schema / SQL lives in `supabase/sql/`; docs are grouped inside `docs/` (SRS is `docs/yoken.md`).
- Shared helpers: `src/lib/` (types, Supabase menu loader, Stripe placeholder) and `config/.env.example` for environment samples.

## Build, Test, and Development Commands
- `pnpm install` — resolve dependencies.
- `pnpm dev` — launch the combined Next.js dev server (menu + dashboards)。
- `pnpm build` — production build with lint + type checks.
- `pnpm lint` / `pnpm format` / `pnpm format:write` — lint or format the codebase (Prettier は `.ts/.tsx/.json/.md` を対象)。
- `pnpm sync:supabase dodam --upload-assets` — stores JSON → Supabase への同期 + 画像アップロード。
- Playwright / Vitest などの追加テストは未整備; 導入時は `tests/` ディレクトリに配置。

## Coding Style & Naming Conventions
- TypeScript + Tailwind。2-space indent, semicolons ON, double quotes enforced by Prettier。
- Component filesは `PascalCase.tsx`; utility / hooks は `camelCase.ts`; route セグメントは Next.js 規約どおり。
- Tailwind クラスはレイアウト → スペース → 色の順で並べること。テーマカラーは `store.theme` を CSS variables として注入。
- UI文言は英語、ドキュメント（リポジトリ内説明）も英語。コミットメッセージは英語 + Conventional Commits。

## Testing Guidelines
- まだ自動テストは未導入。今後追加する際は UI コンポーネント横に `__tests__` を作成し、Playwright は `tests/e2e/` に配置する方針。
- `/api/orders` はモックなのでネットワークテストより UI レベルの確認を重視。
- Supabase と連携するコードは環境変数が無い状態でもフォールバックで動作することを確認すること。

## Commit & Pull Request Guidelines
- Conventional Commits (`feat:`, `fix:`, `chore:`...) を維持。件名 72 文字以下。
- 変更内容 / 動作確認コマンド / 影響ルート（例: `/menu/dodam`）を PR 説明に記載。
- スクリーンショットや Loom は UI 改修時に添付。Supabase マイグレーションは適用手順も忘れずに追記。
- `main` をリベース、CI（lint / build）をパスさせてからマージ。

## Environment & Security Notes
- `.env.local` はコミット禁止。Supabase 鍵は secure vault 経由で共有。
- `config/.env.example` をコピーし、`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET` をセット。
- Supabase RLS は常に有効化しておき、テストのために RLS を無効化した場合は `docs/changelog.md` に記録。
- 画像は `pnpm sync:supabase <slug> --upload-assets` で Storage へ同期し、Public URL が露出する点に留意（顧客向け URL の取り扱いに注意）。
