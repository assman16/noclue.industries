# Items to confirm before launch

These could not be verified from the repository, the supplied assets or noclue.studio.
Nothing below was invented on the site — where information was missing, it was left out.

## Operator & legal

- [ ] **Operator details** were taken from noclue.studio (privacy policy + footer):
      Sapfir Research & Development s. r. o., Záhradná 953/19, 900 24 Veľký Biel,
      IČO 56 275 188, DIČ 2122265519, OR MS Bratislava III, odd. Sro, vl. č. 178856/B.
      Confirm they are current. No IČ DPH is shown (none was published) — add it in
      *Site settings → Operator* if the company is VAT-registered.
- [ ] **Contact email**: the site uses `info@noclue.studio` (verified on noclue.studio).
      If you set up `info@noclue.industries`, change it in *Site settings* **and** in the
      privacy/legal pages.
- [ ] **Privacy notice** (Pages → privacy) is written for this site's actual processing
      (no analytics, inquiry storage, optional SMTP). Have it reviewed, and update it if you
      enable Turnstile, analytics, or a specific SMTP provider outside the EU.
      Server-log retention is described generically — state your actual retention if you
      want to be specific.
- [ ] **Terms of business**: noclue.studio publishes *Obchodné podmienky*; no terms were
      created for Industries (none were provided). Add a Pages entry if you need them.
- [ ] **Slovak-language versions** of legal pages, if you want them for Slovak clients.

## SA-100 archive entry

Everything published comes from the design files (KiCad GLB/SVG, silkscreen). Please confirm:

- [ ] **Status**: set to *In design · Revision 3.0*. If boards have been fabricated or are in
      the field, change the status (the asset name `sa100-fabricated-board-top.png` suggests
      fabrication, but that file is itself a render, so it was not treated as proof).
- [ ] **Relationship to SAPFIR**: the board carries the SAPFIR brand. The site does not name a
      client. Add *Client* only if you want it shown.
- [ ] **Firmware**: not claimed for SA-100. If NoClue Industries wrote it, add
      *Firmware* to disciplines and a line to *Work performed*.
- [ ] **Subtitle** "Field interface board with Wi-Fi and cellular connectivity" — derived from
      the terminal legends and the ESP32-S3 / A7670G parts. Adjust if you describe it differently.
- [ ] **Year** — not set.
- [ ] Some 3D parts in the KiCad export are *approximate envelopes* (A7670G, nanoSIM socket,
      JST, MF-R300). Renders show them as exported; macro shots avoid featuring them.

## Capabilities

- [ ] **3D printing / 3D scanning**: listed as capabilities (from the brief) **without** an
      "in-house" label, because ownership of the equipment wasn't confirmed. If you print/scan
      in-house, set *Delivery: In-house* on those items in *Disciplines*.
- [ ] Response time: no promise is shown. Set *Site settings → Response time* only if you can keep it.

## Technical / operations

- [ ] SMTP credentials (notifications are tested only up to "not configured" — see below).
- [ ] Restrict `/admin` at the proxy (see DEPLOYMENT.md §7).
- [ ] Re-export the SA-100 GLB **with copper tracks** (KiCad 3D export option) if you'd like
      traces visible in renders — the current export has pads, mask and silkscreen only.
- [ ] Domain DNS for noclue.industries → VPS; Coolify domain + Let's Encrypt.
- [ ] Create the first admin account immediately after the first deploy.
