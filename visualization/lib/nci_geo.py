"""Parametric geometry helpers for procedural demonstration assemblies.

All functions take millimetres (engineering convention) and build metre-scale
Blender geometry. Booleans use the EXACT solver and are applied immediately so
the resulting meshes are clean, export-ready solids.
"""
from __future__ import annotations

import math

import bmesh
import bpy
from mathutils import Matrix, Vector

MM = 0.001


def mm(*v: float):
    return tuple(x * MM for x in v) if len(v) > 1 else v[0] * MM


def _link(obj: bpy.types.Object, collection: bpy.types.Collection | None = None) -> bpy.types.Object:
    (collection or bpy.context.scene.collection).objects.link(obj)
    return obj


def collection(name: str) -> bpy.types.Collection:
    col = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if col.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(col)
    return col


def rounded_rect_points(w: float, h: float, r: float, seg: int = 12) -> list[tuple[float, float]]:
    """Counter-clockwise outline of a w x h rectangle (mm) with corner radius r, centred on origin."""
    r = min(r, w / 2, h / 2)
    pts = []
    corners = [(w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)]
    for cx, cy, a0 in corners:
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def prism(name: str, outline_mm: list[tuple[float, float]], z0: float, height: float, col=None) -> bpy.types.Object:
    """Extrude a closed outline (mm) from z0 by height (mm)."""
    bm = bmesh.new()
    verts = [bm.verts.new((x * MM, y * MM, z0 * MM)) for x, y in outline_mm]
    face = bm.faces.new(verts)
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    top = [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=top, vec=(0, 0, height * MM))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return _link(bpy.data.objects.new(name, me), col)


def rounded_box(name: str, w: float, d: float, h: float, r: float, z0: float = 0.0, seg: int = 12, col=None):
    return prism(name, rounded_rect_points(w, d, r, seg), z0, h, col)


