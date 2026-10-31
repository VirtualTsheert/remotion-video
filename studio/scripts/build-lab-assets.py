#!/usr/bin/env python3
"""Membuat aset uji lab (bukan materi sejarah): adegan jalan kota lama dalam
lapisan SVG terpisah untuk menguji parallax 2.5D. Output: public/lab/."""
import random, os
random.seed(7)
W, H = 1600, 2400
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "lab")
os.makedirs(OUT, exist_ok=True)

def svg(body, defs=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><defs>{defs}</defs>{body}</svg>'

sky = svg('<rect width="100%" height="100%" fill="url(#g)"/>' +
          ''.join(f'<ellipse cx="{random.randint(0,W)}" cy="{random.randint(200,900)}" rx="{random.randint(150,380)}" ry="{random.randint(30,70)}" fill="#fff" opacity="0.18"/>' for _ in range(9)),
          '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd3d6"/><stop offset="0.6" stop-color="#eceae4"/><stop offset="1" stop-color="#f4f1ea"/></linearGradient>')

def ridge(y0, amp, color, step=80):
    pts = [f"0,{H}"]
    for x in range(0, W + step, step):
        pts.append(f"{x},{y0 + random.uniform(-amp, amp):.0f}")
    pts.append(f"{W},{H}")
    return f'<polygon points="{" ".join(pts)}" fill="{color}"/>'

far = svg(ridge(1180, 60, "#a9aeb0") + ridge(1300, 35, "#8f9597"))

def building(x, w, h, base, color):
    top = base - h
    s = f'<rect x="{x}" y="{top}" width="{w}" height="{h}" fill="{color}"/>'
    s += f'<rect x="{x-10}" y="{top-18}" width="{w+20}" height="22" fill="#4a4a46"/>'
    cols = max(2, w // 70)
    for r in range(int(h // 110)):
        for c in range(cols):
            wx = x + 22 + c * ((w - 44) / cols)
            s += f'<rect x="{wx:.0f}" y="{top + 40 + r*110}" width="{(w-44)/cols - 20:.0f}" height="70" fill="#2e2e2c" opacity="0.85"/>'
    return s

mid = svg(building(-20, 420, 620, 1760, "#bdb6a6") + building(400, 360, 760, 1760, "#c9c2b2") +
          building(760, 300, 540, 1760, "#b1aa9a") + building(1060, 560, 700, 1760, "#c4bdad") +
          f'<rect x="0" y="1760" width="{W}" height="{H-1760}" fill="#77736b"/>')

def figure(x, y, s):
    return (f'<g transform="translate({x},{y}) scale({s})" fill="#1d1d1b">'
            '<circle cx="0" cy="-260" r="34"/><path d="M-50,-220 L50,-220 L62,-40 L30,-40 L26,0 L8,0 L4,-60 L-4,-60 L-8,0 L-26,0 L-30,-40 L-62,-40 Z"/></g>')

near = svg(f'<rect x="120" y="900" width="26" height="1300" fill="#151514"/><rect x="88" y="880" width="90" height="60" rx="10" fill="#151514"/>'
           + figure(1180, 2150, 2.0) + figure(1380, 2180, 2.2) +
           f'<rect x="0" y="2150" width="{W}" height="{H-2150}" fill="#3a3834"/>')

for name, content in {"sky": sky, "far": far, "mid": mid, "near": near}.items():
    open(os.path.join(OUT, f"street-{name}.svg"), "w").write(content)

inner = lambda c: c.split("</defs>", 1)[1].rsplit("</svg>", 1)[0]
defs = sky.split("<defs>", 1)[1].split("</defs>", 1)[0]
open(os.path.join(OUT, "street-photo.svg"), "w").write(svg("".join(inner(c) for c in (sky, far, mid, near)), defs))
print("lab assets ->", os.path.abspath(OUT))
