"""Derive web variants of the supplied NoClue Industries logo (raster PNG).

The logo is NOT redrawn or altered: variants are trimmed, resized copies.
The favicon is a crop of the existing "noclue" mark (top-left of the logo).

  python visualization/scripts/prepare_brand_assets.py
"""
import os
import shutil

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "White noclue Industries Logo.png")
OUT = os.path.join(ROOT, "public", "brand")
os.makedirs(OUT, exist_ok=True)

logo = Image.open(SRC).convert("RGBA")
bbox = logo.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
trimmed = logo.crop(bbox)
trimmed.save(os.path.join(OUT, "logo-master.png"), optimize=True)
print("trimmed", trimmed.size, "from", logo.size)

for w in (200, 320, 480, 640):
    h = round(trimmed.height * w / trimmed.width)
    im = trimmed.resize((w, h), Image.LANCZOS)
    im.save(os.path.join(OUT, f"logo-{w}.webp"), "WEBP", quality=90, method=6)
    im.save(os.path.join(OUT, f"logo-{w}.png"), optimize=True)
    print("logo", w, h)

# Favicon: the "noclue" mark occupies the left ~28% / top ~55% of the trimmed logo.
mw, mh = trimmed.size
mark = trimmed.crop((0, 0, int(mw * 0.285), int(mh * 0.56)))
mb = mark.getchannel("A").point(lambda a: 255 if a > 40 else 0).getbbox()
mark = mark.crop(mb)
side = int(max(mark.size) * 1.22)
for size, name in ((512, "icon-512.png"), (180, "apple-touch-icon.png"), (48, "favicon-48.png"), (32, "favicon-32.png")):
    canvas = Image.new("RGBA", (side, side), (7, 9, 10, 255))
    canvas.alpha_composite(mark, ((side - mark.width) // 2, (side - mark.height) // 2))
    canvas.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)
canvas = Image.new("RGBA", (side, side), (7, 9, 10, 255))
canvas.alpha_composite(mark, ((side - mark.width) // 2, (side - mark.height) // 2))
canvas.resize((48, 48), Image.LANCZOS).save(os.path.join(ROOT, "src", "app", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
shutil.copy(os.path.join(OUT, "icon-512.png"), os.path.join(ROOT, "src", "app", "icon.png"))
shutil.copy(os.path.join(OUT, "apple-touch-icon.png"), os.path.join(ROOT, "src", "app", "apple-icon.png"))
print("icons written")
