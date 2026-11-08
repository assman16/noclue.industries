"""Exploded-view choreography — reusable for any assembly.

Describe each part (or group of parts) with an ExplodeStep: a direction and
distance along its assembly axis, a normalised time window, and optional spin
(fasteners unscrewing). The animator keyframes every frame with a smooth
ease, so playback is identical forwards and backwards (scroll scrubbing).

    steps = [
        ExplodeStep("lid_screws", ["Screw_Lid_*"], (0, 0, 75), 0.00, 0.45, spin_turns=3, label="M3 × 12 cap screws"),
        ExplodeStep("lid", ["Lid"], (0, 0, 50), 0.10, 0.60, label="Machined lid"),
    ]
    animate(steps, timeline)
    export_labels(steps, camera, frames=[timeline.end])

Units for distances are millimetres.
"""
from __future__ import annotations

import fnmatch
import json
import math
from dataclasses import dataclass, field

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

MM = 0.001


@dataclass
class ExplodeStep:
    id: str
    patterns: list[str]
    offset_mm: tuple[float, float, float]
    start: float  # 0..1 within the explode window
    end: float
    spin_turns: float = 0.0  # rotations about the part's local Z while travelling
    label: str = ""
    note: str = ""
    anchor_mm: tuple[float, float, float] = (0, 0, 0)  # label anchor offset from part centre
    objects: list = field(default_factory=list)


@dataclass
class Timeline:
    start: int = 1  # first frame (fully assembled)
    hold_in: int = 8  # frames held assembled
    explode: int = 72  # frames spent exploding
    hold_out: int = 16  # frames held exploded

    @property
    def end(self) -> int:
        return self.start + self.hold_in + self.explode + self.hold_out - 1

    @property
    def explode_start(self) -> int:
        return self.start + self.hold_in

    @property
    def explode_end(self) -> int:
        return self.explode_start + self.explode


def ease(t: float) -> float:
    """Quintic smootherstep — zero velocity and acceleration at both ends."""
    t = min(1.0, max(0.0, t))
    return t * t * t * (t * (t * 6 - 15) + 10)


def resolve(steps: list[ExplodeStep]) -> None:
    names = [o.name for o in bpy.data.objects]
    for s in steps:
        s.objects = [bpy.data.objects[n] for p in s.patterns for n in names if fnmatch.fnmatch(n, p)]
        if not s.objects:
            raise ValueError(f"explode step '{s.id}' matched no objects: {s.patterns}")


def animate(steps: list[ExplodeStep], tl: Timeline) -> None:
    resolve(steps)
    scene = bpy.context.scene
    scene.frame_start = tl.start
    scene.frame_end = tl.end
    base = {o.name: (o.location.copy(), o.rotation_euler.copy()) for s in steps for o in s.objects}
    for f in range(tl.start, tl.end + 1):
        u = (f - tl.explode_start) / max(1, tl.explode)
        for s in steps:
            local = (u - s.start) / max(1e-6, s.end - s.start)
            k = ease(local)
            for o in s.objects:
                loc0, rot0 = base[o.name]
                o.location = loc0 + Vector(s.offset_mm) * MM * k
                o.keyframe_insert("location", frame=f)
                if s.spin_turns:
                    o.rotation_euler = rot0.copy()
                    o.rotation_euler.z = rot0.z + 2 * math.pi * s.spin_turns * k
                    o.keyframe_insert("rotation_euler", frame=f)
    for s in steps:
        for o in s.objects:
            if o.animation_data and o.animation_data.action:
                for fc in _fcurves(o.animation_data.action):
                    for kp in fc.keyframe_points:
                        kp.interpolation = "LINEAR"


def _fcurves(action):
    """Blender 4.4+ layered actions keep fcurves in channelbags; older versions on the action."""
    if hasattr(action, "fcurves") and len(getattr(action, "fcurves", [])):
        return list(action.fcurves)
    out = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for bag in getattr(strip, "channelbags", []):
                out.extend(bag.fcurves)
    return out


def part_centre(objs) -> Vector:
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return (mn + mx) / 2


def export_labels(steps: list[ExplodeStep], cam: bpy.types.Object, frames: list[int], path: str) -> dict:
    """Project each labelled part's anchor into normalised screen space (0..1, y down)."""
    scene = bpy.context.scene
    data = {"width": scene.render.resolution_x, "height": scene.render.resolution_y, "frames": {}}
    for f in frames:
        scene.frame_set(f)
        entries = []
        for s in steps:
            if not s.label:
                continue
            c = part_centre(s.objects) + Vector(s.anchor_mm) * MM
            v = world_to_camera_view(scene, cam, c)
            entries.append({"id": s.id, "label": s.label, "note": s.note, "x": round(v.x, 4), "y": round(1 - v.y, 4)})
        data["frames"][str(f)] = entries
    with open(path, "w", encoding="utf8") as fh:
        json.dump(data, fh, indent=2)
    return data
