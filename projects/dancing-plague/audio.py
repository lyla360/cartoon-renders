"""Synthesized music bed + SFX stems for "The Town That Couldn't Stop Dancing" (Strasbourg, 1518).
Medieval mood: lute plucks + soft pad + frame drum. The bed builds with the crowd, turns
frantic with the hired musicians, breaks down across the collapse, falls SILENT on
"the dancing stopped" (f1446), and leaves only a low drone under the mystery line.
Writes music.wav + sfx.wav only; mix.py does the level lock against the voice."""
import numpy as np, wave

SR = 48000
DUR = 1628 / 30
N = int(DUR * SR)
rng = np.random.default_rng(7)

def env(n, a=0.005, r=0.2, sus=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
    return e

def lp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)

def hp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)

def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i < N and j > i: buf[i:j] += sig[: j - i] * gain

midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- music ----------------
music = np.zeros(N, np.float32)
BPM = 96; beat = 60 / BPM
prog = [(50, [50, 53, 57]), (46, [46, 50, 53]), (53, [53, 57, 60]), (48, [48, 52, 55])]  # Dm Bb F C
def pluck(f, dur=0.35, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * env(n, 0.003, dur * 0.35)).astype(np.float32)
def pad(fs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        ph = 2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.3 for k in range(8))
    a = np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.15).clip(0)
    return lp_fast((s * a).astype(np.float32), 1200) / len(fs)
def drum(kind):
    if kind == "kick":
        n = int(0.35 * SR); t = np.arange(n) / SR; f = 50 + 90 * np.exp(-t * 30)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)
    n = int(0.18 * SR); t = np.arange(n) / SR
    s = rng.standard_normal(n) * np.exp(-t * 28) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 20) * 0.5
    return hp_fast(s.astype(np.float32), 300)

def section(t, bar):
    """gains (pad, bass, mel, drum) for the bar starting at time t — the bed follows the story."""
    if t < 7.3:  return (0.5, 0.6, 0.0, 0.0)     # hook: she steps in, lute alone
    if t < 11.3: return (0.6, 0.8, 0.5, 0.5)     # day: first dancing, soft drum joins
    if t < 14.8: return (0.5, 0.5, 0.25, 0.0)    # night: thinned out, no drum
    if t < 19.8: return (0.6, 0.8, 0.5, 0.45)    # dawn: she cannot stop
    if t < 29.7: return (0.8, 1.0, 0.8, 0.8)     # the crowd: full bed
    if t < 36.0: return (0.6, 0.8, 0.3, 0.5)     # leaders confer: rhythm only
    if t < 37.4: return (0.6, 0.8, 0.4, 0.6)     # the stage goes up
    if t < 41.9: return (0.9, 1.0, 1.0, 1.0)     # hired musicians: frantic
    # collapse: the band falls apart — drum drops on alternate bars, melody decays away
    k = max(0.15, 1 - (t - 41.9) / 6.3)
    return (0.5, 0.7 * k, 0.7 * k, 0.5 * k if bar % 2 == 0 else 0.0)

MUSIC_END = 1445 / 30  # the bed dies with the last dancer, just before "the dancing stopped"
bar = 0; tt = 0.0
while tt < MUSIC_END:
    root, ch = prog[bar % 4]
    gp, gb, gm, gd = section(tt, bar)
    place(music, pad([midi(m) for m in ch], beat * 4 * 0.98), tt, 0.10 * gp)
    for b in range(4):
        tb = tt + b * beat
        if tb >= MUSIC_END: break
        if gd > 0: place(music, drum("kick" if b % 2 == 0 else "snare"), tb, gd * (0.5 if b % 2 == 0 else 0.3))
        place(music, pluck(midi(root - 12), 0.4, 0.4), tb, 0.35 * gb)
        if gm > 0:
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.22, 0.6), tb + beat / 2, 0.14 * gm)
            if gm > 0.9: place(music, pluck(midi(ch[(b + 1) % 3] + 19), 0.18, 0.55), tb + beat * 0.75, 0.10 * gm)
    bar += 1; tt += beat * 4
i0 = int((MUSIC_END - 0.1) * SR); music[i0:] *= np.linspace(1, 0, N - i0) ** 8
# mystery drone under the last line (from "Five hundred years later", f1496)
DRONE_AT = 1496 / 30
dn = int((DUR - DRONE_AT) * SR); td = np.arange(dn) / SR
drone = (np.sin(2 * np.pi * 73.4 * td) + 0.5 * np.sin(2 * np.pi * 110 * td) + 0.3 * np.sin(2 * np.pi * 146.8 * td)) * np.minimum(1, td / 1.2)
drone = lp_fast(drone.astype(np.float32), 500)
place(music, drone, DRONE_AT, 0.09)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def thunk(f0=90, d=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 14) + lp_fast(noise(d), 1200) * np.exp(-t * 30) * 0.5).astype(np.float32)
def ting():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2093, 4), (3136, 6), (4186, 8)]) * 0.3).astype(np.float32)
def sting():
    n = int(2.0 * SR); t = np.arange(n) / SR
    low = np.sin(2 * np.pi * 36.7 * t) * np.exp(-t * 1.5) * 1.2
    hit = lp_fast(noise(2.0), 900) * np.exp(-t * 6) * 0.8
    stab = pad([midi(38), midi(41), midi(45)], 1.4); s = low + hit; s[: len(stab)] += stab * 2.2 * np.exp(-np.arange(len(stab)) / SR * 2)
    return s.astype(np.float32)
