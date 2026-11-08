"""Shot configuration for the SA-100 board (rev 3.0).

Coordinates are in metres, board centred on the origin, top copper at z≈0.0016.
Board outline: 170 x 150 mm (X x Y). Field terminals run along the -Y edge.

To adapt for another board, copy this file, point MODEL at the new GLB and
re-aim the cameras. Everything else (materials, lights, compositing) is shared.
"""
from nci_studio import CameraSpec, LightSpec

MODEL = "website-assets/SA100/sa100.glb"
NAME = "sa100"
BOARD_TOP = 0.0016

# Board-layer finish (linear RGB). The SA-100 is specified with BLACK soldermask
# and WHITE silkscreen (the KiCad glTF export carries KiCad's default green, which
# is not the intended finish). Changed at material level - never in post.
BOARD_COLORS = {
    "soldermask": (0.0045, 0.0050, 0.0056),   # black LPI mask
    "soldermask_finish": "satin",              # satin/semi-gloss: keeps the board readable on near-black
    "fr4": (0.30, 0.28, 0.16),                 # exposed laminate on the board edge
    "silkscreen": (0.90, 0.90, 0.88),          # white epoxy ink
}

# Website background (#07090A) - renders are composited onto it.
BACKGROUND_SRGB = (7, 9, 10)

# ---------------------------------------------------------------------------
# Lighting rigs
# ---------------------------------------------------------------------------

def rig_dramatic(scale: float = 0.05):
    """Low-key product lighting: big soft top-back key for glossy sheen,
    cool strip rim from the left, faint warm kicker from the right."""
    s = scale
    return [
        LightSpec("Key_TopBack", (0.05, 0.42, 0.40), (0, -0.02, 0), energy=95 * s, size=(0.55, 0.30)),
        LightSpec("Rim_Left", (-0.40, 0.05, 0.10), (0, 0, 0.005), energy=26 * s, size=(0.05, 0.60), color=(0.85, 0.92, 1.0)),
        LightSpec("Kick_Right", (0.42, -0.08, 0.06), (0, 0, 0.005), energy=8 * s, size=(0.04, 0.40), color=(1.0, 0.82, 0.66)),
        LightSpec("Fill_Front", (0.0, -0.55, 0.22), (0, -0.04, 0), energy=4 * s, size=(0.8, 0.2), visible_glossy=False),
    ]


def rig_hero(scale: float = 0.05):
    """rig_dramatic + a long grazing strip behind the board: a bright sheen line
    travels across the soldermask and catches every component edge."""
    s = scale
    return rig_dramatic(scale) + [
        LightSpec("Graze_Back", (0.10, 0.34, 0.035), (-0.02, -0.02, 0.0), energy=70 * s, size=(0.70, 0.012), color=(0.92, 0.96, 1.0)),
        LightSpec("Signal_Kick", (-0.30, -0.22, 0.03), (0, -0.05, 0.008), energy=6 * s, size=(0.03, 0.25), color=(1.0, 0.45, 0.18), visible_glossy=True),
    ]


def rig_technical(scale: float = 0.05):
    """Even, high-key-ish lighting for orthographic and isometric views."""
    s = scale
    return [
        LightSpec("Top_Soft", (0.0, 0.0, 0.70), (0, 0, 0), energy=60 * s, size=(0.9, 0.9), visible_glossy=False),
        LightSpec("Sheen_Back", (0.0, 0.50, 0.45), (0, 0, 0), energy=40 * s, size=(0.9, 0.18)),
        LightSpec("Side_Left", (-0.55, -0.1, 0.25), (0, 0, 0), energy=12 * s, size=(0.1, 0.6), color=(0.88, 0.93, 1.0)),
    ]


def rig_technical_black(scale: float = 0.05):
    """Technical rig for black soldermask: the big overhead softbox is allowed to
    reflect, so the satin mask reads as a dark-graphite plate (how a black board
    photographs on a light tent) and the white silkscreen stays crisp."""
    s = scale
    return [
        LightSpec("Top_Soft", (0.0, -0.10, 0.70), (0, 0, 0), energy=46 * s, size=(1.1, 1.1), visible_glossy=True),
        LightSpec("Sheen_Back", (0.0, 0.50, 0.45), (0, 0, 0), energy=34 * s, size=(0.9, 0.18)),
        LightSpec("Side_Left", (-0.55, -0.1, 0.25), (0, 0, 0), energy=14 * s, size=(0.1, 0.6), color=(0.88, 0.93, 1.0)),
    ]


def rig_cinematic(scale: float = 0.05):
    """Campaign lighting for a black board on black: one long overhead strip whose
    reflection sweeps across the mask, a hard cold rim that draws the board edge
    and every component silhouette, and a narrow signal-orange kicker low on the
    opposite side (reflects in metal cans and pins only)."""
    s = scale
    return [
        LightSpec("Strip_Over", (0.0, 0.26, 0.30), (0.0, -0.02, 0.0), energy=120 * s, size=(0.9, 0.035), color=(0.95, 0.97, 1.0)),
        LightSpec("Rim_Cold", (-0.36, 0.20, 0.035), (0.0, 0.0, 0.004), energy=60 * s, size=(0.02, 0.55), color=(0.82, 0.90, 1.0)),
        LightSpec("Kick_Signal", (0.34, -0.26, 0.025), (0.0, -0.03, 0.006), energy=16 * s, size=(0.015, 0.30), color=(1.0, 0.40, 0.12)),
        LightSpec("Fill_Low", (0.0, -0.6, 0.10), (0, -0.04, 0), energy=2.0 * s, size=(0.9, 0.2), visible_glossy=False),
    ]


