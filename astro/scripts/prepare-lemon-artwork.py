"""Export lossless scene layers: python scripts/prepare-lemon-artwork.py SOURCE.svg."""

import argparse
import base64
import copy
import re
import xml.etree.ElementTree as ET
from pathlib import Path

SVG = "http://www.w3.org/2000/svg"
XLINK = "http://www.w3.org/1999/xlink"
ET.register_namespace("", SVG)
ET.register_namespace("xlink", XLINK)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path, help="Original nm-lemon-line-2.svg export")
root = ET.parse(parser.parse_args().source).getroot()
if root.get("width") != "4192" or root.get("height") != "1272":
    raise ValueError("Expected the original 4192 by 1272 PowerPoint SVG export.")
defs = root.find(f"{{{SVG}}}defs")
scene = root.find(f"{{{SVG}}}g")
if defs is None or scene is None or len(scene) != 52:
    raise ValueError("Expected the original definitions and 52 scene objects.")
output = Path(__file__).resolve().parents[1] / "public/src/img/lemon-line"
output.mkdir(parents=True, exist_ok=True)

# PowerPoint repeats the same original PNG for each lemon. Deduplicate only
# identical bytes; preserve paths, clipping, transforms, and compositing order.
images = {}
aliases = {}
for node in list(defs):
    if node.tag == f"{{{SVG}}}image":
        uri = node.get(f"{{{XLINK}}}href", "")
        if not uri.startswith("data:image/png;base64,"):
            raise ValueError(f"Expected an embedded PNG for {node.get('id')}.")
        data = base64.b64decode(uri.split(",", 1)[1], validate=True)
        if data in images:
            aliases[node.get("id")] = images[data]
            defs.remove(node)
        else:
            images[data] = node.get("id")
for node in root.iter():
    href = node.get(f"{{{XLINK}}}href", "")
    if href.startswith("#") and href[1:] in aliases:
        node.set(f"{{{XLINK}}}href", "#" + aliases[href[1:]])
definitions = {node.get("id"): node for node in defs}


def save(name, children, viewbox="0 0 4192 1272"):
    _, _, width, height = viewbox.split()
    result = ET.Element(
        f"{{{SVG}}}svg", {"width": width, "height": height, "viewBox": viewbox}
    )
    needed = set()
    pending = list(children)
    while pending:
        element = pending.pop()
        for node in element.iter():
            for value in node.attrib.values():
                refs = re.findall(r"url\(#([^)]*)\)", value)
                if value.startswith("#") and value[1:] in definitions:
                    refs.append(value[1:])
                for ref in refs:
                    if ref not in needed:
                        needed.add(ref)
                        pending.append(definitions[ref])
    selected = ET.SubElement(result, f"{{{SVG}}}defs")
    selected.extend(copy.deepcopy(definitions[key]) for key in sorted(needed))
    result.extend(children)
    with (output / name).open("wb") as destination:
        ET.ElementTree(result).write(
            destination, encoding="utf-8", xml_declaration=True
        )


def layer(name, indexes):
    group = ET.Element(f"{{{SVG}}}g", scene.attrib)
    group.extend(copy.deepcopy(scene[i]) for i in indexes)
    save(name, [group])


layer("fallback.svg", range(52))
layer("belts.svg", [20, 51])
layer("machine.svg", [21, 22, 23])
layer("basket.svg", range(34, 51))

# Keep each original overpaint in the lemon's own coordinates. The artwork
# remains exactly as authored, including the unmarked fruit's yellow patch.
for name, index in [("lemon.svg", 4), ("lemon-stamped.svg", 12)]:
    values = [
        float(v) for v in re.findall(r"[-+\d.e]+", scene[index].get("transform")[7:-1])
    ]
    a, b, c, d, tx, ty = values
    a, b, c, d = [v * 1785.94 for v in (a, b, c, d)]
    det = a * d - b * c
    inverse = (
        d / det,
        -b / det,
        -c / det,
        a / det,
        (c * ty - d * tx) / det,
        (b * tx - a * ty) / det,
    )
    original = ET.Element(f"{{{SVG}}}use", {f"{{{XLINK}}}href": "#img1"})
    cover = ET.Element(
        f"{{{SVG}}}g", {"transform": "matrix(" + " ".join(map(str, inverse)) + ")"}
    )
    cover.append(copy.deepcopy(scene[index + 1]))
    save(name, [original, cover], "0 0 512 512")

print({file.name: file.stat().st_size for file in output.iterdir()})
