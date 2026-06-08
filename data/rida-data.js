/**
 * RIDA Website Data
 * Source: RIDA — Website Data.xlsx
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
// data/sheets.js. This array is intentionally empty — kept as a back-compat
// shim for any code that still references window.RIDA_WEBINARS at startup.
// To add a webinar, edit the `webinars` (or `summits`) sheet tab. Multi-clip
// replays use the `webinar_url` cell with one clip per line:
//   Clip 01 - Opening Remarks - https://player.vimeo.com/video/123
//   Clip 02 - Keynote - https://player.vimeo.com/video/456
const RIDA_WEBINARS = [];

// ─── UPCOMING EVENTS ─────────────────────────────────────────────────────────
// Columns: date_iso | day | month_year | time | title | description |
//          register_url | panelists | popup_banner
const RIDA_EVENTS = [
  {
    id: 1,
    date_iso: "2026-05-27",
    day: "27",
    month_year: "May 2026",
    time: "7:00 PM – 9:00 PM EST",
    title: "The Modern Dental Practice: Clinical Excellence Meets Scalable Growth",
    description: "Business panel — Learn how to scale your practice efficiently, optimize workflows, and lead your team to consistently deliver an exceptional patient experience.\nMarketing segment — Ekwa shows how to position your practice, attract the right patients, and convert leads into loyal clients using multi-channel marketing strategies.\nClinical + Insurance panel — Discover how to improve case acceptance, communicate treatment value effectively, and manage insurance to maximize revenue while keeping patients satisfied.",
    register_url: "https://us02web.zoom.us/webinar/register/WN_cJHLbt1yQ7Gdq7b98nxNsA",
    panelists: ["Naren Arulrajah", "Josey Sewell", "Aimee Vail", "Callie Ward", "Kelly Fox-Galvagn", "Dee Fischer", "Dr. Tina Sawi"],
    popup_banner: true
  }
  // Add new events here as rows are added to the Excel sheet
];

// ─── POPUP BANNER CONFIG ─────────────────────────────────────────────────────
// The latest event with popup_banner: true will be displayed as the banner
const RIDA_POPUP_EVENT = RIDA_EVENTS.find(e => e.popup_banner) || null;
