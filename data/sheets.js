// RIDA Academy - Google Sheets Dynamic Data Loader
// Tabs:
//   events   - date_iso, day, month_year, time, title, description, register_url, Panelists, image_urls, popup_banner
//   webinars - date, title, category, duration, description, description_doc_url, vimeo_embed_src, vimeo_full_embed, transcript_url, gated
//   podcast  - episode, title, guest_name, description, audio_source, spotify_url, apple_url, youtube_url, date, transcript_url, contact_info, guest_photo_url

const RIDA_SHEET_ID = '1FOeB6lyOCKzj4u9caLPxModWYrpCILE0h4-7O_0yR4s';

// ── Apps Script proxy for Drive files (VTT transcripts, Google Docs) ──────────
// After deploying data/proxy.gs as a Google Apps Script Web App, paste the URL below.
// Leave empty to skip (transcript tab will show setup instructions instead).
// Example: 'https://script.google.com/macros/s/AKfy...xyz/exec'
const RIDA_APPS_SCRIPT_PROXY = 'https://script.google.com/macros/s/AKfycbwWT5_D6fRC74i6xXRsyOnAsE0l4rkg8K11Oe5So7Pr2UqRxLEQkxHJduKzYtYvmSRggw/exec';

// Public CORS proxy — wraps any URL and adds Access-Control-Allow-Origin: *
// corsproxy.io is used as primary; add a second constant for chain fallback
const RIDA_TEXT_PROXY = 'https://corsproxy.io/?url={url}';
const RIDA_TEXT_PROXY_2 = 'https://api.allorigins.win/raw?url={url}';
window.RIDA_SHEETS_ACTIVE = true;

const RIDA_SUPPLEMENTAL_WEBINARS = [
  {
    id: 'summit-2025-full-replay',
    date: '2025',
    title: 'RIDA Annual Summit 2025 - Full Replay',
    category: 'summit',
    duration: '11 Clips',
    description: 'Watch the full RIDA Annual Summit 2025 replay in a clean, session-by-session format. Every segment is organized in presentation order so you can move from opening remarks through keynote sessions, guest segments, expert panels, and closing remarks without losing the flow of the event.\n\nKey Takeaways\nFollow the summit in the same sequence attendees experienced it live\nJump directly to keynote sessions, guest presentations, and panel discussions\nReview the clinical and business conversations in an ordered, easy-to-navigate replay timeline',
    presenter: 'RID Academy speakers and guest experts',
    vimeo_embed_src: 'https://player.vimeo.com/video/1131555189?badge=0&autopause=0&player_id=0&app_id=58479',
    clips: [
      {
        title: 'Opening Remarks',
        label: 'Clip 01',
        type: 'Opening',
        speaker: 'RID Academy',
        summary: 'The welcome segment that opens the summit and sets the direction for the sessions that follow.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131555189?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Naren Arulrajah Keynote',
        label: 'Clip 02',
        type: 'Keynote',
        speaker: 'Naren Arulrajah',
        summary: 'Naren Arulrajah\'s keynote session and strategic framing for the summit.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131555209?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Jordan Comstock Segment',
        label: 'Clip 03',
        type: 'Featured Session',
        speaker: 'Jordan Comstock',
        summary: 'Jordan Comstock\'s featured summit segment.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131555746?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Gary Takacs Introduction',
        label: 'Clip 04',
        type: 'Introduction',
        speaker: 'RID Academy',
        summary: 'A short introduction leading into Gary Takacs\'s featured session.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131555805?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Gary Takacs Segment',
        label: 'Clip 05',
        type: 'Featured Session',
        speaker: 'Gary Takacs',
        summary: 'Gary Takacs\'s main summit presentation.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131555824?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Gary Segment Close by Naren',
        label: 'Clip 06',
        type: 'Transition',
        speaker: 'Naren Arulrajah',
        summary: 'Closing remarks and transition after Gary Takacs\'s session.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131555925?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Clinical Panel Segment',
        label: 'Clip 07',
        type: 'Clinical Panel',
        speaker: 'Panel Discussion',
        summary: 'The clinical panel conversation from the summit replay.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131555944?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Business Panel Introduction',
        label: 'Clip 08',
        type: 'Introduction',
        speaker: 'RID Academy',
        summary: 'A brief lead-in to the business panel session.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131556164?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Business Panel Segment',
        label: 'Clip 09',
        type: 'Business Panel',
        speaker: 'Panel Discussion',
        summary: 'The full business panel conversation from the summit.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131556170?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Sarah Beth Herman Introduction',
        label: 'Clip 10',
        type: 'Introduction',
        speaker: 'RID Academy',
        summary: 'A short introduction to Sarah Beth Herman\'s closing feature.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131556841?badge=0&autopause=0&player_id=0&app_id=58479'
      },
      {
        title: 'Sarah Beth Herman TED Talk and Closing Remarks',
        label: 'Clip 11',
        type: 'Closing Session',
        speaker: 'Sarah Beth Herman',
        summary: 'Sarah Beth Herman\'s featured talk followed by the summit close.',
        vimeo_embed_src: 'https://player.vimeo.com/video/1131556867?badge=0&autopause=0&player_id=0&app_id=58479'
      }
    ]
  }
];
window.RIDA_SUPPLEMENTAL_WEBINARS = RIDA_SUPPLEMENTAL_WEBINARS;

function ridaPopupDismissKey() {
  const path = (window.location && window.location.pathname) ? window.location.pathname : 'global';
  return `rida_popup_dismissed:${path}`;
}

async function ridaFetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${RIDA_SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  const text = await res.text();
  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1];
  const json = JSON.parse(jsonStr);
  const cols = json.table.cols.map(c => c.label.trim());
  return json.table.rows
    .filter(row => row.c && row.c.some(cell => cell && cell.v !== null && cell.v !== ''))
    .map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[cols[i]] = cell && cell.v !== null ? String(cell.v).trim() : '';
      });
      return obj;
    });
}

