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
// Columns: date_iso | day | month_year | title | description_doc_url |
//          vimeo_embed_src | transcript_url
const RIDA_WEBINARS = [
  {
    id: 1,
    date: "March 31, 2026",
    title: "Stop Working Harder for Less: The Anti-PPO Growth System",
    category: "workshop",
    duration: "2 Hours",
    description: "A deep-dive session covering the Anti-PPO Growth System — the exact framework our top-performing practices use to attract fee-for-service patients, reduce insurance dependence, and grow revenue without working harder. Includes live Q&A.",
    description_doc_url: "https://docs.google.com/document/d/1MiJn87wJ_i3xpZFG-uZ1L-t6KYZgurxHG2IC3tWBEU4/edit?tab=t.3sffcyvnrlxe",
    vimeo_embed_src: "https://player.vimeo.com/video/1184000298?badge=0&autopause=0&player_id=0&app_id=58479",
    vimeo_full_embed: `<div style="padding:75% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1184000298?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="RIDA March 31st - Stop Working Harder for Less: The Anti-PPO Growth System"></iframe></div><script src="https://player.vimeo.com/api/player.js"><\/script>`,
    transcript_url: "https://drive.google.com/file/d/15skRzyh8LBvyW_w4njeMdp85rn13j_NN/view?usp=drive_link",
    gated: true
  }
  // Add new webinars here as rows are added to the Excel sheet
];

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
