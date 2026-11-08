"""NoClue Industries — studio toolkit for Blender (4.2+ / 4.5 LTS).

Reusable building blocks for product visualisation:
  * scene reset + Cycles render presets (GPU / OptiX when available)
  * camera rig with look-at, lens, DOF and orthographic options
  * studio lights (softboxes, strip lights, rim lights) aimed at a target
  * shadow catcher so renders can be composited onto the website's exact
    background colour (see visualization/scripts/composite.py)
  * a material library (PCB finishes, anodised aluminium, steel, polymers)

Every helper is deterministic: the same config always produces the same frame.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Iterable, Sequence

import bpy
from mathutils import Vector

# ---------------------------------------------------------------------------
# Scene + render
# ---------------------------------------------------------------------------


def reset_scene() -> bpy.types.Scene:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    return scene


def enable_gpu(prefer: Sequence[str] = ("OPTIX", "CUDA", "HIP", "METAL", "ONEAPI")) -> str:
    """Enable the best available Cycles compute backend. Returns the backend used.

    Set NCI_DEVICE=CPU to force CPU rendering (useful when the GPU is busy with
    other applications and VRAM is short)."""
    import os

    if os.environ.get("NCI_DEVICE", "").upper() == "CPU":
        bpy.context.scene.cycles.device = "CPU"
        bpy.context.scene.render.threads_mode = "AUTO"
        return "CPU"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for backend in prefer:
        try:
            prefs.compute_device_type = backend
        except TypeError:
            continue
        prefs.get_devices()
        devices = [d for d in prefs.devices if d.type == backend]
        if devices:
            for d in prefs.devices:
                d.use = d.type == backend
            bpy.context.scene.cycles.device = "GPU"
            return backend
    bpy.context.scene.cycles.device = "CPU"
    return "CPU"


@dataclass
class RenderPreset:
    width: int = 1920
    height: int = 1080
    samples: int = 256
    noise_threshold: float = 0.01
    denoise: bool = True
    transparent: bool = True
    look: str = "AgX - Medium High Contrast"
    exposure: float = 0.0
    motion_blur: bool = False
    max_bounces: int = 8


PRESETS = {
    # quick framing checks
    "draft": RenderPreset(width=960, height=540, samples=24),
    # web stills
    "still": RenderPreset(samples=384),
    # high-resolution masters
    "master": RenderPreset(width=3840, height=2160, samples=512),
    # web stills when the GPU is shared / VRAM is tight
    "still_light": RenderPreset(samples=192, noise_threshold=0.02, max_bounces=6),
    # animation frames (balanced for sequence rendering; OIDN cleans the rest)
    "sequence": RenderPreset(width=1600, height=900, samples=48, noise_threshold=0.03, max_bounces=6),
}


def configure_render(preset: RenderPreset, resolution: tuple[int, int] | None = None) -> None:
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    backend = enable_gpu()
    print(f"[nci] Cycles backend: {backend}")
    c = scene.cycles
    c.samples = preset.samples
    c.use_adaptive_sampling = True
    c.adaptive_threshold = preset.noise_threshold
    c.use_denoising = preset.denoise
    try:
        c.denoiser = "OPENIMAGEDENOISE"
        c.denoising_use_gpu = backend != "CPU"
    except (AttributeError, TypeError):
        pass
    c.max_bounces = preset.max_bounces
    c.glossy_bounces = 6
    c.transmission_bounces = 8
    c.caustics_reflective = False
    c.caustics_refractive = False
    c.blur_glossy = 0.5

    w, h = resolution or (preset.width, preset.height)
    scene.render.resolution_x = w
    scene.render.resolution_y = h
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = preset.transparent
    scene.render.use_motion_blur = preset.motion_blur

    vs = scene.view_settings
    vs.view_transform = "AgX"
    try:
        vs.look = preset.look
    except TypeError:
        vs.look = "None"
    vs.exposure = preset.exposure
    vs.gamma = 1.0

    img = scene.render.image_settings
    img.file_format = "PNG"
    img.color_mode = "RGBA" if preset.transparent else "RGB"
    img.color_depth = "16"
    img.compression = 15


def render_still(path: str) -> None:
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"[nci] wrote {path}")


# ---------------------------------------------------------------------------
# World
# ---------------------------------------------------------------------------


def make_world(color=(0.004, 0.005, 0.006), strength: float = 1.0, gradient_top: float = 0.0) -> None:
    """Dark studio world. Optional vertical gradient gives glossy surfaces a soft horizon."""
    world = bpy.data.worlds.new("NCI_World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = strength
    if gradient_top > 0:
        tex = nt.nodes.new("ShaderNodeTexCoord")
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.0
        ramp.color_ramp.elements[0].color = (*color, 1)
        ramp.color_ramp.elements[1].position = 1.0
        top = tuple(min(1.0, c + gradient_top) for c in color)
        ramp.color_ramp.elements[1].color = (*top, 1)
        nt.links.new(tex.outputs["Generated"], sep.inputs[0])
        nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    else:
        bg.inputs["Color"].default_value = (*color, 1)
    nt.links.new(bg.outputs[0], out.inputs[0])


# ---------------------------------------------------------------------------
# Transform helpers
# ---------------------------------------------------------------------------


def look_at(obj: bpy.types.Object, target: Iterable[float], roll: float = 0.0) -> None:
    direction = Vector(target) - obj.location
    quat = direction.to_track_quat("-Z", "Y")
    obj.rotation_mode = "XYZ"
    obj.rotation_euler = quat.to_euler()
    if roll:
        obj.rotation_euler.rotate_axis("Z", math.radians(roll))


def spherical(target: Iterable[float], distance: float, azimuth_deg: float, elevation_deg: float) -> Vector:
    """Point on a sphere around target. Azimuth 0 = camera on -Y (front) looking toward +Y; positive = toward +X."""
    az = math.radians(azimuth_deg)
    el = math.radians(elevation_deg)
    t = Vector(target)
    return t + Vector((
        distance * math.cos(el) * math.sin(az),
        -distance * math.cos(el) * math.cos(az),
        distance * math.sin(el),
    ))


# ---------------------------------------------------------------------------
# Camera
# ---------------------------------------------------------------------------


@dataclass
class CameraSpec:
    target: tuple[float, float, float]
    distance: float
    azimuth: float
    elevation: float
    lens: float = 85.0
    roll: float = 0.0
    ortho_scale: float | None = None  # set to use an orthographic camera
    fstop: float | None = None  # set to enable depth of field
    focus: tuple[float, float, float] | None = None  # focus point (defaults to target)
    shift_x: float = 0.0
    shift_y: float = 0.0
    sensor: float = 36.0


def add_camera(spec: CameraSpec, name: str = "NCI_Camera") -> bpy.types.Object:
    cam_data = bpy.data.cameras.new(name)
    cam = bpy.data.objects.new(name, cam_data)
    bpy.context.scene.collection.objects.link(cam)
    apply_camera(cam, spec)
    bpy.context.scene.camera = cam
    return cam


def apply_camera(cam: bpy.types.Object, spec: CameraSpec) -> None:
    d = cam.data
    d.sensor_fit = "HORIZONTAL"
    d.sensor_width = spec.sensor
    d.clip_start = 0.001
    d.clip_end = 100
    d.shift_x = spec.shift_x
    d.shift_y = spec.shift_y
    if spec.ortho_scale:
        d.type = "ORTHO"
        d.ortho_scale = spec.ortho_scale
    else:
        d.type = "PERSP"
        d.lens = spec.lens
    cam.location = spherical(spec.target, spec.distance, spec.azimuth, spec.elevation)
    look_at(cam, spec.target, spec.roll)
    if spec.fstop:
        d.dof.use_dof = True
        d.dof.aperture_fstop = spec.fstop
        focus = Vector(spec.focus or spec.target)
        d.dof.focus_distance = (focus - cam.location).length
    else:
        d.dof.use_dof = False


# ---------------------------------------------------------------------------
# Lights
# ---------------------------------------------------------------------------


@dataclass
class LightSpec:
    name: str
    position: tuple[float, float, float]
    target: tuple[float, float, float]
    energy: float
    size: tuple[float, float] = (0.3, 0.3)
    color: tuple[float, float, float] = (1.0, 1.0, 1.0)
    spread_deg: float = 180.0
    shape: str = "RECTANGLE"
    visible_glossy: bool = True
    kind: str = "AREA"


def add_light(spec: LightSpec) -> bpy.types.Object:
    data = bpy.data.lights.new(spec.name, spec.kind)
    data.energy = spec.energy
    data.color = spec.color
    if spec.kind == "AREA":
        data.shape = spec.shape
        data.size = spec.size[0]
        data.size_y = spec.size[1]
        data.spread = math.radians(spec.spread_deg)
    elif spec.kind == "SPOT":
        data.spot_size = math.radians(spec.spread_deg)
        data.spot_blend = 0.6
        data.shadow_soft_size = spec.size[0]
    obj = bpy.data.objects.new(spec.name, data)
    obj.location = spec.position
    look_at(obj, spec.target)
    bpy.context.scene.collection.objects.link(obj)
    obj.visible_glossy = spec.visible_glossy
    obj.visible_camera = False
    return obj


def add_lights(specs: Iterable[LightSpec]) -> list[bpy.types.Object]:
    return [add_light(s) for s in specs]


# ---------------------------------------------------------------------------
# Ground / shadow catcher
# ---------------------------------------------------------------------------


def add_shadow_catcher(z: float = 0.0, size: float = 4.0) -> bpy.types.Object:
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z))
    plane = bpy.context.active_object
    plane.name = "NCI_ShadowCatcher"
    plane.is_shadow_catcher = True
    mat = principled("NCI_Catcher", (0.02, 0.02, 0.02), roughness=0.6)
    plane.data.materials.append(mat)
    return plane


def add_floor(z: float = 0.0, size: float = 6.0, color=(0.006, 0.007, 0.008), roughness: float = 0.35) -> bpy.types.Object:
    """A visible dark floor (for compositions that need real reflections instead of a catcher)."""
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z))
    plane = bpy.context.active_object
    plane.name = "NCI_Floor"
    plane.data.materials.append(principled("NCI_Floor", color, roughness=roughness, specular=0.4))
    return plane


# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------


def _bsdf(mat: bpy.types.Material) -> bpy.types.Node:
    return mat.node_tree.nodes["Principled BSDF"]


def _set(bsdf: bpy.types.Node, name: str, value) -> None:
    if name in bsdf.inputs:
        bsdf.inputs[name].default_value = value


def principled(
    name: str,
    color,
    metallic: float = 0.0,
    roughness: float = 0.5,
    specular: float = 0.5,
    coat: float = 0.0,
    coat_roughness: float = 0.05,
    transmission: float = 0.0,
    ior: float = 1.45,
    anisotropic: float = 0.0,
    emission=None,
    emission_strength: float = 0.0,
    alpha: float = 1.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    b = _bsdf(mat)
    _set(b, "Base Color", (*color[:3], 1.0))
    _set(b, "Metallic", metallic)
    _set(b, "Roughness", roughness)
    _set(b, "Specular IOR Level", specular)
    _set(b, "Coat Weight", coat)
    _set(b, "Coat Roughness", coat_roughness)
    _set(b, "Transmission Weight", transmission)
    _set(b, "IOR", ior)
    _set(b, "Anisotropic", anisotropic)
    _set(b, "Alpha", alpha)
    if emission is not None:
        _set(b, "Emission Color", (*emission[:3], 1.0))
        _set(b, "Emission Strength", emission_strength)
    return mat


def add_surface_noise(mat: bpy.types.Material, scale: float = 900.0, strength: float = 0.02, rough_var: float = 0.08) -> None:
    """Micro-texture: tiny bump + roughness variation so surfaces don't look CG-perfect."""
    nt = mat.node_tree
    b = _bsdf(mat)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 8.0
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = 0.0002
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    if rough_var > 0:
        base_r = b.inputs["Roughness"].default_value
        mr = nt.nodes.new("ShaderNodeMapRange")
        mr.inputs["To Min"].default_value = max(0.0, base_r - rough_var)
        mr.inputs["To Max"].default_value = min(1.0, base_r + rough_var)
        nt.links.new(noise.outputs["Fac"], mr.inputs["Value"])
        nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])


