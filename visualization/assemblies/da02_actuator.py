"""DA-02 — demonstration assembly: sealed BLDC rotary actuator module.

An ORIGINAL procedural concept built to demonstrate NoClue Industries'
mechanical visualisation pipeline. It is not a client project, not a product
and not a production-validated design. The driver board carries the
silkscreen "DA-02 DEMONSTRATION" so renders cannot be mistaken for real hardware.

Everything is modelled on one axis (local Z, rear -> front) and exploded along
it, the way the module would actually be taken apart: front parts come off the
front, rear parts off the back, the rotor is withdrawn forward once the front
cover is off.

Design intent (all dimensions mm, local Z = shaft axis, z = 0 at the rear face):
  Housing      6061 tube Ø60 / Ø46 bore, z 8..62, 9 radial cooling fins Ø70,
               internal bulkhead z 22..29 with Ø22 bearing seat,
               6 x M4 tapped holes (front) and 6 x M3 (rear) on PCD 54
  Stator       laminated, Ø46 / Ø28, 24 long, 12 teeth, concentrated copper windings
  Rotor        Ø26 hub, 10 surface magnet segments, on a Ø8 stainless shaft (z 18..86)
  Bearings     2 x 22 / 8 / 7 deep-groove ball bearings (front cover + bulkhead)
  Front cover  Ø64 x 10 anodised, bearing seat + lip-seal recess, 6 x M4 x 16 cap screws
  Output       Ø40 x 8 machined flange, 6 x Ø3.4 on PCD 30, retained by a circlip
  Rear         Ø44 driver PCB on 3 brass standoffs, encoder magnet in the shaft end,
               Ø64 x 8 rear cap, 6 x M3 x 12 cap screws, M8 circular connector
  Seals        2 x Ø57 O-rings (1.8 section), 1 x Ø20 / Ø8 lip seal — signal-orange silicone

Usage (from the repository root):
  blender -b --factory-startup --python visualization/assemblies/da02_actuator.py -- \
      --mode all [--draft] [--frames 1-120x8] [--out visualization/renders/da02]

Modes: build (save .blend only) | stills | sequence | all. Rendering is resumable;
pass --overwrite to re-render existing files.
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
VIS = os.path.dirname(HERE)
sys.path[:0] = [os.path.join(VIS, "lib")]

import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

import nci_explode as ex  # noqa: E402
import nci_geo as g  # noqa: E402
import nci_studio as st  # noqa: E402
from nci_studio import CameraSpec, LightSpec, Library  # noqa: E402

MM = 0.001
COL = "DA02"

# ---------------------------------------------------------------------------
# Parameters (mm)
# ---------------------------------------------------------------------------
HOUSING_Z = (8.0, 62.0)
HOUSING_OD, HOUSING_ID = 60.0, 46.0
FIN_OD, FIN_T, FIN_PITCH = 70.0, 1.8, 5.0
BULKHEAD_Z = (22.0, 29.0)
PCD = 54.0
STATOR_Z = (31.0, 55.0)
STATOR_OD, STATOR_ID, TEETH = 46.0, 28.0, 12
ROTOR_R, POLES = 13.0, 10
SHAFT_R, SHAFT_Z = 4.0, (18.0, 86.0)
BRG_OD, BRG_ID, BRG_W = 22.0, 8.0, 7.0
COVER_Z = (62.0, 72.0)
CAP_Z = (0.0, 8.0)
FLANGE_Z, FLANGE_D = (76.0, 84.0), 40.0
PCB_Z, PCB_D, PCB_T = 10.0, 44.0, 1.6

# Assembly lies on its fins; the root rotates local +Z (front) to world +X.
ROOT_LOC = (-0.035, 0.0, FIN_OD / 2 * MM + 0.001)


# ---------------------------------------------------------------------------
# Geometry helpers (local to this assembly; generic enough to move to nci_geo)
# ---------------------------------------------------------------------------
def parts():
    return bpy.data.collections[COL]


def adopt(obj):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    parts().objects.link(obj)
    return obj


def ring(name, r_out, r_in, z0, h, verts=96, bev=0.3, smooth=True):
    """Hollow cylinder (tube) along Z."""
    o = g.cylinder(name, r_out, h, (0, 0, z0), verts=verts)
    hole = g.cylinder(name + "_bore", r_in, h + 2, (0, 0, z0 - 1), verts=verts)
    g.boolean(o, [hole])
    if bev:
        g.bevel(o, bev, 2, 30)
    if smooth:
        g.shade_smooth(o, 40)
    return adopt(o)


def disc(name, r, z0, h, verts=96, bev=0.4):
    o = g.cylinder(name, r, h, (0, 0, z0), verts=verts)
    if bev:
        g.bevel(o, bev, 3, 30)
    g.shade_smooth(o, 40)
    return adopt(o)


def sphere(name, r, loc):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=r * MM)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    parts().objects.link(o)
    o.location = Vector(loc) * MM
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def polar(n, radius, phase=0.0):
    for i in range(n):
        a = phase + 2 * math.pi * i / n
        yield i, a, radius * math.cos(a), radius * math.sin(a)


def bearing(name, z0):
    """Deep-groove ball bearing: two rings, 8 balls, polymer cage. Joined per material."""
    mid = (BRG_OD / 2 + BRG_ID / 2) / 2
    outer = ring(name + "_Outer", BRG_OD / 2, mid + 1.6, z0, BRG_W, bev=0.5)
    inner = ring(name + "_Inner", mid - 1.6, BRG_ID / 2, z0, BRG_W, bev=0.5)
    rings = g.join(name + "_Rings", [outer, inner])
    balls = [sphere(f"{name}_b{i}", 1.75, (x, y, z0 + BRG_W / 2)) for i, _, x, y in polar(8, mid)]
    balls = g.join(name + "_Balls", balls)
    cage = ring(name + "_Cage", mid + 1.0, mid - 1.0, z0 + 1.0, BRG_W - 2.0, bev=0.15)
    return [rings, balls, cage]


def strip_outside(obj, z_min, z_max):
    """Remove stray vertices an EXACT boolean occasionally leaves at the origin."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bad = [v for v in bm.verts if not (z_min * MM <= v.co.z <= z_max * MM)]
    if bad:
        print(f"[da02] {obj.name}: removed {len(bad)} stray vertices")
        bmesh.ops.delete(bm, geom=bad, context="VERTS")
    bm.to_mesh(obj.data)
    bm.free()


