"""Export render masters to optimised website assets.

  python visualization/scripts/export_web.py            # stills + sequence + OG image
  python visualization/scripts/export_web.py --only stills|sequence|og

Stills    visualization/renders/**.png → public/renders/v1/<name>-<w>.{avif,webp}
          + lossless masters kept in visualization/renders (not shipped)
Sequence  visualization/renders/da01/seq/*.png → public/sequences/da01/v1/<w>/da01-NNN.webp
OG        public/og/noclue-industries-og.jpg (1200x630, hero render + logo)

All images are composited over the site background (#07090A), so they sit
seamlessly on the page without alpha.
"""
import argparse
import glob
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from composite import background  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
R = os.path.join(ROOT, "visualization", "renders")
PUB = os.path.join(ROOT, "public")
BG = (7, 9, 10)

STILLS = [
    ("sa100/sa100-hero.png", "sa100-hero"),
    ("sa100/sa100-detail.png", "sa100-detail"),
    ("sa100/sa100-soic.png", "sa100-soic"),
    ("sa100/sa100-terminals.png", "sa100-terminals"),
    ("sa100/sa100-top.png", "sa100-top"),
    ("sa100/sa100-iso.png", "sa100-iso"),
    ("da01/da01-assembled.png", "da01-assembled"),
    ("da01/da01-exploded.png", "da01-exploded"),
    ("da01/da01-detail-screw.png", "da01-detail-screw"),
    ("da01/da01-detail-gasket.png", "da01-detail-gasket"),
]
WIDTHS = (960, 1600, 2400)
SEQ_WIDTHS = (720, 1280, 1600)


def flatten(path):
    im = Image.open(path).convert("RGBA")
    base = background(im.size, BG, "", 0).convert("RGBA")
    return Image.alpha_composite(base, im).convert("RGB")


def export_stills():
    out = os.path.join(PUB, "renders", "v1")
    os.makedirs(out, exist_ok=True)
    for rel, name in STILLS:
        src = os.path.join(R, rel)
        if not os.path.exists(src):
            print("skip (missing)", rel)
            continue
        im = flatten(src)
        for w in WIDTHS:
            h = round(im.height * w / im.width)
            r = im.resize((w, h), Image.LANCZOS) if w != im.width else im
            r.save(os.path.join(out, f"{name}-{w}.webp"), "WEBP", quality=80, method=6)
            r.save(os.path.join(out, f"{name}-{w}.avif"), "AVIF", quality=58, speed=4)
        print("still", name, im.size)


def export_sequence():
    frames = sorted(glob.glob(os.path.join(R, "da01", "seq", "da01-*.png")))
    if not frames:
        print("no sequence frames found")
        return
    for w in SEQ_WIDTHS:
        os.makedirs(os.path.join(PUB, "sequences", "da01", "v1", str(w)), exist_ok=True)
    total = {w: 0 for w in SEQ_WIDTHS}
    for f in frames:
        im = flatten(f)
        name = os.path.splitext(os.path.basename(f))[0]
        for w in SEQ_WIDTHS:
            h = round(im.height * w / im.width)
            p = os.path.join(PUB, "sequences", "da01", "v1", str(w), f"{name}.webp")
            im.resize((w, h), Image.LANCZOS).save(p, "WEBP", quality=72 if w > 1000 else 70, method=6)
            total[w] += os.path.getsize(p)
    for w, b in total.items():
        print(f"sequence {w}w: {len(frames)} frames, {b / 1e6:.1f} MB total")


def export_og():
    src = os.path.join(R, "sa100", "sa100-hero.png")
    if not os.path.exists(src):
        return
    im = flatten(src)
    W, H = 1200, 630
    scale = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left = (im.width - W) // 2 + int(W * 0.12)
    left = min(left, im.width - W)
    im = im.crop((left, (im.height - H) // 2, left + W, (im.height - H) // 2 + H))
    logo = Image.open(os.path.join(PUB, "brand", "logo-master.png")).convert("RGBA")
    lw = 520
    logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    canvas = im.convert("RGBA")
    shade = Image.linear_gradient("L").rotate(90).resize((W, H))
    dark = Image.new("RGBA", (W, H), (*BG, 255))
    canvas = Image.composite(canvas, dark, shade.point(lambda v: min(255, int(v * 1.6))))
    canvas.alpha_composite(logo, (64, H - logo.height - 64))
    os.makedirs(os.path.join(PUB, "og"), exist_ok=True)
    canvas.convert("RGB").save(os.path.join(PUB, "og", "noclue-industries-og.jpg"), quality=86, optimize=True, progressive=True)
    print("og image written")


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--only", default="")
    only = a.parse_args().only
    if only in ("", "stills"):
        export_stills()
    if only in ("", "sequence"):
        export_sequence()
    if only in ("", "og"):
        export_og()