def brushed(mat: bpy.types.Material, axis: str = "X", scale: float = 4000.0, strength: float = 0.03) -> None:
    """Directional brushing pattern (anisotropic look) using a stretched noise."""
    nt = mat.node_tree
    b = _bsdf(mat)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    s = [scale, scale, scale]
    s["XYZ".index(axis)] = scale * 0.01
    mapping.inputs["Scale"].default_value = s
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 1.0
    noise.inputs["Detail"].default_value = 4.0
    nt.links.new(coord.outputs["Object"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = 0.0001
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])


class Library:
    """Named, reusable materials. Colours are linear RGB."""

    @staticmethod
    def anodized(name="NCI_Anodized_Gunmetal", color=(0.035, 0.038, 0.042), roughness=0.32):
        m = principled(name, color, metallic=1.0, roughness=roughness, specular=0.5)
        add_surface_noise(m, scale=2500, strength=0.015, rough_var=0.05)
        return m

    @staticmethod
    def bead_blasted_aluminium(name="NCI_Aluminium_Blasted", color=(0.55, 0.56, 0.57)):
        m = principled(name, color, metallic=1.0, roughness=0.42)
        add_surface_noise(m, scale=3500, strength=0.03, rough_var=0.06)
        return m

    @staticmethod
    def machined_aluminium(name="NCI_Aluminium_Machined", color=(0.80, 0.81, 0.82)):
        m = principled(name, color, metallic=1.0, roughness=0.18, anisotropic=0.6)
        brushed(m)
        return m

    @staticmethod
    def black_oxide(name="NCI_Steel_BlackOxide"):
        m = principled(name, (0.018, 0.018, 0.02), metallic=1.0, roughness=0.38)
        add_surface_noise(m, scale=3000, strength=0.02)
        return m

    @staticmethod
    def stainless(name="NCI_Steel_Stainless"):
        return principled(name, (0.62, 0.62, 0.63), metallic=1.0, roughness=0.22)

    @staticmethod
    def brass(name="NCI_Brass"):
        return principled(name, (0.78, 0.56, 0.24), metallic=1.0, roughness=0.28)

    @staticmethod
    def silicone(name="NCI_Silicone_Signal", color=(0.90, 0.16, 0.02)):
        m = principled(name, color, roughness=0.55, specular=0.35)
        add_surface_noise(m, scale=1800, strength=0.01, rough_var=0.05)
        return m

    @staticmethod
    def polymer(name="NCI_Polymer_Black", color=(0.012, 0.012, 0.013), roughness=0.45):
        m = principled(name, color, roughness=roughness, specular=0.5)
        add_surface_noise(m, scale=2200, strength=0.01, rough_var=0.06)
        return m

    @staticmethod
    def glass(name="NCI_Glass", tint=(0.92, 0.95, 0.96)):
        return principled(name, tint, roughness=0.02, transmission=1.0, ior=1.52)

    @staticmethod
    def enig(name="NCI_ENIG"):
        return principled(name, (0.95, 0.73, 0.38), metallic=1.0, roughness=0.22)

    @staticmethod
    def tin(name="NCI_Tin"):
        return principled(name, (0.70, 0.71, 0.72), metallic=1.0, roughness=0.3)

    @staticmethod
    def soldermask(name="NCI_Soldermask", color=(0.012, 0.05, 0.025), alpha=1.0, finish="gloss"):
        """LPI soldermask: epoxy base + clear lacquer.
        gloss: classic shiny mask. satin: semi-gloss (typical of black/matte-black masks) -
        a broader, softer sheen that still traces grazing highlights over copper relief."""
        if finish == "satin":
            m = principled(name, color, roughness=0.42, specular=0.55, coat=0.55, coat_roughness=0.16, alpha=alpha)
            add_surface_noise(m, scale=1400, strength=0.006, rough_var=0.04)
            return m
        return principled(name, color, roughness=0.35, specular=0.5, coat=0.7, coat_roughness=0.07, alpha=alpha)

    @staticmethod
    def silkscreen(name="NCI_Silkscreen", color=(0.82, 0.80, 0.72)):
        return principled(name, color, roughness=0.7, specular=0.3)

    @staticmethod
    def fr4(name="NCI_FR4", color=(0.30, 0.28, 0.16)):
        return principled(name, color, roughness=0.6, specular=0.35)


# ---------------------------------------------------------------------------
# Object helpers
# ---------------------------------------------------------------------------


def world_bbox(objects: Iterable[bpy.types.Object]) -> tuple[Vector, Vector]:
    mn = Vector((math.inf,) * 3)
    mx = Vector((-math.inf,) * 3)
    for o in objects:
        if o.type != "MESH":
            continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            mn = Vector((min(mn.x, w.x), min(mn.y, w.y), min(mn.z, w.z)))
            mx = Vector((max(mx.x, w.x), max(mx.y, w.y), max(mx.z, w.z)))
    return mn, mx


def smooth_shade(obj: bpy.types.Object, angle_deg: float = 30.0) -> None:
    if obj.type != "MESH":
        return
    try:
        obj.data.set_sharp_from_angle(angle=math.radians(angle_deg))
    except AttributeError:
        for p in obj.data.polygons:
            p.use_smooth = True


def bevel_modifier(obj: bpy.types.Object, width: float = 0.0004, segments: int = 3, angle_deg: float = 40.0):
    mod = obj.modifiers.new("NCI_Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(angle_deg)
    mod.harden_normals = True
    return mod


@dataclass
class ShotResult:
    name: str
    path: str
    extras: dict = field(default_factory=dict)
