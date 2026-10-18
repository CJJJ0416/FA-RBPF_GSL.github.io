"""Build public conceptual spaces with Open3D; never reads research maps.

Usage: python tools/prepare_scenarios.py --train-kit /path/to/extracted/kenney-kit
All dimensions below are illustrative metres, not architectural specifications.
"""
import argparse
import json
from pathlib import Path

import numpy as np
import open3d as o3d
import trimesh

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "static/models"
PALETTE = {
    "floor": "d6e0e6", "wall": "f0f4f6", "edge": "a0b5c3",
    "blue": "3e779d", "dark": "364e60", "glass": "91b8cb",
    "light": "b6cbd7", "yellow": "d7ad5b", "white": "f4f6f7",
}


def rgb(name):
    value = PALETTE.get(name, name)
    return np.array([int(value[i:i+2], 16) / 255 for i in (0, 2, 4)])


class Space:
    def __init__(self):
        self.mesh = o3d.geometry.TriangleMesh()

    def box(self, center, size, color="wall"):
        mesh = o3d.geometry.TriangleMesh.create_box(*size)
        mesh.translate(np.array(center) - np.array(size) / 2)
        mesh.paint_uniform_color(rgb(color))
        self.mesh += mesh

    def pillar(self, x, z, height=5.2, base=0):
        self.box((x, base+height/2, z), (.42, height, .42), "white")
        self.box((x, base+.15, z), (.6, .3, .6), "edge")

    def bench(self, x, z, floor=0, count=4):
        for k in range(count):
            self.box((x+k*.65, floor+.52, z), (.58, .13, .62), "blue")
            self.box((x+k*.65, floor+.92, z-.27), (.58, .7, .1), "blue")
        for dx in (.2, (count-1)*.65-.2):
            self.box((x+dx, floor+.23, z), (.1, .46, .4), "dark")

    def cabinet(self, x, z, floor=0):
        self.box((x, floor+1.05, z), (.8, 2.1, .65), "dark")
        self.box((x, floor+1.06, z+.334), (.71, 1.92, .025), "edge")
        for h in (1.5, 1.6, 1.7):
            self.box((x, floor+h, z+.35), (.52, .025, .025), "dark")
        self.box((x+.22, floor+1, z+.36), (.035, .22, .04), "blue")

    def rail(self, x0, x1, z, floor):
        self.box(((x0+x1)/2, floor+1, z), (x1-x0, .06, .06), "blue")
        for x in np.linspace(x0, x1, int(x1-x0)+1):
            self.box((x, floor+.5, z), (.045, 1, .045), "blue")

    def stairs(self, x, z, height=3.8, width=2.2, depth=6):
        for i in range(20):
            h = height*(i+1)/20
            self.box((x, h/2, z+(i+.5)*depth/20), (width, h, depth/20), "light")
            self.box((x, h+.015, z+i*depth/20+.035), (width, .03, .07), "edge")
        for side in (-1, 1):
            for i in range(0, 21, 2):
                self.box((x+side*width/2, height*i/20+.48, z+i*depth/20), (.05, .96, .05), "blue")
            # A sloping handrail, represented with a cylinder between its endpoints.
            self.line((x+side*width/2, .96, z), (x+side*width/2, height+.96, z+depth), .035, "blue")

    def line(self, start, end, radius, color):
        start, end = np.array(start), np.array(end)
        delta = end-start
        mesh = o3d.geometry.TriangleMesh.create_cylinder(radius, np.linalg.norm(delta), resolution=8)
        direction = delta / np.linalg.norm(delta)
        axis = np.cross([0, 0, 1], direction)
        if np.linalg.norm(axis) > 1e-8:
            axis = axis / np.linalg.norm(axis) * np.arccos(np.clip(direction[2], -1, 1))
            mesh.rotate(o3d.geometry.get_rotation_matrix_from_axis_angle(axis), center=(0, 0, 0))
        mesh.translate((start+end)/2)
        mesh.paint_uniform_color(rgb(color))
        self.mesh += mesh

    def tiled_floor(self, width, depth):
        self.box((0, -.25, 0), (width, .5, depth), "floor")
        for x in np.arange(-width/2+2, width/2, 2):
            self.box((x, .006, 0), (.022, .012, depth), "light")
        for z in np.arange(-depth/2+2, depth/2, 2):
            self.box((0, .006, z), (width, .012, .022), "light")

    def train(self, path, position, length, rotate=False):
        scene = trimesh.load(path, force="scene", process=False)
        merged = o3d.geometry.TriangleMesh()
        for name in scene.graph.nodes_geometry:
            transform, geometry_name = scene.graph[name]
            part = scene.geometry[geometry_name].copy()
            part.apply_transform(transform)
            mesh = o3d.geometry.TriangleMesh(
                o3d.utility.Vector3dVector(part.vertices),
                o3d.utility.Vector3iVector(part.faces))
            try:
                colors = part.visual.to_color().vertex_colors[:, :3] / 255
                mesh.vertex_colors = o3d.utility.Vector3dVector(colors)
            except (AttributeError, ValueError):
                mesh.paint_uniform_color(rgb("blue"))
            merged += mesh
        bounds = merged.get_axis_aligned_bounding_box()
        extent = bounds.get_extent()
        merged.translate(-bounds.get_center())
        # Orient the longest horizontal axis along X.
        if extent[2] > extent[0]:
            merged.rotate(o3d.geometry.get_rotation_matrix_from_xyz((0, np.pi/2, 0)), center=(0, 0, 0))
        # The source is stylized: fit it to the illustrative rail envelope,
        # rather than imply that the original game asset is dimensioned CAD.
        ext = merged.get_axis_aligned_bounding_box().get_extent()
        transform = np.eye(4)
        transform[:3, :3] = np.diag(np.array([length, 3.25, 2.7]) / ext)
        merged.transform(transform)
        bounds = merged.get_axis_aligned_bounding_box()
        merged.translate((0, -bounds.min_bound[1], 0))
        if rotate:
            merged.rotate(o3d.geometry.get_rotation_matrix_from_xyz((0, np.pi, 0)), center=(0, 0, 0))
        merged.translate(position)
        self.mesh += merged

    def save(self, name):
        mesh = self.mesh.remove_duplicated_triangles().remove_degenerate_triangles().remove_unreferenced_vertices()
        assert not mesh.is_empty()
        assert np.isfinite(np.asarray(mesh.vertices)).all()
        mesh.compute_vertex_normals()
        assert o3d.io.write_triangle_mesh(str(OUT/f"{name}.ply"), mesh, write_vertex_normals=False)
        return {"vertices": len(mesh.vertices), "triangles": len(mesh.triangles),
                "bounds": mesh.get_axis_aligned_bounding_box().get_extent().tolist()}