def creak(d=0.6, f0=140):
    n = int(d * SR); t = np.arange(n) / SR
    rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d))
    ph = np.cumsum(rate) / SR; pulses = (np.mod(ph, 1) < 0.08).astype(np.float32)
    s = lp_fast(pulses * (0.6 + 0.4 * rng.random(n).astype(np.float32)), 2200) * np.sin(np.pi * t / d)
    return hp_fast(s, 200) * 2.5
def whoosh(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 1500) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def hubbub(d):
    n = int(d * SR)
    seg = int(0.11 * SR); gains = np.repeat(rng.uniform(0.25, 1.0, int(np.ceil(n / seg)) + 1), seg)[:n]
    s = lp_fast(noise(d), 750) * gains * (0.55 + 0.45 * np.sin(2 * np.pi * 0.6 * np.arange(n) / SR))
    s *= np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    return s.astype(np.float32)
def crickets(d):
    n = int(d * SR); s = np.zeros(n, np.float32)
    t0 = 0.15
    while t0 < d - 0.3:
        for k in range(3):
            i = int((t0 + k * 0.07) * SR); m = int(0.045 * SR); tt2 = np.arange(m) / SR
            chirp = np.sin(2 * np.pi * 4200 * tt2) * np.sin(np.pi * tt2 / 0.045) ** 2
            if i + m < n: s[i:i + m] += chirp * 0.5
        t0 += rng.uniform(0.55, 0.95)
    return s
def chirp():
    n = int(0.3 * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for k, t0 in enumerate([0.0, 0.16]):
        m = int(0.09 * SR); tt2 = np.arange(m) / SR
        f = 2900 - 700 * tt2 / 0.09
        one = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt2 / 0.09)
        i = int(t0 * SR); s[i:i + m] += one * (0.8 - k * 0.25)
    return s

F = lambda f: f / 30
# she steps into the street: four soft footfalls, then the dancing taps begin
for k, ff in enumerate([120, 146, 172, 198]): place(sfx, thunk(210, 0.1), F(ff), 0.30)
for ff in range(224, 336, 14): place(sfx, thunk(240, 0.07), F(ff), 0.13)   # day dancing taps
place(sfx, crickets(3.5), F(341), 0.14)                                     # night insects
for ff in range(345, 440, 19): place(sfx, thunk(200, 0.07), F(ff), 0.08)    # tired taps in the dark
place(sfx, hubbub(1.9), F(533), 0.16)                                       # the first joiners murmur
place(sfx, hubbub(9.9), F(594), 0.26)                                       # the crowd bed builds
place(sfx, hubbub(6.0), F(700), 0.34)                                       # ...and swells over it
place(sfx, hubbub(3.0), F(891), 0.12)                                       # leaders confer: murmur dips
place(sfx, ting(), F(950), 0.25)                                            # the "brilliant" idea lands
place(sfx, hubbub(3.2), F(983), 0.18)                                       # the pitch, crowd behind
for k, ff in enumerate([1086, 1094, 1103, 1112]): place(sfx, thunk(150, 0.12), F(ff), 0.5 - k * 0.03)  # hammers
place(sfx, creak(0.7, 120), F(1088), 0.4)                                   # stage timber strains
place(sfx, drum("kick"), F(1122), 0.55)                                     # the band starts
place(sfx, hubbub(4.4), F(1122), 0.30)                                      # dancing crowd under the band
for k, ff in enumerate([1258, 1276, 1300, 1324, 1356, 1392]):               # the falls, one by one
    place(sfx, thunk(80, 0.35), F(ff), 0.55)
    place(sfx, whoosh(0.3), F(ff), 0.18)
place(sfx, whoosh(0.9), F(1444), 0.22)                                      # the sudden stop: air goes out of the street
place(sfx, chirp(), F(1472), 0.20)                                          # one bird in the empty street
place(sfx, sting(), F(1496), 0.85)                                          # twist sting under "Five hundred years later"
place(sfx, ting(), F(1612), 0.10)                                           # the question hangs

def write_stem(name, buf):
    peak = float(np.max(np.abs(buf))) or 1.0
    if peak > 0.95: buf = buf * (0.95 / peak)
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(name, f"{len(pcm) / SR:.2f}s peak {peak:.2f}")

write_stem("music.wav", music)
write_stem("sfx.wav", sfx)
