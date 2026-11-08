"""Grade licensed editorial photography into the NoClue Industries house look.

  python visualization/scripts/grade_photos.py

Sources   website-assets/photography/originals/*.jpg   (licences: website-assets/photography/MANIFEST.md)
Output    public/photography/v1/<name>-<w>.{avif,webp}

House look ("cold steel"): crushed blacks that meet the page background (#07090A),
partial desaturation, cool shadows / neutral highlights, gentle S-curve, edge
falloff into the page colour and a fine monochrome grain, so ten photographs
by ten different people read as one campaign. One image is printed as a
signal-orange duotone for the orange colour-field section.

Grading is a creative treatment of the photographs (permitted by the Unsplash
License). It is never applied to NoClue renders, which are shown as rendered.
"""
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "website-assets", "photography", "originals")
OUT = os.path.join(ROOT, "public", "photography", "v1")
WIDTHS = (960, 1600, 2400)
BG = np.array([7, 9, 10], dtype=np.float32) / 255.0
SIGNAL = np.array([255, 90, 31], dtype=np.float32) / 255.0

# name: (source, crop box in fractions l,t,r,b, look, saturation, exposure, vignette)
PHOTOS = {
    "endmill": ("ph01-endmill-aluminium.jpg", (0.0, 0.0, 1.0, 1.0), "steel", 0.30, 0.95, 0.55),
    "facemill": ("ph02-facemill.jpg", (0.0, 0.0, 1.0, 1.0), "steel", 0.25, 0.92, 0.55),
    "sparks": ("ph03-laser-sparks.jpg", (0.0, 0.0, 1.0, 0.86), "duotone", 0.0, 1.05, 0.35),  # crop removes maker's mark
    "ring": ("ph04-machined-ring.jpg", (0.0, 0.0, 1.0, 1.0), "mono", 0.0, 1.0, 0.25),
    "pcb-pads": ("ph05-pcb-pads.jpg", (0.0, 0.0, 1.0, 1.0), "steel", 0.42, 0.92, 0.55),
    "pcb-crystal": ("ph06-pcb-crystal.jpg", (0.0, 0.0, 1.0, 1.0), "steel", 0.30, 1.0, 0.45),
    "pocket": ("ph07-machined-pocket.jpg", (0.0, 0.0, 1.0, 1.0), "steel", 0.40, 0.88, 0.55),
    "balls": ("ph08-steel-balls.jpg", (0.0, 0.0, 1.0, 1.0), "mono", 0.0, 0.95, 0.45),
    "printer": ("ph09-printer-hex.jpg", (0.0, 0.0, 1.0, 0.76), "steel", 0.20, 1.1, 0.40),  # crop removes a blurred label
    "gearbox": ("ph10-gearbox-cutaway.jpg", (0.0, 0.0, 1.0, 1.0), "steel", 0.30, 0.85, 0.60),
}


def s_curve(x, amount=0.18):
    return np.clip(x + amount * (x - 0.5) * (1 - np.abs(2 * x - 1)) * 2, 0, 1)


def grade(im: Image.Image, look: str, sat: float, exposure: float, vignette: float, seed: int) -> Image.Image:
    a = np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0
    lin = a ** 2.2
    lum = (0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]) ** (1 / 2.2)
    lum = lum[..., None]
    if look == "steel":
        x = lum + (a - lum) * sat
        x = x * exposure
        x = s_curve(np.clip((x - 0.035) / 0.965, 0, 1), 0.16)  # crush blacks slightly
        cool = np.array([0.93, 0.985, 1.04], dtype=np.float32)  # cool shadows, neutral highlights
        w = (1 - lum) ** 2
        x = x * (cool * w + (1 - w))
    elif look == "mono":
        x = s_curve(np.clip((lum * exposure - 0.03) / 0.97, 0, 1), 0.2)
        x = np.repeat(x, 3, axis=-1) * np.array([0.985, 1.0, 1.015], dtype=np.float32)
    elif look == "duotone":
        t = s_curve(np.clip(lum * exposure, 0, 1), 0.25)
        lo = t / 0.55
        hi = (t - 0.55) / 0.45
        x = np.where(t < 0.55, BG + (SIGNAL - BG) * np.clip(lo, 0, 1),
                     SIGNAL + (np.array([1.0, 0.93, 0.86]) - SIGNAL) * np.clip(hi, 0, 1))
        x = x.astype(np.float32)
    else:
        raise ValueError(look)

    h, w_ = x.shape[:2]
    if vignette > 0:
        yy, xx = np.mgrid[0:h, 0:w_].astype(np.float32)
        d = np.sqrt(((xx / w_ - 0.5) / 0.62) ** 2 + ((yy / h - 0.5) / 0.62) ** 2)
        fall = np.clip((d - 0.55) / 0.5, 0, 1) ** 1.6 * vignette
        x = x * (1 - fall[..., None]) + BG * fall[..., None]
    x = np.maximum(x, BG * 0.9)  # never darker than the page: photos meet the background
    rng = np.random.default_rng(seed)
    grain = rng.normal(0, 0.012, size=(h, w_, 1)).astype(np.float32)
    x = np.clip(x + grain * (0.4 + 0.6 * (1 - lum)), 0, 1)
    return Image.fromarray((x * 255 + 0.5).astype(np.uint8))


def main():
    os.makedirs(OUT, exist_ok=True)
    meta = {}
    for i, (name, (src, box, look, sat, exp, vig)) in enumerate(PHOTOS.items()):
        im = Image.open(os.path.join(SRC, src))
        W, H = im.size
        im = im.crop((round(box[0] * W), round(box[1] * H), round(box[2] * W), round(box[3] * H)))
        g = grade(im, look, sat, exp, vig, seed=i)
        for w in WIDTHS:
            if w > g.width:
                continue
            h = round(g.height * w / g.width)
            r = g.resize((w, h), Image.LANCZOS)
            r.save(os.path.join(OUT, f"{name}-{w}.webp"), "WEBP", quality=78, method=6)
            r.save(os.path.join(OUT, f"{name}-{w}.avif"), "AVIF", quality=55, speed=4)
        meta[name] = (g.width, g.height)
        print(f"{name}: {g.width}x{g.height} ({look})")
    return meta


if __name__ == "__main__":
    main()