function ridaParseDate(str) {
  if (!str) return null;
  const m = String(str).match(/^Date\((\d+),(\d+),(\d+)\)/);
  if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10));
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ridaPodcastEpisodeNumber(row) {
  const raw = row && row.episode ? String(row.episode).trim() : '';
  const match = raw.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function ridaSortPodcastEpisodes(rows) {
  return (rows || []).slice().sort((a, b) => {
    const epA = ridaPodcastEpisodeNumber(a);
    const epB = ridaPodcastEpisodeNumber(b);
    if (epA !== null && epB !== null && epA !== epB) return epA - epB;

    const dateA = ridaParseDate(a && a.date);
    const dateB = ridaParseDate(b && b.date);
    if (dateA && dateB && dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }

    return String(a && a.title || '').localeCompare(String(b && b.title || ''));
  });
}

function ridaDriveId(url) {
  if (!url) return '';
  const value = String(url).trim();
  let m = value.match(/\/d\/([\w-]{20,})/);
  if (m) return m[1];
  m = value.match(/[?&]id=([\w-]{20,})/);
  if (m) return m[1];
  if (/^[\w-]{20,}$/.test(value)) return value;
  return '';
}

function ridaDriveImg(url, size = 'w900') {
  if (!url) return '';
  const value = String(url).trim();
  if (!value.includes('drive.google.com') && !value.includes('googleusercontent.com') && !/^[\w-]{20,}$/.test(value)) {
    return value;
  }
  const id = ridaDriveId(value);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=${size}` : value;
}

// Parse "Name : drive_url" lines (one per line) into [{name, photo}] for event speaker rows
function ridaParseEventSpeakers(str) {
  if (!str) return [];
  return String(str).split(/\r?\n/).map(line => {
    const sep = line.indexOf(' : ');
    if (sep === -1) return null;
    const name  = line.substring(0, sep).trim();
    const url   = line.substring(sep + 3).trim();
    const photo = url ? (ridaDriveImg(url, 'w200') || url) : '';
    return name ? { name, photo } : null;
  }).filter(Boolean);
}

function ridaEventSpeakerObjectPosition(name) {
  if (/callie ward/i.test(name || '')) return 'center 18%';
  return 'center';
}

// Parse comma-or-newline-separated Drive image URLs → displayable thumbnail URLs
function ridaParseImageUrls(str) {
  if (!str) return [];
  return String(str).split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => ridaDriveImg(s, 'w400'))
    .filter(Boolean);
}

// Convert any Google Drive sharing/view URL to a format usable in <img src>
// Non-Drive URLs are returned unchanged
function ridaNormalizeDriveUrl(url) {
  if (!url) return '';
  const v = String(url).trim();
  if (!v.includes('drive.google.com') && !v.includes('googleusercontent.com')) return v;
  const id = ridaDriveId(v);
  if (!id) return v;
  // Default: return preview URL (works for audio embeds, docs, etc.)
  return `https://drive.google.com/file/d/${id}/preview`;
}

function ridaDriveAudio(url) {
  if (!url) return '';
  const value = String(url).trim();
  if (!value.includes('drive.google.com') && !value.includes('googleusercontent.com') && !/^[\w-]{20,}$/.test(value)) {
    return value;
  }
  const id = ridaDriveId(value);
  return id ? `https://drive.google.com/file/d/${id}/preview` : value;
}

function ridaExtractIframeSrc(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return match ? ridaDecodeHtml(match[1]) : '';
}

function ridaPodcastAudioSrc(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const iframeSrc = ridaExtractIframeSrc(raw);
  if (iframeSrc) return iframeSrc;
  return ridaDriveAudio(raw);
}

function ridaIsLibsynAudio(value) {
  return /libsyn\.com/i.test(String(value || ''));
}

function ridaIsDirectAudioFile(value) {
  const text = String(value || '').trim().toLowerCase();
  return /\.(mp3|m4a|wav|ogg)(\?|$)/.test(text);
}

function ridaFormatPlayerTime(seconds) {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function ridaInitAudioPlayers(scope) {
  const root = scope || document;
  root.querySelectorAll('.rida-pc-native').forEach(player => {
    if (player.dataset.bound === '1') return;
    player.dataset.bound = '1';

    const audio   = player.querySelector('audio');
    const playBtn = player.querySelector('.rida-pc-play');
    const backBtn = player.querySelector('.rida-pc-back');
    const fwdBtn  = player.querySelector('.rida-pc-fwd');
    const speedBtn= player.querySelector('.rida-pc-speed');
    const track   = player.querySelector('.rida-pc-track');
    const fill    = player.querySelector('.rida-pc-fill');
    const thumb   = player.querySelector('.rida-pc-thumb');
    const curEl   = player.querySelector('.rida-pc-cur');
    const durEl   = player.querySelector('.rida-pc-dur');
    if (!audio || !playBtn) return;

    const PLAY_SVG  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    const PAUSE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    let speedIdx = 0;

    const fmt = t => {
      const s = Math.max(0, Math.floor(Number.isFinite(t) ? t : 0));
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };

    const sync = () => {
      const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
      const cur = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      const pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
      if (fill)  fill.style.width = `${pct}%`;
      if (thumb) thumb.style.left = `${pct}%`;
      if (curEl) curEl.textContent = fmt(cur);
      if (durEl) durEl.textContent = dur ? fmt(dur) : '--:--';
      playBtn.innerHTML = audio.paused ? PLAY_SVG : PAUSE_SVG;
      playBtn.classList.toggle('is-playing', !audio.paused);
    };

    playBtn.addEventListener('click', async () => {
      try {
        if (audio.paused) {
          document.querySelectorAll('.rida-pc-native audio').forEach(a => { if (a !== audio) a.pause(); });
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (_) {}
      sync();
    });

    if (backBtn) backBtn.addEventListener('click', () => {
      if (Number.isFinite(audio.duration)) audio.currentTime = Math.max(0, audio.currentTime - 15);
      sync();
    });
    if (fwdBtn) fwdBtn.addEventListener('click', () => {
      if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
      sync();
    });
    if (speedBtn) speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      audio.playbackRate = speeds[speedIdx];
      speedBtn.textContent = `${speeds[speedIdx]}×`;
    });
    if (track) track.addEventListener('click', e => {
      const rect = track.getBoundingClientRect();
      const ratio = rect.width ? (e.clientX - rect.left) / rect.width : 0;
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.max(0, Math.min(audio.duration, ratio * audio.duration));
      }
      sync();
    });

    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('loadedmetadata', sync);
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('ended', sync);
    sync();
  });

  // ── Mini players (.rida-mini-native) ──────────────────────────────────
  root.querySelectorAll('.rida-mini-native').forEach(player => {
    if (player.dataset.bound === '1') return;
    player.dataset.bound = '1';

    const audio    = player.querySelector('audio');
    const playBtn  = player.querySelector('.rida-mini-play');
    const track    = player.querySelector('.rida-mini-track');
    const fill     = player.querySelector('.rida-mini-fill');
    const curEl    = player.querySelector('.rida-mini-cur');
    const durEl    = player.querySelector('.rida-mini-dur');
    if (!audio || !playBtn) return;

    const PLAY_SVG  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    const PAUSE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

    const fmt = t => {
      const s = Math.max(0, Math.floor(Number.isFinite(t) ? t : 0));
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };

    const sync = () => {
      const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
      const cur = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      const pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
      if (fill)  fill.style.width = `${pct}%`;
      if (curEl) curEl.textContent = fmt(cur);
      if (durEl) durEl.textContent = dur ? fmt(dur) : '--:--';
      playBtn.innerHTML = audio.paused ? PLAY_SVG : PAUSE_SVG;
      playBtn.classList.toggle('is-playing', !audio.paused);
    };

    playBtn.addEventListener('click', async () => {
      try {
        if (audio.paused) {
          // Pause any other mini or full players
          document.querySelectorAll('.rida-mini-native audio, .rida-pc-native audio').forEach(a => {
            if (a !== audio) a.pause();
          });
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (_) {}
      sync();
    });

    if (track) track.addEventListener('click', e => {
      const rect = track.getBoundingClientRect();
      const ratio = rect.width ? (e.clientX - rect.left) / rect.width : 0;
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.max(0, Math.min(audio.duration, ratio * audio.duration));
      }
      sync();
    });

    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('loadedmetadata', sync);
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('ended', sync);
    sync();
  });

  root.querySelectorAll('.audio-player-mock').forEach(player => {
    if (player.dataset.bound === '1') return;
    player.dataset.bound = '1';

    const audio = player.querySelector('audio');
    const playBtn = player.querySelector('.player-button');
    const bar = player.querySelector('.progress-bar');
    const fill = player.querySelector('.progress-fill');
    const curEl = player.querySelector('.player-cur');
    const durEl = player.querySelector('.player-dur');
    if (!audio || !playBtn) return;

    const PLAY_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    const PAUSE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    const fmt = t => {
      const s = Math.max(0, Math.floor(Number.isFinite(t) ? t : 0));
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };

    const sync = () => {
      const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
      const cur = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      const pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
      if (fill) fill.style.width = `${pct}%`;
      if (curEl) curEl.textContent = fmt(cur);
      if (durEl) durEl.textContent = dur ? fmt(dur) : '--:--';
      playBtn.innerHTML = audio.paused ? PLAY_SVG : PAUSE_SVG;
    };

    playBtn.addEventListener('click', async () => {
      try {
        if (audio.paused) {
          document.querySelectorAll('.audio-player-mock audio, .rida-mini-native audio, .rida-pc-native audio').forEach(a => {
            if (a !== audio) a.pause();
          });
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (_) {}
      sync();
    });

    if (bar) bar.addEventListener('click', e => {
      const rect = bar.getBoundingClientRect();
      const ratio = rect.width ? (e.clientX - rect.left) / rect.width : 0;
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.max(0, Math.min(audio.duration, ratio * audio.duration));
      }
      sync();
    });

    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('loadedmetadata', sync);
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('ended', sync);
    sync();
  });
}

function ridaPodcastAudioMarkup(ep) {
  // Accept either a full episode object or a plain URL string (backwards compat)
  const isObj = ep && typeof ep === 'object';
  const audioSource = isObj ? (ep.audio_source || '') : String(ep || '');
  const src = ridaPodcastAudioSrc(audioSource);
  if (!src) return '';

  const title    = ridaEscapeHtml(isObj && ep.title      ? ep.title      : '');
  const guest    = isObj && ep.guest_name ? ridaEscapeHtml(ep.guest_name) : '';
  const epNum    = isObj && ep.episode    ? ridaEscapeHtml(String(ep.episode)) : '';
  const spotifyUrl = isObj && ep.spotify_url ? ridaEscapeHtml(ep.spotify_url) : '';
  const appleUrl   = isObj && ep.apple_url   ? ridaEscapeHtml(ep.apple_url)   : '';
  const youtubeUrl = isObj && ep.youtube_url ? ridaEscapeHtml(ep.youtube_url) : '';

  // ── SVG icons ──────────────────────────────────────────────────────────
  const MIC_SVG = `<svg viewBox="0 0 16 16" fill="none" width="12" height="12"><rect x="5" y="1" width="6" height="9" rx="3" stroke="currentColor" stroke-width="1.4"/><path d="M3 8a5 5 0 0 0 10 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  const PLAY_SVG  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  const BACK_SVG  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>`;
  const FWD_SVG   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.5"/></svg>`;
  const SPO_SVG   = `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.021.24-2.82-1.74-6.36-2.1-10.561-1.14-.418.122-.779-.18-.899-.54-.12-.42.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.56 18.72 12.84c.361.18.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.62.539.3.719 1.02.419 1.56-.299.42-1.02.6-1.559.3z"/></svg>`;
  const APL_SVG   = `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6zm0 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z"/></svg>`;
  const YT_SVG    = `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zm-13.9 9.4V8.4l6.3 3.6-6.3 3.6z"/></svg>`;

  // ── Platform links ─────────────────────────────────────────────────────
  const platLinks = [
    spotifyUrl ? `<a href="${spotifyUrl}" target="_blank" rel="noopener" class="rida-pc-plat rida-pc-plat-spotify">${SPO_SVG}Spotify</a>` : '',
    appleUrl   ? `<a href="${appleUrl}"   target="_blank" rel="noopener" class="rida-pc-plat rida-pc-plat-apple">${APL_SVG}Apple Podcasts</a>` : '',
    youtubeUrl ? `<a href="${youtubeUrl}" target="_blank" rel="noopener" class="rida-pc-plat rida-pc-plat-yt">${YT_SVG}YouTube</a>` : '',
  ].filter(Boolean).join('');
  const platformsHtml = platLinks
    ? `<div class="rida-pc-platforms"><span class="rida-pc-plat-label">Also on</span>${platLinks}</div>`
    : '';

  // ── Shared card header ─────────────────────────────────────────────────
  const headerHtml = `
    <div class="rida-pc-bar"></div>
    <div class="rida-pc-head">
      <span class="rida-pc-show">${MIC_SVG}Less Insurance Dependence</span>
      ${epNum ? `<span class="rida-pc-epnum">Ep. ${epNum}</span>` : ''}
    </div>
    ${title ? `<div class="rida-pc-title">${title}</div>` : ''}
    ${guest ? `<div class="rida-pc-guest">with ${guest}</div>` : ''}
  `;

  // ── Libsyn / iframe embed ──────────────────────────────────────────────
  // Any libsyn.com URL that isn't a raw audio file → use their native player
  if (ridaIsLibsynAudio(src) && !ridaIsDirectAudioFile(src)) {
    return `
      <div class="rida-pc">
        ${headerHtml}
        <div class="rida-pc-embed-body">
          <iframe src="${ridaEscapeHtml(src)}" width="100%" height="90"
            frameborder="0" allow="autoplay; encrypted-media" scrolling="no"
            title="${title || 'Podcast episode'}"></iframe>
        </div>
        ${platformsHtml}
      </div>`;
  }

  // ── Custom HTML5 player (direct audio files) ───────────────────────────
  return `
    <div class="rida-pc rida-pc-native">
      ${headerHtml}
      <div class="rida-pc-player">
        <div class="rida-pc-track">
          <div class="rida-pc-fill"></div>
          <div class="rida-pc-thumb"></div>
        </div>
        <div class="rida-pc-times">
          <span class="rida-pc-cur">0:00</span>
          <span class="rida-pc-dur">--:--</span>
        </div>
        <div class="rida-pc-controls">
          <button class="rida-pc-speed" type="button" title="Playback speed">1×</button>
          <button class="rida-pc-skip rida-pc-back" type="button" title="Back 15 seconds">${BACK_SVG}<span>15s</span></button>
          <button class="rida-pc-play" type="button" aria-label="Play">${PLAY_SVG}</button>
          <button class="rida-pc-skip rida-pc-fwd"  type="button" title="Forward 15 seconds">${FWD_SVG}<span>15s</span></button>
        </div>
      </div>
      ${platformsHtml}
      <audio preload="metadata" src="${ridaEscapeHtml(src)}" style="display:none"></audio>
    </div>`;
}

function ridaMiniAudioMarkup(ep) {
  const isObj = ep && typeof ep === 'object';
  const audioSource = isObj ? (ep.audio_source || '') : String(ep || '');
  const src = ridaPodcastAudioSrc(audioSource);
  if (!src) return '';

  const PLAY_SVG  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;

  // Libsyn embed — show native player iframe in a compact wrapper
  if (ridaIsLibsynAudio(src) && !ridaIsDirectAudioFile(src)) {
    return `
      <div class="rida-mini rida-mini-embed-wrap">
        <div class="rida-mini-embed">
          <iframe src="${ridaEscapeHtml(src)}" width="100%" height="52"
            frameborder="0" allow="autoplay; encrypted-media" scrolling="no"
            title="Podcast episode"></iframe>
        </div>
      </div>`;
  }

  // Native HTML5 mini player
  return `
    <div class="rida-mini rida-mini-native">
      <button class="rida-mini-play" type="button" aria-label="Play / Pause">
        ${PLAY_SVG}
      </button>
      <div class="rida-mini-body">
        <div class="rida-mini-track">
          <div class="rida-mini-fill"></div>
        </div>
        <div class="rida-mini-times">
          <span class="rida-mini-cur">0:00</span>
          <span class="rida-mini-sep">/</span>
          <span class="rida-mini-dur">--:--</span>
        </div>
      </div>
      <audio preload="metadata" src="${ridaEscapeHtml(src)}" style="display:none"></audio>
    </div>`;
}

function ridaLandingEpisodeAudioMarkup(ep) {
  const isObj = ep && typeof ep === 'object';
  const audioSource = isObj ? (ep.audio_source || '') : String(ep || '');
  const src = ridaPodcastAudioSrc(audioSource);
  if (!src) return '';

  if (ridaIsLibsynAudio(src) && !ridaIsDirectAudioFile(src)) {
    return `
      <div class="audio-player-embed">
        <iframe src="${ridaEscapeHtml(src)}" width="100%" height="52"
          frameborder="0" allow="autoplay; encrypted-media" scrolling="no"
          title="Podcast episode"></iframe>
      </div>`;
  }

  return `
    <div class="audio-player-mock">
      <button class="player-button" type="button" aria-label="Play / Pause">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <div class="player-info">
        <div class="player-title">${ridaEscapeHtml(isObj && ep.title ? ep.title : 'Podcast episode')}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="player-time">
          <span class="player-cur">0:00</span>
          <span class="player-sep">/</span>
          <span class="player-dur">--:--</span>
        </div>
      </div>
      <audio preload="metadata" src="${ridaEscapeHtml(src)}" style="display:none"></audio>
    </div>`;
}

function ridaSlugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ridaWebinarCategoryLabel(category) {
  const labels = {
    summit: 'Summit Replay',
    workshop: 'Workshop',
    masterclass: 'Masterclass',
    qa: 'Q&A Session'
  };
  const key = String(category || '').trim().toLowerCase();
  return labels[key] || (key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Replay');
}

function ridaMergeWebinars(webinars) {
  const merged = new Map();

  (Array.isArray(webinars) ? webinars : []).forEach((webinar, index) => {
    const safeWebinar = webinar && webinar.id !== undefined ? webinar : { ...webinar, id: index + 1 };
    merged.set(ridaSlugify(safeWebinar && safeWebinar.title), safeWebinar);
  });

  RIDA_SUPPLEMENTAL_WEBINARS.forEach((extra, index) => {
    const slug = ridaSlugify(extra && extra.title);
    const existing = merged.get(slug);
    if (existing) {
      merged.set(slug, { ...existing, ...extra, id: existing.id || extra.id || `supplemental-${index + 1}` });
    } else {
      merged.set(slug, { ...extra, id: extra.id || `supplemental-${index + 1}` });
    }
  });

  return Array.from(merged.values()).map((item, index) => ({
    ...item,
    id: item && item.id !== undefined ? item.id : index + 1
  }));
}

function ridaEscapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats podcast descriptions with section headings and bullet points
 * Converts multi-paragraph text with section headers into styled HTML
 * Example input:
 *   "In this episode...description paragraph.\n\nKey Takeaways\nFirst point here\nSecond point here"
 * Returns HTML with proper heading and list formatting
 */
function ridaFormatPodcastDescription(descriptionText) {
  if (!descriptionText) return '';
  
  const lines = String(descriptionText).split('\n');
  let html = '<div class="ep-desc-full">';
  let i = 0;
  let currentList = [];
  let inList = false;

  while (i < lines.length) {
    const line = lines[i].trim();
    i++;

    if (!line) continue;

    // Check if this looks like a section heading (all caps, short, followed by bullet-like content)
    const isSectionHead = /^[A-Z][A-Z\s&\-]+$/.test(line) && line.length < 50;

    if (isSectionHead) {
      // Flush any pending list
      if (currentList.length > 0) {
        html += '<ul>' + currentList.map(item => `<li>${ridaEscapeHtml(item)}</li>`).join('') + '</ul>';
        currentList = [];
        inList = false;
      }
      html += `<h3>${ridaEscapeHtml(line)}</h3>`;
      inList = true;
    } else if (inList) {
      // We're in a section, collect list items
      currentList.push(line);
    } else {
      // Regular paragraph outside of a section
      if (currentList.length > 0) {
        html += '<ul>' + currentList.map(item => `<li>${ridaEscapeHtml(item)}</li>`).join('') + '</ul>';
        currentList = [];
        inList = false;
      }
      html += `<p>${ridaEscapeHtml(line)}</p>`;
    }
  }

  // Flush any remaining list
  if (currentList.length > 0) {
    html += '<ul>' + currentList.map(item => `<li>${ridaEscapeHtml(item)}</li>`).join('') + '</ul>';
  }

  html += '</div>';
  return html;
}

function ridaDecodeHtml(value) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = String(value || '');
  return textarea.value;
}

function ridaPickRowValue(row, keys) {
  const normalizedEntries = Object.keys(row || {}).map(key => ({
    key,
    normalized: String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
  }));

  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }

    const normalizedKey = String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    const match = normalizedEntries.find(entry => entry.normalized === normalizedKey);
    if (match) {
      const normalizedValue = row[match.key];
      if (normalizedValue !== undefined && normalizedValue !== null && String(normalizedValue).trim()) {
        return String(normalizedValue).trim();
      }
    }
  }
  return '';
}

function ridaLooksLikeEmbedMarkup(value) {
  const text = String(value || '').trim().toLowerCase();
  return /<(iframe|script|div|p)\b/.test(text) || text.includes('player.vimeo.com') || text.includes('<iframe');
}

function ridaPlainTextFromHtml(value) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = String(value || '');
  return (wrapper.textContent || wrapper.innerText || '').replace(/\s+/g, ' ').trim();
}

