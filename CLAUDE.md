# Anki Challenge Vietnam

## Tech Stack
- **Framework**: Astro 5 (output: `server`, SSR via `@astrojs/cloudflare`)
- **UI**: Tailwind CSS v4 + React 18 (`calendar` component)
- **Deploy**: Cloudflare Pages + KV (namespace `DATA`)
- **Runtime**: Node.js (dev), Cloudflare Workers (prod)

## Project Structure
```
public/data/          — JSON fallback data (synced from KV via backup-kv.js)
src/pages/            — Astro pages + API endpoints
  index.astro         — Leaderboard (client-side rendered)
  profile/[id].astro  — User profile + certificates
  certificate/[userId]/[challengeId].astro — Certificate viewer + export
  api/data/[key].ts   — KV-backed JSON API (whitelist keys only)
  api/auth/           — Discord OAuth
  admin/              — Admin CRUD pages
  anki-challenge-10.astro — Registration form
src/components/       — Astro + React components
src/utils/            — calculateStats.js, kv.ts, session.ts
src/layouts/          — Layout.astro
scripts/              — Node.js scripts (backup-kv, export-certs, fetch-data)
```

## Data Flow
1. **KV** (Cloudflare) stores: `users`, `challenges`, `records_08/09/10`, `metadata`
2. **`/api/data/{key}`** reads from KV, falls back to `public/data/*.json` locally
3. **`scripts/backup-kv.js`** syncs KV → local files via live site API
4. All pages fetch data client-side via `/api/data/` endpoints

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

## Conventions
- Use `import.meta.env` for env vars
- KV binding: `env.DATA.put(key, JSON.stringify(val))`
- All API routes use `prerender = false`
- Data files in `public/data/` are `.gitignore`d from watch
- Auth via Discord OAuth + JWT session cookies
