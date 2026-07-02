#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
슬라이드 텍스트 합성 렌더러 (Pillow)
- 디자인 시스템(슬라이드-디자인-시스템.md)의 토큰·좌표를 코드로 옮겨,
  배경(생성 이미지 or CSS식 단색/그라디언트) 위에 텍스트 레이어를 픽셀 정확히 합성.
- AI 이미지엔 글자를 굽지 않는다 → 오타 0, 폰트·좌표·색 100% 일관.
- 푸터 라인 + 푸터 텍스트(주식회사 덥덥덥 · ww-w.ai) + 페이지번호(현재값, 2자리 zero-pad)도 여기서 그린다.

입력 배경(있으면 사용, 없으면 플레이스홀더):  backgrounds/<id>.png   (예: P3, P5, P7, P9, P1)
출력:  out/<id>.png  (1920x1080)
실행:  python3 scripts/render_slides.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG_DIR = os.path.join(ROOT, "backgrounds")
OUT_DIR = os.path.join(ROOT, "out")
FONTS = os.path.expanduser("~/Library/Fonts")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(BG_DIR, exist_ok=True)

W, H = 1920, 1080

# ---- 폰트 매핑 (역할/weight -> 파일) ----
FONT_FILES = {
    ("sans", 400): os.path.join(FONTS, "Pretendard-Regular.otf"),
    ("sans", 500): os.path.join(FONTS, "Pretendard-Medium.otf"),
    ("sans", 600): os.path.join(FONTS, "Pretendard-SemiBold.otf"),
    ("sans", 700): os.path.join(FONTS, "Pretendard-Bold.otf"),
    ("sans", 800): os.path.join(FONTS, "Pretendard-ExtraBold.otf"),
    ("sans", 900): os.path.join(FONTS, "Pretendard-Black.otf"),
    ("serif", 600): os.path.join(FONTS, "NanumMyeongjo-YetHangul.ttf"),
    ("mono", 400): os.path.join(FONTS, "JetBrainsMono-Regular.ttf"),
    ("mono", 500): os.path.join(FONTS, "JetBrainsMono-Medium.ttf"),
}
_font_cache = {}
def font(family, weight, size):
    # 가까운 weight로 폴백
    key = (family, weight)
    if key not in FONT_FILES:
        avail = [w for (f, w) in FONT_FILES if f == family]
        weight = min(avail, key=lambda w: abs(w - weight))
        key = (family, weight)
    ck = (key, size)
    if ck not in _font_cache:
        _font_cache[ck] = ImageFont.truetype(FONT_FILES[key], size)
    return _font_cache[ck]