function ridaCleanSummaryText(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (ridaLooksLikeEmbedMarkup(raw)) {
    return ridaPlainTextFromHtml(raw);
  }
  return raw.replace(/\s+/g, ' ').trim();
}

function ridaGetTextExportCandidates(url) {
  if (!url) return [];
  const value = String(url).trim();
  const candidates = [];
  const id = ridaDriveId(value);
  const isGoogleDoc = /docs\.google\.com\/document\/d\/([\w-]+)/.test(value);

  // ── Apps Script proxy (most reliable — no CORS issues) ──
  if (RIDA_APPS_SCRIPT_PROXY) {
    if (isGoogleDoc) {
      // Google Docs cannot be read as raw Drive blobs — proxy the txt-export URL instead
      const docMatch = value.match(/docs\.google\.com\/document\/d\/([\w-]+)/);
      if (docMatch) {
        const exportUrl = `https://docs.google.com/document/d/${docMatch[1]}/export?format=txt`;
        candidates.push(`${RIDA_APPS_SCRIPT_PROXY}?docUrl=${encodeURIComponent(exportUrl)}`);
      }
    } else if (id) {
      // Regular Drive file (VTT, txt, etc.): read directly via DriveApp
      candidates.push(`${RIDA_APPS_SCRIPT_PROXY}?id=${encodeURIComponent(id)}`);
    }
  }

  // ── Direct Google export URLs (fallback if proxy unavailable) ──
  const docMatch2 = value.match(/docs\.google\.com\/document\/d\/([\w-]+)/);
  if (docMatch2) {
    candidates.push(`https://docs.google.com/document/d/${docMatch2[1]}/export?format=txt`);
  }
  if (id && !isGoogleDoc) {
    candidates.push(`https://drive.google.com/uc?export=download&id=${id}`);
    candidates.push(`https://docs.google.com/uc?export=open&id=${id}`);
  }
  if (!candidates.includes(value)) candidates.push(value);
  return candidates;
}

function ridaBuildProxyUrl(url, proxyTemplate) {
  const proxy = String(proxyTemplate || RIDA_TEXT_PROXY || '').trim();
  if (!proxy) return '';
  return proxy.includes('{url}')
    ? proxy.replace('{url}', encodeURIComponent(url))
    : `${proxy}${proxy.includes('?') ? '&' : '?'}url=${encodeURIComponent(url)}`;
}

function ridaIsGoogleDriveUrl(url) {
  return /drive\.google\.com|docs\.google\.com/i.test(String(url || ''));
}

function ridaLooksLikeHtmlDocument(text) {
  const value = String(text || '').trim().toLowerCase();
  return value.startsWith('<!doctype html') || value.startsWith('<html') || value.includes('<head>') || value.includes('window[\'_drive_viewer_ctiming\']');
}

async function ridaFetchTextContent(url) {
  const candidates = ridaGetTextExportCandidates(url);
  let lastError = null;

  for (const candidate of candidates) {
    const isProxyCandidate = Boolean(RIDA_APPS_SCRIPT_PROXY && candidate.startsWith(RIDA_APPS_SCRIPT_PROXY));
    const attempts = [];

    if (isProxyCandidate) {
      // Workspace Apps Script URLs lack CORS headers — try direct first, then
      // wrap in each CORS proxy as fallbacks (corsproxy.io, then allorigins)
      attempts.push(candidate);
      const p1 = ridaBuildProxyUrl(candidate, RIDA_TEXT_PROXY);
      const p2 = ridaBuildProxyUrl(candidate, RIDA_TEXT_PROXY_2);
      if (p1) attempts.push(p1);
      if (p2) attempts.push(p2);
    } else {
      // Normal candidate: try direct, then CORS proxies
      attempts.push(candidate);
      const p1 = ridaBuildProxyUrl(candidate, RIDA_TEXT_PROXY);
      const p2 = ridaBuildProxyUrl(candidate, RIDA_TEXT_PROXY_2);
      if (ridaIsGoogleDriveUrl(candidate)) {
        // Drive URLs are CORS-blocked — try proxies after direct
        if (p1) attempts.push(p1);
        if (p2) attempts.push(p2);
      } else {
        // Non-Drive, non-proxy: try CORS proxy first (may help with other services)
        if (p1) attempts.unshift(p1);
        if (p2) attempts.splice(1, 0, p2);
      }
    }

    for (const attempt of attempts) {
      try {
        const res = await fetch(attempt);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!text || !text.trim()) continue;
        if (ridaLooksLikeHtmlDocument(text)) {
          lastError = new Error('Received HTML page instead of file content');
          continue;
        }
        // Reject error strings returned by the Apps Script proxy
        if (/^ERROR:/i.test(String(text).trim())) {
          lastError = new Error(String(text).trim().slice(0, 120));
          continue;
        }
        return text;
      } catch (err) {
        lastError = err;
      }
    }
  }
  throw lastError || new Error('Unable to fetch text content');
}

function ridaFormatDisplayDate(row) {
  if (row.date) return String(row.date).trim();

  const parsedDate = ridaParseDate(row.date_iso || '');
  if (parsedDate) {
    return parsedDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  const day = String(row.day || '').trim();
  const monthYear = ridaParseDate(row.month_year || '');
  if (day && monthYear) {
    return monthYear.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }).replace(/(\w+)\s(\d{4})/, (_, month, year) => `${month} ${parseInt(day, 10)}, ${year}`);
  }

  return '';
}

function ridaNormalizeWebinarRow(row, index) {
  const description = ridaCleanSummaryText(ridaPickRowValue(row, [
    'description',
    'overview',
    'summary',
    'description_text'
  ]));

  return {
    id: index + 1,
    date: ridaFormatDisplayDate(row),
    title: String(row.title || '').trim(),
    category: String(row.category || row.type || 'workshop').trim(),
    duration: String(row.duration || row.length || '2 Hours').trim(),
    description,
    description_doc_url: ridaPickRowValue(row, [
      'description_doc_url',
      'decription_doc_url',
      'description_doc',
      'description_url',
      'doc_url',
      'description - Key notes'
    ]),
    vimeo_embed_src: ridaDecodeHtml(ridaPickRowValue(row, [
      'vimeo_embed_src',
      'vimeo_url',
      'webinar_url'
    ])),
    vimeo_full_embed: ridaPickRowValue(row, [
      'vimeo_full_embed',
      'video_embed',
      'embed_html'
    ]),
    transcript_url: ridaPickRowValue(row, [
      'transcript_url',
      'transcript_doc_url',
      'transcript',
      'transcript_url_doc'
    ]),
    presenter: String(ridaPickRowValue(row, [
      'presenter',
      'speaker',
      'guest',
      'host',
      'instructor',
      'facilitator',
      'presented_by'
    ]) || '').trim(),
    gated: /^(true|1|yes)$/i.test(String(row.gated || row.access_gate || ''))
  };
}

function ridaNormalizeLoose(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function ridaExtractWebinarDocSection(text, webinar) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/);
  const normalizedTitle = ridaNormalizeLoose(webinar && webinar.title);
  if (!normalizedTitle) return String(text || '').trim();

  let start = lines.findIndex(line => {
    const normalizedLine = ridaNormalizeLoose(line);
    return normalizedLine && (normalizedLine.includes(normalizedTitle) || normalizedTitle.includes(normalizedLine));
  });

  if (start === -1) return String(text || '').trim();

  const previousLine = ridaNormalizeLoose(lines[start - 1] || '');
  if (previousLine.includes('rida') || previousLine.includes('march') || previousLine.includes('april')) {
    start -= 1;
  }

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    const current = (lines[i] || '').trim();
    if (!current) continue;
    if (/^Part\s+\d+/i.test(current) || /^Reference$/i.test(current)) {
      end = i;
      break;
    }
  }

  return lines.slice(start, end).join('\n').trim();
}

function ridaExtractOverviewSummary(text) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trim());
  const overviewIndex = lines.findIndex(line => /^overview$/i.test(line));
  if (overviewIndex === -1) return '';

  const summaryLines = [];
  for (let i = overviewIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) {
      if (summaryLines.length) break;
      continue;
    }
    if (/^(key topics covered|key takeaways)$/i.test(line)) break;
    summaryLines.push(line);
  }

  return summaryLines.join(' ').trim();
}

