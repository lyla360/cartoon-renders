"""Synthesized music bed + SFX for the Yamaguchi short (sombre, restrained).
Writes stems only (music.wav, sfx.wav); mix.py does the level-locked mix."""
import numpy as np, subprocess, wave

SR = 48000
DUR = 1801 / 30
N = int(DUR * SR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy()
    out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def env(n, a=0.005, r=0.2, sus=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
    return e

def lp(x, k):  # one-pole low-pass, k in (0,1)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += k * (x[i] - acc); y[i] = acc
    return y

def lp_fast(x, cutoff):
    # FFT brick-ish low-pass (fast, fine for beds)
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

# Solemn bed: slow minor pads + sparse low plucks, NO drums.
# Am - F - Dm - E until the payoff (f1361 = 45.37 s), then warmer Am - F - C - G.
PAYOFF = 1361 / 30
progA = [(57, [57, 60, 64]), (53, [53, 57, 60]), (50, [50, 53, 57]), (52, [52, 56, 59])]
progB = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]
BAR = 4.0
bar = 0; tt = 0.0
while tt < DUR - 0.5:
    prog = progA if tt < PAYOFF else progB
    root, ch = prog[bar % 4]
    place(music, brass([midi(m) for m in ch], BAR * 0.98), tt, 0.055)
    place(music, pluck(midi(root - 12), 1.1, 0.25), tt, 0.16)
    place(music, pluck(midi(ch[bar % 3]), 0.9, 0.3), tt + BAR * 0.5, 0.07)
    bar += 1; tt += BAR
# gentle fade-out over the last 2.5 s
i0 = int((DUR - 2.5) * SR); music[i0:] *= np.linspace(1, 0, N - i0) ** 2
# low tension drone under both aftermath passages, barely there
for t0, d in [(357 / 30, 10.0), (1221 / 30, 4.6)]:
    dn = int(d * SR); td = np.arange(dn) / SR
    dr = (np.sin(2 * np.pi * 55 * td) + 0.5 * np.sin(2 * np.pi * 82.4 * td)) * np.minimum(1, td / 1.5) * np.minimum(1, (d - td) / 1.5)
    place(music, lp_fast(dr.astype(np.float32), 500), t0, 0.05)

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
def crash(d=1.2):
    n = int(d * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for k in range(14):
        tk = rng.uniform(0, d * 0.6); i = int(tk * SR); g = thunk(rng.uniform(60, 160), 0.35) * rng.uniform(0.3, 0.9)
        s[i:i + len(g)] += g[: n - i]
    s += lp_fast(noise(d), 2500) * np.exp(-t * 3) * 0.25
    return s
def cuckoo():
    out = []
    for f, d in [(740, 0.16), (587, 0.24)]:
        n = int(d * SR); t = np.arange(n) / SR
        out.append(np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.01) * np.exp(-t * 6)); out.append(np.zeros(int(0.06 * SR)))
    return np.concatenate(out).astype(np.float32)
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
def snore(d=1.1):
    n = int(d * SR); t = np.arange(n) / SR
    buzz = (np.mod(np.cumsum(60 + 25 * np.sin(np.pi * t / d)) / SR, 1) < 0.3).astype(np.float32)
    return (lp_fast(buzz * 0.5 + noise(d) * 0.15, 700) * np.sin(np.pi * t / d) ** 2).astype(np.float32)
def leaves(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 6000), 2500) * (0.3 + 0.3 * np.sin(2 * np.pi * 0.7 * t) ** 2) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)).astype(np.float32)
def water(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 900) * 0.5 + hp_fast(lp_fast(noise(d), 3000), 1200) * 0.15 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * t))).astype(np.float32)

F = lambda f: f / 30
def wind(d, seed_t=0.11):
    w = lp_fast(noise(d), 320); t = np.arange(len(w)) / SR
    w *= (0.4 + 0.3 * np.sin(2 * np.pi * seed_t * t)) * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5)
    return w.astype(np.float32)

# --- sparse SFX only: two flashes, ash wind, faint office room tone ---
place(sfx, rumble(3.0), F(312), 0.8)           # flash 1 build (ramps f316-330)
place(sfx, thunk(55, 0.8), F(318), 0.9)        # deep boom on "explodes"
place(sfx, wind(9.0), F(362), 0.5)             # ash wind, aftermath 1
place(sfx, creak(0.7, 110), F(852), 0.28)      # office: faint floor creak
place(sfx, creak(0.6, 150), F(985), 0.22)      # office: quieter still
place(sfx, rumble(3.2), F(1104), 0.85)         # flash 2 build (ramps f1108-1124)
place(sfx, thunk(50, 0.9), F(1110), 0.95)      # second boom
place(sfx, wind(6.0), F(1226), 0.45)           # ash wind, aftermath 2
place(sfx, thunk(60, 0.5), F(1336), 0.35)      # single soft hit on "Twice."
place(sfx, whoosh(1.4), F(1358), 0.13)         # breath into the golden payoff

def write_stem(name, buf):
    peak = float(np.max(np.abs(buf))) or 1.0
    if peak > 0.95: buf = buf * (0.95 / peak)
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(name, f"{len(pcm) / SR:.2f}s peak {peak:.2f}")

write_stem("music.wav", music)
write_stem("sfx.wav", sfx)
