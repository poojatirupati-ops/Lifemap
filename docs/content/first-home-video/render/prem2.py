import json, math, sys, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---- LifeMap portal theme (from the prototype's CSS) ----
W, H, S = 1920, 1080, 1.25
NSRC = 3122; OUTFPS = 30000 / 1001; DUR = 53.0; SPEECH_END = 48.15
FR = "/tmp/claude-0/-home-user-lifegoals-prototype/e92eea84-3aac-5c94-a947-7c36183afda4/scratchpad/wc/fr_%04d.jpg"
HERE = os.path.dirname(os.path.abspath(__file__)); NOCAP = os.environ.get('NOCAP') == '1'
INK = (14, 47, 51); INK2 = (27, 74, 80); MUTED = (74, 101, 104); LINE = (220, 230, 225); MIST = (242, 246, 243)
PLAIN1 = (207, 233, 226); SEA = (46, 158, 140); SEAD = (31, 122, 107); SEAL = (221, 242, 236)
SUN = (255, 176, 32); SUNL = (255, 241, 209); SKY = (78, 155, 216); CORAL = (232, 103, 74); STORM = (94, 84, 142); WHITE = (255, 255, 255)

def ease(x): x = max(0.0, min(1.0, x)); return 1 - (1 - x) ** 3
def lerp(a, b, t): return a + (b - a) * t
def mixc(a, b, t): return tuple(int(lerp(x, y, max(0, min(1, t)))) for x, y in zip(a, b))

_f = {}
def font(kind, sz):
    k = (kind, round(sz))
    if k in _f: return _f[k]
    px = max(1, int(round(sz * S)))
    if kind in ("head", "headx"):
        f = ImageFont.truetype(f"{HERE}/fonts/BricolageGrotesque[opsz,wdth,wght].ttf", px); f.set_variation_by_axes([48, 800 if kind == "headx" else 700, 100])
    else:
        wt = {"light": 400, "reg": 500, "med": 600, "semi": 700, "bold": 800}[kind]
        f = ImageFont.truetype(f"{HERE}/fonts/Figtree[wght].ttf", px); f.set_variation_by_axes([wt])
    _f[k] = f; return f

class C:
    def __init__(self, base=None):
        self.im = base.copy() if base is not None else Image.new("RGB", (int(W * S), int(H * S)), MIST)
        self.d = ImageDraw.Draw(self.im)
    def _s(self, v): return [x * S for x in v]
    def rr(self, box, r, fill=None, outline=None, w=1): self.d.rounded_rectangle(self._s(box), r * S, fill=fill, outline=outline, width=max(1, int(w * S)) if outline else 0)
    def ell(self, box, fill=None, outline=None, w=1): self.d.ellipse(self._s(box), fill=fill, outline=outline, width=max(1, int(w * S)) if outline else 0)
    def line(self, pts, w, fill): self.d.line([(x * S, y * S) for x, y in pts], fill=fill, width=max(1, int(w * S)), joint="curve")
    def poly(self, pts, fill=None, outline=None): self.d.polygon([(x * S, y * S) for x, y in pts], fill=fill, outline=outline)
    def arc(self, box, a0, a1, fill, w): self.d.arc(self._s(box), a0, a1, fill=fill, width=max(1, int(w * S)))
    def text(self, xy, s, sz, fill=INK, kind="reg", anchor="la"): self.d.text((xy[0] * S, xy[1] * S), s, font=font(kind, sz), fill=fill, anchor=anchor)
    def tw(self, s, sz, kind="reg"): return font(kind, sz).getlength(s) / S
    def spaced(self, xy, s, sz, fill, kind="bold", sp=3, anchor="l"):
        wd = sum(self.tw(ch, sz, kind) + sp for ch in s) - sp
        x = xy[0] if anchor == "l" else (xy[0] - wd / 2 if anchor == "m" else xy[0] - wd)
        for ch in s: self.text((x, xy[1]), ch, sz, fill, kind); x += self.tw(ch, sz, kind) + sp
        return wd
    def card(self, box, r=26, fill=WHITE):
        x0, y0, x1, y1 = box
        self.rr((x0, y0 + 10, x1, y1 + 10), r, fill=(222, 231, 227)); self.rr((x0, y0 + 5, x1, y1 + 5), r, fill=(230, 237, 233))
        self.rr(box, r, fill=fill, outline=LINE, w=1)

def logo_mark(c, x, y, r):
    c.ell((x - r, y - r, x + r, y + r), fill=SEAD); c.ell((x - r * .94, y - r * .94, x + r * .94, y + r * .94), fill=SEA)
    c.ell((x - r * .7, y - r * .78, x + r * .3, y + r * .1), fill=mixc(SEA, (140, 224, 206), .45))

# ---------------- static base ----------------
_base = None
CARD_BOX = (80, 150, 720, 1000)
def base():
    global _base
    if _base is not None: return _base
    w, h = int(W * S), int(H * S)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = np.clip(yy / (h * 0.62), 0, 1)[..., None]
    bg = np.array(PLAIN1, np.float32) * (1 - t) + np.array(MIST, np.float32) * t
    for (cx, cy, rr_, col, a) in [(0.92, 0.12, 0.34, SEAL, 0.9), (0.04, 0.95, 0.30, (230, 240, 236), 0.8)]:
        d = np.sqrt(((xx - cx * w) / w) ** 2 + ((yy - cy * h) / h) ** 2); g = np.clip(1 - d / rr_, 0, 1) ** 1.5 * a
        bg = bg * (1 - g[..., None]) + np.array(col, np.float32) * g[..., None]
    c = C(Image.fromarray(np.clip(bg, 0, 255).astype("uint8")))
    # header
    logo_mark(c, 108, 72, 20); c.text((142, 48), "LifeMap", 38, INK, "headx")
    c.spaced((W - 80, 60), "FIRST HOME IN IRELAND  ·  DEPOSIT TO KEYS", 17, SEAD, "bold", 3, anchor="r")
    c.rr((80, 112, W - 80, 113), 0, fill=(197, 218, 211))
    _base = c.im; return _base

_card = None
def card_img():
    global _card
    if _card is not None: return _card
    x0, y0, x1, y1 = CARD_BOX; m = int(60 * S); cw, ch = int((x1 - x0) * S), int((y1 - y0) * S)
    out = Image.new("RGBA", (cw + 2 * m, ch + 2 * m), (0, 0, 0, 0))
    sh = Image.new("L", out.size, 0); ImageDraw.Draw(sh).rounded_rectangle([m, m + 14 * S, m + cw, m + ch + 14 * S], 34 * S, fill=70)
    sh = sh.filter(ImageFilter.GaussianBlur(22 * S)); out.paste(Image.new("RGBA", out.size, (14, 47, 51, 255)), (0, 0), sh)
    cyy, cxx = np.mgrid[0:ch, 0:cw].astype(np.float32)
    t = np.clip(np.sqrt(((cxx - cw * 0.5) / cw) ** 2 + ((cyy - ch * 0.40) / ch) ** 2) * 1.5, 0, 1)
    card = np.array([250, 253, 252], np.float32)[None, None, :] * (1 - t[..., None]) + np.array([214, 236, 229], np.float32)[None, None, :] * t[..., None]
    cm = Image.new("L", (cw, ch), 0); ImageDraw.Draw(cm).rounded_rectangle([0, 0, cw - 1, ch - 1], 34 * S, fill=255)
    out.paste(Image.fromarray(card.astype("uint8")).convert("RGBA"), (m, m), cm)
    ImageDraw.Draw(out).rounded_rectangle([m, m, m + cw - 1, m + ch - 1], 34 * S, outline=(190, 215, 207), width=max(1, int(1.5 * S)))
    _card = (out, m); return _card

# ---------------- avatar (resampled once, directly at output resolution) ----------------
CX0, CX1, CY1 = 40, 440, 545
AV_SCALE = 1.36
def _load(i): return np.array(Image.open(FR % (min(i, NSRC - 1) + 1)).convert("RGB")).astype(np.float32)[:820]
def avatar(n):
    import notch
    i0 = int(round(n * 59.94 / OUTFPS)); full = (_load(i0) + _load(i0 + 1)) / 2
    c = notch.descreen_rgb(full)[:CY1, CX0:CX1]; c = np.clip(c, 0, 255)
    cb = np.array(Image.fromarray(c.astype("uint8")).filter(ImageFilter.GaussianBlur(2.4))).astype(np.float32)
    lum = cb.mean(2); sat = cb.max(2) - cb.min(2); W0 = c.shape[1]
    cand = ((lum > 128) & (sat < 24)).astype("uint8") * 255
    im = Image.fromarray(cand).filter(ImageFilter.MedianFilter(5))
    for (sx, sy) in [(2, 2), (W0 - 3, 2), (2, CY1 // 2), (W0 - 3, CY1 // 2), (2, CY1 - 3), (W0 - 3, CY1 - 3), (W0 // 2 - 120, 2), (W0 // 2 + 120, 2)]:
        if im.getpixel((sx, sy)) == 255: ImageDraw.floodfill(im, (sx, sy), 128)
    pm = Image.fromarray((~(np.array(im) == 128)).astype("uint8") * 255).filter(ImageFilter.MedianFilter(5))
    if pm.getpixel((W0 // 2, 300)) == 255:
        ImageDraw.floodfill(pm, (W0 // 2, 300), 128); pm = Image.fromarray(((np.array(pm) == 128) * 255).astype("uint8"))
    person = pm.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    mk = np.array(person).astype(np.float32) / 255
    mk *= np.clip((CY1 - 1 - np.arange(CY1)) / 34.0, 0, 1)[:, None]
    rowm = lum[:60].mean(1); dk = np.where(rowm < 80)[0]
    if len(dk): mk[:dk.max() + 9] = 0
    sz = (int((CX1 - CX0) * AV_SCALE), int(CY1 * AV_SCALE))
    img = Image.fromarray(np.clip(c, 0, 255).astype("uint8")).resize(sz, Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.4, percent=125, threshold=2))
    return img, Image.fromarray((mk * 255).astype("uint8")).resize(sz, Image.BILINEAR)

# ---------------- timeline ----------------
LINES = [
 (2.4, 7.1, "Buying your first home in Ireland? Stop. Watch this before you sign anything."),
 (8.7, 15.7, "One. You can borrow up to four times your income, with a ten percent deposit. But choose a repayment you can sleep on."),
 (17.3, 21.8, "Two. Add stamp duty, legal fees and a survey to your budget."),
 (23.2, 27.4, "Three. Claim every benefit: Help to Buy, and the First Home Scheme."),
 (28.9, 32.2, "Four. Fixed gives certainty, variable can move."),
 (33.5, 37.8, "Five. Get approval in principle before you view a single house."),
 (38.4, 42.0, "Six. Protect your family with mortgage protection."),
 (42.5, 48.0, "Do this, and eight months later, you're holding the keys. Time to put the kettle on."),
]
RX0, RX1 = 790, 1840
def eyebrow(c, x, y, s, col=SEAD, anchor="l"): c.spaced((x, y), s, 17, col, "bold", 3, anchor)
def fade(col, p, base=WHITE): return mixc(base, col, p)
def counter(v, lt, dur=1.2): return v * ease(lt / dur)
def pill(c, x, y, s, sz=22, fill=SEAL, ink=SEAD, kind="semi"):
    wd = c.tw(s, sz, kind) + 34; c.rr((x, y, x + wd, y + sz + 18), (sz + 18) / 2, fill=fill); c.text((x + 17, y + 8), s, sz, ink, kind); return wd

def icon_check(c, x, y, s, col=WHITE, w=3.4): c.line([(x - 9 * s, y), (x - 2 * s, y + 8 * s), (x + 11 * s, y - 9 * s)], w * s, col)
def icon_lock(c, x, y, s, col=SEAD):
    c.rr((x - 22 * s, y - 4 * s, x + 22 * s, y + 28 * s), 7 * s, fill=col); c.arc((x - 14 * s, y - 28 * s, x + 14 * s, y + 8 * s), 180, 360, col, 4 * s)
def icon_house(c, x, y, s, col=SEAD, fill=None):
    pts = [(x - 30 * s, y), (x, y - 26 * s), (x + 30 * s, y), (x + 30 * s, y + 30 * s), (x - 30 * s, y + 30 * s), (x - 30 * s, y)]
    if fill: c.poly(pts, fill=fill)
    c.line(pts, 3.2 * s, col); c.rr((x - 7 * s, y + 10 * s, x + 7 * s, y + 30 * s), 2, fill=col)
def icon_key(c, x, y, s, col=SUN):
    c.ell((x - 26 * s, y - 26 * s, x + 6 * s, y + 6 * s), outline=col, w=5 * s); c.line([(x + 4 * s, y - 4 * s), (x + 52 * s, y - 4 * s)], 5 * s, col); c.line([(x + 40 * s, y - 4 * s), (x + 40 * s, y + 12 * s)], 5 * s, col); c.line([(x + 52 * s, y - 4 * s), (x + 52 * s, y + 9 * s)], 5 * s, col)
def shield(c, cx, cy, s):
    pts = [(cx - 60 * s, cy - 50 * s), (cx, cy - 72 * s), (cx + 60 * s, cy - 50 * s), (cx + 60 * s, cy + 6 * s), (cx, cy + 72 * s), (cx - 60 * s, cy + 6 * s), (cx - 60 * s, cy - 50 * s)]
    c.poly(pts, fill=SEAL); c.line(pts, 5 * s, SEAD); icon_house(c, cx, cy - 8 * s, 0.9 * s, SEAD, WHITE)

def m_intro(c, t, lt):
    p = ease(lt / 1.0); x = RX0 + 40
    pill(c, x, 330, "A GUIDE FOR FIRST-TIME BUYERS", 20, SEAL, SEAD, "bold")
    c.text((x, 400), "From deposit", 112, fade(INK, p, MIST), "headx"); c.text((x, 520), "to keys", 112, fade(SEAD, ease((lt - .25) / 1.0), MIST), "headx")
    c.rr((x, 680, x + 150 * ease(lt / 1.2), 686), 3, fill=SUN)
    c.text((x, 710), "A LifeMap guide for the Irish market", 30, fade(MUTED, p, MIST), "reg")

def m_hook(c, t, lt):
    cx, cy = (RX0 + RX1) / 2, 400; p = ease(lt / 0.7); pulse = 1 + 0.02 * math.sin(lt * 5)
    r = 140 * pulse
    c.ell((cx - r - 26, cy - r - 26, cx + r + 26, cy + r + 26), fill=SUNL); c.ell((cx - r, cy - r, cx + r, cy + r), fill=SUN)
    c.rr((cx - 44, cy - 62, cx - 12, cy + 62), 8, fill=INK); c.rr((cx + 12, cy - 62, cx + 44, cy + 62), 8, fill=INK)
    c.text((cx, 610), "Before you sign anything", 64, fade(INK, p, MIST), "headx", "ma")
    c.text((cx, 700), "Pause. Understand. Then commit.", 32, fade(MUTED, ease((lt - .5) / .8), MIST), "reg", "ma")

def m_budget(c, t, lt):
    c.card((RX0, 160, RX1, 790), 28)
    if lt < 5.0:
        eyebrow(c, RX0 + 50, 198, "HOW MUCH YOU MAY BORROW"); pill(c, RX1 - 190, 186, "Illustrative", 20, SUNL, (150, 100, 0), "semi")
        items = [("GROSS INCOME", "€100,000", 0.0, SEAD), ("MULTIPLE", "× 4", 1.0, SUN), ("MORTGAGE UP TO", "€400,000", 2.0, SEAD)]
        xs = [RX0 + 50, RX0 + 390, RX0 + 570]
        for i, (a, b, d, col) in enumerate(items):
            p = ease((lt - 0.2 - d * .5) / 0.6)
            if p <= 0: continue
            c.text((xs[i], 270), a, 17, fade(MUTED, p), "bold"); c.text((xs[i], 296), b, 70, fade(col, p), "headx")
        if lt > 2.0:
            p = ease((lt - 2.0) / 0.7)
            c.rr((RX0 + 50, 470, RX1 - 50, 472), 0, fill=LINE)
            c.text((RX0 + 50, 504), "DEPOSIT", 17, fade(MUTED, p), "bold"); c.text((RX0 + 50, 530), "10%", 78, fade(SEAD, p), "headx")
            c.text((RX0 + 290, 578), "of the price, about €44,000 on €444,000", 30, fade(INK, p), "reg")
            c.rr((RX0 + 50, 670, RX1 - 50, 686), 8, fill=LINE); c.rr((RX0 + 50, 670, RX0 + 50 + (RX1 - RX0 - 100) * 0.9 * p, 686), 8, fill=SEA)
            c.text((RX0 + 50, 702), "Mortgage 90% of price", 22, MUTED, "reg"); c.text((RX1 - 50, 702), "Deposit 10%", 22, SEAD, "semi", "ra")
    else:
        p = ease((lt - 5.0) / 0.7); eyebrow(c, RX0 + 50, 198, "BORROWING VS COMFORT")
        x0, x1, y = RX0 + 60, RX1 - 60, 470; n = 80
        for i in range(n):
            cc = mixc(mixc(SEA, SUN, min(1, i / (n * .55))), CORAL, max(0, (i - n * .55) / (n * .45)))
            xa = x0 + (x1 - x0) * i / n; c.rr((xa, y, xa + (x1 - x0) / n + 1, y + 30), 0, fill=mixc(WHITE, cc, p))
        cm = x0 + (x1 - x0) * 0.45; mx = x1
        c.line([(cm, y - 20), (cm, y + 52)], 4, SEAD); pill(c, cm - 80, y - 82, "COMFORT ZONE", 18, SEAL, SEAD, "bold")
        c.line([(mx, y - 20), (mx, y + 52)], 4, CORAL); pill(c, mx - 118, y - 82, "MAXIMUM", 18, (252, 228, 221), CORAL, "bold")
        c.text((x0, y + 96), "Choose the repayment you can sleep on.", 46, fade(INK, p), "headx")
        c.text((x0, y + 166), "Lenders set the ceiling. You set the comfort level.", 28, fade(MUTED, p), "reg")

def m_costs(c, t, lt):
    c.card((RX0, 160, RX1, 790), 28); eyebrow(c, RX0 + 50, 198, "BEYOND THE DEPOSIT"); pill(c, RX1 - 420, 186, "Illustrative, on a €400,000 home", 20, SUNL, (150, 100, 0), "semi")
    rows = [("Stamp duty", "1% of the purchase price", "≈ €4,000", 0.3, SEA), ("Legal fees", "Your solicitor", "≈ €3,000 – €4,000", 1.4, SKY), ("Survey & valuation", "Know the condition before you commit", "≈ €600 – €900", 2.5, STORM)]
    for i, (a, b, v, d, col) in enumerate(rows):
        p = ease((lt - d) / 0.6)
        if p <= 0: continue
        y = 270 + i * 165 + (1 - p) * 24
        c.ell((RX0 + 50, y + 6, RX0 + 102, y + 58), fill=mixc(WHITE, col, p)); c.text((RX0 + 76, y + 14), str(i + 1), 30, WHITE, "bold", "ma")
        c.text((RX0 + 130, y), a, 42, fade(INK, p), "headx"); c.text((RX0 + 130, y + 56), b, 25, fade(MUTED, p), "reg")
        c.text((RX1 - 50, y + 6), v, 40, fade(SEAD, p), "headx", "ra")
        if i < 2: c.rr((RX0 + 50, y + 126, RX1 - 50, y + 127), 0, fill=fade(LINE, p))

def m_benefits(c, t, lt):
    cards = [("HELP TO BUY", 30000, "€{:,}", "Refund of income tax and DIRT paid, up to this amount, on new builds.", 0.3, SEA),
             ("FIRST HOME SCHEME", 30, "{:d}%", "Shared equity with the State and participating banks on new homes (20% on second-hand).", 2.6, SKY)]
    for i, (a, v, f, d, t0, col) in enumerate(cards):
        x0 = RX0 + i * 530; p = ease((lt - t0) / 0.7)
        if p <= 0: continue
        oy = (1 - p) * 40
        c.card((x0, 190 + oy, x0 + 510, 720 + oy), 28)
        c.rr((x0 + 36, 224 + oy, x0 + 36 + c.tw(a, 18, "bold") + 3 * len(a) + 34, 262 + oy), 19, fill=SEAL if i == 0 else (225, 239, 250)); c.spaced((x0 + 53, 232 + oy), a, 18, SEAD if i == 0 else SKY, "bold", 3)
        val = counter(v, lt - t0 - .2, 1.3); c.text((x0 + 36, 300 + oy), f.format(int(val)), 100, fade(SEAD, p), "headx")
        c.text((x0 + 36, 440 + oy), "up to" if i == 0 else "of the home price, up to", 24, fade(MUTED, p), "reg")
        yy = 500 + oy; line = ""
        for wd in d.split():
            if c.tw(line + " " + wd, 28, "reg") > 430 and line: c.text((x0 + 36, yy), line, 28, fade(INK, p), "reg"); yy += 40; line = wd
            else: line = (line + " " + wd).strip()
        c.text((x0 + 36, yy), line, 28, fade(INK, p), "reg")
    if lt > 4.2: c.text((RX0, 750), "Eligibility rules and regional price ceilings apply.", 24, fade(MUTED, ease((lt - 4.2) / .6), MIST), "reg")

def m_rates(c, t, lt):
    c.card((RX0, 160, RX1, 790), 28); eyebrow(c, RX0 + 50, 198, "FIXED VS VARIABLE"); c.text((RX1 - 50, 190), "Repayment over time (illustrative)", 22, MUTED, "reg", "ra")
    x0, x1, y0, y1 = RX0 + 60, RX1 - 60, 290, 520
    for g in range(4): c.rr((x0, y0 + g * (y1 - y0) / 3, x1, y0 + g * (y1 - y0) / 3 + 1.5), 0, fill=LINE)
    prog = ease(lt / 2.2); n = 90; pf = []; pv = []
    for i in range(int(n * prog) + 1):
        x = lerp(x0, x1, i / n); pf.append((x, y0 + 130)); pv.append((x, y0 + 130 - 70 * math.sin(i / n * 6.3 + 0.6) - 28 * math.sin(i / n * 17.0)))
    if len(pf) > 1: c.line(pf, 6, SEAD); c.line(pv, 5, SKY)
    c.ell((x0 - 8, y0 + 122, x0 + 8, y0 + 138), fill=SEAD)
    c.rr((RX0 + 50, 580, RX0 + 480, 750), 22, fill=SEAL); c.rr((RX0 + 520, 580, RX1 - 50, 750), 22, fill=(228, 241, 250))
    icon_lock(c, RX0 + 100, 628, 0.9, SEAD); c.text((RX0 + 150, 612), "Fixed", 44, INK, "headx"); c.text((RX0 + 150, 672), "Certainty for the", 25, MUTED, "reg"); c.text((RX0 + 150, 704), "fixed period", 25, MUTED, "reg")
    c.line([(RX0 + 560 + j * 7, 640 + math.sin(j * .5 + lt * 3) * 12) for j in range(9)], 5, SKY)
    c.text((RX0 + 640, 612), "Variable", 44, INK, "headx"); c.text((RX0 + 560, 700), "Moves with the market", 25, MUTED, "reg")

def m_approval(c, t, lt):
    c.card((RX0, 160, RX1, 790), 28)
    cx, cy = RX0 + 230, 360; p = ease(lt / 0.6)
    c.ell((cx - 120, cy - 120, cx + 120, cy + 120), fill=SEAL); c.ell((cx - 92, cy - 92, cx + 92, cy + 92), fill=SEA)
    icon_check(c, cx, cy, 3.6 * min(1, p + .01), WHITE, 3.6)
    c.text((cx, 520), "Approval", 50, INK, "headx", "ma"); c.text((cx, 580), "in principle", 50, SEAD, "headx", "ma")
    pts = ["Know your budget before you view", "Strengthen your offer with sellers", "Lenders review your savings, credit record and debts"]
    for i, s in enumerate(pts):
        q = ease((lt - 0.8 - i * 1.1) / 0.6)
        if q <= 0: continue
        y = 250 + i * 170 + (1 - q) * 20
        c.ell((RX0 + 470, y + 2, RX0 + 514, y + 46), fill=mixc(WHITE, SEAL, q)); icon_check(c, RX0 + 492, y + 24, 0.8, fade(SEAD, q), 3.4)
        yy = y; line = ""
        for wd in s.split():
            if c.tw(line + " " + wd, 36, "head") > 440 and line: c.text((RX0 + 540, yy), line, 36, fade(INK, q), "head"); yy += 48; line = wd
            else: line = (line + " " + wd).strip()
        c.text((RX0 + 540, yy), line, 36, fade(INK, q), "head")

def m_protect(c, t, lt):
    c.card((RX0, 160, RX1, 790), 28); p = ease(lt / 0.8)
    shield(c, RX0 + 260, 480, 3.1 * (0.85 + 0.15 * p))
    pill(c, RX0 + 540, 330, "PROTECT YOUR FAMILY", 18, SEAL, SEAD, "bold")
    c.text((RX0 + 540, 392), "Mortgage", 66, fade(INK, p), "headx"); c.text((RX0 + 540, 466), "protection", 66, fade(SEAD, p), "headx")
    c.rr((RX0 + 540, 560, RX0 + 620, 566), 3, fill=SUN)
    q = ease((lt - 1.0) / 0.8); c.text((RX0 + 540, 594), "Life cover that keeps your home", 30, fade(MUTED, q), "reg"); c.text((RX0 + 540, 636), "secure, whatever life brings.", 30, fade(MUTED, q), "reg")

def m_road(c, t, lt):
    c.card((RX0, 160, RX1, 790), 28); eyebrow(c, RX0 + 50, 198, "YOUR ROUTE TO THE KEYS"); c.text((RX1 - 50, 190), "About 8 months", 24, MUTED, "reg", "ra")
    steps = ["Save", "Approval in principle", "Find your home", "Sale agreed", "Loan offer", "Solicitor", "Drawdown", "Keys"]
    n = min(8, int(lt / 4.6 * 8.4) + 1)
    for i, s_ in enumerate(steps):
        col_, row = i % 4, i // 4; x = RX0 + 40 + col_ * 252; y = 250 + row * 270
        on = i < n; lastk = i == 7 and on
        if lastk:
            for k in range(int(232 * S)):
                tt = k / (232 * S); c.d.line([(x * S, (y * S + k)), ((x + 232) * S, (y * S + k))], fill=mixc(INK, SEAD, tt)) if False else None
            c.rr((x, y, x + 232, y + 240), 22, fill=INK)
        else: c.rr((x, y, x + 232, y + 240), 22, fill=(SEAL if on else (246, 249, 247)), outline=(SEA if on else LINE), w=1.5)
        tc = WHITE if lastk else (INK if on else (150, 170, 165))
        c.text((x + 24, y + 18), f"{i + 1:02d}", 34, SUN if lastk else (SEAD if on else (170, 190, 184)), "headx")
        if lastk: icon_key(c, x + 62, y + 104, 1.1, SUN)
        yy = y + 140 if not lastk else y + 176; line = ""
        for wd in s_.split():
            if c.tw((line + " " + wd).strip(), 31, "head") > 190 and line: c.text((x + 24, yy), line, 31, tc, "head"); yy += 38; line = wd
            else: line = (line + " " + wd).strip()
        c.text((x + 24, yy), line, 31, tc, "head")

def closing(c, t, lt):
    # full-bleed LifeMap dark-teal gradient like the portal's video tiles
    w, h = int(W * S), int(H * S); yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    g = np.clip((xx / w * 0.55 + yy / h * 0.75), 0, 1)[..., None]
    a = np.array(INK, np.float32); b = np.array(SEAD, np.float32); cc = np.array(SEA, np.float32)
    col = np.where(g < 0.6, a * (1 - g / 0.6) + b * (g / 0.6), b * (1 - (g - 0.6) / 0.4) + cc * ((g - 0.6) / 0.4))
    d = np.sqrt(((xx - w * 0.82) / w) ** 2 + ((yy - h * 0.2) / h) ** 2); gl = np.clip(1 - d / 0.35, 0, 1)[..., None] ** 2 * 0.18
    col = col * (1 - gl) + np.array([255, 176, 32], np.float32) * gl
    p = ease(lt / 0.9)
    bgim = Image.fromarray(np.clip(col, 0, 255).astype("uint8"))
    c.im = Image.blend(c.im, bgim, p); c.d = ImageDraw.Draw(c.im)
    cx = W / 2
    logo_mark(c, cx, 290, 54)
    c.text((cx, 380), "LifeMap", 150, fade(WHITE, p, INK), "headx", "ma")
    c.rr((cx - 60 * p, 580, cx + 60 * p, 586), 3, fill=SUN)
    c.text((cx, 626), "Start your plan today", 52, fade(WHITE, ease((lt - .4) / .8), INK), "med", "ma")
    q = ease((lt - .9) / .8)
    wd = c.tw("Speak to a verified mortgage expert", 28, "semi") + 56
    c.rr((cx - wd / 2, 720, cx + wd / 2, 782), 31, fill=mixc(INK, SUN, q)); c.text((cx, 735), "Speak to a verified mortgage expert", 28, fade(INK, q, SUN), "semi", "ma")
    c.text((cx, 1010), "Dramatised presentation. Figures illustrative. Rules change. Not financial advice.", 18, mixc(INK, (170, 205, 197), q), "reg", "ma")

MODS = [m_hook, m_budget, m_costs, m_benefits, m_rates, m_approval, m_protect, m_road]

def caption(c, t, a, b, text):
    words = text.split(); lens = [len(w) + 2 for w in words]; tot = sum(lens); acc = 0; wt = []
    for l in lens: wt.append((a + (b - a) * acc / tot, a + (b - a) * (acc + l) / tot)); acc += l
    sz = 38; maxw = RX1 - RX0; lines = []; cur = []
    for i, w in enumerate(words):
        if c.tw(" ".join(words[j] for j in cur + [i]), sz, "med") > maxw and cur: lines.append(cur); cur = [i]
        else: cur.append(i)
    lines.append(cur); y0 = 1000 - len(lines) * 54
    for li, ln in enumerate(lines):
        x = RX0
        for i in ln:
            act = wt[i][0] <= t < wt[i][1]; past = t >= wt[i][1]; wdw = c.tw(words[i], sz, "med")
            if act: c.rr((x - 8, y0 + li * 54 - 4, x + wdw + 8, y0 + li * 54 + 46), 12, fill=SUN)
            c.text((x, y0 + li * 54), words[i], sz, INK if (act or past) else (112, 138, 136), "med"); x += wdw + c.tw(" ", sz, "med")

def frame(n):
    t = n / OUTFPS; c = C(base())
    closing_on = t >= SPEECH_END - 0.05
    slide = ease((t - (SPEECH_END - 0.35)) / 0.7) if closing_on else 0
    k = -1; lt = t
    for i, (a, b, _) in enumerate(LINES):
        if t >= a - 0.05: k = i; lt = t - a
    av = None
    if slide < 1:
        cardim, m = card_img(); x0, y0, x1, y1 = CARD_BOX; off = -slide * 900
        c.im.paste(cardim, (int((x0 + off) * S - m), int(y0 * S - m)), cardim)
        av = (avatar(n), off)
    if closing_on: closing(c, t, t - (SPEECH_END - 0.1))
    else:
        if k < 0: m_intro(c, t, t)
        else: MODS[k](c, t, lt)
        for a, b, txt in LINES:
            if (not NOCAP) and a - 0.05 <= t <= b + 0.45: caption(c, t, a, b, txt)
        c.text((RX1, 1028), "Dramatised presentation. Figures illustrative. Rules change. Not financial advice.", 17, (130, 155, 150), "reg", "ra")
        c.rr((0, 1070, W, 1080), 0, fill=(205, 224, 218)); c.rr((0, 1070, W * min(1, t / DUR), 1080), 0, fill=SEA)
        c.rr((W * min(1, t / DUR) - 4, 1070, W * min(1, t / DUR), 1080), 0, fill=SUN)
    out = c.im.resize((W, H), Image.LANCZOS)
    if av is not None:
        (img, mk), off = av; x0, y0, x1, y1 = CARD_BOX
        px = int(x0 + (x1 - x0 - img.width) / 2 + off); py = int(y1 - img.height - 6)
        out.paste(img, (px, py), mk)
    return out

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "test":
        os.makedirs("tq", exist_ok=True)
        for t in (1.0, 5.0, 10.5, 14.0, 19.5, 25.5, 30.5, 36.0, 40.0, 45.0, 49.5, 52.0):
            frame(int(t * OUTFPS)).save(f"tq/t{t:05.1f}.png")
    else:
        part, nparts = int(sys.argv[2]), int(sys.argv[3]); os.makedirs(os.environ.get("OUTD", "fq"), exist_ok=True)
        for n in range(part, int(DUR * OUTFPS), nparts): frame(n).save(os.environ.get("OUTD", "fq") + f"/f{n + 1:05d}.jpg", quality=94)