function ridaParseDescriptionBlocks(text) {
  if (!text) return { intro: [], takeaways: [], keyPoints: [], bioTitle: '', bioPoints: [] };

  const raw = String(text).split(/\r?\n/).map(l => l.trim());
  const intro     = [];
  const takeaways = [];   // [{title, desc}]
  const keyPoints = [];   // flat list for backward-compat
  const bioPoints = [];
  let bioTitle     = '';
  let mode         = 'intro';   // 'intro' | 'takeaways' | 'bio'
  let pendingTitle = null;

  const stripBullet = l => l.replace(/^[•*\-–—>]\s+/, '').replace(/^\d+[.)]\s+/, '').trim();
  const hasBullet   = l => /^[•*\-–—>]\s/.test(l) || /^\d+[.)]\s/.test(l);

  for (const line of raw) {
    if (!line) {
      // flush unpaired title on blank line
      if (mode === 'takeaways' && pendingTitle !== null) {
        takeaways.push({ title: pendingTitle, desc: '' });
        pendingTitle = null;
      }
      continue;
    }

    // ── Section-switch lines ──────────────────────────────────────────
    if (/^key takeaways?$/i.test(line) || /^key points?$/i.test(line)) {
      if (mode === 'takeaways' && pendingTitle !== null) {
        takeaways.push({ title: pendingTitle, desc: '' });
        pendingTitle = null;
      }
      mode = 'takeaways';
      continue;
    }
    if (/^(more about|about )/i.test(line)) {
      if (mode === 'takeaways' && pendingTitle !== null) {
        takeaways.push({ title: pendingTitle, desc: '' });
        pendingTitle = null;
      }
      bioTitle = line.replace(/:$/, '');
      mode = 'bio';
      continue;
    }

    const isBullet = hasBullet(line);
    const cleaned  = stripBullet(line);
    if (!cleaned) continue;

    if (mode === 'intro') {
      intro.push(cleaned);
    } else if (mode === 'takeaways') {
      keyPoints.push(cleaned); // always add to flat list
      if (isBullet) {
        // bullet-prefixed → standalone item, no paired description
        if (pendingTitle !== null) {
          takeaways.push({ title: pendingTitle, desc: '' });
          pendingTitle = null;
        }
        takeaways.push({ title: cleaned, desc: '' });
      } else {
        // plain line → alternating title / description pairs
        if (pendingTitle === null) {
          pendingTitle = cleaned;
        } else {
          takeaways.push({ title: pendingTitle, desc: cleaned });
          pendingTitle = null;
        }
      }
    } else if (mode === 'bio') {
      bioPoints.push(cleaned);
    }
  }

  // flush unpaired title at end
  if (mode === 'takeaways' && pendingTitle !== null) {
    takeaways.push({ title: pendingTitle, desc: '' });
  }

  // backward-compat: if no takeaways section, use intro lines as key points
  if (!keyPoints.length && intro.length) {
    intro.forEach(l => keyPoints.push(l));
  }

  return { intro, takeaways, keyPoints, bioTitle, bioPoints };
}

function ridaParseContactInfo(str) {
  if (!str) return [];
  return String(str).split('|').map(item => {
    const trimmed = item.trim();
    const idx = trimmed.indexOf(':');
    if (idx > -1) {
      return { type: trimmed.slice(0, idx).trim(), value: trimmed.slice(idx + 1).trim() };
    }
    return { type: 'Link', value: trimmed };
  }).filter(item => item.value);
}

function ridaPodcastGuestImages(ep) {
  if (!ep || typeof ep !== 'object') return [];
  const rawStr = ep.guest_photo_url || ep.guest_photo || ep.image_url || ep.image_urls || ep.photo_url || ep.thumbnail_url || '';
  return ridaParseImageUrls(rawStr);
}

function ridaPodcastBannerMarkup(ep, options) {
  const settings = options || {};
  const images = ridaPodcastGuestImages(ep);
  if (!images.length) return '';

  const visible = images.slice(0, 4);
  const guestName = ridaEscapeHtml(ep && ep.guest_name ? ep.guest_name : 'Featured Guest');
  const countClass = `count-${Math.min(visible.length, 4)}`;
  const extraCount = Math.max(0, images.length - visible.length);
  const tileMarkup = visible.map((url, index) => `
    <div class="pod-banner-tile pod-banner-tile-${index + 1}">
      <img src="${ridaEscapeHtml(url)}" alt="" loading="lazy" onerror="this.closest('.pod-banner-tile').style.display='none'">
    </div>
  `).join('');

  return `
    <div class="pod-banner ${settings.compact ? 'pod-banner-compact' : ''} ${settings.featured ? 'pod-banner-featured' : ''} ${countClass}">
      <div class="pod-banner-grid">${tileMarkup}</div>
      <div class="pod-banner-overlay"></div>
      <div class="pod-banner-copy">
        <span class="pod-banner-chip">Podcast Guest</span>
        <div class="pod-banner-name">${guestName}</div>
        <div class="pod-banner-brand">Less Insurance Dependence</div>
      </div>
      ${extraCount ? `<div class="pod-banner-more">+${extraCount}</div>` : ''}
    </div>
  `;
}

function ridaGuestHeroMarkup(ep) {
  const images = ridaPodcastGuestImages(ep);
  if (!images.length) return '';
  const visible = images.slice(0, 4);
  const moreCount = Math.max(0, images.length - visible.length);
  const isSingle = visible.length === 1;
  const tiles = visible.map((url, index) => `
    <div class="ep-guest-tile ep-guest-tile-${index + 1}">
      <img src="${ridaEscapeHtml(url)}" alt="${ridaEscapeHtml(ep && ep.guest_name ? ep.guest_name : 'Guest speaker')}" loading="lazy" onerror="this.closest('.ep-guest-tile').style.display='none'">
    </div>
  `).join('');
  return `
    <div class="ep-guest-visual ${isSingle ? 'is-single' : 'is-multi'} count-${Math.min(visible.length, 4)}">
      <div class="ep-guest-grid">
        ${tiles}
      </div>
      ${moreCount ? `<div class="ep-guest-more">+${moreCount}</div>` : ''}
    </div>
  `;
}

function ridaPodcastHref(ep) {
  return `podcast-episode/?ep=${encodeURIComponent(ep.episode)}`;
}

function ridaWebinarHref(webinar) {
  return `webinar/?title=${encodeURIComponent(webinar.title || '')}`;
}

function ridaFormatDocHtml(text) {
  const lines = String(text || '').split(/\r?\n/);
  const chunks = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    chunks.push(`<ul class="wb-rich-list">${listItems.join('')}</ul>`);
    listItems = [];
  };

  lines.forEach(raw => {
    const line = raw.trim();
    if (!line) {
      flushList();
      return;
    }

    if (/^[•*\-\u2013\u2014>]/.test(line) || /^\d+\.\s+/.test(line)) {
      const item = ridaEscapeHtml(line.replace(/^[•*\-\u2013\u2014>]\s*/, '').replace(/^\d+\.\s+/, '').trim());
      if (item) listItems.push(`<li>${item}</li>`);
      return;
    }

    flushList();
    if (/^[A-Z][A-Z\s&]{4,}$/.test(line) || /:$/.test(line)) {
      chunks.push(`<h3 class="wb-rich-heading">${ridaEscapeHtml(line.replace(/:$/, ''))}</h3>`);
    } else {
      chunks.push(`<p>${ridaEscapeHtml(line)}</p>`);
    }
  });

  flushList();
  return chunks.join('');
}

function ridaVideoEmbedMarkup(webinar) {
  if (webinar.vimeo_full_embed) return webinar.vimeo_full_embed;
  if (webinar.vimeo_embed_src) {
    return `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="${ridaEscapeHtml(webinar.vimeo_embed_src)}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:16px;" title="${ridaEscapeHtml(webinar.title)}"></iframe></div>`;
  }
  return '';
}

function ridaRenderWebinarSidebarMeta(webinar) {
  const sidebar = document.getElementById('wb-sidebar-info');
  const target = document.getElementById('wb-meta-sidebar');
  if (!sidebar || !target || !webinar) return;

  const rows = [];
  if (webinar.category) rows.push({ icon: 'stack', label: 'Category', value: ridaWebinarCategoryLabel(webinar.category) });
  if (webinar.date) rows.push({ icon: 'calendar', label: 'Replay', value: webinar.date });
  if (webinar.duration) rows.push({ icon: 'play', label: 'Format', value: webinar.duration });
  if (Array.isArray(webinar.clips) && webinar.clips.length) rows.push({ icon: 'list', label: 'Sessions', value: `${webinar.clips.length} ordered clips` });
  if (webinar.presenter) rows.push({ icon: 'user', label: 'Featuring', value: webinar.presenter });

  if (!rows.length) {
    sidebar.style.display = 'none';
    target.innerHTML = '';
    return;
  }

  const icons = {
    stack: '<svg class="wb-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></svg>',
    calendar: '<svg class="wb-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>',
    play: '<svg class="wb-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none"/></svg>',
    list: '<svg class="wb-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>',
    user: '<svg class="wb-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="5"/></svg>'
  };

  target.innerHTML = rows.map(row => `
    <div class="wb-meta-row">
      <div class="wb-meta-icon-wrap">${icons[row.icon] || icons.stack}</div>
      <div class="wb-meta-text">
        <span class="wb-meta-label">${ridaEscapeHtml(row.label)}</span>
        <span class="wb-meta-val">${ridaEscapeHtml(row.value)}</span>
      </div>
    </div>
  `).join('');
  sidebar.style.display = 'block';
}

function ridaRenderWebinarPlaylist(webinar) {
  const clips = Array.isArray(webinar && webinar.clips) ? webinar.clips.filter(clip => clip && clip.vimeo_embed_src) : [];
  if (!clips.length) return false;

  const videoWrap = document.getElementById('wb-video-embed');
  const currentCard = document.getElementById('wb-current-clip-card');
  const currentTitle = document.getElementById('wb-current-clip-title');
  const currentCount = document.getElementById('wb-current-clip-count');
  const currentMeta = document.getElementById('wb-current-clip-meta');
  const currentSummary = document.getElementById('wb-current-clip-summary');
  const sidebar = document.getElementById('wb-clip-sidebar');
  const sidebarList = document.getElementById('wb-clip-list');
  const transcriptWrap = document.getElementById('wb-transcript-content');
  const notesBtn = document.querySelector('.ep-tab-btn[data-tab="notes"]');
  const transcriptBtn = document.querySelector('.ep-tab-btn[data-tab="transcript"]');
  const hasTranscript = Boolean(webinar && webinar.transcript_url);

  if (!videoWrap || !sidebar || !sidebarList || !transcriptWrap) return false;
  if (notesBtn) notesBtn.textContent = 'Overview';

  let activeIndex = 0;
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = parseInt(params.get('clip') || '', 10);
    if (!Number.isNaN(fromQuery) && fromQuery >= 1 && fromQuery <= clips.length) activeIndex = fromQuery - 1;
  } catch (_) {}

  function clipMeta(clip) {
    return [clip.label, clip.type, clip.speaker].filter(Boolean).join(' • ');
  }

  function renderSidebar() {
    sidebarList.innerHTML = clips.map((clip, index) => `
      <button type="button" class="wb-clip-item${index === activeIndex ? ' active' : ''}" data-clip-index="${index}">
        <span class="wb-clip-item-badge">${ridaEscapeHtml(clip.label || `Clip ${String(index + 1).padStart(2, '0')}`)}</span>
        <span class="wb-clip-item-title">${ridaEscapeHtml(clip.title || `Session ${index + 1}`)}</span>
        <span class="wb-clip-item-meta">${ridaEscapeHtml([clip.type, clip.speaker].filter(Boolean).join(' • ') || 'Summit replay segment')}</span>
      </button>
    `).join('');
    sidebar.style.display = 'block';
  }

  function renderGuide() {
    if (hasTranscript) return;
    if (transcriptBtn) transcriptBtn.textContent = 'Session Guide';
    transcriptWrap.innerHTML = `
      <div class="wb-guide-intro">
        <h3 class="wb-rich-heading" style="margin-top:0;">Summit Session Guide</h3>
        <p>Use the ordered replay cards below to jump directly to any segment from the event.</p>
      </div>
      <div class="wb-guide-grid">
        ${clips.map((clip, index) => `
          <button type="button" class="wb-guide-card${index === activeIndex ? ' active' : ''}" data-clip-index="${index}">
            <span class="wb-guide-badge">${ridaEscapeHtml(clip.label || `Clip ${String(index + 1).padStart(2, '0')}`)}</span>
            <h3>${ridaEscapeHtml(clip.title || `Session ${index + 1}`)}</h3>
            <p>${ridaEscapeHtml(clip.summary || 'Watch this replay segment from the summit playlist.')}</p>
            <span class="wb-guide-meta">${ridaEscapeHtml([clip.type, clip.speaker].filter(Boolean).join(' • ') || 'Summit replay')}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function setClip(index) {
    const clip = clips[index];
    if (!clip) return;
    activeIndex = index;
    videoWrap.innerHTML = ridaVideoEmbedMarkup({ title: clip.title || webinar.title, vimeo_embed_src: clip.vimeo_embed_src });

    if (currentCard && currentTitle && currentCount && currentMeta && currentSummary) {
      currentTitle.textContent = clip.title || `Session ${index + 1}`;
      currentCount.textContent = `${index + 1} of ${clips.length}`;
      currentMeta.textContent = clipMeta(clip);
      currentSummary.textContent = clip.summary || 'Part of the full summit replay.';
      currentCard.style.display = 'block';
    }

    renderSidebar();
    renderGuide();

    try {
      const params = new URLSearchParams(window.location.search);
      params.set('title', webinar.title);
      params.set('clip', String(index + 1));
      history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    } catch (_) {}
  }

  sidebarList.addEventListener('click', event => {
    const btn = event.target.closest('[data-clip-index]');
    if (!btn) return;
    setClip(parseInt(btn.getAttribute('data-clip-index'), 10));
  });

  transcriptWrap.addEventListener('click', event => {
    const btn = event.target.closest('[data-clip-index]');
    if (!btn) return;
    setClip(parseInt(btn.getAttribute('data-clip-index'), 10));
  });

  setClip(activeIndex);
  return true;
}

