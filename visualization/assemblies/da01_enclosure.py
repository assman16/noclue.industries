"""DA-01 — demonstration assembly: sealed electronics enclosure.

An ORIGINAL procedural model built to demonstrate NoClue Industries' mechanical
visualisation pipeline. It is not a client project, not a product, and not a
production-validated design. The PCB carries the silkscreen text
"DEMONSTRATION BOARD" so the renders cannot be mistaken for real hardware.

Design intent (all dimensions mm):
  Base      120 x 80 x 30, R8 corners, 5 mm walls, 4 mm floor, 2 x 1 mm gasket groove
  Bosses    4x Ø10 corner bosses with Ø2.5 tapped holes (M3) for the lid
  Standoffs 4x M3 hex brass, 10 mm, board holes on a 90 x 50 mm pattern
  Board     100 x 60 x 1.6, R2 corners
  Gasket    1.8 mm square-section silicone, 0.8 mm compression under the lid
  Lid       120 x 80 x 5, counterbored for M3 x 12 ISO 4762 cap screws
  Window    38 x 14 x 1.5 glass in a stepped recess
  Gland     M12 cable gland through the -X wall

Usage (from the repository root):
  blender -b --factory-startup --python visualization/assemblies/da01_enclosure.py -- \
      --mode all [--draft] [--out visualization/renders/da01]

Modes: build (save .blend only) | stills | sequence | all
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
VIS = os.path.dirname(HERE)
sys.path[:0] = [os.path.join(VIS, "lib")]

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import nci_explode as ex  # noqa: E402
import nci_geo as g  # noqa: E402
import nci_studio as st  # noqa: E402
from nci_studio import CameraSpec, LightSpec, Library  # noqa: E402

MM = 0.001

# ---------------------------------------------------------------------------
# Parameters (mm)
# ---------------------------------------------------------------------------
W, D, H, R = 120.0, 80.0, 30.0, 8.0
WALL, FLOOR = 5.0, 4.0
BOSS_R, BOSS_XY = 5.0, (50.0, 30.0)
PCB_W, PCB_D, PCB_T, PCB_R = 100.0, 60.0, 1.6, 2.0
PCB_HOLES = (45.0, 25.0)
STANDOFF_H = 10.0
PCB_Z = FLOOR + STANDOFF_H
LID_T = 5.0
CBORE_D, CBORE_DEPTH = 6.0, 3.2
WIN = (0.0, -12.0, 38.0, 14.0)  # x, y, w, d of the window recess
GLAND_Z = 17.0


def build():
    st.reset_scene()
    parts = g.collection("DA01")

    # ------------------------------------------------------------- base
    base = g.rounded_box("Base", W, D, H, R, col=parts)
    pocket = g.rounded_box("pocket", W - 2 * WALL, D - 2 * WALL, H, 4.0, z0=FLOOR)
    bosses = [g.cylinder(f"boss{i}", BOSS_R, H + 2, (sx * BOSS_XY[0], sy * BOSS_XY[1], FLOOR - 1))
              for i, (sx, sy) in enumerate([(1, 1), (-1, 1), (-1, -1), (1, -1)])]
    g.boolean(pocket, bosses)
    g.boolean(base, [pocket])
    taps = [g.cylinder(f"tap{i}", 1.25, 13, (sx * BOSS_XY[0], sy * BOSS_XY[1], H - 12))
            for i, (sx, sy) in enumerate([(1, 1), (-1, 1), (-1, -1), (1, -1)])]
    g.boolean(base, taps)
    groove_path = g.rounded_rect_points(W - WALL, D - WALL, R - WALL / 2, 16)
    groove = g.torus_path("groove", groove_path, H, 2.0)
    g.boolean(base, [groove])
    gland_hole = g.cylinder("gland_hole", 6.25, WALL + 4, (-W / 2 - 2, 0, GLAND_Z), axis="X")
    g.boolean(base, [gland_hole])
    g.bevel(base, 0.6, 3, 40)
    g.shade_smooth(base)

    # ------------------------------------------------------------- standoffs
    for i, (sx, sy) in enumerate([(1, 1), (-1, 1), (-1, -1), (1, -1)]):
        g.hex_standoff(f"Standoff_{i}", 5.0, STANDOFF_H, 2.5, (sx * PCB_HOLES[0], sy * PCB_HOLES[1], FLOOR), col=parts)

    # ------------------------------------------------------------- PCB
    pcb = g.rounded_box("PCB", PCB_W, PCB_D, PCB_T, PCB_R, z0=PCB_Z, col=parts)
    holes = [g.cylinder(f"pcbh{i}", 1.6, 4, (sx * PCB_HOLES[0], sy * PCB_HOLES[1], PCB_Z - 1))
             for i, (sx, sy) in enumerate([(1, 1), (-1, 1), (-1, -1), (1, -1)])]
    g.boolean(pcb, holes)
    g.bevel(pcb, 0.15, 1, 40)
    top = PCB_Z + PCB_T
    comps = []

    def box(name, w, d, h, x, y, r=0.2):
        o = g.rounded_box(name, w, d, h, r, z0=top, seg=3)
        o.location = Vector((x, y, 0)) * MM
        comps.append(o)
        return o

    mcu = box("PCB_MCU", 7, 7, 0.9, -8, 6, 0.3)
    can = box("PCB_Shield", 16, 22, 2.4, 30, 4, 0.6)
    ind = box("PCB_Inductor", 4, 4, 2.0, -24, 14, 0.8)
    sensor = box("PCB_Sensor", 4, 4, 1.0, 14, -12, 0.3)
    leds = [box(f"PCB_LED{i}", 1.6, 0.8, 0.6, x, -12, 0.1) for i, x in enumerate((-8, -4, 0))]
    conn = box("PCB_Connector", 6, 8, 5, -42, 0, 0.4)
    passives = []
    for i in range(6):
        passives.append(box(f"PCB_R{i}", 1.6, 0.8, 0.5, -16 + i * 2.6, -2, 0.1))
        passives.append(box(f"PCB_C{i}", 1.6, 0.8, 0.8, -2 + i * 2.6 * 0 + 2, 10 - i * 2.4, 0.1))
    pads = [g.cylinder(f"PCB_TP{i}", 0.6, 0.04, (-30 + i * 3.0, -24, top)) for i in range(6)]
    silk1 = g.text_mesh("PCB_Silk1", "DA-01  DEMONSTRATION BOARD", 2.2, (-10, -27.2, top + 0.01), 0.02)
    silk2 = g.text_mesh("PCB_Silk2", "NOCLUE INDUSTRIES", 1.8, (-28, 25.5, top + 0.01), 0.02)
    outline = g.torus_path("PCB_SilkFrame", g.rounded_rect_points(38, 12, 1, 4), top + 0.012, 0.15)
    outline.location = Vector((WIN[0], WIN[1], 0)) * MM
    for o in comps + pads + [silk1, silk2, outline]:
        o.users_collection[0].objects.unlink(o) if o.users_collection else None
        parts.objects.link(o)

    # ------------------------------------------------------------- PCB screws
    for i, (sx, sy) in enumerate([(1, 1), (-1, 1), (-1, -1), (1, -1)]):
        g.pan_head_screw(f"ScrewPCB_{i}", 3.0, 6.0, (sx * PCB_HOLES[0], sy * PCB_HOLES[1], top), col=parts)

    # ------------------------------------------------------------- gasket
    g.torus_path("Gasket", groove_path, H + 0.1, 1.8, col=parts)
    # torus_path links into the scene collection; move to parts
    gk = bpy.data.objects["Gasket"]
    for c in list(gk.users_collection):
        c.objects.unlink(gk)
    parts.objects.link(gk)
    g.shade_smooth(gk, 60)

    # ------------------------------------------------------------- lid
    lid = g.rounded_box("Lid", W, D, LID_T, R, z0=H, col=parts)
    cuts = []
    for i, (sx, sy) in enumerate([(1, 1), (-1, 1), (-1, -1), (1, -1)]):
        x, y = sx * BOSS_XY[0], sy * BOSS_XY[1]
        cuts.append(g.cylinder(f"thru{i}", 1.7, LID_T + 2, (x, y, H - 1)))
        cuts.append(g.cylinder(f"cb{i}", CBORE_D / 2, CBORE_DEPTH + 1, (x, y, H + LID_T - CBORE_DEPTH)))
    wx, wy, ww, wd = WIN
    through = g.rounded_box("win_through", ww - 4, wd - 4, LID_T + 2, 1.0, z0=H - 1)
    through.location = Vector((wx, wy, 0)) * MM
    step = g.rounded_box("win_step", ww, wd, 2.0, 2.0, z0=H + LID_T - 1.5)
    step.location = Vector((wx, wy, 0)) * MM
    cuts += [through, step]
    g.boolean(lid, cuts)
    try:
        engr = g.text_mesh("engrave", "NCI / DA-01", 3.2, (26, 30, H + LID_T), 1.0)
        g.boolean(lid, [engr])
    except Exception as exc:  # engraving is cosmetic; never fail the build on it
        print("[da01] engraving skipped:", exc)
    g.bevel(lid, 0.8, 3, 40)
    g.shade_smooth(lid)

    win = g.rounded_box("Window", ww - 0.2, wd - 0.2, 1.5, 1.9, z0=H + LID_T - 1.5, col=parts)
    win.location = Vector((wx, wy, 0)) * MM

    # ------------------------------------------------------------- lid screws
    for i, (sx, sy) in enumerate([(1, 1), (-1, 1), (-1, -1), (1, -1)]):
        g.socket_head_screw(f"ScrewLid_{i}", 3.0, 12.0, (sx * BOSS_XY[0], sy * BOSS_XY[1], H + LID_T - CBORE_DEPTH), col=parts)

    # ------------------------------------------------------------- cable gland (M12)
    import mathutils

    def gpart(name, r, length, x0, verts=64, bev=0.4):
        o = g.cylinder(name, r, length, (0, 0, 0), verts=verts)
        o.data.transform(mathutils.Matrix.Rotation(math.radians(-90), 4, "Y"))
        o.location = Vector((x0, 0, GLAND_Z)) * MM
        g.bevel(o, bev, 2, 30)
        g.shade_smooth(o)
        return o

    body_hex = gpart("Gland_Hex", 8.66, 4.0, -W / 2, verts=6)  # 15 AF hex against the wall
    body_hex.rotation_euler.x = math.radians(30)
    dome = gpart("Gland_Dome", 7.0, 9.0, -W / 2 - 4.0, bev=2.0)
    thread = gpart("Gland_Thread", 6.0, WALL + 3.0, -W / 2 + WALL + 3.0, bev=0.3)
    gland = g.join("Gland", [body_hex, dome, thread])
    seal = gpart("Gland_Seal", 3.2, 1.2, -W / 2 - 13.0, bev=0.3)
    seal.name = "Gland_Seal"
    locknut = gpart("Gland_Locknut", 8.66, 3.0, -W / 2 + WALL + 3.0, verts=6, bev=0.3)
    locknut.name = "Gland_Locknut"
    for o in (gland, seal, locknut):
        for c in list(o.users_collection):
            c.objects.unlink(o)
        parts.objects.link(o)

    assign_materials()
    return parts


def assign_materials():
    m_base = Library.bead_blasted_aluminium(color=(0.48, 0.49, 0.50))
    m_lid = Library.anodized(color=(0.06, 0.064, 0.07), roughness=0.3)
    m_brass = Library.brass()
    m_mask = Library.soldermask("NCI_Mask_Black", color=(0.012, 0.013, 0.014))
    m_silk = Library.silkscreen(color=(0.80, 0.80, 0.76))
    m_enig = Library.enig()
    m_poly = Library.polymer()
    m_poly_light = Library.polymer("NCI_Polymer_Light", color=(0.62, 0.60, 0.55), roughness=0.5)
    m_tin = Library.tin()
    m_glass = Library.glass(tint=(0.80, 0.86, 0.88))
    m_gasket = Library.silicone()
    m_oxide = Library.black_oxide()
    m_zinc = Library.stainless("NCI_Zinc")
    m_led = st.principled("NCI_LED", (0.9, 0.35, 0.05), roughness=0.2, emission=(1.0, 0.33, 0.05), emission_strength=0.0)

    for o in bpy.data.collections["DA01"].objects:
        n = o.name
        if n == "Base":
            g.material(o, m_base)
        elif n in ("Lid",):
            g.material(o, m_lid)
        elif n.startswith("Standoff"):
            g.material(o, m_brass)
        elif n == "PCB":
            g.material(o, m_mask)
        elif n.startswith("PCB_Silk"):
            g.material(o, m_silk)
        elif n.startswith("PCB_TP"):
            g.material(o, m_enig)
        elif n == "PCB_Shield":
            g.material(o, m_tin)
        elif n == "PCB_Connector":
            g.material(o, m_poly_light)
        elif n.startswith("PCB_LED"):
            g.material(o, m_led)
        elif n.startswith("PCB_"):
            g.material(o, m_poly)
        elif n.startswith("ScrewPCB"):
            g.material(o, m_zinc)
        elif n.startswith("ScrewLid"):
            g.material(o, m_oxide)
        elif n == "Gasket":
            g.material(o, m_gasket)
        elif n == "Window":
            g.material(o, m_glass)
        elif n == "Gland_Seal":
            g.material(o, m_gasket)
        elif n.startswith("Gland"):
            g.material(o, m_poly)


# ---------------------------------------------------------------------------
# Explode choreography
# ---------------------------------------------------------------------------
STEPS = [
    ex.ExplodeStep("lid_screws", ["ScrewLid_*"], (0, 0, 98), 0.00, 0.40, spin_turns=4,
                   label="4 × M3 × 12 cap screws", note="ISO 4762, black oxide", anchor_mm=(0, 0, 4)),
    ex.ExplodeStep("lid", ["Lid"], (0, 0, 64), 0.12, 0.55, label="Machined lid", note="counterbored, stepped window recess",
                   anchor_mm=(46, -26, 0)),
    ex.ExplodeStep("window", ["Window"], (0, 0, 84), 0.18, 0.62, label="Glass window", note="38 × 14 × 1.5", anchor_mm=(-14, 0, 0)),
    ex.ExplodeStep("gasket", ["Gasket"], (0, 0, 42), 0.25, 0.66, label="Silicone gasket", note="1.8 mm section in 2 × 1 mm groove",
                   anchor_mm=(-58, 0, 0)),
    ex.ExplodeStep("gland", ["Gland", "Gland_Seal"], (-34, 0, 0), 0.20, 0.60, label="M12 cable gland", anchor_mm=(-6, 0, 6)),
    ex.ExplodeStep("locknut", ["Gland_Locknut"], (7, 0, 0), 0.62, 0.80),
    ex.ExplodeStep("pcb_screws", ["ScrewPCB_*"], (0, 0, 34), 0.35, 0.72, spin_turns=3, label="4 × M3 pan head"),
    ex.ExplodeStep("pcb", ["PCB", "PCB_*"], (0, 0, 20), 0.45, 0.86, label="Demonstration board", note="100 × 60 × 1.6",
                   anchor_mm=(34, -24, 0)),
    ex.ExplodeStep("standoffs", ["Standoff_*"], (0, 0, 8), 0.55, 0.92, label="M3 hex standoffs", note="brass, 10 mm"),
    ex.ExplodeStep("base", ["Base"], (0, 0, 0), 0.0, 1.0, label="Base housing", note="bead-blasted aluminium",
                   anchor_mm=(40, -40, -6)),
]

TIMELINE = ex.Timeline(start=1, hold_in=6, explode=84, hold_out=6)  # 96 frames

# camera: tight on the closed enclosure, pulling back and orbiting as it opens
CAM_FROM = CameraSpec(target=(-0.010, 0.0, 0.018), distance=0.40, azimuth=-38, elevation=26, lens=55, shift_x=-0.10)
CAM_TO = CameraSpec(target=(-0.022, 0.0, 0.060), distance=0.60, azimuth=-27, elevation=20, lens=55, shift_x=-0.13)


def rig(scale=1.0):
    s = 0.05 * scale
    return [
        LightSpec("Key_TopBack", (0.10, 0.55, 0.62), (0, 0, 0.04), energy=260 * s, size=(0.70, 0.40)),
        LightSpec("Rim_Right", (0.62, 0.12, 0.20), (0, 0, 0.05), energy=110 * s, size=(0.08, 0.90), color=(0.85, 0.92, 1.0)),
        LightSpec("Kick_Left", (-0.60, -0.25, 0.14), (0, 0, 0.04), energy=55 * s, size=(0.06, 0.70), color=(1.0, 0.80, 0.62)),
        LightSpec("Fill_Front", (0.0, -0.80, 0.35), (0, 0, 0.03), energy=26 * s, size=(1.0, 0.3), visible_glossy=False),
        LightSpec("Top_Strip", (0.0, 0.0, 0.75), (0, 0, 0), energy=30 * s, size=(0.9, 0.06)),
    ]


def lerp_cam(a: CameraSpec, b: CameraSpec, k: float) -> CameraSpec:
    L = lambda x, y: x + (y - x) * k  # noqa: E731
    return CameraSpec(target=tuple(L(x, y) for x, y in zip(a.target, b.target)), distance=L(a.distance, b.distance),
                      azimuth=L(a.azimuth, b.azimuth), elevation=L(a.elevation, b.elevation), lens=L(a.lens, b.lens),
                      shift_x=L(a.shift_x, b.shift_x), shift_y=L(a.shift_y, b.shift_y))


def animate_camera(cam):
    tl = TIMELINE
    for f in range(tl.start, tl.end + 1):
        u = (f - tl.explode_start) / tl.explode
        st.apply_camera(cam, lerp_cam(CAM_FROM, CAM_TO, ex.ease(u)))
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)


def stage():
    st.make_world(color=(0.0025, 0.003, 0.0035), gradient_top=0.012)
    st.add_shadow_catcher(z=0.0, size=3.0)
    st.add_lights(rig())
    cam = st.add_camera(CAM_FROM)
    ex.animate(STEPS, TIMELINE)
    animate_camera(cam)
    return cam


def parse():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--mode", default="all", choices=["build", "stills", "sequence", "all"])
    p.add_argument("--draft", action="store_true")
    p.add_argument("--out", default=os.path.join(VIS, "renders", "da01"))
    p.add_argument("--frames", default="", help="subset, e.g. 1-96x4 or 1,48,96")
    p.add_argument("--preset", default="", help="override still preset, e.g. still_light")
    p.add_argument("--overwrite", action="store_true", help="re-render files that already exist")
    return p.parse_args(argv)


def frame_list(spec: str, tl: ex.Timeline):
    if not spec:
        return list(range(tl.start, tl.end + 1))
    if "-" in spec:
        rng, _, step = spec.partition("x")
        a, b = (int(v) for v in rng.split("-"))
        return list(range(a, b + 1, int(step or 1)))
    return [int(v) for v in spec.split(",")]


def main():
    a = parse()
    out = os.path.abspath(a.out)
    os.makedirs(out, exist_ok=True)
    build()
    cam = stage()
    scn = bpy.context.scene
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, "da01_enclosure.blend"))

    # label anchors for the website overlay (normalised screen coordinates)
    st.configure_render(st.PRESETS["sequence"])
    ex.export_labels(STEPS, cam, [TIMELINE.end], os.path.join(out, "da01-labels.json"))
    if a.mode == "build":
        return

    if a.mode in ("stills", "all"):
        preset = st.PRESETS["draft" if a.draft else (a.preset or "still")]
        shots = {
            "assembled": (TIMELINE.start, None),
            "exploded": (TIMELINE.end, None),
            # macro: lid corner, counterbore + screw head, assembled
            "detail-screw": (TIMELINE.start, CameraSpec(target=(-0.050, -0.030, 0.034), distance=0.11, azimuth=-30, elevation=34,
                                                       lens=100, fstop=5.6)),
            # macro: gasket lifting out of its groove mid-sequence
            "detail-gasket": (int(TIMELINE.explode_start + TIMELINE.explode * 0.5),
                              CameraSpec(target=(-0.050, -0.032, 0.046), distance=0.17, azimuth=-36, elevation=18, lens=90, fstop=6.3)),
        }
        for name, (frame, spec) in shots.items():
            target = os.path.join(out, f"da01-{name}.png")
            if os.path.exists(target) and not a.overwrite and not a.draft:
                print(f"[da01] skip existing {name}")
                continue
            scn.frame_set(frame)
            if spec:
                still_cam = st.add_camera(spec, name=f"Cam_{name}")
            else:
                scn.camera = cam
            res = (2400, 1350) if name in ("assembled", "exploded") else (2400, 1600)
            st.configure_render(preset, None if a.draft else res)
            st.render_still(os.path.join(out, f"da01-{name}.png"))
            scn.camera = cam

    if a.mode in ("sequence", "all"):
        preset = st.PRESETS["draft" if a.draft else "sequence"]
        st.configure_render(preset, (960, 540) if a.draft else (preset.width, preset.height))
        seq = os.path.join(out, "seq")
        os.makedirs(seq, exist_ok=True)
        scn.camera = cam
        for f in frame_list(a.frames, TIMELINE):
            target = os.path.join(seq, f"da01-{f:03d}.png")
            if os.path.exists(target) and not a.overwrite:
                continue  # resumable: re-running continues where it stopped
            scn.frame_set(f)
            st.render_still(target)

    with open(os.path.join(out, "da01-meta.json"), "w", encoding="utf8") as fh:
        json.dump({"frames": TIMELINE.end - TIMELINE.start + 1, "fps_hint": 24, "steps": [s.id for s in STEPS]}, fh, indent=2)


if __name__ == "__main__":
    main()
