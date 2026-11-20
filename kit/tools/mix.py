#!/usr/bin/env python3
"""Level-locked mix for cartoon shorts:  python3 mix.py voice.mp3 music.wav sfx.wav

Writes mix_raw.wav (float32, voice sample rate) in the current directory.
finish.sh then applies the single loudness gain + limiter; this script does
NO ducking/compression -- just two linear gains, per the skill's audio rule:

  music gated RMS  -> exactly 50% of the voice gated RMS  (-6.02 dB)
  sfx   gated RMS  -> 50% of the voice gated RMS, then peak-capped so the
                      loudest sfx sample never exceeds 0.7x the voice peak.
  voice            -> summed in completely unchanged.

Gated RMS method (documented, deliberately simple): the signal is cut into
non-overlapping 2048-sample frames; a frame is "active" when its own RMS is
above -45 dBFS. The gated RMS is the RMS over the samples of active frames
only, so pauses/silence don't drag the measured level down. If no frame
passes the gate (near-silent file), the plain overall RMS is used instead.

Inputs are decoded/resampled with ffmpeg (so .mp3 voice works); measurement
is done on the mono mixdown, the mix itself keeps the voice's channel count.
"""
import subprocess, sys, tempfile, os
import numpy as np
from scipy.io import wavfile

GATE_DBFS = -45.0
FRAME = 2048
TARGET = 0.5          # music & sfx sit at 50% of the voice level
SFX_PEAK_CAP = 0.7    # sfx peak <= 0.7 x voice peak


def decode(path, sr, tmp):
    """ffmpeg-decode any audio file to a float wav at sample rate sr."""
    out = os.path.join(tmp, os.path.basename(path) + ".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path,
                    "-ar", str(sr), "-ac", "2", "-c:a", "pcm_f32le", out],
                   check=True)
    _, data = wavfile.read(out)
    return np.asarray(data, dtype=np.float64)


def probe_sr(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0",
                        "-show_entries", "stream=sample_rate",
                        "-of", "csv=p=0", path],
                       capture_output=True, text=True, check=True)
    return int(r.stdout.strip())


def gated_rms(x):
    """Energy-gated RMS of a mono float signal (see module docstring)."""
    n = (len(x) // FRAME) * FRAME
    if n == 0:
        return float(np.sqrt(np.mean(x ** 2))) if len(x) else 0.0
    frames = x[:n].reshape(-1, FRAME)
    frms = np.sqrt(np.mean(frames ** 2, axis=1))
    active = frms > 10 ** (GATE_DBFS / 20.0)
    if not active.any():
        return float(np.sqrt(np.mean(x ** 2)))
    sel = frames[active]
    return float(np.sqrt(np.mean(sel ** 2)))


def db(x):
    return 20.0 * np.log10(x) if x > 0 else -np.inf


def main():
    if len(sys.argv) != 4:
        sys.exit("usage: python3 mix.py <voice> <music> <sfx>")
    voice_p, music_p, sfx_p = sys.argv[1:4]
    sr = probe_sr(voice_p)
    with tempfile.TemporaryDirectory() as tmp:
        voice = decode(voice_p, sr, tmp)
        music = decode(music_p, sr, tmp)
        sfx = decode(sfx_p, sr, tmp)

    v_rms = gated_rms(voice.mean(axis=1))
    v_peak = float(np.max(np.abs(voice)))
    print(f"voice : gated RMS {db(v_rms):6.2f} dBFS, peak {db(v_peak):6.2f} dBFS")

    def scale_to(stem, name):
        r = gated_rms(stem.mean(axis=1))
        g = (TARGET * v_rms / r) if r > 0 else 0.0
        print(f"{name:6s}: gated RMS {db(r):6.2f} dBFS -> gain {db(g):+6.2f} dB"
              f" -> {db(gated_rms((stem * g).mean(axis=1))):6.2f} dBFS"
              f" ({db(gated_rms((stem * g).mean(axis=1)) / v_rms):+.2f} dB vs voice)")
        return stem * g

    music = scale_to(music, "music")
    sfx = scale_to(sfx, "sfx")
    s_peak = float(np.max(np.abs(sfx))) if sfx.size else 0.0
    if s_peak > SFX_PEAK_CAP * v_peak > 0:
        sfx *= (SFX_PEAK_CAP * v_peak) / s_peak
        print(f"sfx   : peak capped at 0.7x voice peak "
              f"({db(float(np.max(np.abs(sfx)))):.2f} dBFS)")

    n = max(len(voice), len(music), len(sfx))
    mix = np.zeros((n, 2))
    for stem in (voice, music, sfx):
        mix[:len(stem)] += stem
    wavfile.write("mix_raw.wav", sr, mix.astype(np.float32))
    print(f"mix_raw.wav written: {n / sr:.2f} s @ {sr} Hz, "
          f"peak {db(float(np.max(np.abs(mix)))):.2f} dBFS")


if __name__ == "__main__":
    main()
