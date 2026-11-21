#!/usr/bin/env python3
"""Louisiana Purchase - Historical Map Animation renderer (frames only, no audio).
720x1280 @30fps, overscan 900x1600, zero neon route lines, physical props only.
Usage: render.py --start 0 --end 100 --out frames/  |  render.py --frame 42 --out still.png
"""
import argparse, json, math, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
CFG = json.load(open(os.path.join(HERE, "config.json")))
DUR = CFG["duration"]; FPS = 30; TOTAL = CFG["total_frames"]
OVW, OVH = 900, 1600; W, H = 720, 1280
FONT_DIR = "/usr/share/fonts/truetype/dejavu"
def font(name, size):
    p = os.path.join(FONT_DIR, name)
    return ImageFont.truetype(p if os.path.exists(p) else os.path.join(FONT_DIR, "DejaVuSerif-Bold.ttf"), size)
def f_serif_i(s): return font("DejaVuSerif-BoldItalic.ttf", s)
def f_serif(s): return font("DejaVuSerif-Bold.ttf", s)
def f_sans(s): return font("DejaVuSans-Bold.ttf", s)

def clamp(t): return max(0.0, min(1.0, t))
def sstep(t): t = clamp(t); return t*t*(3-2*t)
def smoother(t): t = clamp(t); return t*t*t*(t*(t*6-15)+10)
def spring_pop(t, dur=0.38):
    if t <= 0: return 0.0
    u = t/dur
    if u >= 1: return 1.0
    if u < 0.55: return 1.16*sstep(u/0.55)
    if u < 0.82: return 1.16-0.20*sstep((u-0.55)/0.27)
    return 0.96+0.04*sstep((u-0.82)/0.18)
def hop(t, t0, t1, p0, p1, hh=46):
    if t <= t0: return p0[0], p0[1], 0.0
    if t >= t1: return p1[0], p1[1], 0.0
    u = smoother((t-t0)/max(1e-4, t1-t0))
    return p0[0]+(p1[0]-p0[0])*u, p0[1]+(p1[1]-p0[1])*u-math.sin(u*math.pi)*hh, math.sin(u*math.pi*2)*8

