#!/usr/bin/env python3
"""Export bounded, static navigation examples from a glocal2-nav checkout.

Run with that project's Python environment and GPU. Website consumers need only HTTP.
The source template and the live viewer's active map are read-only throughout export.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import tempfile


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_script(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def export_seed(source, template, work, output, requested_seed, frame_limit, point_limit):
    import numpy as np
    import trimesh
    from stair_nav.visualization import scene as viewer_scene
    from stair_nav.visualization.lidar import LidarPreview
    from stair_nav.visualization.motion import face_palette

    # Cap only public-web sensor samples. The native optimized path stays complete.
    original_builder = viewer_scene.build_scene_viewer
    def bounded_builder(*args, **kwargs):
        return original_builder(*args, max_frames=frame_limit, **kwargs)
    viewer_scene.build_scene_viewer = bounded_builder
    maps = load_script(source / "scripts/scenes/generate_random_map.py", "site_random_map")
    try:
        maps.generate(template, work, work, "static-site-export", requested_seed)
    finally:
        viewer_scene.build_scene_viewer = original_builder
    seed = json.loads((work / "scene.json").read_text())["seed"]
    route_worker = load_script(source / "scripts/planning/generate_random_route.py", "site_random_route")
    random_dir = work / "random_routes/current"
    route_worker.generate(work, random_dir, seed=seed ^ 0x35A81, max_frames=frame_limit)
    bundle = json.loads((work / "viewer_data.json").read_text())
    random_route = json.loads((random_dir / "route.json").read_text())
    bundle["routes"].append(random_route)
    model = bundle["scene"]
    target = output / str(seed)
    target.mkdir()
    mesh = trimesh.load(work / "terrain.obj", force="mesh", process=False)
    positions = np.asarray(mesh.triangles, dtype="<f4").reshape(-1, 3)
    colors = np.repeat(face_palette(mesh, model).astype(np.uint8), 3, axis=0)
    (target / "building.bin").write_bytes(positions.tobytes() + colors.tobytes())
    bound = max(abs(float(v)) for row in model["bounds_world"] for v in row)
    scale = max(.001, bound / 32000)
    lidar = LidarPreview()
    lidar.describe(work)
    lidar._prepare()
    camera = {k:v for k,v in bundle["routes"][0]["report"]["camera"].items() if k != "config_source"}
    route_list = []
    names = {
        "ascent": ["跨楼层上行", "Across floors · ascent"],
        "descent": ["跨楼层下行", "Across floors · descent"],
        "lower_corridor": ["底层室内穿行", "Ground-floor rooms"],
        "upper_corridor": ["顶层室内穿行", "Upper-floor rooms"],
        "upper_bridge": ["无栏杆窄桥", "Exposed narrow bridge"],
    }
    for ordinal, route in enumerate(bundle["routes"]):
        report = route["report"]
        query = report["query"]
        is_random = query.startswith("random_")
        public_id = "random_crossfloor" if is_random else query
        labels = ([f"随机两点 · {report['start_floor']+1}F → {report['goal_floor']+1}F",
                   f"Random endpoints · {report['start_floor']+1}F → {report['goal_floor']+1}F"]
                  if is_random else names.get(query, [query, query]))
        csv_path = random_dir / "random.gpmp.csv" if is_random else work / "paths" / f"{query}.gpmp.csv"
        path = np.atleast_2d(np.loadtxt(csv_path, delimiter=",", skiprows=1))
        frames, clouds, cursor = [], [], 0
        for i, frame in enumerate(route["frames"]):
            scan = lidar.scan(frame["pose"], frame["t"], i, lidar.config["pitch_deg"])
            pts = np.asarray(scan["points_world"], dtype=float).reshape(-1, 3)
            ranges = np.asarray(scan["ranges"], dtype=float)
            if len(pts) > point_limit:
                keep = np.linspace(0, len(pts)-1, point_limit, dtype=int)
                pts, ranges = pts[keep], ranges[keep]
            packed = np.empty((len(pts), 4), dtype="<i2")
            packed[:, :3] = np.rint(pts / scale).astype("<i2")
            packed[:, 3] = np.rint(ranges * 1000).astype("<i2")
            clouds.append(packed.tobytes())
            frames.append(dict(t=frame["t"], pose=frame["pose"], rgb=frame["rgb"], depth=frame["depth"],
                coverage=frame["coverage"], lidar=dict(origin=scan["origin"], offset=cursor,
                count=len(pts), hit_count=scan["hit_count"], ray_count=scan["ray_count"],
                perspective=scan["perspective_image"], panorama=scan["range_image"])))
            cursor += len(pts)
        cloud_file = target / (public_id + ".bin")
        cloud_file.write_bytes(b"".join(clouds))
        duration = report["duration_s"]
        data = dict(id=public_id, seed=seed, labels=labels, length_m=report["reference_length_m"],
            duration_s=duration, camera=camera, path=np.round(path, 6).tolist(),
            sensor_fps=(len(frames)-1)/duration, frames=frames,
            clouds=dict(file=cloud_file.name, scale_m=scale, stride_bytes=8, range_scale_m=.001),
            validation="native_gpmp_output; geometry_collision_validation_disabled")
        json_file = target / (public_id + ".json")
        write_json(json_file, data)
        route_list.append(dict(id=public_id, labels=labels, file=json_file.name,
            frames=len(frames), duration_s=duration, length_m=data["length_m"],
            sensor_fps=data["sensor_fps"], bytes=json_file.stat().st_size+cloud_file.stat().st_size,
            start_z=frames[0]["pose"][2], goal_z=frames[-1]["pose"][2],
            different_floors=bool(report.get("different_floors", query in ("ascent", "descent")))))
        print(f"Exported seed {seed}/{public_id}: {len(frames)} frames", flush=True)
    architecture = model["architecture"]
    info = dict(seed=seed, requested_seed=requested_seed, family=architecture["family"],
        label=architecture["label"], floors=len(model["floors"]), rooms=len(model["rooms"]),
        stairs=len(model["stair_flights"]), bounds=model["bounds_world"], routes=route_list,
        floor_heights=[floor["z"] for floor in model["floors"]],
        bridge_count=sum(f.get("kind")=="bridge" for f in model.get("floor_features", [])),
        mesh=dict(file="building.bin", vertices=len(positions), positions_bytes=positions.nbytes),
        lidar_config=lidar.config)
    write_json(target / "scene.json", info)
    provenance = dict(seed=seed, generator=architecture["generator"],
        topology_sha256=architecture["topology_sha256"],
        source_commit=subprocess.check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip(),
        inputs={name:digest(work/name) for name in ("scene.json", "terrain.obj", "terrain.pcd", "vst.pickle", "paths.report.json")},
        route_csv_sha256={r["id"]:digest(random_dir / "random.gpmp.csv" if r["id"]=="random_crossfloor" else work / "paths" / (r["id"]+".gpmp.csv")) for r in route_list},
        scope="Synthetic mesh ray casting along saved native GPMP references. Geometry collision validation disabled; no robot dynamics or field deployment.")
    write_json(target / "provenance.json", provenance)
    return {k:info[k] for k in ("seed", "family", "label", "floors", "rooms", "stairs", "bridge_count", "routes")}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--template", type=Path, help="Read-only scene template with VST and camera configuration")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1]/"static/navigation")
    parser.add_argument("--seed", type=int, action="append")
    parser.add_argument("--count", type=int, default=3)
    parser.add_argument("--frames", type=int, default=128)
    parser.add_argument("--points", type=int, default=512)
    args = parser.parse_args()
    if args.count < 1 or not 2 <= args.frames <= 1000 or not 1 <= args.points <= 1000:
        parser.error("count >= 1, frames 2..1000 and points 1..1000 are required")
    source = args.source_root.resolve()
    template = (args.template or source/"outputs/upstream_f5580008/easy_00043_edit02").resolve()
    output = args.output.resolve()
    sys.path[:0] = [str(source/"src"), str(source/"scripts/scenes")]
    os.environ.setdefault("CUDA_PATH", "/usr/local/cuda")
    os.environ.setdefault("CUPY_CACHE_DIR", str(source/".cache/cupy"))
    os.environ.setdefault("MPLCONFIGDIR", str(source/".cache/matplotlib"))
    os.environ["PYTHONPATH"] = str(source/"src")+os.pathsep+os.environ.get("PYTHONPATH", "")
    seeds = args.seed or [secrets.randbelow(2**30) for _ in range(args.count)]
    if len(seeds) != len(set(seeds)):
        parser.error("seed values must be unique")
    (source/".cache").mkdir(exist_ok=True)
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".navigation-export-", dir=output.parent) as publish_tmp:
        stage = Path(publish_tmp)
        examples = []
        for seed in seeds:
            with tempfile.TemporaryDirectory(prefix="site-seed-", dir=source/".cache") as raw_tmp:
                examples.append(export_seed(source, template, Path(raw_tmp), stage, seed, args.frames, args.points))
        if len({e["seed"] for e in examples}) != len(examples):
            raise RuntimeError("Generation retries produced duplicate seeds")
        files = {str(p.relative_to(stage)):dict(bytes=p.stat().st_size, sha256=digest(p))
                 for p in stage.rglob("*") if p.is_file()}
        write_json(stage/"manifest.json", dict(schema_version=1, generated_at=datetime.now(timezone.utc).isoformat(),
            examples=examples, files=files, frame_cap=args.frames, display_point_cap=args.points,
            lidar_colors_rgb=(__import__("matplotlib").colormaps["turbo_r"](__import__("numpy").linspace(0, 1, 256))[:, :3]*255).astype(int).tolist(),
            scope="Precomputed random buildings, native GPMP references and ideal synthetic sensor previews."))
        backup = output.with_name(output.name+".previous")
        if backup.exists():
            raise RuntimeError(f"Previous export still exists: {backup}")
        if output.exists():
            output.rename(backup)
        try:
            stage.rename(output)
        except BaseException:
            if backup.exists():backup.rename(output)
            raise
        if backup.exists():shutil.rmtree(backup)
    print(f"Static navigation cache: {output}", flush=True)


if __name__ == "__main__":
    main()