def socket_screw(name, d, length, bearing_face_z, x, y, flip=False):
    """Cap screw. flip=True: head points to -Z (inserted from the rear)."""
    s = g.socket_head_screw(name, d, length, (0, 0, 0))
    adopt(s)
    if flip:
        s.rotation_euler.x = math.pi
    s.location = Vector((x, y, bearing_face_z)) * MM
    return s


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
def build():
    st.reset_scene()
    g.collection(COL)
    z0, z1 = HOUSING_Z

    # ------------------------------------------------------------ housing
    housing = g.cylinder("Housing", HOUSING_OD / 2, z1 - z0, (0, 0, z0), verts=128)
    bore = g.cylinder("h_bore", HOUSING_ID / 2, z1 - z0 + 2, (0, 0, z0 - 1), verts=128)
    g.boolean(housing, [bore])
    bulk = ring("h_bulk", HOUSING_ID / 2 + 0.5, BRG_OD / 2 - 0.6, BULKHEAD_Z[0], BULKHEAD_Z[1] - BULKHEAD_Z[0],
                bev=0, smooth=False)
    housing = g.join("Housing", [housing, bulk])
    fins = []
    z = z0 + 6.0
    while z + FIN_T < z1 - 5.0:
        fins.append(g.cylinder(f"fin{len(fins)}", FIN_OD / 2, FIN_T, (0, 0, z), verts=128))
        z += FIN_PITCH
    for f in fins:
        hole = g.cylinder(f.name + "_b", HOUSING_OD / 2 - 1.0, FIN_T + 2, (0, 0, f.location.z / MM - 1), verts=128)
        g.boolean(f, [hole])
    housing = g.join("Housing", [housing] + fins)
    taps = [g.cylinder(f"tapF{i}", 1.7, 14, (x, y, z1 - 13), verts=24) for i, _, x, y in polar(6, PCD / 2, math.pi / 6)]
    taps += [g.cylinder(f"tapR{i}", 1.25, 12, (x, y, z0 - 1), verts=24) for i, _, x, y in polar(6, PCD / 2)]
    g.boolean(housing, taps)
    g.bevel(housing, 0.4, 2, 40)
    g.shade_smooth(housing, 35)
    adopt(housing)

    # ------------------------------------------------------------ stator
    s0, s1 = STATOR_Z
    yoke = g.cylinder("Stator", STATOR_OD / 2, s1 - s0, (0, 0, s0), verts=128)
    yb = g.cylinder("s_b", STATOR_OD / 2 - 4.0, s1 - s0 + 2, (0, 0, s0 - 1), verts=128)
    g.boolean(yoke, [yb])
    teeth, coils = [], []
    for i, a, _, _ in polar(TEETH, 0):
        t = g.rounded_box(f"tooth{i}", 4.4, 3.4, s1 - s0, 0.2, z0=s0)  # radial x tangential
        t.data.transform(Matrix.Translation(Vector(((STATOR_ID / 2 + (STATOR_OD / 2 - 4.0 - STATOR_ID / 2) / 2 + 0.6) * MM, 0, 0))))
        t.data.transform(Matrix.Rotation(a, 4, "Z"))
        tip = g.rounded_box(f"tip{i}", 1.4, 7.0, s1 - s0, 0.2, z0=s0)
        tip.data.transform(Matrix.Translation(Vector(((STATOR_ID / 2 + 0.7) * MM, 0, 0))))
        tip.data.transform(Matrix.Rotation(a, 4, "Z"))
        teeth += [t, tip]
        c = g.rounded_box(f"Coil_{i}", 3.6, 5.8, s1 - s0 + 4.0, 1.2, z0=s0 - 2.0)
        c.data.transform(Matrix.Translation(Vector(((STATOR_ID / 2 + 4.6) * MM, 0, 0))))
        c.data.transform(Matrix.Rotation(a, 4, "Z"))
        g.bevel(c, 0.6, 3, 30)
        coils.append(c)
    stator = g.join("Stator", [yoke] + teeth)
    g.shade_smooth(stator, 30)
    adopt(stator)
    windings = g.join("Stator_Windings", coils)
    g.shade_smooth(windings, 50)
    adopt(windings)

    # ------------------------------------------------------------ rotor + shaft
    hub = disc("Rotor", ROTOR_R - 1.2, s0 + 0.5, s1 - s0 - 1.0, bev=0.4)
    mags = []
    for i, a, x, y in polar(POLES, ROTOR_R - 0.6):
        m = g.rounded_box(f"mag{i}", 1.6, 7.2, s1 - s0 - 2.0, 0.3, z0=s0 + 1.0)
        m.data.transform(Matrix.Rotation(a, 4, "Z"))
        m.data.transform(Matrix.Translation(Vector((x, y, 0)) * MM))
        mags.append(m)
    magnets = g.join("Rotor_Magnets", mags)
    g.bevel(magnets, 0.2, 2, 30)
    g.shade_smooth(magnets, 30)
    adopt(magnets)
    shaft = g.cylinder("Shaft", SHAFT_R, SHAFT_Z[1] - SHAFT_Z[0], (0, 0, SHAFT_Z[0]), verts=64)
    key = g.rounded_box("key", 10, 3, 6, 0.2, z0=FLANGE_Z[0] - 1)
    key.location.y = (SHAFT_R - 0.8 + 1.5) * MM
    g.boolean(shaft, [key])
    g.bevel(shaft, 0.4, 3, 30)
    g.shade_smooth(shaft, 40)
    adopt(shaft)

    # ------------------------------------------------------------ bearings
    rear_brg = bearing("BearingRear", BULKHEAD_Z[0])
    front_brg = bearing("BearingFront", COVER_Z[0])

    # ------------------------------------------------------------ front cover
    c0, c1 = COVER_Z
    cover = g.cylinder("Cover", 32.0, c1 - c0, (0, 0, c0), verts=128)
    cuts = [g.cylinder("c_seat", BRG_OD / 2, BRG_W + 1, (0, 0, c0 - 1), verts=96),
            g.cylinder("c_thru", 6.0, c1 - c0 + 2, (0, 0, c0 - 1), verts=64),
            g.cylinder("c_seal", 10.0, 3.0, (0, 0, c1 - 3.0), verts=96),
            g.cylinder("c_pilot", 25.0, 1.2, (0, 0, c1 - 1.2), verts=128)]  # shallow decorative facing step (outer ring stays)
    for i, _, x, y in polar(6, PCD / 2, math.pi / 6):
        cuts.append(g.cylinder(f"c_th{i}", 2.2, c1 - c0 + 2, (x, y, c0 - 1), verts=32))
        cuts.append(g.cylinder(f"c_cb{i}", 3.8, 4.2 + 1, (x, y, c1 - 4.2), verts=48))
    g.boolean(cover, cuts)
    try:
        txt = g.text_mesh("c_txt", "NCI  DA-02", 2.6, (0, -17.5, c1 - 1.2), 0.8)
        g.boolean(cover, [txt])
    except Exception as exc:  # engraving is cosmetic
        print("[da02] engraving skipped:", exc)
    g.bevel(cover, 0.5, 3, 40)
    g.shade_smooth(cover, 35)
    adopt(cover)
    front_screws = [socket_screw(f"ScrewFront_{i}", 4.0, 16.0, c1 - 4.2, x, y)
                    for i, _, x, y in polar(6, PCD / 2, math.pi / 6)]
    seal = ring("Seal", 10.0, SHAFT_R, c1 - 3.0, 3.0, bev=0.6)
    lip = ring("Seal_lip", SHAFT_R + 2.0, SHAFT_R, c1 - 0.2, 0.9, bev=0.3)
    seal = g.join("Seal", [seal, lip])
    adopt(seal)

    # ------------------------------------------------------------ output flange + circlip
    f0, f1 = FLANGE_Z
    flange = g.cylinder("Flange", FLANGE_D / 2, f1 - f0, (0, 0, f0), verts=128)
    fc = [g.cylinder("f_bore", SHAFT_R, 20, (0, 0, f0 - 5), verts=64),
          g.cylinder("f_rec", 13.0, 2.0, (0, 0, f1 - 2.0), verts=96)]
    for i, _, x, y in polar(6, 15.0):
        fc.append(g.cylinder(f"f_h{i}", 1.7, 12, (x, y, f0 - 2), verts=32))
        fc.append(g.cylinder(f"f_cs{i}", 2.9, 1.0, (x, y, f1 - 1.0), verts=32))
    for i, _, x, y in polar(3, 19.2, math.pi / 2):  # three relief scallops on the rim
        fc.append(g.cylinder(f"f_sc{i}", 3.0, 12, (x, y, f0 - 2), verts=48))
    g.boolean(flange, fc)
    strip_outside(flange, f0 - 0.01, f1 + 0.01)
    hubf = ring("f_hub", 9.0, SHAFT_R, f0 - 2.0, 2.0, bev=0.3)
    g.bevel(flange, 0.5, 3, 40)
    g.shade_smooth(flange, 35)
    flange = g.join("Flange", [flange, hubf])
    strip_outside(flange, f0 - 2.01, f1 + 0.01)
    adopt(flange)
    clip = ring("Circlip", SHAFT_R + 1.6, SHAFT_R - 0.2, f1 + 0.4, 0.9, verts=64, bev=0.1)
    gap = g.rounded_box("clip_gap", 3.0, 2.0, 4, 0.1, z0=f1 - 1)
    gap.location.x = (SHAFT_R + 1.0) * MM
    g.boolean(clip, [gap])

    # ------------------------------------------------------------ O-rings
    for name, zz in (("ORingFront", COVER_Z[0] - 0.4), ("ORingRear", HOUSING_Z[0] + 0.4)):
        pts = [(28.4 * math.cos(2 * math.pi * k / 96), 28.4 * math.sin(2 * math.pi * k / 96)) for k in range(96)]
        o = g.torus_path(name, pts, zz, 1.8, round_section=True)
        adopt(o)
        g.shade_smooth(o, 60)

    # ------------------------------------------------------------ rear: magnet, PCB, standoffs
    disc("EncoderMagnet", 3.0, SHAFT_Z[0] - 2.4, 2.4, verts=48, bev=0.25)
    pcb = g.cylinder("PCB", PCB_D / 2, PCB_T, (0, 0, PCB_Z), verts=128)
    pcb_cuts = [g.cylinder(f"pcbh{i}", 1.6, 4, (x, y, PCB_Z - 1), verts=24) for i, _, x, y in polar(3, 18.0, math.pi / 2)]
    g.boolean(pcb, pcb_cuts)
    g.bevel(pcb, 0.15, 1, 40)
    adopt(pcb)
    top = PCB_Z + PCB_T
    comps = []

    def comp(name, w, d, h, x, y, r=0.2, rot=0.0):
        o = g.rounded_box(name, w, d, h, r, z0=top, seg=3)
        if rot:
            o.data.transform(Matrix.Rotation(rot, 4, "Z"))
        o.location = Vector((x, y, 0)) * MM
        comps.append(o)
        return o

    comp("PCB_Sensor", 4, 4, 0.9, 0, 0, 0.3)
    comp("PCB_MCU", 7, 7, 0.9, -9, 7, 0.3)
    comp("PCB_Driver", 5, 5, 0.9, 9, 7, 0.3)
    for i, a, x, y in polar(6, 13.5, math.pi / 6):
        comp(f"PCB_FET{i}", 5.0, 6.0, 1.1, x, y, 0.2, rot=a)
    for i, a, x, y in polar(12, 8.0):
        comp(f"PCB_C{i}", 1.6, 0.8, 0.8, x, y, 0.1, rot=a)
    comp("PCB_Header", 10, 3, 4.5, 0, -16.5, 0.3)
    comps_tin = [g.cylinder(f"PCB_TP{i}", 0.7, 0.05, (x, y, top), verts=16) for i, _, x, y in polar(5, 19.5, -0.7)]
    silk = g.text_mesh("PCB_Silk", "DA-02 DEMONSTRATION", 1.5, (0, 19.0, top + 0.01), 0.02)
    silk2 = g.text_mesh("PCB_Silk2", "NOCLUE INDUSTRIES", 1.2, (0, -11.0, top + 0.01), 0.02)
    for o in comps + comps_tin + [silk, silk2]:
        adopt(o)
    for i, _, x, y in polar(3, 18.0, math.pi / 2):
        adopt(g.hex_standoff(f"Standoff_{i}", 5.0, BULKHEAD_Z[0] - top, 2.5, (x, y, top)))

    # ------------------------------------------------------------ rear cap + screws + connector
    r0, r1 = CAP_Z
    cap = g.cylinder("RearCap", 32.0, r1 - r0, (0, 0, r0), verts=128)
    capc = [g.cylinder("rc_conn", 5.0, 20, (0, 0, -5), verts=64)]
    for i, _, x, y in polar(6, PCD / 2):
        capc.append(g.cylinder(f"rc_th{i}", 1.7, r1 - r0 + 2, (x, y, r0 - 1), verts=32))
        capc.append(g.cylinder(f"rc_cb{i}", 2.9, 3.2 + 1, (x, y, r0 - 1), verts=48))
    for i, _, x, y in polar(6, 20.0, math.pi / 6):  # weight-relief pockets on the inner face
        capc.append(g.cylinder(f"rc_p{i}", 4.0, 3.0, (x, y, r1 - 3.0), verts=48))
    g.boolean(cap, capc)
    g.bevel(cap, 0.5, 3, 40)
    g.shade_smooth(cap, 35)
    adopt(cap)
    [socket_screw(f"ScrewRear_{i}", 3.0, 12.0, r0 + 3.2, x, y, flip=True) for i, _, x, y in polar(6, PCD / 2)]
    body = disc("Connector", 5.0, -12.0, 14.0, verts=48, bev=0.3)
    nut = disc("Connector_Nut", 6.2, -10.0, 6.0, verts=24, bev=0.4)
    pins = g.join("Connector_Pins", [g.cylinder(f"pin{i}", 0.5, 2.0, (x, y, -12.5), verts=12) for i, _, x, y in polar(4, 2.2)])
    adopt(pins)
    _ = (body, nut)

    assign_materials()
    root = bpy.data.objects.new("DA02_ROOT", None)
    bpy.context.scene.collection.objects.link(root)
    for o in parts().objects:
        o.parent = root
    root.rotation_euler = (0, math.radians(90), 0)
    root.location = ROOT_LOC
    bpy.context.view_layer.update()
    return root