def metro(train):
    s = Space()
    s.tiled_floor(30, 22)
    # Two open levels expose the platform, stairs, and technical room.
    s.box((0, .38, 1), (29, .75, 9), "wall")
    s.box((0, .78, -3.25), (28.7, .035, .25), "yellow")
    s.box((0, .05, -6), (29, .12, 4.8), "dark")
    for z in (-6.85, -5.15):
        s.box((0, .18, z), (29, .12, .1), "edge")
    s.train(train, (-1, .25, -6), 20)
    s.box((0, 3.8, 8), (29, .28, 5.5), "floor")
    s.box((0, 5.1, 10.7), (29, 2.4, .25), "wall")
    s.box((-14.5, 3, 4.8), (.25, 6, 12), "wall")
    for x in (-10, -3, 4, 11):
        s.pillar(x, 4.4, 5.4, .75)
        s.bench(x, 1, .75)
    s.stairs(10, -.7, 3.8, 2.3, 6)
    s.rail(-13.9, 7.9, 5.2, 3.95)
    s.box((-8, 4.9, 5.7), (6, 2, .18), "glass")
    s.box((-4.9, 5.05, 8.1), (.18, 2.3, 5), "wall")
    for x in (-12.7, -11.5, -10.3, -9.1):
        s.cabinet(x, 9.8, 3.95)
    for x in (0, 1.3, 2.6, 3.9):
        s.box((x, 4.4, 8), (.42, 1, 1.7), "edge")
        s.box((x+.45, 4.6, 8), (.55, .5, .04), "glass")
    return s