INK = (43, 32, 22, 255)
# ---------------- plates ----------------
_PLATES = {}
def _noise_overlay(im, seed, alpha=16):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, alpha, (im.size[1]//4, im.size[0]//4)).astype(np.float32)
    nz = Image.fromarray(np.clip(128+n, 0, 255).astype(np.uint8)).resize(im.size).convert("L")
    ov = Image.merge("RGBA", (nz, nz, nz, Image.new("L", im.size, 60)))
    return Image.alpha_composite(im.convert("RGBA"), ov)
def plate(key):
    if key in _PLATES: return _PLATES[key]
    A = os.path.join(HERE, "assets")
    if key == "A": im = Image.open(os.path.join(A, "plateA.jpg")).convert("RGBA")
    elif key == "C": im = Image.open(os.path.join(A, "plateC.jpg")).convert("RGBA")
    elif key == "B":
        im = Image.new("RGBA", (OVW, OVH), (75, 114, 130, 255)); d = ImageDraw.Draw(im, "RGBA")
        land = (181, 159, 120, 255)
        d.polygon([(0,300),(300,260),(330,620),(180,900),(0,980)], fill=land, outline=INK, width=4)      # Americas sliver
        d.polygon([(560,180),(760,120),(900,220),(900,520),(700,560),(580,430)], fill=land, outline=INK, width=4)  # Europe
        d.polygon([(600,60),(700,20),(760,110),(690,190),(610,150)], fill=(200,180,140,255), outline=INK, width=4) # Britain
        d.polygon([(640,300),(820,280),(880,430),(760,540),(650,470)], fill=(38,74,168,90), outline=INK, width=3)  # France tint
        for i in range(46):
            x, y = random.Random(i).randint(0, OVW), random.Random(i+99).randint(0, OVH)
            d.arc([x, y, x+54, y+14], 180, 330, fill=(255,255,255,70), width=3)
        im = _noise_overlay(im, 7)
    elif key == "D" or key == "Dn":
        night = key == "Dn"
        wall = (64, 62, 96, 255) if night else (146, 108, 74, 255)
        im = Image.new("RGBA", (OVW, OVH), wall); d = ImageDraw.Draw(im, "RGBA")
        for x in range(60, OVW-60, 150): d.rectangle([x, 120, x+110, 620], fill=(58,52,44,255) if night else (96,72,50,255), outline=(230,200,150,255), width=5)
        d.rectangle([70, 150, 180, 590], fill=(120,150,190,255) if night else (170,205,230,255), outline=(240,220,170,255), width=6)
        d.polygon([(0,1600),(0,980),(900,900),(900,1600)], fill=(92,62,38,255))  # floor
        d.polygon([(90,1180),(810,1120),(880,1420),(30,1500)], fill=(120,84,50,255), outline=INK, width=5)  # table
        d.polygon([(120,1170),(780,1115),(830,1360),(90,1420)], fill=(198,178,138,255), outline=INK, width=3)  # table map sheet
    elif key == "P":  # plantation diorama
        im = Image.new("RGBA", (OVW, OVH), (168, 205, 225, 255)); d = ImageDraw.Draw(im, "RGBA")
        d.rectangle([0, 620, OVW, 1600], fill=(96, 142, 66, 255))
        for r in range(9):
            y = 700 + r*95
            for x in range(-40, OVW, 90):
                d.line([x+r*14, y, x+26+r*14, y-120], fill=(52, 96, 44, 255), width=9)
                d.line([x+16+r*14, y, x-6+r*14, y-105], fill=(66, 118, 54, 255), width=7)
        d.rectangle([0, 1330, OVW, 1600], fill=(150, 116, 76, 255))
    elif key == "Be":  # beach diorama
        im = Image.new("RGBA", (OVW, OVH), (170, 208, 228, 255)); d = ImageDraw.Draw(im, "RGBA")
        d.rectangle([0, 560, OVW, 980], fill=(75, 114, 130, 255))
        for i in range(30):
            x, y = random.Random(i*3).randint(0, OVW), 600+random.Random(i).randint(0, 330)
            d.arc([x, y, x+50, y+12], 180, 330, fill=(255,255,255,90), width=3)
        d.rectangle([0, 980, OVW, 1600], fill=(216, 188, 138, 255))
    else: raise ValueError(key)
    _PLATES[key] = im
    return im

def label(d, xy, text, size=44, fill=(30, 26, 20, 255)):
    f = f_serif_i(size)
    d.text((xy[0]+3, xy[1]+3), text, font=f, fill=(255, 250, 235, 160))
    d.text(xy, text, font=f, fill=fill)

# ---------------- sprites (generated, green-screen extracted) ----------------
_SPR = {}
def sprite(name):
    if name not in _SPR:
        _SPR[name] = Image.open(os.path.join(HERE, "assets", name + ".png")).convert("RGBA")
    return _SPR[name]
def paste_sprite(canvas, name, cx, by, h, pop=1.0, flip=False, tilt=0.0, alpha=255):
    if pop <= 0.02: return
    sp = sprite(name)
    if flip: sp = sp.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    w = int(sp.size[0] * (h*pop) / sp.size[1]); hh = int(h*pop)
    sp = sp.resize((max(2, w), max(2, hh)), Image.Resampling.LANCZOS)
    if tilt: sp = sp.rotate(tilt, resample=Image.Resampling.BICUBIC, expand=True)
    if alpha < 255:
        a = sp.split()[3].point(lambda v: v*alpha//255); sp.putalpha(a)
    sh = Image.new("RGBA", sp.size, (0, 0, 0, 0)); sh.putalpha(sp.split()[3].point(lambda v: int(v*0.30)))
    canvas.alpha_composite(sh, (int(cx-sp.size[0]/2)+7, int(by-sp.size[1])+9))
    canvas.alpha_composite(sp, (int(cx-sp.size[0]/2), int(by-sp.size[1])))

# ---------------- code-drawn peg-doll ----------------
def draw_arm(d, sx, sy, ang_deg, ln, prop=None):
    a = math.radians(ang_deg); ex, ey = sx+math.cos(a)*ln, sy+math.sin(a)*ln
    d.line([sx, sy, ex, ey], fill=(25, 20, 16, 255), width=8)
    d.ellipse([ex-13, ey-13, ex+13, ey+13], fill=(255, 252, 246, 255), outline=(25, 20, 16, 255), width=3)
    if prop == "pointer": d.line([ex, ey, ex+ln*0.55, ey-ln*0.30], fill=(120, 84, 40, 255), width=7)
    if prop == "sword": d.line([ex, ey, ex+ln*0.5, ey-ln*0.42], fill=(200, 205, 215, 255), width=8)
    if prop == "dagger": d.line([ex, ey, ex-ln*0.34, ey+ln*0.10], fill=(200, 205, 215, 255), width=7)
    if prop == "scroll":
        d.rounded_rectangle([ex-16, ey-42, ex+16, ey+42], 8, fill=(238, 226, 192, 255), outline=INK, width=3)
    return ex, ey

def character(canvas, cx, by, s, skin=(250, 224, 192, 255), coat=(30, 30, 34, 255), waist=(238, 228, 204, 255),
              hat="wig", face="neutral", armL=None, armR=None, jaw=0.0, yellow=False, fall=0.0, pop=1.0, sash=None):
    """Draw peg-doll on its own layer (for fall rotation), then paste."""
    if pop <= 0.02: return
    s = s*pop; L = Image.new("RGBA", (560, 640), (0, 0, 0, 0)); d = ImageDraw.Draw(L, "RGBA")
    ox, oy = 280, 620  # base centre in layer
    if yellow: skin = (242, 214, 29, 255)
    # body bell
    d.polygon([(ox-0.36*s, oy), (ox-0.30*s, oy-0.40*s), (ox-0.15*s, oy-0.56*s), (ox+0.15*s, oy-0.56*s), (ox+0.30*s, oy-0.40*s), (ox+0.36*s, oy)], fill=coat, outline=INK, width=5)
    d.polygon([(ox-0.15*s, oy-0.02*s), (ox, oy-0.54*s), (ox+0.15*s, oy-0.02*s)], fill=waist)
    if sash: d.polygon([(ox-0.20*s, oy-0.52*s), (ox-0.08*s, oy-0.52*s), (ox+0.24*s, oy-0.06*s), (ox+0.12*s, oy-0.06*s)], fill=sash)
    for i in range(3): d.ellipse([ox-9, oy-0.40*s+i*0.13*s, ox+9, oy-0.40*s+i*0.13*s+18], outline=INK, width=3)
    hy = oy-0.80*s; hr = 0.27*s
    # arms behind head but over body
    if armL: draw_arm(d, ox-0.22*s, oy-0.44*s, armL[0], 0.36*s, armL[1] if len(armL) > 1 else None)
    if armR: draw_arm(d, ox+0.22*s, oy-0.44*s, armR[0], 0.36*s, armR[1] if len(armR) > 1 else None)
    d.ellipse([ox-hr, hy-hr, ox+hr, hy+hr], fill=skin, outline=INK, width=5)
    ex = 0.11*s
    if face == "xx":
        for sgn in (-1, 1):
            d.line([ox+sgn*ex-11, hy-11, ox+sgn*ex+11, hy+11], fill=INK, width=5); d.line([ox+sgn*ex-11, hy+11, ox+sgn*ex+11, hy-11], fill=INK, width=5)
    else:
        for sgn in (-1, 1): d.ellipse([ox+sgn*ex-8, hy-8, ox+sgn*ex+8, hy+8], fill=INK)
    my = hy+0.11*s
    if jaw > 0.05:
        jh = 0.30*s*jaw
        d.rounded_rectangle([ox-0.09*s, my-4, ox+0.09*s, my+jh], 10, fill=(90, 30, 26, 255), outline=INK, width=4)
    elif face == "smile": d.arc([ox-0.08*s, my-0.07*s, ox+0.08*s, my+0.07*s], 15, 165, fill=INK, width=5)
    elif face == "worried": d.arc([ox-0.08*s, my+0.02*s, ox+0.08*s, my+0.16*s], 195, 345, fill=INK, width=5)
    else: d.line([ox-0.07*s, my, ox+0.07*s, my], fill=INK, width=5)
    # hats
    if hat == "wig":
        for sgn in (-1, 1): d.ellipse([ox+sgn*hr*0.72-0.10*s, hy-hr*0.9, ox+sgn*hr*0.72+0.10*s, hy+0.05*s], fill=(242, 240, 236, 255), outline=INK, width=3)
        d.pieslice([ox-hr, hy-hr*1.25, ox+hr, hy+hr*0.2], 180, 360, fill=(242, 240, 236, 255), outline=INK, width=3)
    elif hat == "shako":
        d.rectangle([ox-0.17*s, hy-hr-0.16*s, ox+0.17*s, hy-hr+0.10*s], fill=(24, 24, 28, 255), outline=INK, width=4)
        d.ellipse([ox-10, hy-hr-0.10*s, ox+10, hy-hr+0.02*s], fill=(200, 40, 40, 255))
    elif hat == "crown":
        d.polygon([(ox-0.18*s, hy-hr+6), (ox-0.18*s, hy-hr-0.14*s), (ox-0.06*s, hy-hr-0.02*s), (ox, hy-hr-0.17*s), (ox+0.06*s, hy-hr-0.02*s), (ox+0.18*s, hy-hr-0.14*s), (ox+0.18*s, hy-hr+6)], fill=(240, 200, 70, 255), outline=INK, width=4)
    elif hat == "hair":
        d.pieslice([ox-hr, hy-hr*1.15, ox+hr, hy+hr*0.3], 180, 360, fill=(52, 36, 24, 255))
    elif hat == "straw":
        d.ellipse([ox-0.30*s, hy-hr*0.95, ox+0.30*s, hy-hr*0.55], fill=(226, 196, 120, 255), outline=INK, width=4)
    if fall: L = L.rotate(fall, resample=Image.Resampling.BICUBIC, expand=False)
    canvas.alpha_composite(L, (int(cx-280), int(by-620)))

# ---------------- props ----------------
def barrel(d, x, y, s=54):
    d.rounded_rectangle([x-s*0.42, y-s, x+s*0.42, y], 12, fill=(146, 102, 58, 255), outline=INK, width=4)
    d.line([x-s*0.44, y-s*0.72, x+s*0.44, y-s*0.72], fill=INK, width=4); d.line([x-s*0.44, y-s*0.28, x+s*0.44, y-s*0.28], fill=INK, width=4)
def crate(d, x, y, s=58):
    d.rectangle([x-s/2, y-s, x+s/2, y], fill=(176, 138, 84, 255), outline=INK, width=4)
    d.line([x-s/2, y-s, x+s/2, y], fill=INK, width=3); d.line([x-s/2, y, x+s/2, y-s], fill=INK, width=3)
def ship(d, x, y, s=150, flag=(36, 60, 160, 255), sail=(246, 240, 220, 255)):
    d.polygon([(x-s*0.55, y), (x+s*0.55, y), (x+s*0.38, y+s*0.24), (x-s*0.38, y+s*0.24)], fill=(110, 74, 42, 255), outline=INK, width=4)
    d.line([x, y, x, y-s*0.95], fill=INK, width=6)
    d.polygon([(x+6, y-s*0.9), (x+6, y-s*0.15), (x+s*0.42, y-s*0.15)], fill=sail, outline=INK, width=3)
    d.polygon([(x-6, y-s*0.8), (x-6, y-s*0.15), (x-s*0.34, y-s*0.15)], fill=sail, outline=INK, width=3)
    d.polygon([(x, y-s*0.95), (x+s*0.30, y-s*0.83), (x, y-s*0.71)], fill=flag)
def tag(d, x, y, text, s=40, fill=(240, 200, 70, 255)):
    f = f_sans(s); bb = d.textbbox((0, 0), text, font=f); tw, th = bb[2]-bb[0], bb[3]-bb[1]
    d.rounded_rectangle([x-tw/2-16, y-th/2-10, x+tw/2+16, y+th/2+10], 12, fill=fill, outline=INK, width=4)
    d.text((x-tw/2, y-th/2-2), text, font=f, fill=(30, 24, 16, 255))
def scroll_prop(d, x, y, w, h, frac, text=None):
    w2 = w*frac
    if w2 < 8: return
    d.rounded_rectangle([x-w2/2, y-h/2, x+w2/2, y+h/2], 14, fill=(238, 226, 192, 255), outline=INK, width=4)
    d.ellipse([x-w2/2-12, y-h/2-8, x-w2/2+12, y+h/2+8], fill=(198, 168, 116, 255), outline=INK, width=3)
    d.ellipse([x+w2/2-12, y-h/2-8, x+w2/2+12, y+h/2+8], fill=(198, 168, 116, 255), outline=INK, width=3)
    if text and frac > 0.6: label(d, (x-w2/2+26, y-26), text, 36)
def easel(d, x, y, s=200):
    d.line([x-s*0.4, y, x, y-s], fill=(110, 74, 42, 255), width=10); d.line([x+s*0.4, y, x, y-s], fill=(110, 74, 42, 255), width=10)
    d.rectangle([x-s*0.52, y-s*1.02, x+s*0.52, y-s*0.30], fill=(226, 208, 168, 255), outline=INK, width=5)
def chain_row(d, x, y, n, broken=0.0):
    for i in range(n):
        cx = x+i*44
        if broken and i == n//2: continue
        d.ellipse([cx-24, y-13, cx+24, y+13], outline=(60, 60, 66, 255), width=7)
def flame(canvas, cx, cy, t, intensity=1.0, seed=0):
    if intensity <= 0.02: return
    s = intensity; pad = int(max(90, 115*s)); patch = Image.new("RGBA", (pad*2, pad*2), (0, 0, 0, 0)); pd = ImageDraw.Draw(patch, "RGBA"); pc = pad
    for mult, av in [(1.0, 26), (0.72, 42), (0.45, 65)]:
        gr = int(76*s*mult*(0.94+0.06*math.sin(t*13+seed)))
        pd.ellipse([pc-gr, pc-gr, pc+gr, pc+gr], fill=(255, 110, 20, int(av*min(1.0, s))))
    for k in range(5):
        ph = t*(10+k*2.1)+seed*1.7+k*1.3; ox = (k-2)*14*s+math.sin(ph)*5*s
        fh = (44+(k % 3)*18)*s*(0.85+0.22*abs(math.sin(ph))); fw = (15+(k % 2)*5)*s
        pd.polygon([(pc+ox-fw, pc+8*s), (pc+ox-fw*0.6, pc-fh*0.45), (pc+ox+math.sin(ph*1.3)*7*s, pc-fh), (pc+ox+fw*0.6, pc-fh*0.45), (pc+ox+fw, pc+8*s)], fill=(242, 82, 18, int(225*min(1.0, s))))
        pd.polygon([(pc+ox-fw*0.48, pc+5*s), (pc+ox+math.sin(ph*1.3)*4*s, pc-fh*0.62), (pc+ox+fw*0.48, pc+5*s)], fill=(255, 226, 92, int(240*min(1.0, s))))
    canvas.alpha_composite(patch, (int(cx-pad), int(cy-pad)))

# geography on plate A (900x1600)
LOU_POLY = [(408, 812), (548, 786), (592, 936), (552, 1128), (462, 1162), (404, 972)]
USA_POLY = [(548, 786), (742, 762), (812, 892), (772, 1072), (612, 1148), (552, 1128), (592, 936)]
NEW_ORLEANS = (560, 1118)
MISSISSIPPI = [(618, 806), (600, 920), (578, 1010), (560, 1118)]

def tint(canvas, poly, color):
    ov = Image.new("RGBA", (OVW, OVH), (0, 0, 0, 0)); dd = ImageDraw.Draw(ov, "RGBA")
    dd.polygon(poly, fill=color, outline=(30, 26, 20, 200), width=4); canvas.alpha_composite(ov)

CAPTIONS = {
 0: ["America sent two men", "to buy one city", "They came home with", "half a continent", "Price? Fifteen million dollars", "three cents an acre", "America doubled overnight", "by accident"],
 1: ["Rewind. 1802.", "France and Britain", "have just made peace", "but nobody trusts it", "Both smile, shake hands", "daggers behind their backs", "War is coming back", "Everyone knows it"],
 2: ["Napoleon has a dream", "rebuild France's empire", "in America", "His key piece: Louisiana", "from New Orleans", "to Canada", "France, a world power", "again, on paper"],
 3: ["But the engine is", "not Louisiana", "It's Saint-Domingue", "today's Haiti", "France's richest colony", "sugar and coffee", "A money machine", "built on slavery"],
 4: ["Then the enslaved people", "rise up", "Chains break", "Plantations burn", "The colony Napoleon", "needs most", "slips from his hands", "battle by battle"],
 5: ["He sends a huge army", "to take it back", "At first, it works", "Then yellow fever hits", "Soldiers collapse", "France loses the island", "for good", "Haiti will be independent"],
 6: ["Without Saint-Domingue", "Louisiana has no purpose", "America's western farmers", "depend on one choke point", "the Mississippi River", "and New Orleans port", "Block that port", "and their trade chokes"],
 7: ["President Thomas Jefferson", "sends two diplomats", "Monroe and Livingston", "to Paris", "Buy New Orleans", "and only New Orleans", "for up to", "ten million dollars"],
 8: ["Napoleon does different math", "War with Britain is coming", "He needs cash, fast", "Louisiana is far away", "hard to defend", "Britain could take it", "His wallet is empty"],
 9: ["So he shocks everyone", "Not just the city", "All of Louisiana", "Every river, every plain", "eight hundred thousand", "square miles", "for fifteen million dollars"],
 10: ["The diplomats have", "no permission. None.", "But some deals are", "too big to phone home", "On April 30, 1803", "they sign anyway"],
 11: ["Overnight, America doubles", "in size", "roughly four cents", "an acre", "They shopped for a city", "and accidentally bought", "an empire"],
}
BOUNDS = [0, 10, 20, 32, 44, 54, 66, 78, 90, 103, 114, 124, 135]
SCALE = DUR/135.0
SCENES = [(BOUNDS[i]*SCALE, BOUNDS[i+1]*SCALE) for i in range(12)]
CAM = {0: (1.05, 1.30, 450, 450, 830, 800), 1: (1.0, 1.15, 450, 450, 800, 800), 2: (1.25, 1.05, 500, 450, 900, 820),
       3: (1.0, 1.35, 450, 450, 800, 760), 4: (1.0, 1.1, 450, 450, 800, 800), 5: (1.1, 1.0, 450, 450, 780, 800),
       6: (1.30, 1.05, 520, 450, 950, 830), 7: (1.0, 1.2, 450, 450, 800, 800), 8: (1.0, 1.25, 450, 470, 800, 800),
       9: (1.05, 1.35, 450, 450, 800, 800), 10: (1.15, 1.3, 450, 450, 820, 800), 11: (1.35, 1.0, 520, 450, 900, 800)}

def scene_index(t):
    for i, (a, b) in enumerate(SCENES):
        if a <= t < b: return i
    return 11

def draw_scene(t):
    i = scene_index(t); a, b = SCENES[i]; u = (t-a)/max(0.01, b-a); tu = t-a
    key = {0: "A", 1: "B", 2: "A", 3: "C", 4: "P", 5: "Be", 6: "A", 7: "D", 8: "B", 9: "D", 10: "Dn", 11: "A"}[i]
    cv = plate(key).copy(); d = ImageDraw.Draw(cv, "RGBA")
    bob = math.sin(t*2.2)*5
    if i == 0:
        tint(cv, LOU_POLY, (38, 74, 168, 110)); d = ImageDraw.Draw(cv, "RGBA")
        easel(d, 450, 1180, 300); scroll_prop(d, 450, 640, 330, 120, spring_pop(tu), "Louisiana")
        paste_sprite(cv, "diplomat", 268, 1330+bob, 330, spring_pop(tu))
        paste_sprite(cv, "diplomat", 640, 1330-bob, 330, spring_pop(tu-0.15), flip=True)
        paste_sprite(cv, "napoleon", 450, 1130, 280, spring_pop(tu-0.3))
        if tu > 2.2: tag(d, 450, 470, "$15M", 54)
        jd = 0.9 if 3.0 < tu < 6.0 else 0.0
        if jd:  # jaw-drop: elongated open mouth below each diplomat's chin
            for cx in (268, 640): d.rounded_rectangle([cx-18, 1172, cx+18, 1172+62*jd], 9, fill=(90, 30, 26, 255), outline=INK, width=4)
    elif i == 1:
        label(d, (330, 180), "1802", 92)
        paste_sprite(cv, "napoleon", 300, 1050+bob, 380, spring_pop(tu))
        character(cv, 610, 1050-bob, 360, coat=(178, 32, 36, 255), hat="crown", face="smile", armL=(-160, "dagger"), armR=(-25,))
        # handshake arms
        d.line([395, 830, 505, 830], fill=(25, 20, 16, 255), width=9)
        d.ellipse([437, 817, 463, 843], fill=(255, 252, 246, 255), outline=INK, width=3)
        if u > 0.45: label(d, (250, 1240), "Peace... for now", 40)
    elif i == 2:
        tint(cv, LOU_POLY, (38, 74, 168, int(60+110*sstep(u)))); d = ImageDraw.Draw(cv, "RGBA")
        label(d, (330, 900), "Louisiana", 52)
        paste_sprite(cv, "napoleon", 700, 700+bob, 330, spring_pop(tu))
        d.line([610, 520, 520, 880], fill=(120, 84, 40, 255), width=8)  # pointer to map
        # thought cloud
        if u > 0.35:
            d.rounded_rectangle([90, 210, 430, 390], 40, fill=(255, 253, 245, 245), outline=INK, width=4)
            d.polygon([(300, 390), (330, 450), (360, 390)], fill=(255, 253, 245, 245), outline=INK, width=3)
            d.rounded_rectangle([140, 275, 380, 315], 20, fill=(232, 196, 120, 255), outline=INK, width=4)
            label(d, (150, 220), "EMPIRE!", 36)
    elif i == 3:
        label(d, (240, 300), "Saint-Domingue", 54)
        label(d, (330, 370), "(Haiti)", 40)
        for k, (px, py) in enumerate([(300, 760), (450, 820), (600, 760), (380, 940), (540, 950)]):
            p = spring_pop(tu-0.4*k)
            if p > 0.05:
                if k % 3 == 0:
                    for c in range(3): d.rounded_rectangle([px-30+c*4, py-26-c*24, px+30+c*4, py-c*24], 6, fill=(246, 244, 238, 255), outline=INK, width=3)
                elif k % 3 == 1: barrel(d, px, py+30, int(60*p))
                else:
                    for c in range(3): d.ellipse([px-34+c*10, py-20-c*20, px+6+c*10, py+20-c*20], fill=(240, 200, 70, 255), outline=INK, width=3)
        for k, px in enumerate((250, 450, 650)):
            character(cv, px, 1330+bob*(1 if k % 2 else -1), 300, skin=(122, 76, 48, 255), coat=(216, 202, 170, 255), waist=(216, 202, 170, 255), hat="hair", face="worried", pop=spring_pop(tu-0.3*k))
        chain_row(d, 205, 1210, 11)
    elif i == 4:
        for k, px in enumerate((280, 470, 660)):
            character(cv, px, 1300+bob, 330, skin=(122, 76, 48, 255), coat=(216, 202, 170, 255), waist=(216, 202, 170, 255), hat="hair", face="smile" if u > 0.3 else "worried",
                      armR=(-55, "sword") if u > 0.3 else None, pop=spring_pop(tu-0.2*k))
        chain_row(d, 215, 1185, 12, broken=sstep((u-0.25)/0.2))
        flame(cv, 180, 1180, t, 0.8*sstep((u-0.4)/0.3), 3); flame(cv, 740, 1140, t, 0.7*sstep((u-0.5)/0.3), 7)
        character(cv, 770, 1330, 260, coat=(36, 60, 160, 255), hat="shako", face="worried")
    elif i == 5:
        for k in range(4):
            x, y, _, _ = 0, 0, 0, 0
            sx = 120+k*190; sy = 700+math.sin(t*1.7+k)*8
            ship(d, sx, sy, 130, flag=(36, 60, 160, 255))
        for k, px in enumerate((230, 420, 610, 770)):
            sick = u > 0.45 and k < 3
            character(cv, px, 1420, 300, coat=(36, 60, 160, 255), hat="shako", face="xx" if sick else "neutral", yellow=sick, fall=78 if sick and u > 0.6 else 0, pop=spring_pop(tu-0.25*k))
        if u > 0.55: label(d, (270, 1080), "Yellow fever", 46)
    elif i == 6:
        tint(cv, USA_POLY, (42, 149, 168, 90)); tint(cv, LOU_POLY, (120, 120, 130, 70)); d = ImageDraw.Draw(cv, "RGBA")
        label(d, (520, 700), "USA", 48); label(d, (300, 1330), "New Orleans", 42)
        d.line(MISSISSIPPI, fill=(75, 114, 130, 255), width=16)
        for k in range(3):
            fr = (u*1.3-k*0.33) % 1.0
            idx = fr*(len(MISSISSIPPI)-1); j = int(idx); fr2 = idx-j
            x = MISSISSIPPI[j][0]+(MISSISSIPPI[min(j+1, 3)][0]-MISSISSIPPI[j][0])*fr2
            y = MISSISSIPPI[j][1]+(MISSISSIPPI[min(j+1, 3)][1]-MISSISSIPPI[j][1])*fr2
            ship(d, x, y-16, 92, flag=(42, 149, 168, 255))
            barrel(d, x-58, y+44, 44); crate(d, x+62, y+44, 46)
        # port gate
        gx = 560; d.rectangle([gx-110, 1030, gx-14, 1150], fill=(110, 74, 42, 255), outline=INK, width=4)
        d.rectangle([gx+14, 1030, gx+110, 1150], fill=(110, 74, 42, 255), outline=INK, width=4)
        character(cv, 240, 1420+bob, 280, coat=(120, 96, 60, 255), hat="straw", face="worried")
        character(cv, 690, 1420-bob, 280, coat=(120, 96, 60, 255), hat="straw", face="worried")
    elif i == 7:
        character(cv, 450, 780+bob, 360, coat=(52, 44, 40, 255), hat="wig", face="neutral", armR=(-40,))
        tag(d, 640, 560, "$10M", 48)
        easel(d, 220, 1150, 170); d.ellipse([196, 830, 244, 878], fill=(200, 40, 40, 255), outline=INK, width=3); label(d, (90, 760), "One city only", 36)
        paste_sprite(cv, "diplomat", 330, 1420, 320, spring_pop(tu-0.5))
        paste_sprite(cv, "diplomat", 580, 1420, 320, spring_pop(tu-0.8), flip=True)
        # briefcase
        d.rounded_rectangle([392, 1080, 508, 1160], 10, fill=(150, 152, 158, 255), outline=INK, width=4)
    elif i == 8:
        paste_sprite(cv, "napoleon", 450, 980+bob, 400, spring_pop(tu))
        # empty wallet
        d.rounded_rectangle([300, 1120, 600, 1300], 26, fill=(122, 88, 56, 255), outline=INK, width=5)
        for r in range(3): d.arc([350+r*30, 1150, 550-r*20, 1290], 200, 320, fill=(230, 230, 230, 160), width=3)
        tag(d, 450, 1080, "EMPTY", 40, fill=(238, 226, 192, 255))
        for k in range(3): ship(d, 140+k*90, 320+math.sin(t+k)*6, 84, flag=(200, 40, 40, 255))
        label(d, (300, 180), "War is coming", 44)
    elif i == 9:
        scroll_prop(d, 450, 760, 620, 210, sstep((u-0.15)/0.35), "ALL of Louisiana")
        if u > 0.4: tag(d, 450, 520, "$15M", 58)
        if u > 0.25: tag(d, 180, 520, "$10M", 40, fill=(200, 200, 200, 255))
        paste_sprite(cv, "diplomat", 280, 1420+bob, 330, spring_pop(tu))
        paste_sprite(cv, "diplomat", 620, 1420-bob, 330, spring_pop(tu-0.2), flip=True)
        paste_sprite(cv, "napoleon", 450, 1180, 280, spring_pop(tu-0.1))
        if 0.35 < u < 0.8:
            for cx in (280, 620): d.rounded_rectangle([cx-18, 1262, cx+18, 1262+76], 9, fill=(90, 30, 26, 255), outline=INK, width=4)
    elif i == 10:
        d.text((333, 173), "1803", font=f_serif_i(92), fill=(0, 0, 0, 160))
        d.text((330, 170), "1803", font=f_serif_i(92), fill=(246, 238, 214, 255))
        scroll_prop(d, 450, 800, 560, 190, 1.0, "April 30, 1803")
        paste_sprite(cv, "napoleon", 240, 1400+bob, 320, spring_pop(tu))
        paste_sprite(cv, "diplomat", 660, 1400-bob, 320, spring_pop(tu-0.2), flip=True)
        d.line([360, 1180, 545, 1180], fill=(25, 20, 16, 255), width=9)
        d.ellipse([437, 1167, 463, 1193], fill=(255, 252, 246, 255), outline=INK, width=3)
        d.line([620, 1120, 520, 990], fill=(90, 90, 96, 255), width=5)  # quill
    elif i == 11:
        m = sstep((u-0.15)/0.5)
        tint(cv, USA_POLY, (42, 149, 168, 90)); tint(cv, LOU_POLY, (38, 74, 168, int(110*(1-m))+(42 if m >= 1 else 0)))
        # merged tint: draw USA color over Louisiana as m grows
        if m > 0:
            ov = Image.new("RGBA", (OVW, OVH), (0, 0, 0, 0)); dd = ImageDraw.Draw(ov, "RGBA")
            sub = LOU_POLY[:2]+[(int(LOU_POLY[2][0]), int(LOU_POLY[2][1]))]+LOU_POLY[3:]
            dd.polygon(LOU_POLY, fill=(42, 149, 168, int(100*m))); cv.alpha_composite(ov); d = ImageDraw.Draw(cv, "RGBA")
        label(d, (540, 700), "USA", 56); label(d, (330, 930), "Louisiana", 44)
        # yard sign
        sx, sy = 250, 1240; d.rectangle([sx-8, sy, sx+8, sy+120], fill=(110, 74, 42, 255))
        sold = u > 0.45
        d.rounded_rectangle([sx-130, sy-92, sx+130, sy], 10, fill=(246, 244, 238, 255), outline=INK, width=4)
        label(d, (sx-105, sy-78), "SOLD" if sold else "FOR SALE", 40)
        if u > 0.55: tag(d, 640, 1230, "4c / acre", 44)
        paste_sprite(cv, "diplomat", 700, 1450+bob, 280, spring_pop(tu))
    # camera
    z0, z1, cx0, cx1, cy0, cy1 = CAM[i]; uu = smoother(u)
    zoom = z0+(z1-z0)*uu; cx = cx0+(cx1-cx0)*uu; cy = cy0+(cy1-cy0)*uu
    cw, ch = OVW/zoom, OVH/zoom
    left = max(0, min(OVW-cw, cx-cw/2)); top = max(0, min(OVH-ch, cy-ch/2))
    frame = cv.crop((left, top, left+cw, top+ch)).resize((W, H), Image.Resampling.BILINEAR).convert("RGBA")
    # rewind overlay scene 2 start
    if i == 1 and tu < 1.2:
        dd = ImageDraw.Draw(frame, "RGBA"); dd.text((36, 60), "<<< REWIND", font=f_sans(44), fill=(255, 255, 255, 230))
    draw_caption(frame, i, u, t)
    return frame.convert("RGB")

def draw_caption(frame, i, u, t):
    caps = CAPTIONS[i]; n = len(caps); k = min(n-1, int(u*n))
    text = caps[k]
    d = ImageDraw.Draw(frame, "RGBA")
    size = 34
    while size > 28:
        f = f_sans(size); bb = d.textbbox((0, 0), text, font=f)
        if bb[2]-bb[0] <= W-56: break
        size -= 2
    f = f_sans(size); bb = d.textbbox((0, 0), text, font=f); tw, th = bb[2]-bb[0], bb[3]-bb[1]
    y = int(H*0.86)
    d.rounded_rectangle([(W-tw)/2-18, y-10, (W+tw)/2+18, y+th+12], 12, fill=(12, 12, 14, 178))
    d.text(((W-tw)/2, y), text, font=f, fill=(255, 252, 244, 255))

def render_range(start, end, outdir):
    os.makedirs(outdir, exist_ok=True)
    for fr in range(start, end):
        t = fr/FPS
        im = draw_scene(t)
        im.save(os.path.join(outdir, f"f{fr:05d}.jpg"), quality=88)
        if fr % 50 == 0: print(f"frame {fr}", flush=True)

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--start", type=int, default=0); ap.add_argument("--end", type=int, default=TOTAL)
    ap.add_argument("--frame", type=int, default=-1); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    if a.frame >= 0: draw_scene(a.frame/FPS).save(a.out)
    else: render_range(a.start, a.end, a.out)