def assign_materials():
    m_alu = Library.bead_blasted_aluminium(color=(0.58, 0.59, 0.60))
    m_mach = Library.machined_aluminium()
    m_ano = Library.anodized(color=(0.045, 0.048, 0.054), roughness=0.28)
    m_steel = st.principled("NCI_Steel_Polished", (0.72, 0.72, 0.73), metallic=1.0, roughness=0.12)
    m_chrome = st.principled("NCI_Chrome", (0.80, 0.80, 0.81), metallic=1.0, roughness=0.04)
    m_lam = st.principled("NCI_Lamination", (0.10, 0.10, 0.11), metallic=1.0, roughness=0.30)
    st.brushed(m_lam, axis="Z", scale=6000, strength=0.06)
    m_cu = st.principled("NCI_Copper_Enamel", (0.93, 0.47, 0.25), metallic=1.0, roughness=0.22, coat=0.6, coat_roughness=0.08)
    m_nickel = st.principled("NCI_Nickel", (0.55, 0.55, 0.56), metallic=1.0, roughness=0.2)
    m_oxide = Library.black_oxide()
    m_seal = Library.silicone()
    m_cage = Library.polymer("NCI_Cage", color=(0.02, 0.02, 0.022), roughness=0.35)
    m_brass = Library.brass()
    m_mask = Library.soldermask("NCI_Mask_Black", color=(0.0045, 0.005, 0.0056), finish="satin")
    m_silk = Library.silkscreen(color=(0.90, 0.90, 0.88))
    m_enig = Library.enig()
    m_poly = Library.polymer()
    m_tin = Library.tin()

    rules = [
        ("Housing", m_alu), ("Stator_Windings", m_cu), ("Stator", m_lam), ("Rotor_Magnets", m_nickel),
        ("Rotor", m_oxide), ("Shaft", m_steel), ("Bearing*_Rings", m_steel), ("Bearing*_Balls", m_chrome),
        ("Bearing*_Cage", m_cage), ("Cover", m_ano), ("RearCap", m_ano), ("Flange", m_mach), ("Circlip", m_oxide),
        ("ScrewFront_*", m_oxide), ("ScrewRear_*", m_oxide), ("Seal", m_seal), ("ORing*", m_seal),
        ("EncoderMagnet", m_nickel), ("PCB", m_mask), ("PCB_Silk*", m_silk), ("PCB_TP*", m_enig),
        ("PCB_Header", m_poly), ("PCB_*", m_poly), ("Standoff_*", m_brass), ("Connector_Pins", m_brass),
        ("Connector_Nut", m_nickel), ("Connector", m_poly),
    ]
    import fnmatch
    for o in parts().objects:
        for pat, m in rules:
            if fnmatch.fnmatch(o.name, pat):
                g.material(o, m)
                break
        else:
            print("[da02] no material for", o.name)


