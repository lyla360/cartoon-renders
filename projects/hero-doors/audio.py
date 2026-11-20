"""Synthesized music bed + SFX stems for "The Miracle Was Just Plumbing" (Hero's doors).
Writes music.wav + sfx.wav only; mix.py does the level lock against the voice."""
import numpy as np, wave

SR = 48000
DUR = 1270 / 30
N = int(DUR * SR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

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
BPM = 104; beat = 60 / BPM
prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (55, [55, 59, 62]), (52, [52, 56, 59])]  # Am F G E
def pluck(f, dur=0.35, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * env(n, 0.003, dur * 0.35)).astype(np.float32)
def brass(fs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        ph = 2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.3 for k in range(8))
    a = np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.15).clip(0)
    return lp_fast((s * a).astype(np.float32), 1800) / len(fs)
def drum(kind):
    if kind == "kick":
        n = int(0.35 * SR); t = np.arange(n) / SR; f = 50 + 90 * np.exp(-t * 30)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)
    n = int(0.18 * SR); t = np.arange(n) / SR
    s = rng.standard_normal(n) * np.exp(-t * 28) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 20) * 0.5
    return hp_fast(s.astype(np.float32), 300)

MUSIC_END = 40.05  # bed stops on the twist line ("Turns out, the miracle was just plumbing")
bar = 0; tt = 0.0
while tt < MUSIC_END:
    root, ch = prog[bar % 4]
    place(music, brass([midi(m) for m in ch], beat * 4 * 0.98), tt, 0.10)
    for b in range(4):
        tb = tt + b * beat
        if tb >= MUSIC_END: break
        place(music, drum("kick" if b % 2 == 0 else "snare"), tb, 0.55 if b % 2 == 0 else 0.32)
        place(music, pluck(midi(root - 12), 0.4, 0.4), tb, 0.35)
        place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.22, 0.6), tb + beat / 2, 0.13)
    if bar % 2 == 1:
        for k, m in enumerate([ch[0] + 12, ch[1] + 12, ch[2] + 12]):
            place(music, brass([midi(m)], beat * 0.45), tt + 2 * beat + k * beat * 0.5, 0.07)
    bar += 1; tt += beat * 4
i0 = int((MUSIC_END - 0.08) * SR); music[i0:] *= np.linspace(1, 0, N - i0) ** 8
dn = int((DUR - MUSIC_END) * SR); td = np.arange(dn) / SR
drone = (np.sin(2 * np.pi * 55 * td) + 0.5 * np.sin(2 * np.pi * 82.4 * td) + 0.3 * np.sin(2 * np.pi * 110.3 * td)) * np.minimum(1, td / 1.2)
drone = lp_fast(drone.astype(np.float32), 600)
place(music, drone, MUSIC_END, 0.09)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def thunk(f0=90, d=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 14) + lp_fast(noise(d), 1200) * np.exp(-t * 30) * 0.5).astype(np.float32)
def rumble(d):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 160) * 3 * np.minimum(1, t / 0.15) * np.exp(-t / (d * 0.45))
    return s.astype(np.float32)
def scrape(d=0.8):
    n = int(d * SR); t = np.arange(n) / SR
    s = noise(d) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t)) * np.sin(np.pi * t / d)
    s = hp_fast(lp_fast(s, 5000), 1500)
    ring = np.sin(2 * np.pi * 1870 * t) * np.exp(-t * 3) * 0.2
    return (s * 0.6 + ring).astype(np.float32)
def ting():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2093, 4), (3136, 6), (4186, 8)]) * 0.3).astype(np.float32)
def sting():
    n = int(2.0 * SR); t = np.arange(n) / SR
    low = np.sin(2 * np.pi * 41 * t) * np.exp(-t * 1.5) * 1.2
    hit = lp_fast(noise(2.0), 900) * np.exp(-t * 6) * 0.8
    stab = brass([midi(45), midi(48), midi(51)], 1.4); s = low + hit; s[: len(stab)] += stab * 2.2 * np.exp(-np.arange(len(stab)) / SR * 2)
    return s.astype(np.float32)
def creak(d=0.6, f0=140):
    n = int(d * SR); t = np.arange(n) / SR
    rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d))
    ph = np.cumsum(rate) / SR; pulses = (np.mod(ph, 1) < 0.08).astype(np.float32)
    s = lp_fast(pulses * (0.6 + 0.4 * rng.random(n).astype(np.float32)), 2200) * np.sin(np.pi * t / d)
    return hp_fast(s, 200) * 2.5
def snap():
    d = 0.5; n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 800) * np.exp(-t * 18) * 1.4 + np.pad(thunk(120, 0.4), (0, n - int(0.4 * SR))) * 0.6).astype(np.float32)
def splash(d=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 4000) * (np.exp(-t * 4) * np.minimum(1, t / 0.01)) + lp_fast(noise(d), 400) * np.exp(-t * 7) * 1.5
    return s.astype(np.float32)
def whoosh(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 1500) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def water(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 900) * 0.5 + hp_fast(lp_fast(noise(d), 3000), 1200) * 0.15 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * t))).astype(np.float32)
def hubbub(d):
    n = int(d * SR)
    seg = int(0.11 * SR); gains = np.repeat(rng.uniform(0.25, 1.0, int(np.ceil(n / seg)) + 1), seg)[:n]
    s = lp_fast(noise(d), 750) * gains * (0.55 + 0.45 * np.sin(2 * np.pi * 0.6 * np.arange(n) / SR))
    s *= np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    return s.astype(np.float32)
