# Poster math oracle - mirrors engine.js float ops exactly (math.floor(x+0.5) == JS Math.round for positive magnitudes).
import json, math

def round1(x):
    return math.floor(x * 10 + 0.5) / 10

def sharpness(pxW, pxH, printWcm):
    if not (pxW > 0 and pxH > 0): return {"error": "pixels must be positive"}
    if not (printWcm > 0): return {"error": "print width must be positive"}
    dpi = math.floor(pxW / (printWcm / 2.54) + 0.5)
    if dpi >= 300: band = "crisp up close"
    elif dpi >= 150: band = "fine at arm's length"
    elif dpi >= 100: band = "poster-viewing distance only"
    else: band = "visible pixels - print smaller or upscale"
    maxW = round1(pxW / 300 * 2.54)
    return {"dpi": dpi, "band": band, "maxCrispW": maxW}

def crop_check(pxW, pxH, printWcm, printHcm):
    if not (pxW > 0 and pxH > 0): return {"error": "pixels must be positive"}
    if not (printWcm > 0 and printHcm > 0): return {"error": "print size must be positive"}
    rImg = pxW / pxH; rPrint = printWcm / printHcm
    if abs(rImg - rPrint) < 1e-9:
        return {"fit": "exact fit - nothing cropped", "pct": 0}
    if rImg > rPrint:
        pct = round1(100 * (1 - rPrint / rImg))
        return {"fit": "wider than the print - crops %g%% off the sides" % pct, "pct": pct}
    pct = round1(100 * (1 - rImg / rPrint))
    return {"fit": "taller than the print - crops %g%% off the top and bottom" % pct, "pct": pct}

def mat_window(printW, printH, overlap, border):
    if not (printW > 0 and printH > 0): return {"error": "print size must be positive"}
    if not (overlap > 0): return {"error": "overlap must be positive"}
    if not (border >= 0): return {"error": "border must not be negative"}
    winW = round1(printW - 2 * overlap); winH = round1(printH - 2 * overlap)
    if not (winW > 0 and winH > 0): return {"error": "overlap eats the whole print"}
    return {"winW": winW, "winH": winH, "outerW": round1(printW + 2 * border), "outerH": round1(printH + 2 * border)}

cases = []
def sh(*a): cases.append({"tool": "sharp", "args": list(a), "expect": sharpness(*a)})
def cr(*a): cases.append({"tool": "crop", "args": list(a), "expect": crop_check(*a)})
def ma(*a): cases.append({"tool": "mat", "args": list(a), "expect": mat_window(*a)})

# sharpness: happy
sh(6000, 4000, 60)      # 254 dpi fine
sh(6000, 4000, 50)      # 304.8 -> 305 crisp (round check)
sh(6000, 4000, 50.8)    # exactly 300 boundary
sh(6000, 4000, 51)      # 298.8 -> 299 fine
sh(3000, 2000, 76.2)    # 100 dpi boundary poster-only
sh(3000, 2000, 76.5)    # 99.6 -> 100? 3000/(76.5/2.54)=99.6 -> round 100 poster-only? floor(99.6+0.5)=100 -> poster-only band still
sh(2400, 1600, 61)      # 100 -> poster
sh(1200, 800, 60)       # 50.8 -> visible pixels
sh(8000, 6000, 40)      # 508 crisp
sh(4500, 3000, 45.72)   # exactly 250
sh(5184, 3456, 91.4)    # decimals -> 144 fine
# sharpness: errors
sh(0, 4000, 60)
sh(-6000, 4000, 60)
sh(6000, 0, 60)
sh(6000, 4000, 0)
sh(6000, 4000, -10)

# crop: happy
cr(6000, 4000, 60, 40)  # exact
cr(4000, 6000, 60, 40)  # taller, 55.6
cr(6000, 4000, 60, 45)  # wider, 11.1
cr(4000, 3000, 40, 40)  # wider square print: r 1.333 vs 1 -> crops 25% sides
cr(3000, 3000, 40, 20)  # taller: 50%
cr(5000, 4000, 50, 40)  # exact (1.25 vs 1.25)
cr(1920, 1080, 40, 22.5) # exact 16:9
cr(1920, 1080, 30, 30)  # wider: 43.7
cr(2000, 1000, 10, 8)   # wider: r2 vs 1.25 -> 37.5
cr(1000, 2000, 8, 10)   # taller: 0.5 vs 0.8 -> 37.5
# crop: errors
cr(0, 4000, 60, 40)
cr(6000, -1, 60, 40)
cr(6000, 4000, 0, 40)
cr(6000, 4000, 60, -5)

# mat: happy
ma(60, 40, 0.5, 5)      # defaults
ma(30, 20, 0.5, 0)      # no border
ma(50, 70, 0.4, 7.5)    # decimals
ma(21, 29.7, 0.5, 3)    # A4-ish
ma(91.4, 61, 0.6, 10)
ma(40, 40, 0.25, 4)
ma(10, 8, 0.5, 2)
# mat: errors
ma(0, 40, 0.5, 5)
ma(60, -40, 0.5, 5)
ma(60, 40, 0, 5)
ma(60, 40, -0.5, 5)
ma(60, 40, 0.5, -1)
ma(1, 1, 0.6, 5)        # overlap eats print
ma(0.9, 2, 0.5, 1)      # eats width

with open("expected.json", "w") as f:
    json.dump(cases, f, indent=1)
print(len(cases), "cases written")
