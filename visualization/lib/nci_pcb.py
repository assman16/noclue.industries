"""PCB import + material upgrade for KiCad glTF exports.

KiCad (8+/10) exports boards as glTF with flat PBR colours and a fixed set of
board-layer meshes named ``index_PCB``, ``index_soldermask``, ``index_silkscreen``
and ``index_pad``. Component meshes are merged per material.

This module never modifies geometry. It only:
  * re-parents everything under one empty and centres the board on the origin
    (board top surface stays at its true height),
  * replaces flat KiCad materials with physically based finishes while keeping
    each part's original colour.
"""
from __future__ import annotations

import colorsys

import bpy
from mathutils import Vector

from nci_studio import Library, principled, world_bbox

BOARD_LAYERS = {
    "index_PCB": "fr4",
    "index_soldermask": "soldermask",
    "index_silkscreen": "silkscreen",
    "index_pad": "pads",
}


def import_glb(path: str, name: str = "PCB") -> tuple[bpy.types.Object, list[bpy.types.Object]]:
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == "MESH"]
    mn, mx = world_bbox(meshes)
    center = Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, 0.0))

    root = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(root)
    for o in new:
        if o.parent is None or o.parent not in new:
            mw = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = mw
    for o in new:
        if o.parent is root:
            o.location -= center
    bpy.context.view_layer.update()
    return root, meshes


def _layer_name(obj: bpy.types.Object) -> str | None:
    """KiCad layer meshes are recognised from the glTF node name kept in the mesh data."""
    for key in BOARD_LAYERS:
        if obj.name.startswith(key) or obj.data.name.startswith(key):
            return BOARD_LAYERS[key]
    return None


def classify_color(rgb) -> str:
    r, g, b = rgb
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    spread = max(rgb) - min(rgb)
    if r > 0.55 and 0.35 < g < 0.8 and b < 0.4 and r > g > b:
        return "gold"
    if spread < 0.06 and max(rgb) > 0.33:
        return "metal"
    if max(rgb) < 0.07:
        return "black"
    return "polymer"


SILK_LIFT = 0.00003  # 30 µm: physical ink thickness; fixes coplanar z-fighting with the mask


def finish_board_layers(meshes: list[bpy.types.Object]) -> None:
    """Lift the silkscreen by its real ink thickness so it renders on top of the mask."""
    for obj in meshes:
        if _layer_name(obj) == "silkscreen":
            obj.location.z += SILK_LIFT


def tone_polymer(rgb, max_saturation: float = 0.62):
    """Clamp unrealistically saturated display colours (e.g. KiCad's neon terminal green)
    to a plausible moulded-plastic saturation. Hue and lightness are preserved."""
    h, l, s = colorsys.rgb_to_hls(*rgb)
    if s > max_saturation and l > 0.3:
        return colorsys.hls_to_rgb(h, min(l, 0.45), max_saturation)
    return rgb


def upgrade_materials(meshes: list[bpy.types.Object], board_colors: dict | None = None) -> dict[str, int]:
    """Swap flat glTF materials for studio finishes. Returns counts per class."""
    board_colors = board_colors or {}
    cache: dict[str, bpy.types.Material] = {}
    counts: dict[str, int] = {}

    lib_board = {
        "fr4": lambda c: Library.fr4(color=board_colors.get("fr4", c)),
        "soldermask": lambda c: Library.soldermask(color=board_colors.get("soldermask", c)),
        "silkscreen": lambda c: Library.silkscreen(color=board_colors.get("silkscreen", (0.85, 0.84, 0.78))),
        "pads": lambda c: Library.enig(),
    }

    for obj in meshes:
        layer = _layer_name(obj)
        for slot in obj.material_slots:
            src = slot.material
            if src is None:
                continue
            bsdf = src.node_tree.nodes.get("Principled BSDF") if src.use_nodes else None
            rgb = tuple(bsdf.inputs["Base Color"].default_value[:3]) if bsdf else (0.5, 0.5, 0.5)
            if layer:
                key = f"board:{layer}"
                if key not in cache:
                    cache[key] = lib_board[layer](rgb)
                    cache[key].name = f"NCI_PCB_{layer}"
                cls = layer
            else:
                cls = classify_color(rgb)
                key = f"{cls}:{src.name}"
                if key not in cache:
                    if cls == "gold":
                        m = principled(f"NCI_Gold_{src.name}", rgb, metallic=1.0, roughness=0.25)
                    elif cls == "metal":
                        m = principled(f"NCI_Metal_{src.name}", rgb, metallic=1.0, roughness=0.32)
                    elif cls == "black":
                        m = principled(f"NCI_Black_{src.name}", rgb, roughness=0.42, specular=0.5)
                    else:
                        m = principled(f"NCI_Polymer_{src.name}", tone_polymer(rgb), roughness=0.48, specular=0.45, coat=0.15)
                    cache[key] = m
            slot.material = cache[key]
            counts[cls] = counts.get(cls, 0) + 1
    return counts