def hx(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

# ---- 토큰 (§2 컬러 / §3.2 타입) ----
C = {
    # DARK (cover/divider/section) — 중성 니어블랙
    "dark.bg": "#141417", "dark.bg2": "#1C1C20", "dark.bg3": "#0E0E11",
    "dark.primary": "#F4F4F1", "dark.secondary": "#C8C8C4", "dark.muted": "#8C8C89",
    "dark.accent": "#F87145", "dark.accent2": "#46B6C7", "dark.accent3": "#E6A93C",
    "dark.border": "#33333A",
    # LIGHT (explanation) — 클린 오프화이트(아주 옅은 웜뉴트럴)
    "light.bg": "#FFFFFF", "light.primary": "#000000", "light.secondary": "#57565A",
    "light.muted": "#6E6D72", "light.accent": "#E85C34", "light.clay": "#BC4319",
    # 액센트 3색 (대비 검증): coral / teal / amber. *.deep = 본문크기 텍스트용(AA)
    "light.accent2": "#1F6E78", "light.accent3": "#8F6410",
    "light.highlight": "#F8C6AE", "light.border": "#E2E1DD",
    # PHOTO overlay — 화이트 톤
    "photo.text": "#FFFFFF", "photo.footer": "#FFFFFF",
}
FOOTER_TEXT = "주식회사 덥덥덥 · ww-w.ai"

# 모드별 푸터 색
FOOTER_COLOR = {"dark": "#8C8C89", "light": "#8B8A8E", "photo": "#FFFFFF"}
RULE_COLOR = {"dark": "#33333A", "light": "#E2E1DD", "photo": None}

# ---------- 그리기 헬퍼 ----------
def wrap(text, fnt, maxw):
    out = []
    for para in text.split("\n"):
        words = para.split(" ")
        cur = ""
        for w in words:
            trial = w if not cur else cur + " " + w
            if fnt.getlength(trial) <= maxw or not cur:
                if not cur and fnt.getlength(w) > maxw:  # 한 단어가 너무 길면 글자 단위
                    s = ""
                    for ch in w:
                        if fnt.getlength(s + ch) <= maxw:
                            s += ch
                        else:
                            out.append(s); s = ch
                    cur = s
                else:
                    cur = trial
            else:
                out.append(cur); cur = w
        out.append(cur)
    return out

def draw_para(d, text, x, y, fnt, fill, lh, maxw, align="left"):
    lines = wrap(text, fnt, maxw)
    cy = y
    for ln in lines:
        if align == "center":
            lw = fnt.getlength(ln)
            d.text((x + (maxw - lw) / 2, cy), ln, font=fnt, fill=fill)
        else:
            d.text((x, cy), ln, font=fnt, fill=fill)
        cy += lh
    return cy  # 다음 y

def vgrad(stops):
    """세로 그라디언트 RGBA 이미지 (stops: [(pos0~1, (r,g,b,a)), ...])"""
    g = Image.new("RGBA", (1, H))
    px = g.load()
    stops = sorted(stops)
    for yy in range(H):
        t = yy / (H - 1)
        # 구간 보간
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]; p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                f = 0 if p1 == p0 else (t - p0) / (p1 - p0)
                px[0, yy] = tuple(round(c0[j] + (c1[j] - c0[j]) * f) for j in range(4))
                break
        else:
            px[0, yy] = stops[-1][1]
    return g.resize((W, H))

SCRIMS = {
    "bottom": [(0.0, (12, 12, 14, 0)), (0.55, (12, 12, 14, 0)), (1.0, (12, 12, 14, 199))],
    "full":   [(0.0, (12, 12, 14, 89)), (0.4, (12, 12, 14, 38)), (1.0, (12, 12, 14, 179))],
    "footer": [(0.0, (12, 12, 14, 0)), (0.86, (12, 12, 14, 0)), (1.0, (12, 12, 14, 140))],
}

def hgrad(stops):
    """가로 그라디언트(좌→우) — divider 좌측 스크림용."""
    g = Image.new("RGBA", (W, 1))
    px = g.load()
    stops = sorted(stops)
    for xx in range(W):
        t = xx / (W - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]; p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                f = 0 if p1 == p0 else (t - p0) / (p1 - p0)
                px[xx, 0] = tuple(round(c0[j] + (c1[j] - c0[j]) * f) for j in range(4))
                break
        else:
            px[xx, 0] = stops[-1][1]
    return g.resize((W, H))

def make_bg(slide):
    mode = slide["mode"]
    bgpath = os.path.join(BG_DIR, slide["id"] + ".png")
    if os.path.exists(bgpath):
        img = Image.open(bgpath).convert("RGBA").resize((W, H))
    elif mode == "dark":
        img = vgrad([(0.0, hx(C["dark.bg2"]) + (255,)),
                     (0.55, hx(C["dark.bg"]) + (255,)),
                     (1.0, hx(C["dark.bg3"]) + (255,))]).convert("RGBA")
    elif mode == "light":
        img = Image.new("RGBA", (W, H), hx(C["light.bg"]) + (255,))
    else:  # photo 플레이스홀더
        img = Image.new("RGBA", (W, H), hx("#2B2723") + (255,))
        d = ImageDraw.Draw(img)
        f = font("sans", 500, 40)
        msg = "[ photo background: backgrounds/%s.png ]" % slide["id"]
        d.text((W/2 - f.getlength(msg)/2, H/2 - 20), msg, font=f, fill=hx("#6c655c"))
    return img