def rig_raking(scale: float = 0.05):
    """Plan-view drama: a single low raking softbox from the left throws every
    component's relief into long shadows; a broad overhead strip lays one diagonal
    sheen across the mask."""
    s = scale
    return [
        LightSpec("Rake_Left", (-0.45, 0.05, 0.06), (0.0, 0.0, 0.0), energy=70 * s, size=(0.06, 0.7), color=(0.96, 0.98, 1.0)),
        LightSpec("Sheen_Diag", (0.12, 0.30, 0.42), (0.0, 0.0, 0.0), energy=36 * s, size=(1.0, 0.06)),
        LightSpec("Kick_Signal", (0.40, -0.30, 0.03), (0.0, 0.0, 0.004), energy=10 * s, size=(0.02, 0.4), color=(1.0, 0.40, 0.12)),
    ]


def rig_macro(scale: float = 0.05):
    s = scale
    return [
        LightSpec("Key_Macro", (-0.10, 0.18, 0.16), (0.03, -0.06, 0.004), energy=28 * s, size=(0.20, 0.08)),
        LightSpec("Rim_Macro", (0.25, -0.02, 0.05), (0.03, -0.06, 0.004), energy=10 * s, size=(0.03, 0.25), color=(0.85, 0.92, 1.0)),
        LightSpec("Fill_Macro", (0.0, -0.40, 0.12), (0.03, -0.06, 0.0), energy=2.5 * s, size=(0.4, 0.15), visible_glossy=False),
    ]


# ---------------------------------------------------------------------------
# Shots
# ---------------------------------------------------------------------------

SHOTS = {
    # Homepage hero: low front-right view, board on the right, darkness on the left
    # for the headline. Focus on the terminal row closest to camera.
    "hero": dict(
        camera=CameraSpec(target=(0.0, -0.01, 0.004), distance=0.37, azimuth=57, elevation=19, lens=50, fstop=5.6,
                          focus=(0.06, -0.02, 0.006), shift_x=-0.16, shift_y=0.03),
        lights=rig_hero(),
        resolution=(2400, 1350),
        preset="still",
    ),
    # Alternative hero: reverse angle, MCU + USB-C in the foreground.
    "hero_b": dict(
        camera=CameraSpec(target=(0.0, 0.0, 0.004), distance=0.40, azimuth=-128, elevation=20, lens=50, fstop=5.6,
                          focus=(0.06, 0.05, 0.004), shift_x=-0.15, shift_y=0.03),
        lights=rig_dramatic(),
        resolution=(2400, 1350),
        preset="still",
    ),
    # Macro: ESP32-S3 module castellations, USB-C receptacle and passives (real footprints).
    "detail": dict(
        camera=CameraSpec(target=(0.058, 0.050, 0.003), distance=0.13, azimuth=-40, elevation=22, lens=100, fstop=8.0),
        lights=rig_macro(),
        resolution=(2400, 1600),
        preset="still",
    ),
    # Macro: SOIC rows on the input side.
    "soic": dict(
        camera=CameraSpec(target=(-0.055, 0.0, 0.002), distance=0.15, azimuth=150, elevation=34, lens=100, fstop=7.0),
        lights=rig_macro(),
        resolution=(2400, 1600),
        preset="still",
    ),
    # Macro on the field terminals (spring clamps).
    "terminals": dict(
        camera=CameraSpec(target=(-0.035, -0.066, 0.008), distance=0.19, azimuth=-22, elevation=16, lens=100, fstop=5.6,
                          focus=(-0.048, -0.068, 0.010)),
        lights=rig_macro(),
        resolution=(2400, 1600),
        preset="still",
    ),
    # Orthographic top view (technical plate).
    "top": dict(
        camera=CameraSpec(target=(0, 0, 0), distance=0.6, azimuth=0, elevation=90, ortho_scale=0.205),
        lights=rig_technical_black(),
        resolution=(2400, 2116),
        preset="still",
    ),
    # Isometric-style view for capabilities / archive cards.
    "iso": dict(
        camera=CameraSpec(target=(0, -0.004, 0.0), distance=0.9, azimuth=-38, elevation=35.264, ortho_scale=0.285),
        lights=rig_technical_black(),
        resolution=(2400, 1800),
        preset="still",
    ),

    # --- Campaign shots (v2) -------------------------------------------------
    # The rear-right corner (ESP32-S3 module, USB-C) cutting into empty black on two
    # sides; the overhead strip lays a sheen along the mask toward the corner.
    "cine_corner": dict(
        camera=CameraSpec(target=(0.062, 0.050, 0.002), distance=0.21, azimuth=128, elevation=33, lens=85, roll=-14,
                          fstop=3.2, focus=(0.066, 0.058, 0.004), shift_x=-0.12, shift_y=-0.04),
        lights=rig_cinematic(),
        resolution=(2400, 1350),
        preset="still",
    ),
    # Near-plan view, board rotated across the frame, raking light.
    "plan_raking": dict(
        camera=CameraSpec(target=(0.012, 0.0, 0.0), distance=0.40, azimuth=8, elevation=74, lens=50, roll=24,
                          fstop=4.0, focus=(0.0, -0.02, 0.004)),
        lights=rig_raking(),
        resolution=(2400, 1350),
        preset="still",
    ),
    # Macro on the maker's mark in the silkscreen (noclue.industries / rev 3.0).
    "macro_mark": dict(
        camera=CameraSpec(target=(-0.066, 0.064, 0.0016), distance=0.075, azimuth=-24, elevation=38, lens=100,
                          fstop=4.0),
        lights=rig_macro(0.032),
        resolution=(2400, 1600),
        preset="still",
    ),
}