// ── Helper: detect WebVTT format ───────────────────────────────────
function ridaIsVTT(text) {
  // Strip BOM (\uFEFF) before checking — trim() does NOT remove BOM
  return /^WEBVTT/i.test(String(text || '').replace(/^\uFEFF/, '').trim());
}

// Decode common HTML entities that appear inside VTT cue text
function ridaDecodeVttEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

// ── Helper: parse WebVTT into transcript entries ───────────────────
function ridaParseVTT(text, guestName) {
  const cleanGuest = (guestName || 'Guest').split(' ')[0];
  const HOST_KEYS = ['host', 'naren', 'moderator', 'interviewer', 'arulrajah'];

  // Strip BOM and normalise line endings
  const raw = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = raw.split('\n');
  const entries = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip header, blank lines, cue numeric IDs, and block directives
    if (!line
      || /^WEBVTT/i.test(line)
      || /^NOTE(\s|$)/i.test(line)
      || /^STYLE(\s|$)/i.test(line)
      || /^REGION(\s|$)/i.test(line)
      || /^\d+$/.test(line)
    ) { i++; continue; }

    // Timestamp line
    if (line.includes(' --> ')) {
      const timeMatch = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{1,3})/);
      let rawTime = timeMatch ? timeMatch[1].replace(',', '.').replace(/\.\d+$/, '') : '';
      if (rawTime && rawTime.split(':').length === 2) rawTime = '00:' + rawTime;
      i++;

      // Collect cue text lines until blank line
      const textLines = [];
      while (i < lines.length && lines[i].trim()) { textLines.push(lines[i]); i++; }
      if (!textLines.length) continue;

      let joined = textLines.join(' ');

      // ── Speaker extraction ───────────────────────────────────────
      let label = '';

      // 1. WebVTT voice tag: <v SPEAKER_NAME>text</v>
      const vTag = joined.match(/^<v\s+([^>]+)>/i);
      if (vTag) label = vTag[1].trim();

      // Strip ALL HTML/VTT tags now that speaker is captured
      let content = joined.replace(/<[^>]+>/g, '').trim();
      content = ridaDecodeVttEntities(content);

      // 2. Colon-prefix format: "Speaker Name: text" (only if no <v> tag found)
      if (!label) {
        const colonMatch = content.match(/^([A-Z][A-Za-z .'-]{0,34}):\s+(.+)/);
        if (colonMatch) { label = colonMatch[1].trim(); content = colonMatch[2].trim(); }
      }

      // Skip blank / silence-only cues
      if (!content || /^(\[silence\]|<silence>)$/i.test(content)) continue;

      // ── Role classification ──────────────────────────────────────
      let role = 'guest';
      if (label) {
        const spkLower = label.toLowerCase();
        if (HOST_KEYS.some(k => spkLower.includes(k))) {
          role = 'host';
          label = label; // keep original name from VTT (e.g. "Naren")
        }
      }

      // Fall back to guest name from sheet when no label at all
      if (!label) label = cleanGuest;

      entries.push({ label, role, time: rawTime, text: content });
      continue;
    }
    i++;
  }
  return entries;
}

function ridaClassifySpeakerLabel(label, guestName) {
  const normalized = String(label || '').trim();
  const cleanGuest = String(guestName || 'Guest').trim();
  const hostKeys = ['host', 'naren', 'moderator', 'interviewer', 'arulrajah', 'rid academy'];
  const lower = normalized.toLowerCase();

  if (!normalized) {
    return { label: '', role: 'guest' };
  }
  if (hostKeys.some(key => lower.includes(key))) {
    return { label: normalized, role: 'host' };
  }
  if (/^intro$/i.test(normalized)) {
    return { label: normalized, role: 'intro' };
  }
  if (cleanGuest && lower === cleanGuest.toLowerCase()) {
    return { label: normalized, role: 'guest' };
  }
  return { label: normalized, role: 'guest' };
}

