#!/usr/bin/env python3
"""ChatGPT 시안에서 일러스트 영역만 자동 crop (+ 배경 투명화).
- bounding box 자동 감지: 배경(단색 아이보리/흰색)과 다른 픽셀 범위 → 여백 패딩.
- --transparent: 테두리에서 flood-fill로 배경색에 연결된 영역만 투명화
  (내부 옅은 색은 외곽선이 막아줘서 안 뚫림 → 받침층 안 사라짐).
사용: python3 crop_illust.py <src.png> <out.png> [--thresh 16] [--pad 12] [--transparent] [--floodtol 30]
"""
import argparse
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--thresh", type=int, default=16, help="bbox 감지 임계(낮을수록 옅은 외곽선까지 포함)")
ap.add_argument("--pad", type=int, default=12, help="bbox 바깥 여백(px)")
ap.add_argument("--transparent", action="store_true", help="배경 flood-fill 투명화")
ap.add_argument("--floodtol", type=int, default=30, help="flood-fill 배경 허용 색차")
a = ap.parse_args()

im = Image.open(a.src).convert("RGB")
W, H = im.size
px = im.load()

def corner_avg(x0, y0):
    r = g = b = 0
    for x in range(x0, x0 + 5):
        for y in range(y0, y0 + 5):
            pr, pg, pb = px[x, y]; r += pr; g += pg; b += pb
    return (r // 25, g // 25, b // 25)

bg = corner_avg(0, H - 5)  # 좌하단 = 보통 순수 배경
br, bgc, bb = bg

# 1) bbox 감지
mask = Image.new("L", (W, H), 0); mpx = mask.load()
for y in range(H):
    for x in range(W):
        pr, pg, pb = px[x, y]
        if abs(pr - br) + abs(pg - bgc) + abs(pb - bb) > a.thresh:
            mpx[x, y] = 255
bbox = mask.getbbox()
if not bbox:
    raise SystemExit("NO_CONTENT (배경만 감지 — thresh 낮춰보세요)")
l, t, r, b = bbox
l = max(0, l - a.pad); t = max(0, t - a.pad); r = min(W, r + a.pad); b = min(H, b + a.pad)
crop = im.crop((l, t, r, b))

# 2) 배경 투명화 (테두리 seed에서 flood-fill)
if a.transparent:
    work = crop.copy()
    SENT = (255, 0, 255)
    cw, ch = work.size
    seeds = [(x, 0) for x in range(0, cw, 8)] + [(x, ch - 1) for x in range(0, cw, 8)] \
          + [(0, y) for y in range(0, ch, 8)] + [(cw - 1, y) for y in range(0, ch, 8)]
    for s in seeds:
        if work.getpixel(s) != SENT:
            ImageDraw.floodfill(work, s, SENT, thresh=a.floodtol)
    crop = crop.convert("RGBA")
    cpx = crop.load(); wpx = work.load()
    for y in range(ch):
        for x in range(cw):
            if wpx[x, y] == SENT:
                cr, cg, cb, _ = cpx[x, y]; cpx[x, y] = (cr, cg, cb, 0)

crop.save(a.out)
print(f"CROP {a.src} bg={bg} bbox=({l},{t},{r},{b}) transparent={a.transparent} -> {a.out} {crop.size}")