def rail(train):
    s = Space()
    s.tiled_floor(34, 27)
    for z in (-7, -3):
        s.box((0, .05, z), (33, .15, 3.2), "dark")
        for dz in (-.8, .8):
            s.box((0, .19, z+dz), (33, .12, .1), "edge")
    s.train(train, (-2, .25, -7), 25)
    s.box((0, .5, 1), (33, 1, 4.5), "wall")
    s.box((0, 1.02, -1.05), (32.8, .04, .22), "yellow")
    s.box((0, 4.4, 8), (33, .3, 9), "floor")
    s.box((0, 6.2, 12.4), (33, 3.3, .2), "glass")
    s.box((-16.3, 6, 8), (.25, 3, 9), "wall")
    for x in (-13, -5, 3, 11):
        s.pillar(x, 3, 7.1)
        s.pillar(x, 11, 3, 4.55)
        s.box((x, 7.7, 7), (.18, .2, 10), "edge")
        s.bench(x, 7, 4.55, 5)
        s.bench(x, 9.5, 4.55, 5)
    s.stairs(12, -2.5, 4.4, 2.5, 6)
    s.rail(-16, 10.5, 3.5, 4.55)
    s.box((-12, 5.6, 5), (6, 2.1, .18), "wall")
    s.box((-8.9, 5.6, 6.5), (.18, 2.1, 3), "wall")
    for x in (-15, -13.8, -12.6):
        s.cabinet(x, 6.3, 4.55)
    s.box((-.4, 6.3, 10.8), (3.5, 1.3, .18), "dark")
    for y in (6, 6.3, 6.6):
        s.box((-.4, y, 10.69), (3, .06, .02), "yellow")
    return s


def airport():
    s = Space()
    s.tiled_floor(29, 25)
    s.box((0, 2.2, -12.1), (28.5, 4.4, .2), "glass")
    s.box((-14.25, 2.2, 0), (.2, 4.4, 24), "wall")
    for x in (-12, -6, 0, 6, 12):
        s.pillar(x, -11.7, 5.5)
        s.box((x, 5.5, -1), (.18, .18, 22), "edge")
        s.pillar(x, 9.8, 5.5)
    for x in (-10.5, -4, 2.5):
        for z in (-7, -4.8):
            s.bench(x, z, 0, 7)
    s.box((-1.8, 1.1, -10), (3.4, 1.1, 1), "white")
    s.box((-1.8, .5, -10), (3.4, .9, 1), "blue")
    s.box((-1.8, 2.8, -10.2), (2.5, .8, .12), "dark")
    for x in (-10, -6, -2):
        s.box((x, .6, 5.8), (2.5, 1.2, 1), "white")
        s.box((x, .35, 5.8), (2.5, .7, 1.03), "blue")
        s.box((x+.3, 1.55, 5.9), (.65, .45, .08), "dark")
        s.box((x+1.6, .25, 7), (.7, .5, 3), "dark")
    for x in (-11, -8, -5, -2):
        for z in (1, 3):
            s.box((x, .5, z), (.06, 1, .06), "blue")
            s.box((x, .04, z), (.3, .08, .3), "dark")
        s.line((x, .9, 1), (x, .9, 3), .025, "blue")
    s.box((7.7, 1.25, 1), (.2, 2.5, 19.5), "wall")
    s.box((11, 1.4, 5.8), (6.4, 2.8, .2), "wall")
    for z in (7, 8.3, 9.6):
        s.cabinet(12.6, z)
    s.box((10.5, .45, -5), (1.5, .9, 2), "edge")
    for z in (-6, -3.8):
        s.box((10.5, 1.7, z), (2.8, .2, .25), "blue")
        for x in (9.2, 11.8):
            s.box((x, .85, z), (.15, 1.7, .25), "blue")
    return s


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--train-kit", type=Path, required=True)
    args = parser.parse_args()
    OUT.mkdir(exist_ok=True)
    candidates = list(args.train_kit.rglob("train-electric-city-a.glb"))
    if not candidates:
        raise FileNotFoundError("Kenney train-electric-city-a.glb is required")
    train = candidates[0]
    fast = next(iter(args.train_kit.rglob("train-electric-bullet-a.glb")), train)
    stats = {}
    for name, space in (("metro", metro(train)), ("rail", rail(fast)), ("airport", airport())):
        stats[name] = space.save(name)
    manifest = {"generator": "Open3D " + o3d.__version__, "units": "illustrative metres", "scenes": stats}
    (OUT/"manifest.json").write_text(json.dumps(manifest, indent=2)+"\n")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