function ridaFormatTranscript(text, guestName) {
  // Dispatch to VTT parser if file is in WebVTT format
  if (ridaIsVTT(text)) {
    const entries = ridaParseVTT(text, guestName);
    if (entries.length) {
      return entries.map(entry => {
        const roleClass = entry.role === 'host' ? 'ep-ts-host' : (entry.role === 'intro' ? 'ep-ts-intro' : 'ep-ts-guest');
        const badgeClass = entry.role === 'host' ? 'ep-ts-host-badge' : (entry.role === 'intro' ? 'ep-ts-intro-badge' : 'ep-ts-guest-badge');
        const meta = (entry.label || entry.time)
          ? `<div class="ep-ts-meta">${entry.label ? `<span class="ep-transcript-speaker ${badgeClass}">${ridaEscapeHtml(entry.label)}</span>` : ''}${entry.time ? `<span class="ep-transcript-time">${ridaEscapeHtml(entry.time)}</span>` : ''}</div>`
          : '';
        return `<div class="ep-transcript-para ${roleClass}">${meta}<div class="ep-transcript-text">${ridaEscapeHtml(entry.text)}</div></div>`;
      }).join('');
    }
  }

  const lines = String(text || '').split(/\r?\n/);
  const entries = [];
  const hostName = 'RID Academy';
  const cleanGuest = (guestName || 'Guest').split(' ')[0];
  const lineRe = /^(Speaker\s+(\d+))\s{2,}(\d{1,2}:\d{2}(?::\d{2})?)\s{2,}(.+)$/;
  const namedTimedRe = /^([A-Z][A-Za-z .'-]{0,40})\s{2,}(\d{1,2}:\d{2}(?::\d{2})?)\s{2,}(.+)$/;
  const namedColonRe = /^([A-Z][A-Za-z .&/'-]{0,50}):\s+(.+)$/;

  lines.forEach(raw => {
    const line = raw.trim();
    if (!line || line === '<silence>') return;
    const match = line.match(lineRe);
    if (match) {
      const speakerNum = parseInt(match[2], 10);
      const time = match[3];
      const textValue = match[4].trim();
      if (!textValue || textValue === '<silence>') return;
      let label = cleanGuest;
      let role = 'guest';
      if (speakerNum === 1) {
        label = 'Intro';
        role = 'intro';
      } else if (speakerNum === 2) {
        label = hostName;
        role = 'host';
      }
      entries.push({ label, role, time, text: textValue });
      return;
    }
    const namedTimed = line.match(namedTimedRe);
    if (namedTimed) {
      const classified = ridaClassifySpeakerLabel(namedTimed[1], guestName);
      entries.push({
        label: classified.label,
        role: classified.role,
        time: namedTimed[2],
        text: namedTimed[3].trim()
      });
      return;
    }
    const namedColon = line.match(namedColonRe);
    if (namedColon) {
      const classified = ridaClassifySpeakerLabel(namedColon[1], guestName);
      entries.push({
        label: classified.label,
        role: classified.role,
        time: '',
        text: namedColon[2].trim()
      });
      return;
    }
    entries.push({ label: '', role: 'guest', time: '', text: line });
  });

  if (!entries.length) {
    return '<div class="ep-transcript-para"><div class="ep-transcript-text">Transcript could not be parsed.</div></div>';
  }

  return entries.map(entry => {
    const roleClass = entry.role === 'host' ? 'ep-ts-host' : (entry.role === 'intro' ? 'ep-ts-intro' : 'ep-ts-guest');
    const badgeClass = entry.role === 'host' ? 'ep-ts-host-badge' : (entry.role === 'intro' ? 'ep-ts-intro-badge' : 'ep-ts-guest-badge');
    const meta = entry.label || entry.time
      ? `<div class="ep-ts-meta">${entry.label ? `<span class="ep-transcript-speaker ${badgeClass}">${ridaEscapeHtml(entry.label)}</span>` : ''}${entry.time ? `<span class="ep-transcript-time">${ridaEscapeHtml(entry.time)}</span>` : ''}</div>`
      : '';
    return `<div class="ep-transcript-para ${roleClass}">${meta}<div class="ep-transcript-text">${ridaEscapeHtml(entry.text)}</div></div>`;
  }).join('');
}

async function ridaLoadTranscript(containerId, transcriptUrl, title, guestName) {
  const container = document.getElementById(containerId);
  if (!container || !transcriptUrl) return;

  container.innerHTML = `<div class="ep-transcript-loading"><div class="ep-transcript-spinner"></div><span>Loading transcript...</span></div>`;

  try {
    const text = await ridaFetchTextContent(transcriptUrl);
    const html = ridaFormatTranscript(text, guestName);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const readMins = Math.max(1, Math.round(wordCount / 200));
    container.innerHTML = `
      <div class="ep-transcript-header">
        <div>
          <h3>Full Transcript</h3>
          <p style="font-size:.75rem;color:var(--text-3);margin-top:4px;">~${wordCount.toLocaleString()} words · ${readMins} min read</p>
        </div>
        <div class="ep-transcript-actions">
          <div class="ep-transcript-search">
            <svg viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M9.5 9.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input type="text" id="${containerId}-search" placeholder="Search transcript..." autocomplete="off">
          </div>
          <button class="ep-transcript-dl" id="${containerId}-download">
            <svg viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Download
          </button>
        </div>
      </div>
      <div class="ep-transcript-body" id="${containerId}-body">${html}</div>
      <button class="ep-transcript-expand" id="${containerId}-expand">Show full transcript ↓</button>
    `;

    const body = document.getElementById(`${containerId}-body`);
    const expandBtn = document.getElementById(`${containerId}-expand`);
    const searchInput = document.getElementById(`${containerId}-search`);
    const downloadBtn = document.getElementById(`${containerId}-download`);
    let expanded = false;
    const baseHtml = html;

    if (expandBtn && body) {
      expandBtn.addEventListener('click', () => {
        expanded = !expanded;
        body.style.maxHeight = expanded ? 'none' : '560px';
        expandBtn.textContent = expanded ? 'Collapse transcript ↑' : 'Show full transcript ↓';
      });
    }

    if (searchInput && body) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        if (!q) {
          body.innerHTML = baseHtml;
          return;
        }
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        body.innerHTML = baseHtml.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="ep-transcript-highlight">$1</mark>');
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${ridaSlugify(title || 'transcript')}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }
  } catch (e) {
    console.warn('RIDA Sheets: Could not load transcript', e);
    const isDrive = ridaIsGoogleDriveUrl(transcriptUrl);
    const proxyMissing = isDrive && !RIDA_APPS_SCRIPT_PROXY;
    container.innerHTML = proxyMissing
      ? `<div class="ep-transcript-unavailable" style="text-align:left;padding:28px 24px;">
          <p style="font-weight:700;color:var(--text);margin-bottom:10px;">&#128274; One-time proxy setup needed</p>
          <p style="margin-bottom:14px;">Google Drive blocks direct browser fetches (CORS). A small Apps Script proxy fixes this permanently.</p>
          <ol style="font-size:.83rem;color:var(--text-2);line-height:1.9;padding-left:20px;margin-bottom:16px;">
            <li>Open <a href="https://script.google.com" target="_blank" rel="noopener" style="color:var(--accent)">script.google.com</a> &rarr; <b>New Project</b></li>
            <li>Delete the default code and paste the contents of <code style="background:var(--bg-elevated);padding:1px 5px;border-radius:3px;">data/proxy.gs</code></li>
            <li>Click <b>Deploy</b> &rarr; <b>New Deployment</b> &rarr; Type: <b>Web app</b></li>
            <li>Set <b>Execute as: Me</b>, <b>Who has access: Anyone</b> &rarr; Deploy</li>
            <li>Copy the Web App URL and paste it into <code style="background:var(--bg-elevated);padding:1px 5px;border-radius:3px;">RIDA_APPS_SCRIPT_PROXY</code> in <code style="background:var(--bg-elevated);padding:1px 5px;border-radius:3px;">data/sheets.js</code></li>
          </ol>
          <a href="${transcriptUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--bg-elevated);border:1px solid var(--border-2);border-radius:7px;font-size:.78rem;color:var(--text-2);">&#8599; Open transcript file directly</a>
        </div>`
      : `<div class="ep-transcript-unavailable">
          <p>Transcript couldn't be loaded. <a href="${transcriptUrl}" target="_blank" rel="noopener" style="color:var(--accent)">Open file directly &rarr;</a></p>
        </div>`;
  }
}

async function ridaLoadEventPopup() {
  try {
    const events = await ridaFetchSheet('events');
    if (!events.length) return;
    const flagged = events
      .filter(e => String(e.popup_banner || '').trim())
      .sort((a, b) => {
        const da = ridaParseDate(a.date_iso);
        const db = ridaParseDate(b.date_iso);
        return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
      });
    const ev = flagged[0];
    if (!ev) return;

    const bannerEl = document.getElementById('popupEventBanner');
    const popupEl = document.getElementById('ridaEventPopup');
    if (bannerEl) {
      const bannerValue = String(ev.popup_banner || '').trim();
      const bannerIsUrl = /^https?:\/\//i.test(bannerValue) || /drive\.google\.com/i.test(bannerValue);
      if (bannerIsUrl) {
        bannerEl.src = ridaDriveImg(bannerValue, 'w1200');
        bannerEl.alt = ev.title || 'Featured event banner';
        bannerEl.onclick = ev.register_url ? () => window.open(ev.register_url, '_blank', 'noopener') : null;
        bannerEl.style.cursor = ev.register_url ? 'pointer' : 'default';
        bannerEl.style.display = 'block';
      } else {
        bannerEl.style.display = 'none';
      }
    }
    if (popupEl && !sessionStorage.getItem(ridaPopupDismissKey())) {
      setTimeout(() => {
        popupEl.style.display = 'flex';
        popupEl.style.animation = 'ridaPopupIn 0.4s ease';
      }, 2500);
    }
  } catch (e) {
    console.warn('RIDA Sheets: Could not load event popup', e);
  }
}

window.ridaClosePopup = function ridaClosePopup() {
  const popup = document.getElementById('ridaEventPopup');
  if (popup) popup.style.display = 'none';
  sessionStorage.setItem(ridaPopupDismissKey(), '1');
};

async function ridaLoadReviewsGrid() {
  const grid = document.getElementById('rv-track') || document.getElementById('reviewsGrid');
  if (!grid) return;
  try {
    const rows = await ridaFetchSheet('reviews');
    if (!rows.length) { grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,.4);padding:60px 0">No reviews yet.</p>'; return; }

    // Expose globally so the page filter function can use it
    window.allReviews = rows;

    // Helper: resolve source from either column name variant
    const rSrcVal = r => (r.source || r.platform || '').trim();

    // Compute average rating
    const ratings = rows.map(r => parseFloat(r.rating) || 5).filter(Boolean);
    const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';
    const avgEl   = document.getElementById('rv-avg');
    const countEl = document.getElementById('rv-count');
    const starsEl = document.getElementById('rv-stars');
    if (avgEl) avgEl.textContent = avg;
    if (countEl) countEl.textContent = rows.length + '+';
    if (starsEl) {
      const fullStars = Math.round(parseFloat(avg));
      starsEl.textContent = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
      starsEl.style.visibility = 'visible';
    }

    const formatReviewDate = raw => {
      if (!raw) return '';
      let d = new Date(raw);
      if (Number.isNaN(d.getTime())) d = new Date(String(raw).replace(/\//g, '-'));
      if (Number.isNaN(d.getTime())) return String(raw).trim();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const reviewDate = r => {
      const direct = formatReviewDate((r.date || '').trim());
      if (direct) return direct;
      const source = rSrcVal(r);
      const match = source.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(\d{4})/i);
      if (!match) return '';
      return formatReviewDate(`${match[3]}-${match[1]}-${match[2]}`);
    };

    // Build source filter pills dynamically
    const sources = [...new Set(rows.map(rSrcVal).filter(Boolean))];
    const filtersEl = document.getElementById('rvFilters');
    if (filtersEl && sources.length) {
      const existing = filtersEl.querySelectorAll('.rv-filter:not([data-source="all"])');
      existing.forEach(el => el.remove());
      sources.forEach(src => {
        const btn = document.createElement('button');
        btn.className = 'rv-filter';
        btn.textContent = src;
        btn.setAttribute('data-source', src.toLowerCase());
        btn.onclick = function() { filterReviews(src.toLowerCase(), btn); };
        filtersEl.appendChild(btn);
      });
    }

    // Render all reviews
    if (typeof window.filterReviews === 'function') {
      window.filterReviews('all', document.querySelector('.rv-filter.active'));
    } else {
      grid.innerHTML = '<div class="rv-grid">' + rows.map(r => {
        const name    = (r.name || r.reviewer_name || '').trim();
        const source  = rSrcVal(r);
        const text    = (r.review || r.review_text || r.testimonial || '').trim();
        const rating  = Math.min(5, Math.max(1, parseInt(r.rating) || 5));
        const stars   = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const initials = (name || '?').split(' ').map(w => w[0] || '').join('').substring(0, 2).toUpperCase();
        const roleStr = [r.role, r.practice, r.location].filter(Boolean).join(' · ');
        const src = source.toLowerCase();
        const isWebinar = /webinar|rida|march/i.test(src);
        const srcKey = isWebinar ? 'webinar' : (src.replace(/\s+/g, '') || 'direct');
        const featured = /true|yes|1/i.test(r.featured || '');
        const dateStr = reviewDate(r);
        return `<div class="rv-card${featured ? ' rv-card--featured' : ''}${isWebinar ? ' rv-card--webinar' : ''}">
          <div class="rv-stars">${stars}</div>
          <p class="rv-text">${ridaEscapeHtml(text)}</p>
          <div class="rv-author">
            <div class="rv-initial">${ridaEscapeHtml(initials)}</div>
            <div class="rv-author-info">
              <div class="rv-name">${ridaEscapeHtml(name || 'Anonymous')}</div>
              ${roleStr ? `<div class="rv-role">${ridaEscapeHtml(roleStr)}</div>` : ''}
              ${source ? `<span class="rv-source rv-source-${srcKey}">${ridaEscapeHtml(source)}</span>` : ''}
            </div>
            ${dateStr ? `<div class="rv-date"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${ridaEscapeHtml(dateStr)}</div>` : ''}
          </div>
        </div>`;
      }).join('') + '</div>';
    }
  } catch (e) {
    console.warn('RIDA Sheets: Could not load reviews', e);
    grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,.4);padding:60px 0">Reviews could not be loaded.</p>';
  }
}

async function ridaLoadEventsGrid() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;
  try {
    const events = await ridaFetchSheet('events');
    if (!events.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,.4);padding:32px">No upcoming events.</div>';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = events.filter(ev => {
      const d = ridaParseDate(ev.date_iso);
      return d && d >= today;
    });
    const list = upcoming.length ? upcoming : events.slice(-4);

    const calSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const clockSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

    grid.innerHTML = list.map((ev, idx) => {
      const featured  = idx === 0;
      const dateLabel = ev.day && ev.month_year ? `${ev.day} ${ev.month_year}` : (ev.date_iso || '');
      const typeLabel = ridaEscapeHtml(ev.type || ev.category || 'Webinar');
      const speakers  = ridaParseEventSpeakers(ev.image_urls || ev.image_url || '');

      if (featured) {
        // ── Featured / next-up card ──────────────────────────────────────
        const portraitsHtml = speakers.length ? speakers.map(s => `
          <div class="ev-portrait">
            <div class="ev-portrait-img">
              ${s.photo ? `<img src="${ridaEscapeHtml(s.photo)}" alt="${ridaEscapeHtml(s.name)}" loading="lazy" style="object-position:${ridaEscapeHtml(ridaEventSpeakerObjectPosition(s.name))}" onerror="this.closest('.ev-portrait').style.display='none'">` : ''}
            </div>
            <span class="ev-portrait-name">${ridaEscapeHtml(s.name)}</span>
          </div>`).join('') : '';

        return `<div class="event-card event-card--featured">
          <div class="ev-featured-media">
            <div class="ev-featured-badge">Next Up</div>
            ${portraitsHtml ? `<div class="ev-portraits">${portraitsHtml}</div>` : '<div class="ev-featured-placeholder"></div>'}
          </div>
          <div class="ev-featured-body">
            <div class="ev-featured-head">
              <span class="event-tag">${typeLabel}</span>
              <span class="event-card-date">${ridaEscapeHtml(dateLabel)}${ev.time ? ' · ' + ridaEscapeHtml(ev.time) : ''}</span>
            </div>
            <h2 class="ev-featured-title">${ridaEscapeHtml(ev.title)}</h2>
            <p class="ev-featured-desc">${ridaEscapeHtml(ev.description || '').replace(/\n/g, '<br>')}</p>
            <a href="${ridaEscapeHtml(ev.register_url || '#')}" target="_blank" rel="noopener" class="event-cta event-cta--lg">Register Now →</a>
          </div>
        </div>`;
      }

      // ── Regular card ────────────────────────────────────────────────────
      const speakersHtml = speakers.length ? `
        <div class="ev-speakers">
          ${speakers.map(s => `
            <div class="ev-speaker">
              <div class="ev-speaker-photo">
                ${s.photo ? `<img src="${ridaEscapeHtml(s.photo)}" alt="${ridaEscapeHtml(s.name)}" loading="lazy" style="object-position:${ridaEscapeHtml(ridaEventSpeakerObjectPosition(s.name))}" onerror="this.style.display='none'">` : ''}
              </div>
              <span class="ev-speaker-name">${ridaEscapeHtml(s.name)}</span>
            </div>`).join('')}
        </div>` : '';

      return `<div class="event-card">
        <div class="event-card-head">
          <span class="event-tag">${typeLabel}</span>
          <span class="event-card-date">${ridaEscapeHtml(dateLabel)}${ev.time ? ' · ' + ridaEscapeHtml(ev.time) : ''}</span>
        </div>
        <div class="event-card-body">
          <h3>${ridaEscapeHtml(ev.title)}</h3>
          <p class="event-description">${ridaEscapeHtml(ev.description || '').replace(/\n/g, '<br>')}</p>
          ${speakersHtml}
          <a href="${ridaEscapeHtml(ev.register_url || '#')}" target="_blank" rel="noopener" class="event-cta">Register Now →</a>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    console.warn('RIDA Sheets: Could not load events grid', e);
  }
}

async function ridaLoadLatestPodcastSection() {
  const card = document.getElementById('latestEpisodeCard');
  if (!card) return;
  try {
    const episodes = ridaSortPodcastEpisodes(await ridaFetchSheet('podcast'));
    if (!episodes.length) return;
    const latest = episodes[episodes.length - 1];
    const episodeHref = ridaPodcastHref(latest);
    const numberEl = document.getElementById('latestEpisodeNumber');
    const titleEl = document.getElementById('latestEpisodeTitle');
    const guestEl = document.getElementById('latestEpisodeGuest');
    const descEl = document.getElementById('latestEpisodeDescription');
    const visualEl = document.getElementById('latestEpisodeVisual');
    const playerWrap = document.getElementById('latestEpisodePlayerWrap') || card.querySelector('.ep-audio-wrap');
    const linksWrap = card.querySelector('.episode-links');

    if (visualEl) {
      visualEl.innerHTML = ridaPodcastBannerMarkup(latest, { featured: true }) || '';
      visualEl.style.display = visualEl.innerHTML ? 'block' : 'none';
    }
    if (numberEl) numberEl.textContent = `Episode ${latest.episode}`;
    if (titleEl) titleEl.textContent = latest.title || 'Latest Episode';
    if (guestEl) guestEl.textContent = latest.guest_name ? `Guest: ${latest.guest_name}` : 'Latest RID Academy episode';
    // Description is hidden from latest episode card - remove this to show it
    if (descEl) descEl.style.display = 'none';

    if (playerWrap) {
      if (latest.audio_source) {
        const markup = ridaLandingEpisodeAudioMarkup(latest);
        playerWrap.innerHTML = markup;
        ridaInitAudioPlayers(playerWrap);
      } else {
        playerWrap.innerHTML = '';
      }
    }

    if (linksWrap) {
      linksWrap.innerHTML = `
        <a class="episode-link" href="${episodeHref}">Open Episode Page →</a>
        ${latest.apple_url ? `<a class="episode-link" href="${latest.apple_url}" target="_blank" rel="noopener">Apple Podcasts</a>` : ''}
        ${latest.spotify_url ? `<a class="episode-link" href="${latest.spotify_url}" target="_blank" rel="noopener">Spotify</a>` : ''}
      `;
    }
  } catch (e) {
    console.warn('RIDA Sheets: Could not load latest podcast section', e);
  }
}

async function ridaLoadHomeLatestPodcast() {
  const card = document.getElementById('homeLatestPodcastCard');
  if (!card) return;
  try {
    const episodes = ridaSortPodcastEpisodes(await ridaFetchSheet('podcast'));
    if (!episodes.length) return;

    const latest = episodes[episodes.length - 1];
    const episodeHref = ridaPodcastHref(latest);
    const eyebrowEl = document.getElementById('homeLatestPodcastEyebrow');
    const titleEl = document.getElementById('homeLatestPodcastTitle');
    const metaEl = document.getElementById('homeLatestPodcastMeta');
    const playerWrap = document.getElementById('homeLatestPodcastPlayerWrap');
    const linksWrap = document.getElementById('homeLatestPodcastLinks');

    if (eyebrowEl) eyebrowEl.textContent = `Latest Episode · Ep ${latest.episode || ''}`;
    if (titleEl) titleEl.textContent = latest.title || 'Latest Episode';
    if (metaEl) {
      const metaParts = [];
      if (latest.date) metaParts.push(latest.date);
      if (latest.guest_name) metaParts.push(latest.guest_name);
      metaEl.textContent = metaParts.join(' · ') || 'Latest RID Academy episode';
    }

    if (playerWrap) {
      const homeAudioSrc = ridaPodcastAudioSrc(latest.audio_source || '');
      const homeAudioMarkup = homeAudioSrc
        ? (ridaIsDirectAudioFile(homeAudioSrc)
          ? `<audio class="home-podcast-audio" controls><source src="${ridaEscapeHtml(homeAudioSrc)}" type="audio/mpeg"></audio>`
          : ridaMiniAudioMarkup(latest))
        : '<div style="color:rgba(255,255,255,.6);font-size:.9rem;">Audio unavailable for this episode.</div>';
      playerWrap.innerHTML = `
        <div class="pod-player-lbl">Play episode</div>
        ${homeAudioMarkup}
      `;
      if (!ridaIsDirectAudioFile(homeAudioSrc)) {
        ridaInitAudioPlayers(playerWrap);
      }
    }

    if (linksWrap) {
      linksWrap.innerHTML = `
        <a href="${episodeHref}" class="l-chip">Open Episode</a>
        ${latest.apple_url ? `<a href="${latest.apple_url}" class="l-chip" target="_blank" rel="noopener">Apple Podcasts</a>` : ''}
        ${latest.spotify_url ? `<a href="${latest.spotify_url}" class="l-chip" target="_blank" rel="noopener">Spotify</a>` : ''}
        ${latest.youtube_url ? `<a href="${latest.youtube_url}" class="l-chip" target="_blank" rel="noopener">YouTube</a>` : ''}
      `;
    }
  } catch (e) {
    console.warn('RIDA Sheets: Could not load home latest podcast', e);
  }
}

async function ridaLoadPodcastGrid() {
  const grid = document.getElementById('episodesGrid');
  if (!grid) return;
  try {
    const episodes = ridaSortPodcastEpisodes(await ridaFetchSheet('podcast'));
    if (!episodes.length) return;

    const all = episodes.slice().reverse();
    const perPage = 6;
    let currentPage = 0;
    const totalPages = () => Math.max(1, Math.ceil(all.length / perPage));

    const render = () => {
      const start = currentPage * perPage;
      const pageEps = all.slice(start, start + perPage);
      grid.innerHTML = pageEps.map(ep => `
        <a class="ep-card" href="${ridaPodcastHref(ep)}">
          ${ridaPodcastBannerMarkup(ep, { compact: true }) || (ep.thumbnail_url ? `<div class="ep-card-thumb" style="height:140px;overflow:hidden;background:var(--bg-subtle);border-bottom:1px solid var(--border);"><img src="${ridaEscapeHtml(ep.thumbnail_url)}" alt="" style="width:100%;height:100%;object-fit:cover;" loading="lazy"></div>` : '')}
          <div class="ep-card-top">
            <span class="ep-num">Ep ${ridaEscapeHtml(ep.episode)}</span>
            <span class="ep-date">${ridaEscapeHtml(ep.date || '')}</span>
          </div>
          <div class="ep-card-body">
            <h3 class="ep-title">${ridaEscapeHtml(ep.title)}</h3>
            ${ep.guest_name ? `<p class="ep-guest">with ${ridaEscapeHtml(ep.guest_name)}</p>` : '<p class="ep-guest">&nbsp;</p>'}
            <span class="ep-listen">Open episode →</span>
          </div>
        </a>
      `).join('');

      const dots = document.getElementById('carouselDots');
      if (dots) {
        dots.innerHTML = Array.from({ length: totalPages() }, (_, i) => `<button class="carousel-dot ${i === currentPage ? 'active' : ''}" data-page="${i}"></button>`).join('');
        dots.querySelectorAll('.carousel-dot').forEach(dot => {
          dot.addEventListener('click', () => {
            currentPage = parseInt(dot.dataset.page, 10);
            render();
          });
        });
      }

      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      if (prevBtn) prevBtn.disabled = currentPage === 0;
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages() - 1;
    };

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) {
      const newPrev = prevBtn.cloneNode(true);
      prevBtn.parentNode.replaceChild(newPrev, prevBtn);
      newPrev.addEventListener('click', () => {
        if (currentPage > 0) {
          currentPage -= 1;
          render();
        }
      });
    }
    if (nextBtn) {
      const newNext = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNext, nextBtn);
      newNext.addEventListener('click', () => {
        if (currentPage < totalPages() - 1) {
          currentPage += 1;
          render();
        }
      });
    }

    render();
    await ridaLoadLatestPodcastSection();
  } catch (e) {
    console.warn('RIDA Sheets: Could not load podcast grid', e);
  }
}

async function ridaLoadEpisodePage() {
  const heroEl = document.getElementById('ep-hero-content');
  if (!heroEl) return;
  try {
    const params = new URLSearchParams(window.location.search);
    const targetEpisode = params.get('ep');
    const rows = ridaSortPodcastEpisodes(await ridaFetchSheet('podcast'));
    if (!rows.length) throw new Error('No episodes found');

    const all = rows.slice().reverse();
    const index = all.findIndex(ep => String(ep.episode) === String(targetEpisode));
    const ep = index > -1 ? all[index] : all[0];
    const prev = index > -1 ? all[index + 1] : null;
    const next = index > -1 ? all[index - 1] : null;

    document.title = `${ep.title} | Podcast Episode | RID Academy`;
    heroEl.innerHTML = `
      <div class="ep-hero-layout">
        <div class="ep-hero-copy">
          <div class="ep-num-badge">Episode ${ridaEscapeHtml(ep.episode)}</div>
          <h1 class="ep-hero-title">${ridaEscapeHtml(ep.title)}</h1>
          <div class="ep-meta-tags">
            ${ep.guest_name ? `<span class="ep-tag">Guest: ${ridaEscapeHtml(ep.guest_name)}</span>` : ''}
            ${ep.date ? `<span class="ep-tag">${ridaEscapeHtml(ep.date)}</span>` : ''}
          </div>
        </div>
        ${ridaGuestHeroMarkup(ep)}
      </div>
    `;

    const shareBar = document.getElementById('ep-share-bar');
    if (shareBar) {
      shareBar.style.display = 'block';
      const pageUrl = encodeURIComponent(window.location.href);
      const pageTitle = encodeURIComponent(ep.title);
      const fb = document.getElementById('share-fb');
      const tw = document.getElementById('share-tw');
      const li = document.getElementById('share-li');
      if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      if (tw) tw.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
      if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
    }

    // Audio source takes priority; Spotify embed as fallback
    if (ep.audio_source) {
      const audioSection = document.getElementById('ep-audio-section');
      const audioWrap    = document.getElementById('ep-audio-wrap') || (audioSection ? audioSection.querySelector('.ep-audio-wrap') : null);
      if (audioSection && audioWrap) {
        audioSection.style.display = 'block';
        audioWrap.innerHTML = ridaPodcastAudioMarkup(ep);
        ridaInitAudioPlayers(audioWrap);
      }
    } else if (ep.spotify_url) {
      const spotifySection = document.getElementById('ep-embed-section');
      const spotifyFrame = document.getElementById('ep-spotify-iframe');
      if (spotifySection && spotifyFrame) {
        spotifySection.style.display = 'block';
        spotifyFrame.src = ep.spotify_url;
      }
    }

    const parsed = ridaParseDescriptionBlocks(ep.description);

    // ① Overview / intro paragraphs
    const overviewWrap = document.getElementById('ep-overview-wrap');
    if (overviewWrap && parsed.intro.length) {
      overviewWrap.style.display = 'block';
      overviewWrap.innerHTML = parsed.intro
        .map(p => `<p class="ep-overview-para">${ridaEscapeHtml(p)}</p>`)
        .join('');
    }

    // ② Key Takeaways cards (when structured description)
    const takeawaysWrap  = document.getElementById('ep-takeaways-wrap');
    const takeawaysList  = document.getElementById('ep-takeaways-list');
    const keypointsWrap  = document.getElementById('ep-keypoints-wrap');
    if (takeawaysWrap && takeawaysList && parsed.takeaways.length) {
      takeawaysWrap.style.display = 'block';
      if (keypointsWrap) keypointsWrap.style.display = 'none';
      takeawaysList.innerHTML = parsed.takeaways.map(item => `
        <div class="ep-takeaway-card">
          <div class="ep-takeaway-title">${ridaEscapeHtml(item.title)}</div>
          ${item.desc ? `<div class="ep-takeaway-desc">${ridaEscapeHtml(item.desc)}</div>` : ''}
        </div>`).join('');
    } else {
      // Fallback: simple bulleted list
      const keyList = document.getElementById('ep-keypoints-list');
      if (keyList) {
        keyList.innerHTML = parsed.keyPoints.length
          ? parsed.keyPoints.map(point => `<li>${ridaEscapeHtml(point)}</li>`).join('')
          : '<li>Show notes will be added soon.</li>';
      }
    }

    const bioWrap = document.getElementById('ep-bio-wrap');
    const bioHeading = document.getElementById('ep-bio-heading');
    const bioList = document.getElementById('ep-bio-list');
    if (bioWrap && bioList && parsed.bioPoints.length) {
      bioWrap.style.display = 'block';
      if (bioHeading) bioHeading.textContent = parsed.bioTitle || `More About ${ep.guest_name || 'the Guest'}`;
      bioList.innerHTML = parsed.bioPoints.map(point => `<li>${ridaEscapeHtml(point)}</li>`).join('');
    }

    const contacts = ridaParseContactInfo(ep.contact_info);
    const connectWrap = document.getElementById('ep-connect-wrap');
    const connectName = document.getElementById('ep-connect-name');
    const connectGrid = document.getElementById('ep-connect-grid');
    if (connectWrap && connectGrid && contacts.length) {
      connectWrap.style.display = 'block';
      if (connectName) connectName.textContent = ep.guest_name || 'our guest';
      connectGrid.innerHTML = contacts.map(item => {
        const type = item.type.toLowerCase();
        let href = item.value;
        if (type.includes('email') && !href.startsWith('mailto:')) href = `mailto:${href}`;
        if (type.includes('phone') && !href.startsWith('tel:')) href = `tel:${href.replace(/[^\d+]/g, '')}`;
        if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) href = `https://${href}`;
        return `<a href="${href}" target="_blank" rel="noopener" class="ep-connect-item"><span><span class="ep-connect-val">${ridaEscapeHtml(item.value)}</span><span class="ep-connect-type">${ridaEscapeHtml(item.type)}</span></span></a>`;
      }).join('');
    }

    const body = document.getElementById('ep-body');
    if (body) body.style.display = 'block';

    await ridaLoadTranscript('ep-transcript-content', ep.transcript_url, ep.title, ep.guest_name);

    const navSection = document.getElementById('ep-nav-section');
    const prevNext = document.getElementById('ep-prev-next');
    if (navSection && prevNext) {
      navSection.style.display = 'block';
      const prevCard = prev
        ? `<a href="?ep=${encodeURIComponent(prev.episode)}" class="ep-nav-card"><div class="ep-nav-dir">← Previous Episode</div><div class="ep-nav-ep">Episode ${ridaEscapeHtml(prev.episode)}</div><div class="ep-nav-title">${ridaEscapeHtml(prev.title)}</div></a>`
        : `<div class="ep-nav-card ep-nav-placeholder"><div class="ep-nav-dir">← Previous</div><div class="ep-nav-title">This is the oldest available episode.</div></div>`;
      const nextCard = next
        ? `<a href="?ep=${encodeURIComponent(next.episode)}" class="ep-nav-card ep-nav-right"><div class="ep-nav-dir">Next Episode →</div><div class="ep-nav-ep">Episode ${ridaEscapeHtml(next.episode)}</div><div class="ep-nav-title">${ridaEscapeHtml(next.title)}</div></a>`
        : `<div class="ep-nav-card ep-nav-right ep-nav-placeholder"><div class="ep-nav-dir">Next →</div><div class="ep-nav-title">This is the latest episode.</div></div>`;
      prevNext.innerHTML = prevCard + nextCard;
    }
  } catch (e) {
    console.warn('RIDA Sheets: Could not load episode page', e);
    heroEl.innerHTML = `<div class="ep-not-found"><h2>Could Not Load Episode</h2><p>Please try again in a moment.</p><a href="/podcast" class="ep-cta-btn">Browse Podcast →</a></div>`;
  }
}