def apply_scrim(img, name):
    img.alpha_composite(vgrad(SCRIMS[name]))

def draw_footer(img, slide):
    mode = slide["mode"]
    # 푸터/구분선 = 콘텐츠 라이트모드 페이지에만. 표지(타이틀)·포토·다크 divider에는 없음.
    if mode != "light":
        return
    d = ImageDraw.Draw(img)
    # 구분선 @y:976, 텍스트 baseline y:1020 — 28px 여백(겹침 금지)
    rc = RULE_COLOR[mode]
    if rc:
        d.line([(120, 976), (1800, 976)], fill=hx(rc), width=1)
    fc = hx(FOOTER_COLOR[mode])
    ff = font("sans", 500, 22)
    d.text((120, 1020), FOOTER_TEXT, font=ff, fill=fc, anchor="ls")
    pg = slide.get("page")
    if pg:
        d.text((1800, 1020), "%02d" % pg, font=ff, fill=fc, anchor="rs")

# ---------- 레이아웃 렌더러 ----------
def r_cover(img, s):
    apply_scrim(img, "full")
    d = ImageDraw.Draw(img)
    tcol = hx(C["dark.primary"])
    title = font("serif", 600, 96)
    draw_para(d, s["title"], 120, 700, title, tcol, 112, 1500)
    meta = font("sans", 500, 36)
    d.text((120, 908), s["meta"][0], font=meta, fill=hx(C["photo.text"]), anchor="ls")
    d.text((120, 952), s["meta"][1], font=meta, fill=hx(C["photo.text"]), anchor="ls")

def r_divider(img, s):
    # 배경 이미지가 있으면 좌측 스크림으로 가독 확보(드라마틱 이미지 + 좌측 텍스트)
    if os.path.exists(os.path.join(BG_DIR, s["id"] + ".png")):
        img.alpha_composite(hgrad([(0.0, (12, 12, 14, 232)), (0.5, (12, 12, 14, 150)),
                                   (0.78, (12, 12, 14, 40)), (1.0, (12, 12, 14, 0))]))
    d = ImageDraw.Draw(img)
    # final/P2 메트릭에 정합: 숫자 크게(~size 290, baseline y708) → 타이틀 y747 → 서브 y893
    d.text((120, 708), s["num"], font=font("serif", 600, 290), fill=hx(C["dark.accent"]), anchor="ls")
    d.text((120, 747), s["title"], font=font("serif", 600, 120), fill=hx(C["dark.primary"]))
    if s.get("subtitle"):
        draw_para(d, s["subtitle"], 120, 893, font("sans", 400, 36),
                  hx(C["dark.secondary"]), 50, 1300)

def _col(v):
    """hex(#...) 또는 토큰키 또는 'primary'류 라이트 단축키 → RGB."""
    if isinstance(v, str) and v.startswith("#"):
        return hx(v)
    if v in C:
        return hx(C[v])
    return hx(C["light." + v])