def crackle(d):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 500) * 0.35 * np.minimum(1, t / 0.05)
    for _ in range(int(d * 26)):
        i = int(rng.uniform(0, d - 0.05) * SR); m = int(0.03 * SR)
        s[i:i + m] += hp_fast(noise(0.03), 1800) * np.exp(-np.arange(m) / SR * 90) * rng.uniform(0.3, 1.0)
    return s.astype(np.float32)
def pour(d):
    n = int(d * SR); t = np.arange(n) / SR
    gurgle = 0.6 + 0.4 * np.sin(2 * np.pi * 3.7 * t) * np.sin(2 * np.pi * 1.3 * t + 1)
    s = lp_fast(noise(d), 2600) * gurgle + hp_fast(lp_fast(noise(d), 4500), 2000) * 0.25
    s *= np.minimum(1, t / 0.06) * np.minimum(1, (d - t) / 0.15)
    return s.astype(np.float32)
def clank():
    n = int(0.7 * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(618, 9), (927, 12), (1466, 15), (2210, 20)]) * 0.5
    s += hp_fast(noise(0.7), 2500) * np.exp(-t * 40) * 0.5
    return s.astype(np.float32)
def gasp():
    n = int(0.4 * SR); t = np.arange(n) / SR
    s = hp_fast(lp_fast(noise(0.4), 2400), 700) * np.sin(np.pi * t / 0.4) ** 1.5
    return s.astype(np.float32)
def laugh(d=0.9):
    n = int(d * SR); s = np.zeros(n, np.float32)
    for k, t0 in enumerate([0.0, 0.19, 0.4]):
        m = int(0.13 * SR); t = np.arange(m) / SR
        f0 = 210 - k * 25
        burst = (np.sin(2 * np.pi * f0 * t) * 0.5 + lp_fast(noise(0.13), 1600) * 0.4) * np.sin(np.pi * t / 0.13)
        i = int(t0 * SR); s[i:i + m] += burst[: max(0, n - i)]
    return s

F = lambda f: f / 30
place(sfx, whoosh(0.7), F(20), 0.5)              # hook pull-back
place(sfx, hubbub(9.8), F(150), 0.30)            # Alexandria crowd bed (shots 2-3)
place(sfx, hubbub(3.8), F(407), 0.22)            # crowd under the oxen joke
place(sfx, creak(0.7, 110), F(330), 0.5)         # straining at the unbudging doors
place(sfx, creak(0.5, 150), F(352), 0.35)
place(sfx, creak(0.8, 90), F(440), 0.55)         # oxen rope strain
place(sfx, laugh(), F(432), 0.38)                # first laugher
place(sfx, laugh(), F(472), 0.3)                 # second laugher
place(sfx, ting(), F(560), 0.3)                  # the flame catches
place(sfx, crackle(2.0), F(556), 0.5)            # altar fire lit
place(sfx, crackle(6.5), F(585), 0.32)           # fire bed under doors/gasp
place(sfx, rumble(1.0), F(620), 0.4)             # hidden mechanism wakes
place(sfx, creak(1.1, 80), F(620), 0.8)          # doors creak open
place(sfx, whoosh(0.8), F(628), 0.5)             # the swing
place(sfx, thunk(70, 0.5), F(668), 0.9)          # doors land wide
place(sfx, gasp(), F(694), 0.7)                  # the gasp
place(sfx, ting(), F(706), 0.35)                 # divine shimmer
place(sfx, whoosh(0.4), F(826), 0.5)             # flash cut underground
place(sfx, water(9.5), F(831), 0.16)             # cave drips ambience
place(sfx, rumble(1.6), F(838), 0.35)            # earth mechanism rumble
place(sfx, crackle(2.4), F(845), 0.5)            # fire under the vessel
place(sfx, crackle(8.9), F(905), 0.28)           # fire bed through the mechanism
place(sfx, pour(2.2), F(918), 0.55)              # water pushes into the bucket
place(sfx, splash(0.8), F(922), 0.4)
place(sfx, pour(1.8), F(950), 0.4)
place(sfx, snap(), F(1008), 0.55)                # rope strain releases
place(sfx, clank(), F(1030), 0.9)                # bucket lands
place(sfx, thunk(100, 0.3), F(1030), 0.5)
place(sfx, creak(0.6, 130), F(1050), 0.7)        # first rope yank
place(sfx, snap(), F(1052), 0.3)
place(sfx, creak(0.55, 160), F(1085), 0.6)       # second yank
place(sfx, crackle(0.8), F(1128), 0.22)          # the dying fire sputters
place(sfx, creak(0.9, 85), F(1166), 0.7)         # doors creak shut
place(sfx, whoosh(0.6), F(1172), 0.4)
place(sfx, thunk(65, 0.55), F(1194), 1.0)        # SLAM
place(sfx, rumble(0.8), F(1194), 0.4)
place(sfx, sting(), F(1208), 0.9)                # twist sting
place(sfx, ting(), F(1250), 0.22)                # the drip forms
place(sfx, splash(0.5), F(1256), 0.5)            # ...and lands. just plumbing.

def write_stem(name, buf):
    peak = float(np.max(np.abs(buf))) or 1.0
    if peak > 0.95: buf = buf * (0.95 / peak)
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(name, f"{len(pcm) / SR:.2f}s peak {peak:.2f}")

write_stem("music.wav", music)
write_stem("sfx.wav", sfx)