async function ridaLoadWebinarsGrid() {
  try {
    const rows = await ridaFetchSheet('webinars');
    const sheetWebinars = rows.map(ridaNormalizeWebinarRow);
    window.RIDA_WEBINARS = ridaMergeWebinars(sheetWebinars);
    document.dispatchEvent(new CustomEvent('ridaDataReady'));

    if (typeof renderWebinars === 'function') renderWebinars('all');
  } catch (e) {
    console.warn('RIDA Sheets: Could not load webinars', e);
    window.RIDA_WEBINARS = ridaMergeWebinars([]);
    document.dispatchEvent(new CustomEvent('ridaDataReady'));
    if (typeof renderWebinars === 'function') renderWebinars('all');
  }
}

async function ridaLoadWebinarPage() {
  const hero = document.getElementById('wb-hero-content');
  if (!hero) return;
  try {
    const params = new URLSearchParams(window.location.search);
    const titleParam = params.get('title');
    let rows = [];
    try {
      rows = await ridaFetchSheet('webinars');
    } catch (sheetError) {
      console.warn('RIDA Sheets: Could not fetch webinar rows, using fallback data', sheetError);
    }

    const webinars = ridaMergeWebinars(rows.map(ridaNormalizeWebinarRow));
    if (!webinars.length) throw new Error('No webinars found');

    const webinar = webinars.find(item => ridaSlugify(item.title) === ridaSlugify(titleParam)) || webinars[0];
    const replayLabel = webinar.category === 'summit' ? 'Summit Replay' : 'Webinar Replay';
    document.title = `${webinar.title} | ${replayLabel} | RID Academy`;

    hero.innerHTML = `
      <nav class="breadcrumb" aria-label="breadcrumb">
        <a href="/webinars">Webinar Archive</a>
        <span aria-hidden="true"> / </span>
        <span>${ridaEscapeHtml(webinar.title.length > 48 ? webinar.title.substring(0, 48) + '…' : webinar.title)}</span>
      </nav>
      <div class="ep-num-badge">${ridaEscapeHtml(replayLabel)}</div>
      <h1 class="ep-hero-title">${ridaEscapeHtml(webinar.title)}</h1>
      <div class="ep-meta-tags">
        ${webinar.category ? `<span class="ep-tag">${ridaEscapeHtml(ridaWebinarCategoryLabel(webinar.category))}</span>` : ''}
        ${webinar.date    ? `<span class="ep-tag">${ridaEscapeHtml(webinar.date)}</span>`     : ''}
        ${webinar.duration? `<span class="ep-tag">${ridaEscapeHtml(webinar.duration)}</span>` : ''}
      </div>
      ${webinar.presenter ? `<p class="wb-presenter-line"><span class="wb-presenter-badge">Presenter</span>&nbsp;${ridaEscapeHtml(webinar.presenter)}</p>` : ''}
    `;

    const shareBar = document.getElementById('wb-share-bar');
    if (shareBar) {
      shareBar.style.display = 'block';
      const pageUrl = encodeURIComponent(window.location.href);
      const pageTitle = encodeURIComponent(webinar.title);
      const fb = document.getElementById('share-fb');
      const tw = document.getElementById('share-tw');
      const li = document.getElementById('share-li');
      if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      if (tw) tw.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
      if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
    }

    ridaRenderWebinarSidebarMeta(webinar);

    const videoWrap = document.getElementById('wb-video-embed');
    const videoSection = document.getElementById('wb-video-section');
    const hasPlaylist = Array.isArray(webinar.clips) && webinar.clips.length > 0;
    if (videoWrap && videoSection && !hasPlaylist) {
      const embedMarkup = ridaVideoEmbedMarkup(webinar);
      if (embedMarkup) {
        videoWrap.innerHTML = embedMarkup;
      } else {
        videoWrap.innerHTML = `<div class="ep-transcript-unavailable"><p>Replay video is not available for this webinar yet.</p></div>`;
      }
      videoSection.style.display = 'block';
    } else if (videoSection) {
      videoSection.style.display = 'block';
    }

    const summary = document.getElementById('wb-summary');
    const summaryBlock = document.getElementById('wb-summary-block');

    // Parse description into structured blocks
    const wbParsed = ridaParseDescriptionBlocks(webinar.description);

    // Populate summary text (first intro line or full description)
    if (summary) {
      const summaryText = wbParsed.intro.length
        ? wbParsed.intro[0]
        : (webinar.description || 'Detailed webinar notes and transcript are available below.');
      summary.textContent = summaryText;
      if (summaryBlock && summaryText) summaryBlock.style.display = 'block';
    }

    // ① Overview / intro paragraphs
    const wbOverviewWrap = document.getElementById('wb-overview-wrap');
    if (wbOverviewWrap && wbParsed.intro.length) {
      wbOverviewWrap.style.display = 'block';
      wbOverviewWrap.innerHTML = wbParsed.intro
        .map(p => `<p class="ep-overview-para">${ridaEscapeHtml(p)}</p>`)
        .join('');
    }

    // ② Key Takeaways cards
    const wbTakeawaysWrap = document.getElementById('wb-takeaways-wrap');
    const wbTakeawaysList = document.getElementById('wb-takeaways-list');
    if (wbTakeawaysWrap && wbTakeawaysList && wbParsed.takeaways.length) {
      wbTakeawaysWrap.style.display = 'block';
      wbTakeawaysList.innerHTML = wbParsed.takeaways.map(item => `
        <div class="ep-takeaway-card">
          <div class="ep-takeaway-title">${ridaEscapeHtml(item.title)}</div>
          ${item.desc ? `<div class="ep-takeaway-desc">${ridaEscapeHtml(item.desc)}</div>` : ''}
        </div>`).join('');
    } else if (wbParsed.keyPoints.length) {
      // Fallback: render as a simple bullet list inside wb-notes-content
      const wbFallbackList = document.getElementById('wb-keypoints-list');
      const wbFallbackWrap = document.getElementById('wb-keypoints-wrap');
      if (wbFallbackList && wbFallbackWrap) {
        wbFallbackWrap.style.display = 'block';
        wbFallbackList.innerHTML = wbParsed.keyPoints
          .map(pt => `<li>${ridaEscapeHtml(pt)}</li>`)
          .join('');
      }
    }

    const notes = document.getElementById('wb-notes-content');
    if (notes) {
      if (webinar.description_doc_url) {
        notes.innerHTML = `<div class="ep-transcript-loading"><div class="ep-transcript-spinner"></div><span>Loading webinar notes...</span></div>`;
        try {
          const docText = await ridaFetchTextContent(webinar.description_doc_url);
          const docSection = ridaExtractWebinarDocSection(docText, webinar);
          const overviewSummary = webinar.description || ridaExtractOverviewSummary(docSection);
          if (summary && overviewSummary) summary.textContent = overviewSummary;
          notes.innerHTML = `
            <div class="wb-doc-actions">
              <span class="wb-doc-label">Replay Notes</span>
            </div>
            <div class="wb-rich-text">${ridaFormatDocHtml(docSection)}</div>
          `;
        } catch (e) {
          console.warn('RIDA Sheets: Could not load webinar notes', e);
          notes.innerHTML = `<div class="ep-transcript-unavailable"><p>Replay notes could not be loaded automatically.</p></div>`;
        }
      } else if (hasPlaylist) {
        notes.innerHTML = `
          <div class="wb-doc-actions">
            <span class="wb-doc-label">Replay Overview</span>
          </div>
          <div class="wb-rich-text">
            <h3 class="wb-rich-heading">How to use this replay</h3>
            <p>This full replay is arranged in summit order so you can watch it straight through or jump directly to a session from the replay timeline.</p>
            <ul class="wb-rich-list">
              <li>Use the timeline in the sidebar to move between keynote talks, featured segments, and panel discussions.</li>
              <li>Keep your place with the ordered clip sequence shown throughout the page.</li>
              <li>Come back to specific sessions later without scrubbing through one long recording.</li>
            </ul>
          </div>
        `;
      } else {
        notes.innerHTML = `<div class="ep-transcript-unavailable"><p>Replay notes are not available for this webinar yet.</p></div>`;
      }
    }

    const body = document.getElementById('wb-body');
    if (body) body.style.display = 'block';

    if (hasPlaylist) {
      ridaRenderWebinarPlaylist(webinar);
    }

    if (!hasPlaylist || webinar.transcript_url) {
      // Use real presenter name for speaker badge; fall back to 'Webinar Guest'
      const wbGuestName = webinar.presenter || 'Webinar Guest';
      await ridaLoadTranscript('wb-transcript-content', webinar.transcript_url, webinar.title, wbGuestName);
    }
  } catch (e) {
    console.warn('RIDA Sheets: Could not load webinar page', e);
    hero.innerHTML = `<div class="ep-not-found"><h2>Could Not Load Webinar</h2><p>Please try again in a moment.</p><a href="/webinars" class="ep-cta-btn">Back to Webinar Archive →</a></div>`;
  }
}

(function () {
  const path = window.location.pathname;

  if (document.getElementById('ridaEventPopup')) {
    ridaLoadEventPopup();
  }

  if (path.includes('podcast-episode')) {
    ridaLoadEpisodePage();
  } else if (path.includes('webinar-archive')) {
    ridaLoadWebinarsGrid();
  } else if (path.includes('webinar')) {
    ridaLoadWebinarPage();
  } else if (path.includes('events')) {
    ridaLoadEventsGrid();
  } else if (path.includes('reviews')) {
    ridaLoadReviewsGrid();
  } else if (path.includes('podcast')) {
    ridaLoadPodcastGrid();
  }

  if (document.getElementById('homeLatestPodcastCard')) {
    ridaLoadHomeLatestPodcast();
  }
})();