# ---------------------------------------------------------------------------
# Explode choreography (offsets along the shaft axis, local Z, mm)
# Outermost parts leave first; front and rear unstack simultaneously.
# ---------------------------------------------------------------------------
K = 0.8  # global spacing factor
Z3 = lambda dz: (0, 0, dz * K)  # noqa: E731

STEPS = [
    # front
    ex.ExplodeStep("circlip", ["Circlip"], Z3(240), 0.00, 0.46, spin_turns=1.5, label="Retaining ring", note="DIN 471"),
    ex.ExplodeStep("flange", ["Flange"], Z3(215), 0.03, 0.54, label="Output flange", note="machined 6061, 6 × Ø3.4 on PCD 30",
                   anchor_mm=(-20, 0, 0)),
    ex.ExplodeStep("front_screws", ["ScrewFront_*"], Z3(185), 0.10, 0.56, spin_turns=5, label="6 × M4 × 16",
                   note="ISO 4762, black oxide"),
    ex.ExplodeStep("seal", ["Seal"], Z3(160), 0.16, 0.60, label="Shaft lip seal", note="silicone, Ø20 / Ø8"),
    ex.ExplodeStep("cover", ["Cover"], Z3(140), 0.20, 0.64, label="Front cover", note="anodised, bearing + seal seats",
                   anchor_mm=(-32, 0, 0)),
    ex.ExplodeStep("front_bearing", ["BearingFront_*"], Z3(125), 0.26, 0.70, label="Deep-groove bearing", note="22 / 8 / 7"),
    ex.ExplodeStep("front_oring", ["ORingFront"], Z3(100), 0.30, 0.74, label="O-ring", note="Ø57 × 1.8"),
    ex.ExplodeStep("rotor", ["Rotor", "Rotor_Magnets", "Shaft"], Z3(95), 0.38, 0.86, label="Rotor", note="10-pole, Ø8 stainless shaft",
                   anchor_mm=(-14, 0, -10)),
    ex.ExplodeStep("stator", ["Stator", "Stator_Windings"], Z3(45), 0.50, 0.94, label="Wound stator", note="12 slots, concentrated windings",
                   anchor_mm=(-24, 0, 0)),
    # rear
    ex.ExplodeStep("connector", ["Connector", "Connector_Nut", "Connector_Pins"], Z3(-140), 0.00, 0.44, spin_turns=1.0,
                   label="M8 connector"),
    ex.ExplodeStep("rear_screws", ["ScrewRear_*"], Z3(-120), 0.06, 0.50, spin_turns=-5, label="6 × M3 × 12"),
    ex.ExplodeStep("rear_cap", ["RearCap"], Z3(-100), 0.14, 0.58, label="Rear cap", note="anodised", anchor_mm=(-32, 0, 0)),
    ex.ExplodeStep("rear_oring", ["ORingRear"], Z3(-85), 0.20, 0.64),
    ex.ExplodeStep("pcb", ["PCB", "PCB_*"], Z3(-70), 0.28, 0.74, label="Driver board", note="demonstration PCB, Ø44",
                   anchor_mm=(-22, 0, 0)),
    ex.ExplodeStep("standoffs", ["Standoff_*"], Z3(-55), 0.34, 0.80),
    ex.ExplodeStep("magnet", ["EncoderMagnet"], Z3(-40), 0.40, 0.84, label="Encoder magnet"),
    ex.ExplodeStep("rear_bearing", ["BearingRear_*"], Z3(-30), 0.44, 0.90),
    ex.ExplodeStep("housing", ["Housing"], (0, 0, 0), 0.0, 1.0, label="Finned housing", note="bead-blasted 6061",
                   anchor_mm=(-35, 0, 0)),
]