def draw_translucent_rect(img, box, fill, radius=0):
    """반투명 둥근 사각형(배지·딤·스크림 밴드)을 알파 합성."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(box, radius=radius, fill=tuple(fill))
    img.alpha_composite(layer)

def draw_spans(d, x, y, spans, fnt):
    """한 줄 인라인 스팬: 색·취소선·하이라이트(둥근 배경) 지원. 색은 hex 또는 토큰키."""
    asc, desc = fnt.getmetrics()
    lineh = asc + desc
    cx = x
    for sp in spans:
        t = sp["t"]
        w = fnt.getlength(t)
        col = _col(sp.get("c", "primary"))
        if sp.get("hl"):
            pad = sp.get("hlpad", 10)
            d.rounded_rectangle([cx - pad, y + 2, cx + w + pad, y + lineh - 1],
                                radius=8, fill=_col(sp.get("hlc", "light.highlight")))
        d.text((cx, y), t, font=fnt, fill=col)
        if sp.get("strike"):
            sy = y + int(asc * 0.66)
            d.line([(cx, sy), (cx + w, sy)], fill=col, width=3)
        cx += w
    return cx

def r_manual(img, s):
    """페이지별 절대좌표 요소 — AI 레퍼런스 레이아웃을 그대로 재현."""
    d = ImageDraw.Draw(img)
    for e in s["elements"]:
        k = e["k"]
        if k == "line":
            d.line([(e["x1"], e["y1"]), (e["x2"], e["y2"])],
                   fill=_col(e.get("color", "light.border")), width=e.get("w", 1))
            continue
        if k == "dot":
            r = e.get("r", 10)
            d.ellipse([e["x"], e["y"], e["x"] + r, e["y"] + r], fill=_col(e.get("color", "light.accent")))
            continue
        if k == "desat":  # 영역 흑백(+딤) — 비교 슬라이드 '약한 쪽' 강조. amount 0~1, dim 0~1
            box = (e["x"], e["y"], e["x"] + e["w"], e["y"] + e["h"])
            region = img.crop(box).convert("RGB")
            gray = ImageOps.grayscale(region).convert("RGB")
            blended = Image.blend(region, gray, e.get("amount", 1.0))
            if e.get("dim"):
                blended = ImageEnhance.Brightness(blended).enhance(1 - e["dim"])
            img.paste(blended.convert("RGBA"), box)
            d = ImageDraw.Draw(img)
            continue
        if k == "rect":   # 반투명 배지·딤·스크림 밴드. fill=[r,g,b,a]
            draw_translucent_rect(img, [e["x"], e["y"], e["x"] + e["w"], e["y"] + e["h"]],
                                  e["fill"], e.get("radius", 0))
            d = ImageDraw.Draw(img)
            continue
        if k == "box":    # 둥근 사각형(테두리 + 옵션 fill)
            d.rounded_rectangle([e["x"], e["y"], e["x"] + e["w"], e["y"] + e["h"]],
                                radius=e.get("radius", 12), width=e.get("width", 3),
                                outline=_col(e.get("outline", "light.accent")),
                                fill=_col(e["fill"]) if e.get("fill") else None)
            continue
        if k == "circle":
            r = e["r"]
            d.ellipse([e["cx"] - r, e["cy"] - r, e["cx"] + r, e["cy"] + r],
                      fill=_col(e.get("fill", "light.accent")))
            continue
        fnt = font(e.get("family", "sans"), e.get("weight", 400), e["size"])
        align = e.get("align", "l")
        if k == "spans":
            draw_spans(d, e["x"], e["y"], e["spans"], fnt)
        elif k == "text":
            if e.get("maxw"):
                draw_para(d, e["t"], e["x"], e["y"], fnt, _col(e.get("color", "light.primary")),
                          e.get("lh", int(e["size"] * 1.4)), e["maxw"],
                          "center" if align == "c" else "left")
            else:
                anchor = {"l": "la", "c": "ma", "r": "ra", "ls": "ls", "rs": "rs",
                          "ms": "ms", "mm": "mm", "lm": "lm", "rm": "rm"}[align]
                d.text((e["x"], e["y"]), e["t"], font=fnt,
                       fill=_col(e.get("color", "light.primary")), anchor=anchor)

def r_light(img, s):
    d = ImageDraw.Draw(img)
    pc = hx(C["light.primary"]); sc = hx(C["light.secondary"]); acc = hx(C["light.accent"])
    tt = font("sans", 700, 64)
    draw_para(d, s["title"], 120, 120, tt, pc, 76, 1680)
    y = s.get("body_y", 360)
    body = font("sans", 400, 36)
    bsm = font("sans", 400, 30)
    for it in s["bullets"]:
        sub = it.get("sub", False)
        bx = 120 + (48 if sub else 0)
        fnt = bsm if sub else body
        col = sc if sub else pc
        my = y + (14 if sub else 18)
        if sub:
            d.text((bx, y), "–", font=fnt, fill=hx(C["light.muted"]))
        else:
            d.ellipse([bx, my, bx + 10, my + 10], fill=acc)
        tx = bx + 28
        lh = 44 if sub else 52
        if "spans" in it:
            draw_spans(d, tx, y, it["spans"], fnt)
            ny = y + lh
        else:
            ny = draw_para(d, it["t"], tx, y, fnt, col, lh, 1680 - (tx - 120))
        y = ny + (16 if sub else 22)

def r_photo(img, s):
    if s.get("center_text"):
        apply_scrim(img, "bottom")
        d = ImageDraw.Draw(img)
        f = font("sans", 600, 56)
        d.text((W / 2, 980), s["center_text"], font=f, fill=hx(C["photo.text"]), anchor="ms")
    # 패널 구분선
    for vx in s.get("dividers", []):
        ImageDraw.Draw(img).line([(vx, 0), (vx, H)], fill=hx(C["light.bg"]), width=6)

def r_three(img, s):
    d = ImageDraw.Draw(img)
    pc = hx(C["light.primary"]); sc = hx(C["light.secondary"]); acc = hx(C["light.accent"])
    draw_para(d, s["title"], 120, 120, font("sans", 700, 64), pc, 76, 1680)
    if s.get("lead"):
        draw_para(d, s["lead"], 120, 300, font("sans", 500, 40), sc, 56, 1680)
    cols = [120, 688, 1256]
    triad = [hx(C["light.accent"]), hx(C["light.accent2"]), hx(C["light.accent3"])]  # coral/teal/amber
    lab = font("sans", 600, 40); body = font("sans", 400, 30)
    for i, (cx, col) in enumerate(zip(cols, s["cols"])):
        d.text((cx, 460), col["label"], font=lab, fill=col.get("color") and _col(col["color"]) or triad[i])
        draw_para(d, col["desc"], cx, 520, body, sc, 44, 544)

RENDER = {"cover": r_cover, "divider": r_divider, "light": r_light,
          "photo": r_photo, "three": r_three, "manual": r_manual}

# ---------- 슬라이드 데이터 (구성안 P1~P10) ----------
SLIDES = [
    {"id": "P1", "mode": "photo", "layout": "cover",
     "title": "1인 창업자 분들을 위한\n바이브코딩과 에이전트 활용법",
     "meta": ["KAIST OverEdge", "2026.07.07 · 덥덥덥 대표이사 김태형"]},
    {"id": "P2", "mode": "dark", "layout": "divider", "page": 2,
     "num": "1", "title": "AI 시대, 관점의 전환",
     "subtitle": "AI를 쓰는 시대에서, AI 위에 사업을 올리는 시대로."},
    {"id": "P3", "mode": "photo", "layout": "photo", "page": 3,
     "center_text": "당신은 OO 시대에 살고 있습니다.", "dividers": [640, 1280]},
    {"id": "P4", "mode": "light", "layout": "manual", "page": 4,
     # AI 레퍼런스(refs/P4.png) 레이아웃을 diff로 측정해 좌표 인코딩 (1920×1080 공간)
     "elements": [
        {"k": "text", "t": "AI 위에 사업을 올려라", "x": 103, "y": 150, "size": 100,
         "weight": 800, "color": "light.primary"},
        # 불릿1 (2줄)
        {"k": "dot", "x": 104, "y": 372, "r": 16, "color": "light.accent"},
        {"k": "text", "x": 152, "y": 352, "size": 40, "color": "light.primary",
         "maxw": 1750, "lh": 61,
         "t": "인터넷·모바일이 그랬듯, 진짜 변화는 AI가 모든 일의 바닥에 깔린\n인프라가 된 것."},
        # 불릿2 (사고의 전환)
        {"k": "dot", "x": 104, "y": 541, "r": 16, "color": "light.accent"},
        {"k": "spans", "x": 152, "y": 521, "size": 40, "spans": [
            {"t": "사고의 전환:  ", "c": "primary"},
            {"t": "‘AI 기능을 붙인 앱’", "c": "muted", "strike": True},
            {"t": " (NO)    →    ", "c": "secondary"},
            {"t": "“AI 인프라 위에 설계한 사업” (YES)", "c": "accent"}]},
        # 불릿3 (ChatGPT)
        {"k": "dot", "x": 104, "y": 656, "r": 16, "color": "light.accent"},
        {"k": "spans", "x": 152, "y": 636, "size": 40, "spans": [
            {"t": "ChatGPT·구글·클로드는 내 경쟁자가 아니라, ", "c": "primary"},
            {"t": "내가 딛고 설 인프라", "c": "primary", "hl": True},
            {"t": "다.", "c": "primary"}]},
        # 서브1
        {"k": "text", "t": "–", "x": 151, "y": 726, "size": 32, "color": "light.muted"},
        {"k": "spans", "x": 200, "y": 726, "size": 32, "spans": [
            {"t": "못 이긴다는 뜻이 아니다 — ", "c": "secondary"},
            {"t": "서비스(제품)는 우리가 더 잘 만든다.", "c": "secondary", "hl": True}]},
        # 서브2 (2줄)
        {"k": "text", "t": "–", "x": 151, "y": 808, "size": 32, "color": "light.muted"},
        {"k": "text", "x": 200, "y": 808, "size": 32, "color": "light.secondary",
         "maxw": 1400, "lh": 53,
         "t": "빅테크도 전 영역을 독점할 수 없어 양보할 수밖에 없다.\n(참고: MS의 독점법 제재 사례)"},
     ]},
    {"id": "P5", "mode": "photo", "layout": "photo", "page": 5},  # 이미지에 구분선 포함됨
    # P5.5 — 비교: 좌2(AI 없이) vs 우2(AI와 함께), 10~50× (P5 배경 재사용 + 오버레이)
    {"id": "P5_5", "mode": "photo", "layout": "manual", "page": 6, "no_footer": True,
     "elements": [
        {"k": "desat", "x": 0, "y": 0, "w": 960, "h": 1080, "amount": 1.0, "dim": 0.12},        # 좌측 흑백+딤(AI 없이)
        {"k": "line", "x1": 960, "y1": 0, "x2": 960, "y2": 1080, "w": 6, "color": "#FBFAF6"},   # 중앙 디바이더
        # 좌 라벨
        {"k": "rect", "x": 300, "y": 84, "w": 360, "h": 96, "radius": 48, "fill": [18, 18, 20, 165]},
        {"k": "text", "t": "AI 없이", "x": 480, "y": 132, "size": 48, "weight": 700, "color": "#FBFAF6", "align": "mm"},
        # 우 라벨 (코랄 — AI와 함께)
        {"k": "rect", "x": 1248, "y": 84, "w": 424, "h": 96, "radius": 48, "fill": [232, 92, 52, 240]},
        {"k": "text", "t": "AI와 함께", "x": 1460, "y": 132, "size": 48, "weight": 700, "color": "#FBFAF6", "align": "mm"},
        # 하단 우측 메시지 (코랄)
        {"k": "rect", "x": 1110, "y": 902, "w": 660, "h": 104, "radius": 52, "fill": [232, 92, 52, 240]},
        {"k": "text", "t": "10–50× 더 빠르게", "x": 1440, "y": 954, "size": 48, "weight": 700, "color": "#FBFAF6", "align": "mm"},
     ]},
    {"id": "P6", "mode": "light", "layout": "manual", "page": 6,
     # refs/P6.png 레이아웃 측정 인코딩 (오타 교정: 등장하자·자동차)
     "elements": [
        {"k": "text", "t": "새 생활권 = 새 사업 기회", "x": 100, "y": 142, "size": 96,
         "weight": 800, "color": "light.primary"},
        # 불릿1 (2줄)
        {"k": "dot", "x": 108, "y": 348, "r": 15, "color": "light.accent"},
        {"k": "text", "x": 160, "y": 329, "size": 36, "color": "light.primary", "maxw": 900, "lh": 59,
         "t": "사람들은 AI를 놀라워는 하지만,\n그것이 완전히 새 시대의 시작인 줄은 모른다."},
        # 불릿2
        {"k": "dot", "x": 108, "y": 502, "r": 15, "color": "light.accent"},
        {"k": "text", "t": "속도 10~50배는 증상일 뿐. 핵심은 생활권의 이주.", "x": 160, "y": 483,
         "size": 36, "color": "light.primary"},
        # 불릿3 (자동차 코랄, 2줄)
        {"k": "dot", "x": 108, "y": 597, "r": 15, "color": "light.accent"},
        {"k": "spans", "x": 160, "y": 578, "size": 36, "spans": [
            {"t": "자동차", "c": "accent"},
            {"t": "가 등장하자 교외·고속도로·물류·주유소라는", "c": "primary"}]},
        {"k": "text", "t": "이전엔 없던 사업이 생겼다.", "x": 160, "y": 637, "size": 36, "color": "light.primary"},
        # 핵심 질문 박스
        {"k": "box", "x": 100, "y": 724, "w": 1520, "h": 208, "radius": 16, "outline": "light.accent", "width": 3},
        {"k": "circle", "cx": 192, "cy": 828, "r": 48, "fill": "light.accent"},
        {"k": "text", "t": "?", "x": 192, "y": 828, "size": 52, "weight": 800, "color": "#FFFFFF", "align": "mm"},
        {"k": "line", "x1": 292, "y1": 792, "x2": 292, "y2": 864, "w": 3, "color": "light.accent"},
        {"k": "text", "t": "핵심 질문", "x": 324, "y": 766, "size": 26, "weight": 600, "color": "light.accent"},
        {"k": "text", "t": "걷기 시대엔 불가능했지만, 자동차 시대엔 되는 사업은?", "x": 324, "y": 808,
         "size": 46, "weight": 700, "color": "light.accent"},
     ]},
    {"id": "P7", "mode": "photo", "layout": "photo", "page": 7},
    {"id": "P8", "mode": "light", "layout": "light", "page": 8,
     "title": "자율주행은 '내 일하는 방식'이다",
     "bullets": [
        {"t": "자율주행은 사업 아이템이 아니라 나의 작업 방식에 대한 지시."},
        {"t": "최근 AI가 goal을 향해 스스로 달리는 모드가 대유행 → 테슬라 오토파일럿 비유."},
        {"spans": [
            {"t": "자동으로 돌아가니, ", "c": "primary"},
            {"t": "나의 페르소나를 심어 분신", "c": "primary", "hl": True},
            {"t": "을 만들 수 있다.", "c": "primary"}]},
        {"spans": [
            {"t": "동시에 ", "c": "primary"},
            {"t": "10~50배 일하는, 나를 복제한 군단", "c": "accent"},
            {"t": "을 만들자.", "c": "primary"}]},
     ]},
    {"id": "P9", "mode": "photo", "layout": "photo", "page": 9},
    {"id": "P10", "mode": "light", "layout": "three", "page": 10,
     "title": "이제 곧, 1인 창업가의 자비스",
     "lead": "자비스 = 부르면 만들고, 알아서 운영하고, 자리를 비워도 돌아가는 이상적 AI 비서.",
     "cols": [
        {"label": "① 만들기", "desc": "요청하면 앱을 만들어 낸다."},
        {"label": "② 자동화", "desc": "운영(일정·메일·문서·리서치)을 알아서."},
        {"label": "③ 자율주행", "desc": "자리를 비워도 일이 진행된다."},
     ]},
    {"id": "P11", "mode": "dark", "layout": "divider", "page": 11,
     # 챕터 2 divider — P2와 동일한 고정 좌표(num y520 / title y688 / subtitle y868)로 일관.
     "num": "2", "title": "AI를 더 잘 알기",
     "subtitle": "원리의 이해부터 고급 활용까지"},
]

def main():
    for s in SLIDES:
        img = make_bg(s)
        RENDER[s["layout"]](img, s)
        if not s.get("no_footer"):
            draw_footer(img, s)
        out = os.path.join(OUT_DIR, s["id"] + ".png")
        img.convert("RGB").save(out)
        print("rendered", out)

if __name__ == "__main__":
    main()
