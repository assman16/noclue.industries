"""Inspect an imported model: objects, dimensions, materials.

Usage:
  blender -b --factory-startup --python visualization/scripts/inspect_model.py -- path/to/model.glb
"""
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
path = argv[0]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)

objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
mn = Vector((1e9, 1e9, 1e9))
mx = Vector((-1e9, -1e9, -1e9))
for o in objs:
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        mn = Vector(map(min, mn, w))
        mx = Vector(map(max, mx, w))
print("MESH OBJECTS", len(objs))
print("WORLD BBOX min", tuple(round(v, 5) for v in mn), "max", tuple(round(v, 5) for v in mx))
print("SIZE (m)", tuple(round(v, 5) for v in (mx - mn)))
for o in objs:
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    omn = Vector(map(min, *[tuple(v) for v in bb])) if False else Vector((min(v.x for v in bb), min(v.y for v in bb), min(v.z for v in bb)))
    omx = Vector((max(v.x for v in bb), max(v.y for v in bb), max(v.z for v in bb)))
    mats = []
    for s in o.material_slots:
        m = s.material
        if m is None:
            mats.append("None")
            continue
        bsdf = m.node_tree.nodes.get("Principled BSDF") if m.use_nodes else None
        col = tuple(round(c, 3) for c in bsdf.inputs["Base Color"].default_value[:3]) if bsdf else None
        mats.append(f"{m.name}{col}")
    print(f"{o.name:45s} verts={len(o.data.vertices):7d} z=[{omn.z:.4f},{omx.z:.4f}] size=({(omx-omn).x:.4f},{(omx-omn).y:.4f},{(omx-omn).z:.4f}) mats={mats}")