TIMELINE = ex.Timeline(start=1, hold_in=8, explode=100, hold_out=12)  # 120 frames

# Camera (world space; the axis runs along world X). Opens close on the sealed
# module, then pulls back and swings round as the parts separate.
CAM_FROM = CameraSpec(target=(0.006, 0.0, 0.034), distance=0.30, azimuth=52, elevation=17, lens=60, shift_y=-0.02)
CAM_TO = CameraSpec(target=(0.064, 0.0, 0.040), distance=0.56, azimuth=28, elevation=14, lens=45, shift_y=-0.02)


def rig(scale=1.0):
    s = 0.05 * scale
    return [
        LightSpec("Key_Over", (0.05, 0.30, 0.55), (0.02, 0, 0.03), energy=300 * s, size=(0.9, 0.22)),
        LightSpec("Strip_Back", (0.02, 0.55, 0.12), (0.02, 0, 0.04), energy=240 * s, size=(1.2, 0.03), color=(0.90, 0.95, 1.0)),
        LightSpec("Rim_Right", (0.60, 0.10, 0.14), (0.05, 0, 0.04), energy=120 * s, size=(0.05, 0.6), color=(0.85, 0.92, 1.0)),
        LightSpec("Kick_Signal", (-0.50, 0.25, 0.03), (0, 0, 0.03), energy=12 * s, size=(0.03, 0.4), color=(1.0, 0.42, 0.14)),
        LightSpec("Fill_Front", (0.05, -0.80, 0.25), (0.02, 0, 0.03), energy=22 * s, size=(1.2, 0.3), visible_glossy=False),
    ]


