# Object storage: Garage (S3) for imagery and CMS uploads

Heavy imagery is **not in git**. It lives in a [Garage](https://garagehq.deuxfleurs.fr/) S3
bucket on the VPS, which Garage also serves publicly as a static website:

| Bucket | Public? | Contents | Written by |
|---|---|---|---|
| `assets.noclue.industries` | yes (Garage web endpoint = `ASSET_URL`) | `renders/…`, `photography/…`, `sequences/…` (versioned, immutable cache) · `media/…` (CMS uploads) | `pnpm assets:upload` · Payload (`@payloadcms/storage-s3`) |
| `nci-source` | **no** | `visualization/renders/…` (Blender masters, `.blend` scenes), `website-assets/…` (GLB, photo originals) | `pnpm assets:upload --source` |

How the app uses it:

- **Site imagery.** Everything in `src/content/renders.ts`, `photography.ts` and the assembly
  sequence is requested from `ASSET_URL` (read at runtime). Without `ASSET_URL` the site falls back
  to `/public/...` (local development).
- **CMS uploads.** When the `S3_*` variables are set, Payload writes every upload and its generated
  sizes to `s3://<S3_BUCKET>/media/`. The files' URLs point at `ASSET_URL/media/...`, so they are
  served by Garage, not proxied through the app (media is public by design). Without `S3_*`,
  uploads stay on the `MEDIA_DIR` volume.
- **The seed** (`pnpm seed`) fetches its source images from `ASSET_URL` when they are not on disk,
  which is the normal case inside a production container.

Tested locally end to end with Garage v2.5.0: upload script, idempotent re-run, public serving with
cache headers, private source bucket not served, CMS create (original + sizes in `media/`), and
delete (all objects removed).

---

## 1 · Deploy Garage on Coolify

1. **New resource:** Coolify → *New Resource* → *Docker Compose* (or *Git* → this repo). Use
   `deploy/garage/docker-compose.yml`.
2. **Environment** (mark each as secret):
   ```
   GARAGE_RPC_SECRET=$(openssl rand -hex 32)
   GARAGE_ADMIN_TOKEN=$(openssl rand -base64 32)
   GARAGE_METRICS_TOKEN=$(openssl rand -base64 32)
   ```
3. **Domains** for the `garage` service:
   - `https://s3.noclue.industries:3900`: the S3 API
   - `https://assets.noclue.industries:3902`: the public web endpoint

   Create the DNS A records for both. Do **not** give 3901 (RPC) or 3903 (admin) a domain.
4. **Deploy.** Data persists in the `garage-meta` / `garage-data` volumes. Back them up like the
   database volume.

## 2 · Initialise the cluster (once)

Open a terminal on the Garage container (Coolify → *Terminal*, or `docker exec -it <container> sh`
is **not** available because the image has no shell). Run the binary directly:

```bash
docker exec <garage-container> /garage status                     # note the node ID
docker exec <garage-container> /garage layout assign -z dc1 -c 50G <node-id>
docker exec <garage-container> /garage layout apply --version 1

# buckets
docker exec <garage-container> /garage bucket create assets.noclue.industries
docker exec <garage-container> /garage bucket create nci-source
docker exec <garage-container> /garage bucket website --allow assets.noclue.industries

# key for the website (app + CMS uploads): public bucket only
docker exec <garage-container> /garage key create nci-app
docker exec <garage-container> /garage bucket allow --read --write assets.noclue.industries --key nci-app

# key for the upload script: both buckets
docker exec <garage-container> /garage key create nci-uploader
docker exec <garage-container> /garage bucket allow --read --write assets.noclue.industries --key nci-uploader
docker exec <garage-container> /garage bucket allow --read --write nci-source --key nci-uploader
```

`key create` prints the **Key ID** and the **Secret key** once. Store them in your password manager.

Why the bucket is named after the domain: Garage's web endpoint picks the bucket from the `Host`
header, so `assets.noclue.industries` serves the bucket of the same name. Size the layout
capacity (`-c`) to the disk you want Garage to use.

## 3 · Configure the website (Coolify → app → Environment)

```
ASSET_URL=https://assets.noclue.industries
S3_ENDPOINT=https://s3.noclue.industries
S3_REGION=garage
S3_BUCKET=assets.noclue.industries
S3_ACCESS_KEY_ID=<nci-app key id>
S3_SECRET_ACCESS_KEY=<nci-app secret>      # secret
```

Redeploy. On boot the app applies the `media_storage` migration (it adds `prefix` / `_objectKey`
to `media`). The app refuses to start in production if `S3_*` is set but `ASSET_URL` is not.

## 4 · Upload the imagery from this machine

The images exist only on the workstation now: `public/renders`, `public/photography`,
`public/sequences`, the local CMS `media/` folder and the Blender sources. In `.env` or the shell:

```
S3_ENDPOINT=https://s3.noclue.industries
S3_BUCKET=assets.noclue.industries
S3_SOURCE_BUCKET=nci-source
S3_ACCESS_KEY_ID=<nci-uploader key id>
S3_SECRET_ACCESS_KEY=<nci-uploader secret>
```

```bash
pnpm assets:upload --dry-run      # see what would go up
pnpm assets:upload --source       # web assets + local CMS media + private source archive
pnpm assets:upload                # later: only re-sends files whose MD5 changed
pnpm assets:upload --only renders # one group: renders | photography | sequences | media | source
```

Check: `https://assets.noclue.industries/renders/v2/sa100-plan-960.webp` loads in a browser.

## 5 · Fill the production CMS

In the tools container (it inherits the `S3_*` / `ASSET_URL` settings):

```bash
docker compose --profile tools run --rm tools pnpm seed
```

On a fresh database this creates the content, and its media go straight into `s3://…/media/`.
On a database that already has edited content, see the warning about `SEED_FORCE=1` in
`docs/REVIEW.md`.

**Recommended order:** 1 → 2 → 4 (upload) → 3 (app env + redeploy) → 5 (seed). Until step 3, a
deployment of `main` has no imagery, because the files are no longer in the repository.

---

## Adding or changing imagery

- **Renders:** `python visualization/scripts/export_web.py`, then `pnpm assets:upload`. If the
  content of an image changes, bump the version folder (`RENDER_VERSION` / `RENDER_BASE`); objects
  are cached as immutable.
- **Photography:** `python visualization/scripts/grade_photos.py`, then `pnpm assets:upload --only photography`.
- **CMS:** just upload in `/admin`. It goes to S3 automatically.

## Local test

```bash
docker compose -f docker-compose.dev.yml --profile s3 up -d
# then step 2 against the local container (bucket name: assets.localhost, layout -c 10G)
```

Use `ASSET_URL=http://assets.localhost:3902` and `S3_ENDPOINT=http://127.0.0.1:3900` with the
keys you created. Browsers resolve `*.localhost` to loopback, so the web endpoint works without
hosts-file edits.
