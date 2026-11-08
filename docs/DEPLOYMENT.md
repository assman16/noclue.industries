# Deployment — Coolify on a self-hosted VPS

The app is a single Docker image (Next.js standalone server with Payload CMS embedded)
plus PostgreSQL, with imagery and CMS uploads in a self-hosted **Garage** S3 bucket
(separate Coolify resource, see [STORAGE.md](STORAGE.md)). Nothing depends on Vercel or
a managed service.

> Imagery is not in the repository. A fresh deployment shows no renders or photos until
> Garage is set up, the files are uploaded and `ASSET_URL` is configured (STORAGE.md §1–4).

## 1. Create the resource in Coolify

Recommended: **Docker Compose** resource pointing at this repository, using
`docker-compose.yml`.

1. *New resource → Docker Compose → (your Git source)*, compose file `docker-compose.yml`.
2. On the **app** service set the domain `https://noclue.industries` (and optionally
   `https://www.noclue.industries` with a redirect). Coolify's Traefik proxy terminates
   HTTPS with Let's Encrypt and forwards to port 3000. Do **not** publish ports yourself.
3. Leave the **db** service without a domain. It has no published ports and only joins
   the private `internal` network, so PostgreSQL is not reachable from the internet.
4. Set the environment variables (below) and deploy.

Alternative: deploy the `Dockerfile` as an *Application* and attach a separate Coolify
PostgreSQL resource (private network, no public port). Then set `DATABASE_URL` to its
internal connection string and add a persistent storage mount at `/app/media`.

## 2. Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | yes | `https://noclue.industries` — also a **build** argument (inlined at build time) |
| `POSTGRES_PASSWORD` | yes | long random string; used by `db` and in `DATABASE_URL` |
| `PAYLOAD_SECRET` | yes | `openssl rand -hex 32`. Changing it logs everyone out |
| `INQUIRY_IP_SALT` | yes | `openssl rand -hex 16`. Salt for hashing visitor IPs |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | optional | Inquiry notification email. Without them, inquiries are still stored and marked *Email not configured* |
| `SMTP_FROM_ADDRESS`, `SMTP_FROM_NAME` | optional | Sender. Use a domain with SPF/DKIM set up for your SMTP provider |
| `INQUIRY_NOTIFY_TO` | optional | Comma-separated recipients (overridden by *Site settings → Notify emails*) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | optional | Enables Cloudflare Turnstile on the form. **Update the privacy notice** if you enable it |
| `SITE_INDEXABLE` | optional | `false` on a staging domain to disallow indexing |
| `ASSET_URL` | yes* | Public base of the asset bucket, e.g. `https://assets.noclue.industries`. Read at runtime |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION` | yes* | Garage S3 API + key (`nci-app`). Enables CMS uploads to S3. Region defaults to `garage` |

\* Required for imagery and S3 uploads. Without the `S3_*` variables, uploads fall back to the `media` volume.

Mark secrets as *secret* in Coolify. Never commit `.env`.

## 3. First start

On boot the server:

1. connects to PostgreSQL,
2. applies pending migrations from `src/migrations` (`prodMigrations`),
3. starts serving. `/healthz` returns 200 only when the database answers.

Then:

```bash
# seed initial content (idempotent; never overwrites edits)
docker compose --profile tools run --rm tools pnpm seed
```

In Coolify you can run this from the server terminal in the project directory, or
temporarily switch the command. Afterwards open `https://noclue.industries/admin` and
**create the first user immediately** (it becomes the administrator).

## 4. Health checks and logs

- Docker `HEALTHCHECK` and the compose `healthcheck` call `GET /healthz` (DB round-trip).
- Configure the same path as Coolify's health check for zero-downtime rolling deploys.
- Logs go to stdout/stderr (json-file driver, rotated: 10 MB × 5). Server errors are logged
  with a `[data]`, `[inquiry]` or `[healthz]` prefix. Visitors see a generic error page.

## 5. Persistent data

| Volume | Mounted at | Contains |
|---|---|---|
| `pgdata` | `/var/lib/postgresql/data` (db) | all CMS content, inquiries, users |
| `media` | `/app/media` (app) | uploads **only when S3 is not configured** (fallback) |
| `garage-meta`, `garage-data` | Garage resource | all imagery and CMS uploads, the private source archive |

Renders, photography and the exploded-view sequence live in the Garage bucket (`pnpm
assets:upload`). Fonts, logos and the OG image are part of the image (`public/`).

## 6. Backups and restore

Back up **both** the database and the media volume.

```bash
# database (run on the VPS, from the compose project directory)
docker compose exec -T db pg_dump -U noclue -Fc noclue_industries > nci-$(date +%F).dump

# media
docker run --rm -v <project>_media:/m -v "$PWD":/b alpine tar czf /b/nci-media-$(date +%F).tgz -C /m .
```

Coolify can also schedule PostgreSQL backups to S3-compatible storage for database
resources. Keep copies off the VPS.

Restore:

```bash
docker compose exec -T db pg_restore -U noclue -d noclue_industries --clean --if-exists < nci-YYYY-MM-DD.dump
docker run --rm -v <project>_media:/m -v "$PWD":/b alpine sh -c "cd /m && tar xzf /b/nci-media-YYYY-MM-DD.tgz"
```

Test a restore on a staging stack at least once.

## 7. Security notes

- PostgreSQL: no published ports, private network only, strong password.
- Admin: Payload auth with 5-attempt lockout (15 min), 8-hour sessions, secure + SameSite=Lax
  cookies in production, roles (*admin* / *editor*). Public API: create/update/delete is denied
  for anonymous users on all collections; inquiries cannot be read or created through the API.
- **Recommended network restriction for `/admin`:** in Coolify, add Traefik middleware to
  allow `/admin` only from your IPs or behind basic auth / Cloudflare Access, e.g. labels on `app`:
  ```
  traefik.http.middlewares.nci-admin-ip.ipallowlist.sourcerange=203.0.113.10/32
  traefik.http.routers.<router>-admin.rule=Host(`noclue.industries`) && PathPrefix(`/admin`)
  traefik.http.routers.<router>-admin.middlewares=nci-admin-ip
  ```
  (`/api/users/login` is used by the admin; restrict `/api/users` the same way if desired.)
- Security headers (HSTS, nosniff, frame-options, referrer-policy, permissions-policy) are set in
  `next.config.ts`.
- Inquiry form: server-side validation, honeypot, signed timing token, per-IP and global rate
  limits (in-memory, single instance), optional Turnstile. IPs are stored only as salted hashes.
- The in-memory rate limiter and cache assume **one app container**. If you scale out, move
  rate limiting to Redis and use a shared Next.js cache handler.

## 8. Proxy / HTTPS details

- The app trusts `X-Forwarded-For` from the proxy for rate limiting; only expose it through
  Coolify's proxy.
- `NEXT_PUBLIC_SERVER_URL` must match the public HTTPS origin — Payload uses it for CORS/CSRF
  and the site for canonical URLs, sitemap and Open Graph.

## 9. Updating

Push to the tracked branch → Coolify builds the image → the new container applies
migrations on boot → health check passes → traffic switches. Roll back by redeploying the
previous image (migrations are additive by default; review any destructive migration
before deploying).