def lerp_cam(a: CameraSpec, b: CameraSpec, k: float) -> CameraSpec:
    L = lambda x, y: x + (y - x) * k  # noqa: E731
    return CameraSpec(target=tuple(L(x, y) for x, y in zip(a.target, b.target)), distance=L(a.distance, b.distance),
                      azimuth=L(a.azimuth, b.azimuth), elevation=L(a.elevation, b.elevation), lens=L(a.lens, b.lens),
                      shift_x=L(a.shift_x, b.shift_x), shift_y=L(a.shift_y, b.shift_y))


def animate_camera(cam):
    tl = TIMELINE
    for f in range(tl.start, tl.end + 1):
        # camera leads slightly and settles during the exploded hold
        u = (f - tl.explode_start) / (tl.explode + tl.hold_out * 0.6)
        st.apply_camera(cam, lerp_cam(CAM_FROM, CAM_TO, ex.ease(u)))
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)
        cam.data.keyframe_insert("lens", frame=f)
        cam.data.keyframe_insert("shift_y", frame=f)


def stage():
    st.make_world(color=(0.0022, 0.0026, 0.003), gradient_top=0.010)
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
    p.add_argument("--out", default=os.path.join(VIS, "renders", "da02"))
    p.add_argument("--frames", default="", help="subset, e.g. 1-120x8 or 1,60,120")
    p.add_argument("--stills", default="", help="subset of still names")
    p.add_argument("--preset", default="")
    p.add_argument("--overwrite", action="store_true")
    return p.parse_args(argv)


