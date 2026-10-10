// Poster math engine - photo print sizing arithmetic.
// Pure functions, no DOM. All borrowed norms are labeled in the UI, not buried here.
'use strict';

function round1(x) { return Math.round(x * 10) / 10; }

// --- Print sharpness ---------------------------------------------------------
// Effective DPI at a given print width: pixels divided by printed inches.
// Bands are labeled print-shop heuristics, not guarantees.
function sharpness(pxW, pxH, printWcm) {
  if (!(pxW > 0) || !(pxH > 0)) return { error: 'pixels must be positive' };
  if (!(printWcm > 0)) return { error: 'print width must be positive' };
  var dpi = Math.round(pxW / (printWcm / 2.54));
  var band = dpi >= 300 ? 'crisp up close'
    : dpi >= 150 ? 'fine at arm\'s length'
    : dpi >= 100 ? 'poster-viewing distance only'
    : 'visible pixels - print smaller or upscale';
  var maxW = round1(pxW / 300 * 2.54); // widest print that still hits 300 dpi
  return { dpi: dpi, band: band, maxCrispW: maxW };
}

// --- Crop check --------------------------------------------------------------
// Filling a print shape with an image shape: does anything get cropped?
// pct is the share of the image that falls outside the print shape.
function cropCheck(pxW, pxH, printWcm, printHcm) {
  if (!(pxW > 0) || !(pxH > 0)) return { error: 'pixels must be positive' };
  if (!(printWcm > 0) || !(printHcm > 0)) return { error: 'print size must be positive' };
  var rImg = pxW / pxH, rPrint = printWcm / printHcm;
  var pct;
  if (Math.abs(rImg - rPrint) < 1e-9) return { fit: 'exact fit - nothing cropped', pct: 0 };
  if (rImg > rPrint) {
    pct = round1(100 * (1 - rPrint / rImg));
    return { fit: 'wider than the print - crops ' + pct + '% off the sides', pct: pct };
  }
  pct = round1(100 * (1 - rImg / rPrint));
  return { fit: 'taller than the print - crops ' + pct + '% off the top and bottom', pct: pct };
}

// --- Mat window --------------------------------------------------------------
// A mat overlaps the print edge a little on every side. Window = print minus
// twice the overlap; outer = print plus twice the border. Labeled norm:
// 0.5 cm overlap is common shop practice.
function matWindow(printW, printH, overlap, border) {
  if (!(printW > 0) || !(printH > 0)) return { error: 'print size must be positive' };
  if (!(overlap > 0)) return { error: 'overlap must be positive' };
  if (!(border >= 0)) return { error: 'border must not be negative' };
  var winW = round1(printW - 2 * overlap), winH = round1(printH - 2 * overlap);
  if (!(winW > 0) || !(winH > 0)) return { error: 'overlap eats the whole print' };
  return { winW: winW, winH: winH, outerW: round1(printW + 2 * border), outerH: round1(printH + 2 * border) };
}

// --- Text rendering (shared by UI and tests) ---------------------------------
function renderSharp(r) {
  if (r.error) return r.error;
  return r.dpi + ' dpi at that size - ' + r.band + '. Widest crisp (300 dpi) print: ' + r.maxCrispW + ' cm.';
}
function renderCrop(r) {
  if (r.error) return r.error;
  return r.fit + '.';
}
function renderMat(r) {
  if (r.error) return r.error;
  return 'Cut the window ' + r.winW + ' x ' + r.winH + ' cm; mat outer ' + r.outerW + ' x ' + r.outerH + ' cm.';
}

var api = {
  round1: round1,
  sharpness: sharpness,
  cropCheck: cropCheck,
  matWindow: matWindow,
  renderSharp: renderSharp,
  renderCrop: renderCrop,
  renderMat: renderMat
};
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.PosterMath = api;