def cylinder(name: str, radius: float, height: float, loc=(0, 0, 0), verts: int = 64, axis: str = "Z", col=None):
    """Cylinder (mm). loc is the centre of the base face; the body extends along +axis."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=radius * MM, radius2=radius * MM, depth=height * MM)
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, height * MM / 2))
    if axis == "X":  # extends toward +X from loc
        bmesh.ops.transform(bm, matrix=Matrix.Rotation(math.radians(90), 4, "Y"), verts=bm.verts)
    elif axis == "Y":  # extends toward +Y from loc
        bmesh.ops.transform(bm, matrix=Matrix.Rotation(math.radians(-90), 4, "X"), verts=bm.verts)
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector(loc) * MM)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return _link(bpy.data.objects.new(name, me), col)


def torus_path(name: str, outline_mm: list[tuple[float, float]], z: float, section: float, col=None, round_section: bool = False):
    """Sweep a square (or round) section along a closed outline: gaskets, O-rings, seals."""
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    sp = curve.splines.new("POLY")
    sp.points.add(len(outline_mm) - 1)
    for p, (x, y) in zip(sp.points, outline_mm):
        p.co = (x * MM, y * MM, z * MM, 1)
    sp.use_cyclic_u = True
    if round_section:
        curve.bevel_mode = "ROUND"
        curve.bevel_depth = section * MM / 2
        curve.bevel_resolution = 6
    else:
        prof = bpy.data.curves.new(name + "_prof", "CURVE")
        ps = prof.splines.new("POLY")
        ps.points.add(3)
        s = section * MM / 2
        for p, (x, y) in zip(ps.points, [(-s, -s), (s, -s), (s, s), (-s, s)]):
            p.co = (x, y, 0, 1)
        ps.use_cyclic_u = True
        prof_obj = bpy.data.objects.new(name + "_prof", prof)
        curve.bevel_mode = "OBJECT"
        curve.bevel_object = prof_obj
    obj = _link(bpy.data.objects.new(name, curve), col)
    return to_mesh(obj)


def to_mesh(obj: bpy.types.Object) -> bpy.types.Object:
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(obj.evaluated_get(dg))
    new = bpy.data.objects.new(obj.name, me)
    new.matrix_world = obj.matrix_world
    for c in obj.users_collection:
        c.objects.link(new)
    bpy.data.objects.remove(obj, do_unlink=True)
    new.name = new.name.split(".")[0]
    return new


def apply_modifiers(obj: bpy.types.Object) -> None:
    with bpy.context.temp_override(object=obj, active_object=obj, selected_objects=[obj]):
        for m in list(obj.modifiers):
            bpy.ops.object.modifier_apply(modifier=m.name)


def boolean(target: bpy.types.Object, cutters: list[bpy.types.Object], op: str = "DIFFERENCE", keep: bool = False) -> None:
    for i, c in enumerate(cutters):
        mod = target.modifiers.new(f"bool{i}", "BOOLEAN")
        mod.operation = op
        mod.solver = "EXACT"
        mod.object = c
        apply_modifiers(target)
        if not keep:
            bpy.data.objects.remove(c, do_unlink=True)


def bevel(obj: bpy.types.Object, width_mm: float = 0.5, segments: int = 3, angle: float = 35, apply: bool = True) -> None:
    mod = obj.modifiers.new("bevel", "BEVEL")
    mod.width = width_mm * MM
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(angle)
    mod.miter_outer = "MITER_ARC"
    mod.harden_normals = False
    if apply:
        apply_modifiers(obj)


def shade_smooth(obj: bpy.types.Object, angle: float = 32) -> None:
    """Smooth shading with sharp edges by angle, plus face-weighted normals so large
    planar faces cut by booleans shade perfectly flat (no gradient artifacts)."""
    for p in obj.data.polygons:
        p.use_smooth = True
    try:
        obj.data.set_sharp_from_angle(angle=math.radians(angle))
    except AttributeError:
        pass
    mod = obj.modifiers.new("weighted", "WEIGHTED_NORMAL")
    mod.mode = "FACE_AREA"
    mod.keep_sharp = True
    mod.weight = 100
    apply_modifiers(obj)


def join(name: str, objs: list[bpy.types.Object]) -> bpy.types.Object:
    with bpy.context.temp_override(active_object=objs[0], selected_editable_objects=objs, object=objs[0]):
        bpy.ops.object.join()
    objs[0].name = name
    return objs[0]


def set_origin_to_geometry(obj: bpy.types.Object) -> None:
    """Move the object origin to its bounding-box centre without moving the mesh."""
    bb = [Vector(c) for c in obj.bound_box]
    centre = sum(bb, Vector()) / 8
    obj.data.transform(Matrix.Translation(-centre))
    obj.location = obj.matrix_world @ centre


def material(obj: bpy.types.Object, mat: bpy.types.Material) -> bpy.types.Object:
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


# ---------------------------------------------------------------------------
# Fasteners (ISO-proportioned, simplified: no thread geometry)
# ---------------------------------------------------------------------------


def socket_head_screw(name: str, d: float = 3.0, length: float = 10.0, loc=(0, 0, 0), col=None) -> bpy.types.Object:
    """ISO 4762-style cap screw. loc = point under the head (bearing face centre)."""
    head_d, head_k, socket = 1.83 * d, d, 0.83 * d
    head = cylinder(name, head_d / 2, head_k, (0, 0, 0), verts=64, col=col)
    bevel(head, 0.3, 3, 30)
    hexc = cylinder(name + "_hex", socket / 2 / math.cos(math.pi / 6), head_k * 0.6, (0, 0, head_k * 0.45), verts=6)
    boolean(head, [hexc])
    shank = cylinder(name + "_shank", d / 2, length, (0, 0, -length), verts=48)
    bevel(shank, 0.25, 2, 30)
    obj = join(name, [head, shank])
    obj.location = Vector(loc) * MM
    shade_smooth(obj)
    return obj


def pan_head_screw(name: str, d: float = 3.0, length: float = 6.0, loc=(0, 0, 0), col=None) -> bpy.types.Object:
    """ISO 7045-style pan head (cross recess simplified as a slot cross)."""
    head_d, head_k = 2.0 * d, 0.6 * d * 1.0
    head = cylinder(name, head_d / 2, head_k, (0, 0, 0), verts=64, col=col)
    bevel(head, head_k * 0.45, 5, 25)
    for i, ang in enumerate((0, 90)):
        slot = prism(name + f"_s{i}", rounded_rect_points(head_d * 0.6, d * 0.22, 0.05, 1), head_k * 0.55, head_k)
        slot.rotation_euler.z = math.radians(ang)
        boolean(head, [slot])
    shank = cylinder(name + "_shank", d / 2, length, (0, 0, -length), verts=48)
    obj = join(name, [head, shank])
    obj.location = Vector(loc) * MM
    shade_smooth(obj)
    return obj


def hex_standoff(name: str, across_flats: float = 5.0, height: float = 8.0, bore: float = 2.5, loc=(0, 0, 0), col=None):
    """Female-female hex standoff. loc = centre of bottom face."""
    r = across_flats / 2 / math.cos(math.pi / 6)
    body = cylinder(name, r, height, (0, 0, 0), verts=6, col=col)
    body.rotation_euler.z = math.radians(30)
    apply_rotation(body)
    bevel(body, 0.25, 2, 30)
    hole = cylinder(name + "_bore", bore / 2, height + 2, (0, 0, -1), verts=32)
    boolean(body, [hole])
    body.location = Vector(loc) * MM
    shade_smooth(body)
    return body


def apply_rotation(obj: bpy.types.Object) -> None:
    obj.data.transform(obj.rotation_euler.to_matrix().to_4x4())
    obj.rotation_euler = (0, 0, 0)


def text_mesh(name: str, body: str, size_mm: float, loc_mm=(0, 0, 0), extrude_mm: float = 0.02, align: str = "CENTER", col=None):
    curve = bpy.data.curves.new(name, "FONT")
    curve.body = body
    curve.size = size_mm * MM
    curve.extrude = extrude_mm * MM / 2
    curve.align_x = align
    curve.align_y = "CENTER"
    curve.space_character = 1.05
    obj = _link(bpy.data.objects.new(name, curve), col)
    obj.location = Vector(loc_mm) * MM
    return to_mesh(obj)
