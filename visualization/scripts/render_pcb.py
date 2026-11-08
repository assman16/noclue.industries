"""Render PCB shots defined in a config module.

Usage (from the repository root):
  blender -b --factory-startup --python visualization/scripts/render_pcb.py -- \
      --config sa100 --shots hero,detail --preset draft --out visualization/renders

Options:
  --config   module name in visualization/configs (default: sa100)
  --shots    comma separated shot names (default: all)
  --preset   override render preset (draft|still|master)
  --scale    resolution scale factor (e.g. 0.5 for quick checks)
  --save-blend  also save a .blend scene per shot for manual tweaking
"""
import argparse
import importlib
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
VIS = os.path.dirname(HERE)
sys.path[:0] = [os.path.join(VIS, "lib"), os.path.join(VIS, "configs")]

import bpy  # noqa: E402

import nci_pcb  # noqa: E402
import nci_studio as st  # noqa: E402


def parse():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--config", default="sa100")
    p.add_argument("--shots", default="")
    p.add_argument("--preset", default="")
    p.add_argument("--scale", type=float, default=1.0)
    p.add_argument("--out", default=os.path.join(VIS, "renders"))
    p.add_argument("--save-blend", action="store_true")
    return p.parse_args(argv)


def build_scene(cfg):
    st.reset_scene()
    st.make_world(color=(0.0025, 0.003, 0.0035), strength=1.0, gradient_top=0.01)
    root, meshes = nci_pcb.import_glb(os.path.abspath(cfg.MODEL), name=cfg.NAME.upper())
    nci_pcb.finish_board_layers(meshes)
    counts = nci_pcb.upgrade_materials(meshes, cfg.BOARD_COLORS)
    print("[nci] material classes:", counts)
    mn, _ = st.world_bbox(meshes)
    st.add_shadow_catcher(z=mn.z - 0.0002)
    return root, meshes


def main():
    args = parse()
    cfg = importlib.import_module(args.config)
    names = [s for s in args.shots.split(",") if s] or list(cfg.SHOTS)
    args.out = os.path.abspath(args.out)
    os.makedirs(args.out, exist_ok=True)

    build_scene(cfg)
    cam = None
    lights = []
    for name in names:
        shot = cfg.SHOTS[name]
        for l in lights:
            bpy.data.objects.remove(l, do_unlink=True)
        lights = st.add_lights(shot["lights"])
        if cam is None:
            cam = st.add_camera(shot["camera"])
        else:
            st.apply_camera(cam, shot["camera"])
        preset = st.PRESETS[args.preset or shot.get("preset", "still")]
        w, h = shot.get("resolution", (preset.width, preset.height))
        st.configure_render(preset, (int(w * args.scale), int(h * args.scale)))
        path = os.path.join(args.out, f"{cfg.NAME}-{name}.png")
        if args.save_blend:
            bpy.ops.wm.save_as_mainfile(filepath=os.path.join(args.out, f"{cfg.NAME}-{name}.blend"))
        st.render_still(path)


if __name__ == "__main__":
    main()
