"""Composite transparent renders onto the website background and export web assets.

  python visualization/scripts/composite.py IN.png OUT_BASENAME [--bg 7,9,10]
      [--vignette 0.0..1] [--glow x,y,r,strength] [--widths 2400,1600,960] [--master]

Writes OUT_BASENAME-<width>.webp (+ .avif when Pillow supports it) and,
with --master, OUT_BASENAME-master.png (lossless, full resolution).

The shadow catcher alpha carries contact shadows; compositing in sRGB over
the exact CSS background colour makes renders sit seamlessly on the page.
"""
import argparse
import os

from PIL import Image, ImageDraw, ImageFilter, features


def parse():
    p = argparse.ArgumentParser()
    p.add_argument("src")
    p.add_argument("out")
    p.add_argument("--bg", default="7,9,10")
    p.add_argument("--vignette", type=float, default=0.0)
    p.add_argument("--glow", default="", help="x,y,radius,strength (fractions of width/height)")
    p.add_argument("--widths", default="2400,1600,960")
    p.add_argument("--quality", type=int, default=82)
    p.add_argument("--master", action="store_true")
    p.add_argument("--transparent", action="store_true", help="keep alpha instead of compositing")
    return p.parse_args()


def background(size, bg, glow, vignette):
    w, h = size
    base = Image.new("RGB", size, bg)
    if glow:
        gx, gy, gr, gs = [float(v) for v in glow.split(",")]
        layer = Image.new("L", size, 0)
        d = ImageDraw.Draw(layer)
        r = gr * w
        d.ellipse([gx * w - r, gy * h - r, gx * w + r, gy * h + r], fill=int(255 * gs))
        layer = layer.filter(ImageFilter.GaussianBlur(r * 0.45))
        lift = Image.new("RGB", size, (26, 31, 34))
        base = Image.composite(lift, base, layer)
    if vignette > 0:
        mask = Image.new("L", size, 0)
        d = ImageDraw.Draw(mask)
        d.ellipse([-w * 0.15, -h * 0.25, w * 1.15, h * 1.25], fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) * 0.2))
        dark = Image.new("RGB", size, tuple(max(0, c - 5) for c in bg))
        base = Image.composite(base, dark, mask) if vignette else base
    return base


def main():
    a = parse()
    src = Image.open(a.src)
    if src.mode == "I;16" or src.mode.startswith("I"):
        src = src.convert("RGBA")
    src = src.convert("RGBA")
    bg = tuple(int(v) for v in a.bg.split(","))
    if a.transparent:
        out = src
    else:
        base = background(src.size, bg, a.glow, a.vignette).convert("RGBA")
        out = Image.alpha_composite(base, src).convert("RGB")

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    if a.master:
        out.save(f"{a.out}-master.png", optimize=True)
    avif = features.check("avif")
    for w in [int(x) for x in a.widths.split(",") if x]:
        if w > out.width:
            continue
        h = round(out.height * w / out.width)
        im = out.resize((w, h), Image.LANCZOS)
        im.save(f"{a.out}-{w}.webp", "WEBP", quality=a.quality, method=6)
        if avif:
            im.save(f"{a.out}-{w}.avif", "AVIF", quality=max(40, a.quality - 22), speed=4)
        print(f"wrote {a.out}-{w}.webp{' + avif' if avif else ''} ({w}x{h})")


if __name__ == "__main__":
    main()
