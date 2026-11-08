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

# Board-layer colours (linear RGB). Kept faithful to the KiCad export.
BOARD_COLORS = {
    "soldermask": (0.016, 0.085, 0.040),
    "fr4": (0.30, 0.28, 0.16),
    "silkscreen": (0.86, 0.85, 0.80),
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
        lights=rig_technical(),
        resolution=(2400, 2116),
        preset="still",
    ),
    # Isometric-style view for capabilities / archive cards.
    "iso": dict(
        camera=CameraSpec(target=(0, -0.004, 0.0), distance=0.9, azimuth=-38, elevation=35.264, ortho_scale=0.285),
        lights=rig_technical(),
        resolution=(2400, 1800),
        preset="still",
    ),
}
