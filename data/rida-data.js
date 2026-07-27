/**
 * RIDA Website Data
 * Source: RIDA Website Data.xlsx
 *
 * HOW TO UPDATE:
 * Option A (Manual): Edit the arrays below whenever the Excel sheet changes.
 * Option B (Auto / Google Sheets): Publish each sheet tab as CSV via
 *   File → Share → Publish to web → CSV, then replace the fetch URLs in
 *   data-loader.js with the published CSV links. The website will pull
 *   live data on every page load without touching this file.
 */

// ─── WEBINAR REPLAYS ────────────────────────────────────────────────────────
// Webinars now live in the Google Sheet (`webinars` tab) and are loaded by
// data/sheets.js. This array is intentionally empty, kept as a back-compat
// shim for any code that still references window.RIDA_WEBINARS at startup.
// To add a webinar, edit the `webinars` (or `summits`) sheet tab. Multi-clip
// replays use the `webinar_url` cell with one clip per line:
//   Clip 01 - Opening Remarks - https://player.vimeo.com/video/123
//   Clip 02 - Keynote - https://player.vimeo.com/video/456
const RIDA_WEBINARS = [];

// ─── UPCOMING EVENTS ─────────────────────────────────────────────────────────
// Events now live in the Google Sheet (`events` tab) and are loaded by
// data/sheets.js → ridaLoadEventsGrid() / ridaLoadEventPopup().
// This array is intentionally empty, kept as a back-compat shim for any
// code that still references window.RIDA_EVENTS.
const RIDA_EVENTS = [];
const RIDA_POPUP_EVENT = null;