def frame_list(spec: str, tl: ex.Timeline):
    if not spec:
        return list(range(tl.start, tl.end + 1))
    if "-" in spec:
        rng, _, step = spec.partition("x")
        a, b = (int(v) for v in rng.split("-"))
        return list(range(a, b + 1, int(step or 1)))
    return [int(v) for v in spec.split(",")]


SEQ_RES = (1920, 1080)


def main():
    a = parse()
    out = os.path.abspath(a.out)
    os.makedirs(out, exist_ok=True)
    build()
    cam = stage()
    scn = bpy.context.scene
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, "da02_actuator.blend"))

    st.configure_render(st.PRESETS["sequence"], SEQ_RES)
    ex.export_labels(STEPS, cam, [TIMELINE.end], os.path.join(out, "da02-labels.json"))
    if a.mode == "build":
        return

    if a.mode in ("stills", "all"):
        preset = st.PRESETS["draft" if a.draft else (a.preset or "still")]
        mid = int(TIMELINE.explode_start + TIMELINE.explode * 0.55)
        shots = {
            "assembled": (TIMELINE.start, None, (2400, 1350)),
            "exploded": (TIMELINE.end, None, (2400, 1350)),
            # hero: sealed module, low and close on the output flange
            "hero": (TIMELINE.start, CameraSpec(target=(0.020, 0.0, 0.036), distance=0.24, azimuth=62, elevation=9, lens=75,
                                                fstop=4.0, focus=(0.050, -0.01, 0.036), shift_x=-0.12), (2400, 1350)),
            # macro: wound stator + withdrawn rotor, exploded
            "detail-stator": (TIMELINE.end, CameraSpec(target=(0.062, 0.0, 0.037), distance=0.20, azimuth=34, elevation=16, lens=85,
                                                   fstop=5.6, focus=(0.056, -0.012, 0.040)), (2400, 1600)),
        }
        names = [n for n in a.stills.split(",") if n] or list(shots)
        for name in names:
            frame, spec, res = shots[name]
            target = os.path.join(out, f"da02-{name}.png")
            if os.path.exists(target) and not a.overwrite and not a.draft:
                print(f"[da02] skip existing {name}")
                continue
            scn.frame_set(frame)
            scn.camera = st.add_camera(spec, name=f"Cam_{name}") if spec else cam
            st.configure_render(preset, (res[0] // 2, res[1] // 2) if a.draft else res)
            st.render_still(target)
            scn.camera = cam

    if a.mode in ("sequence", "all"):
        preset = st.PRESETS["draft" if a.draft else "sequence"]
        st.configure_render(preset, (960, 540) if a.draft else SEQ_RES)
        seq = os.path.join(out, "seq")
        os.makedirs(seq, exist_ok=True)
        scn.camera = cam
        for f in frame_list(a.frames, TIMELINE):
            target = os.path.join(seq, f"da02-{f:03d}.png")
            if os.path.exists(target) and not a.overwrite:
                continue
            scn.frame_set(f)
            st.render_still(target)

    with open(os.path.join(out, "da02-meta.json"), "w", encoding="utf8") as fh:
        json.dump({"frames": TIMELINE.end - TIMELINE.start + 1, "fps_hint": 24, "steps": [s.id for s in STEPS],
                   "explode_window": [TIMELINE.explode_start, TIMELINE.explode_end]}, fh, indent=2)


if __name__ == "__main__":
    main()
