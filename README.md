# NoClue Industries — noclue.industries

Website and CMS for **NoClue Industries**, the hardware engineering counterpart to
[NoClue Studio](https://noclue.studio): electronics, firmware, mechanical CAD and prototyping.

| | |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, CSS Modules |
| CMS | Payload CMS 3 (integrated in the same Next.js app, admin at `/admin`) |
| Database | PostgreSQL 17 |
| Hosting | Self-hosted Docker on a Linux VPS via Coolify (no Vercel features) |
| Visuals | Blender 4.5 LTS / Cycles pipeline in [`visualization/`](visualization/README.md) |

Further documentation:

- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Coolify setup, environment, migrations, backups, security
- [docs/DESIGN.md](docs/DESIGN.md) — creative direction, design system, key technical decisions
- [docs/REVIEW.md](docs/REVIEW.md) — **items that need your confirmation before launch**
- [visualization/README.md](visualization/README.md) — the reusable Blender rendering pipeline

---

## Local development

Requirements: Node ≥ 22.23 or ≥ 24.22, pnpm 11, Docker (for PostgreSQL).

```bash
cp .env.example .env               # then set PAYLOAD_SECRET and INQUIRY_IP_SALT
docker compose -f docker-compose.dev.yml up -d   # PostgreSQL on 127.0.0.1:5433
pnpm install
pnpm seed                          # creates schema (dev push) + initial content
pnpm dev                           # http://localhost:3000, admin at /admin
```

The first account created at `/admin` becomes an administrator.

### Useful scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server (Payload pushes schema changes automatically in dev) |
| `pnpm build` / `pnpm start` | Production build / server |
| `pnpm lint` · `pnpm typecheck` | ESLint · TypeScript |
| `pnpm seed` | Insert missing initial content (never overwrites edits) |
| `SEED_FORCE=1 pnpm seed` | Reset globals, disciplines, legal pages and SA-100 entry to defaults |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after changing collections |
| `pnpm migrate:create <name>` | Create a migration after schema changes (commit it!) |
| `pnpm migrate` | Apply pending migrations (production does this automatically on boot) |

### Schema changes — the safe workflow

1. Change a collection/global in `src/collections` or `src/globals`.
2. `pnpm generate:types` and `pnpm migrate:create describe-the-change`.
3. Review the generated SQL in `src/migrations/`, commit it with the code.
4. Deploy. The production server runs pending migrations on start-up
   (`prodMigrations` in `src/payload.config.ts`) before serving traffic.

Dev uses schema *push*; production never does (`push` is disabled when `NODE_ENV=production`).

---

## Project structure

```
src/
  app/(frontend)/        public site: home, capabilities, archive, contact, [slug] pages
  app/(payload)/         Payload admin + REST API (generated, do not edit)
  app/healthz/           health probe (checks PostgreSQL)
  app/sitemap.ts, robots.ts
  collections/           Projects, Services, Pages, Media, Inquiries, Users
  globals/               Home (homepage copy), SiteSettings (contact, operator, SEO)
  components/            UI components (CSS Modules)
  content/               defaults + fallbacks, legal texts, render + photography manifests, form options
  lib/                   data layer (cached CMS queries), SEO, inquiry handling
  migrations/            PostgreSQL migrations (committed)
  styles/globals.css     design tokens + base styles
public/
  renders/v2/            AVIF/WebP renders (immutable cache — bump folder on re-render; v2 = black SA-100)
  photography/v1/        licensed, graded editorial photography (see website-assets/photography/MANIFEST.md)
  sequences/da02/v1/     DA-02 exploded-assembly frame sequence (720/1280/1920 px)
  sequences/da01/v1/     v1 DA-01 sequence (kept, not shown)
  brand/                 logo variants (derived from the supplied PNG, unaltered)
  fonts/                 self-hosted Saira + JetBrains Mono (OFL)
visualization/           Blender pipeline: libs, configs, scripts, .blend scenes, masters
scripts/seed.ts          initial content
```

## Content editing

Everything routine is editable in `/admin`:

- **Homepage** (global) — hero lines, section titles, process steps and "why" points (shown on /capabilities), assembly copy, contact intro
- **Disciplines** — the four services, their capabilities (with optional *in-house* / *via partners* label) and deliverables
- **Engineering archive** — projects with drafts/versions, auto reference numbers (`NCI-A-0001…`),
  status, disciplines, gallery, verified technical data and key components
- **Pages** — privacy notice, legal information, any future text page (served at `/<slug>`)
- **Media** — every image is labelled *render / photo / CAD / drawing / diagram* on the site
- **Inquiries** — leads from the form, with status, internal notes and email-delivery status
- **Site settings** — contact details, notification recipients, operator data, SEO defaults

Edits appear on the site immediately (tag-based cache revalidation); no rebuild needed.

## Languages

English only for now. The CMS is configured with Payload localization (`en`), and all
text fields are localized. To add Slovak: add the locale in `src/payload.config.ts`,
translate in the admin, then add locale routing (e.g. `/sk/...`) in the frontend.
