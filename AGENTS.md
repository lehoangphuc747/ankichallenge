# Anki Challenge Vietnam

## Tech Stack
- **Framework**: Astro 5 (output: `server`, SSR via `@astrojs/cloudflare`)
- **UI**: Tailwind CSS v4 + React 18 (`calendar` component)
- **Database**: Cloudflare D1 (`DB` binding: `anki-challenge-db`, SQLite Serverless) + KV (`DATA` fallback)
- **Deploy**: Cloudflare Pages
- **Runtime**: Node.js (dev), Cloudflare Workers (prod)

## Project Structure
```
public/data/          — JSON fallback data (synced from D1/KV via backup-kv.js)
src/pages/            — Astro pages + API endpoints
  index.astro         — Leaderboard (client-side rendered)
  profile/[id].astro  — User profile + certificates
  certificate/[userId]/[challengeId].astro — Certificate viewer + export
  api/data/[key].ts   — D1-backed JSON API (whitelist keys only)
  api/auth/           — Discord OAuth
  admin/              — Admin CRUD pages
  anki-challenge-10.astro — Registration form
src/components/       — Astro + React components
src/utils/            — calculateStats.js, db.ts, kv.ts, session.ts
src/layouts/          — Layout.astro
scripts/              — Node.js scripts (backup-d1, backup-kv, export-certs, migrate-json-to-d1)
migrations/           — D1 SQL migrations (0001_init.sql)
```

## Data Flow
1. **D1 Database** (Cloudflare SQLite): stores tables `users`, `challenges`, `checkins`, `login_history`.
2. **`/api/data/{key}`** reads directly from D1 (fallback to KV / `public/data/*.json` locally), returns format identical to original JSON.
3. **`scripts/backup-d1.js`** / `npm run backup-d1`: exports full SQL dump from D1.
4. **`scripts/backup-kv.js`** / `npm run backup-kv`: syncs D1/KV → local `public/data/*.json` files.
5. All pages fetch data client-side via `/api/data/` endpoints.

## Leaderboard (index.astro)
- Sorted by `disciplinePercentage` descending
- Formula: `round(studyDays / totalDaysPossible * 100)`
- Tie handling: same % = same rank, rank increments on strictly lower %
- Challenge selector dropdown (AC8/9/10 changes records file)
- Search by name/discordNickname, toggle real name vs username

## Certificates
- A4 size (210mm × 297mm), double border design
- 3 Google Fonts: Be Vietnam Pro, Playfair Display, Mrs Saint Delafield
- Export: HTML (standalone), PNG/JPG (html2canvas CDN), PDF (html2pdf.js CDN), Print
- Server-side export (puppeteer): `scripts/export-certs-ch{8,9,10}.js`
- File naming: `{rank}-{slugified-user-name}.png`

## Key Scripts
```
npm run dev           — astro dev (local)
npm run build         — astro build
npm run backup-kv     — Sync KV → local files
npm run export-certs-ch10 — Export certificate PNGs via puppeteer
```

## Discord Check-in Bot
- Slash command `/checkin` lives in `src/pages/api/discord/interact.ts` (Discord interactions webhook endpoint).
- Commands are **guild-scoped only** (not global) to avoid 1-hour cache delay and duplicate `/checkin` entries.
  - Register: `DISCORD_GUILD_ID=867268399687663616 node scripts/deploy-commands.js` (needs `DISCORD_TOKEN`).
  - Server "Anki Việt Nam" guild id `867268399687663616`.
- `/checkin` **only** verifies `discordId` ↔ `users` KV, then writes the record. No thread/channel/role/date-range checks.
- **`challengeIds` in KV are indexes 1/2/3** (1=AC8, 2=AC9, 3=AC10), NOT 8/9/10. `KV_RECORDS = {1:'records_08', 2:'records_09', 3:'records_10'}`.
- KV `users` is wrapped as `{ data: [...] }`; `records_*` are a bare object `{ date: { userId: true } }`.

### Interaction timeout (cold start) — CRITICAL
- Discord requires a response within **3 seconds**; cold starts + sequential KV reads/writes exceed this.
- Fix pattern: reply **`DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE` (type 5) immediately**, run logic in background via `ctx.waitUntil()`, then PATCH the result to
  `https://discord.com/api/v10/webhooks/{application_id}/{interaction_token}/messages/@original`.
- `locals.runtime.ctx` (ExecutionContext) is available in `@astrojs/cloudflare`; use `ctx.waitUntil(promise)`.
- Interaction PATCH webhook calls do **not** need `Authorization`, but MUST include `User-Agent`.

### KV write quota (free plan) — CRITICAL
- Free-plan Cloudflare KV has a **very low daily write (put) limit** (~1,000/day). Exceeding it throws `KV put() limit exceeded for the day.` (surfaces as "/checkin failed").
- Check-in must write KV **as few times as possible** — one `putToKV(records_10)` per check-in. **Do not** re-add audit/log writes (was removed to halve writes).
- Every Discord login writes `login_history`; every login also writes `users` if email changed. Keep write paths lean.
- Quota is **per namespace**, so other namespaces (ankivn's `RATE_LIMIT_KV`, `SESSION_KV`, etc.) do NOT affect the `DATA` namespace.
- Quota resets daily (UTC). To raise limits: upgrade to Workers Paid ($5/mo).

## Deploy quirks (Cloudflare Pages)
- Auto-deploys from GitHub `master` → project `ankichallenge` (`ankichallenge.pages.dev`). Git remote is named **`ankichallenge`** (not `origin`).
- **Pin exact dependency versions** (`"astro": "5.16.6"`, `"@astrojs/cloudflare": "12.6.12"`) and commit `yarn.lock`. Caret ranges let Cloudflare resolve newer packages that pull `undici@8.x` (needs Node ≥22.19) while the build image ships Node 22.16.0 → build fails. `unifont@~0.6.0` avoids `undici@^8`.
- `.node-version` (22.19.0) + `NODE_VERSION` env var do **not** change the Pages build image Node; pinning deps is the reliable fix.
- `scripts/deploy-commands.js` registers guild commands only (requires `DISCORD_GUILD_ID`).
- Build caching can be disabled if a stale dependency cache poisons builds.

## Conventions
- Use `import.meta.env` for env vars
- KV binding: `env.DATA.put(key, JSON.stringify(val))`
- All API routes use `prerender = false`
- Data files in `public/data/` are `.gitignore`d from watch
- Auth via Discord OAuth + JWT session cookies
