import numpy as np
from PIL import Image, ImageFilter
_cache = {}
def gain_map(h, w):
    k = (h, w)
    if k in _cache: return _cache[k]
    fy = np.abs(np.arange(h) - h // 2)[:, None].astype(np.float32); fx = np.abs(np.arange(w) - w // 2)[None, :].astype(np.float32)
    def band(v, lo, hi, soft): return np.clip((v - (lo - soft)) / soft, 0, 1) * np.clip(((hi + soft) - v) / soft, 0, 1)
    A = band(fy, 160, 262, 12) * np.clip((30 - fx) / 10, 0, 1)            # horizontal scan-lines
    B = band(fx, 100, 190, 10) * np.clip((24 - fy) / 8, 0, 1)             # vertical pixel columns
    Cc = band(fy, 172, 252, 10) * band(fx, 108, 182, 8)                    # grid cross terms
    g = 1 - np.clip(A + B + Cc, 0, 1) * 0.97
    _cache[k] = g.astype(np.float32); return _cache[k]
def descreen_rgb(a):
    h, w = a.shape[:2]; g = gain_map(h, w); out = np.empty_like(a)
    for i in range(3):
        F = np.fft.fftshift(np.fft.fft2(a[..., i])); out[..., i] = np.fft.ifft2(np.fft.ifftshift(F * g)).real
    return out
