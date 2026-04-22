# Scroll-Stop Landing Page Builder — Team Guide

> Apple-style scroll-driven landing page where a video plays frame-by-frame as the user scrolls.
> The video "stops" at key moments to show annotation cards with product highlights.

---

## Prerequisites

- Node.js + npm installed
- FFmpeg installed (`choco install ffmpeg` on Windows / `brew install ffmpeg` on Mac)
- A Next.js project (App Router) with Tailwind CSS
- Your MP4 video file (ideally 5–10 seconds, product on a clean/white background)

---

## Step 1 — Extract Frames

Run this in your terminal, replacing the paths:

```bash
mkdir -p public/scroll-stop/frames
ffmpeg -i "path/to/your-video.mp4" -vf "fps=15,scale=1920:-2" -q:v 2 public/scroll-stop/frames/frame_%04d.jpg
```

Count how many frames were created:

```bash
ls public/scroll-stop/frames | wc -l
```

> Update `FRAME_COUNT` in the component to match that number.

---

## Step 2 — Create the Component

Create `components/ScrollStopAnimation.tsx` with the code below.
**Only customize the `CARDS` array and `FRAME_COUNT`** — everything else is ready to go.

```tsx
"use client"

import { useEffect, useRef, useState } from "react"

// ── CUSTOMIZE THESE ──────────────────────────────────────────
const FRAME_COUNT = 120  // ← change to your actual frame count

const CARDS = [
  {
    number: "01",
    title: "Your First Feature",
    desc: "Describe your product's first key benefit here — keep it to 1–2 sentences.",
    statNumber: "500+",
    statLabel: "Stat Label",
    show: 0.10,   // scroll progress when card appears (0.0 = start, 1.0 = end)
    hide: 0.28,   // scroll progress when card disappears
  },
  {
    number: "02",
    title: "Second Feature",
    desc: "Describe the second key benefit.",
    statNumber: "100%",
    statLabel: "Stat Label",
    show: 0.30,
    hide: 0.48,
  },
  {
    number: "03",
    title: "Third Feature",
    desc: "Third benefit description.",
    statNumber: "24/7",
    statLabel: "Stat Label",
    show: 0.50,
    hide: 0.68,
  },
  {
    number: "04",
    title: "Fourth Feature",
    desc: "Fourth benefit description.",
    statNumber: "29",
    statLabel: "Stat Label",
    show: 0.72,
    hide: 0.92,
  },
]
// ─────────────────────────────────────────────────────────────

const HOLD_MS = 600
const SNAP_ZONE = 0.04

interface CardData {
  number: string; title: string; desc: string
  statNumber: string; statLabel: string; show: number; hide: number
}

export function ScrollStopAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [loadPct, setLoadPct] = useState(0)
  const [cardIdx, setCardIdx] = useState(-1)
  const frames = useRef<HTMLImageElement[]>([])
  const curFrame = useRef(-1)
  const snapped = useRef<boolean[]>(CARDS.map(() => false))
  const snapping = useRef(false)
  const snapTimeout = useRef<number>(0)

  // Preload all frames
  useEffect(() => {
    let n = 0
    const imgs: HTMLImageElement[] = []
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      img.src = `/scroll-stop/frames/frame_${String(i).padStart(4, "0")}.jpg`
      const tick = () => {
        n++
        setLoadPct(Math.round((n / FRAME_COUNT) * 100))
        if (n === FRAME_COUNT) { frames.current = imgs; setLoaded(true) }
      }
      img.onload = tick; img.onerror = tick; imgs.push(img)
    }
  }, [])

  function draw(index: number) {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext("2d"); if (!ctx) return
    const img = frames.current[index]
    if (!img?.complete || !img.naturalWidth) return
    const cw = c.width, ch = c.height
    if (!cw || !ch) return
    ctx.clearRect(0, 0, cw, ch)
    const ir = img.naturalWidth / img.naturalHeight
    const cr = cw / ch
    let dw: number, dh: number
    if (window.innerWidth > 768) {
      // Desktop: cover-fit
      if (cr > ir) { dw = cw; dh = cw / ir } else { dh = ch; dw = ch * ir }
    } else {
      // Mobile: zoomed contain
      const z = 1.2
      if (cr > ir) { dh = ch * z; dw = dh * ir } else { dw = cw * z; dh = dw / ir }
    }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
  }

  function sizeCanvas() {
    const c = canvasRef.current; if (!c) return
    const dpr = window.devicePixelRatio || 1
    c.width = window.innerWidth * dpr; c.height = window.innerHeight * dpr
    c.style.width = window.innerWidth + "px"; c.style.height = window.innerHeight + "px"
    if (curFrame.current >= 0) draw(curFrame.current)
  }

  useEffect(() => {
    if (!loaded) return
    sizeCanvas(); curFrame.current = 0; draw(0)
    window.addEventListener("resize", sizeCanvas)
    return () => window.removeEventListener("resize", sizeCanvas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  useEffect(() => {
    if (!loaded) return
    let ticking = false
    const blockWheel = (e: WheelEvent) => { if (snapping.current) e.preventDefault() }
    const blockTouch = (e: TouchEvent) => { if (snapping.current) e.preventDefault() }
    const blockKey = (e: KeyboardEvent) => {
      if (snapping.current && ["ArrowDown", "ArrowUp", " ", "PageDown", "PageUp"].includes(e.key))
        e.preventDefault()
    }
    window.addEventListener("wheel", blockWheel, { passive: false })
    window.addEventListener("touchmove", blockTouch, { passive: false })
    window.addEventListener("keydown", blockKey)

    const onScroll = () => {
      if (ticking) return; ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const sec = sectionRef.current; if (!sec) return
        const rect = sec.getBoundingClientRect()
        const scrollH = sec.offsetHeight - window.innerHeight
        if (scrollH <= 0) return
        const progress = Math.min(1, Math.max(0, -rect.top / scrollH))
        const fi = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT))
        if (fi !== curFrame.current) { curFrame.current = fi; draw(fi) }
        let activeCard = -1
        for (let i = 0; i < CARDS.length; i++) {
          if (progress >= CARDS[i].show && progress <= CARDS[i].hide) { activeCard = i; break }
        }
        setCardIdx(activeCard)
        if (!snapping.current) {
          for (let i = 0; i < CARDS.length; i++) {
            const entering = progress >= CARDS[i].show && progress < CARDS[i].show + SNAP_ZONE
            if (entering && !snapped.current[i]) {
              snapped.current[i] = true; snapping.current = true
              clearTimeout(snapTimeout.current)
              snapTimeout.current = window.setTimeout(() => { snapping.current = false }, HOLD_MS)
              break
            }
            if (progress < CARDS[i].show - 0.02) snapped.current[i] = false
          }
        }
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", blockWheel)
      window.removeEventListener("touchmove", blockTouch)
      window.removeEventListener("keydown", blockKey)
      clearTimeout(snapTimeout.current); snapping.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  return (
    <section ref={sectionRef} className="relative z-[2]" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black" style={{ zIndex: 2 }}>

        {/* Loading screen */}
        {!loaded && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-[3px] text-white/50 mb-4">
                Loading
              </p>
              <div className="w-[200px] h-[3px] bg-white/[0.08] rounded mx-auto overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded transition-[width] duration-200"
                  style={{ width: `${loadPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Frame canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Annotation cards */}
        {CARDS.map((card, i) => (
          <div
            key={card.number}
            style={{
              position: "absolute",
              bottom: "8vh",
              left: "5vw",
              maxWidth: 360,
              background: "rgba(0, 0, 0, 0.85)",        // ← dark so it reads on light video frames
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              borderRadius: 20,
              padding: 28,
              zIndex: 10,
              opacity: i === cardIdx ? 1 : 0,
              transform: i === cardIdx ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              pointerEvents: i === cardIdx ? "auto" as const : "none" as const,
            }}
          >
            {/* ← Replace #10b981 with your brand accent color */}
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#10b981", marginBottom: 8 }}>
              {card.number}
            </div>
            <h3 style={{ fontWeight: 600, fontSize: 18, color: "#fff", marginBottom: 8 }}>
              {card.title}
            </h3>
            <p
              className="hidden md:block"
              style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 16 }}
            >
              {card.desc}
            </p>
            <div className="hidden md:block">
              <span style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>
                {card.statNumber}
              </span>
              <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                {card.statLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

---

## Step 3 — Add to Your Page

Import and place it between your hero and the next section:

```tsx
import { ScrollStopAnimation } from "@/components/ScrollStopAnimation"

export default function Page() {
  return (
    // ⚠️ CRITICAL: NO overflow-x-hidden on this wrapper — it breaks sticky positioning
    <div className="bg-black text-white min-h-screen">

      {/* Hero section */}
      <section>...</section>

      {/* Scroll animation */}
      <ScrollStopAnimation />

      {/* Rest of page */}
      <section>...</section>

    </div>
  )
}
```

---

## Step 4 — Tuning the Cards

Match each card's `show`/`hide` to the key moments in your video.
The values are **scroll progress** from `0.0` (start of section) to `1.0` (end of section).

| Card | Appears at | Disappears at | Video moment |
|------|-----------|---------------|--------------|
| 01   | `0.10`    | `0.28`        | ~1 second in |
| 02   | `0.30`    | `0.48`        | ~2.5 seconds |
| 03   | `0.50`    | `0.68`        | ~4 seconds   |
| 04   | `0.72`    | `0.92`        | ~5.8 seconds |

To find the right values: divide the timestamp of each key moment by the total video duration.
For example, if your video is 8s and a key moment is at 2s → `2 / 8 = 0.25`.

---

## Step 5 — Customize Colors

Replace these two values throughout the component with your brand accent color:

| Find | Replace with |
|------|-------------|
| `#10b981` | Your accent color (e.g. `#6366f1` for purple) |
| `bg-black` / `rgba(0,0,0,0.85)` | Your background color |

---

## Key Rules — Do Not Break These

| Rule | Why it matters |
|------|---------------|
| **No `overflow-x-hidden` on any ancestor div** | Breaks `position: sticky` — video scrolls past instead of sticking |
| **Frame files at `/public/scroll-stop/frames/frame_0001.jpg`** | Component loads from this exact path |
| **`FRAME_COUNT` must match actual extracted frame count** | Otherwise loading never completes |
| **`show`/`hide` values between `0.0` and `1.0`** | Represent scroll progress — values outside this range won't trigger |
| **Cards never overlap** | Ensure one card's `hide` value is less than the next card's `show` value |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Video only shows first frame / rest is black | An ancestor has `overflow-x-hidden` — remove it |
| Scroll gets completely stuck | Remove any `overflow: hidden` from parent divs |
| Cards not showing | Check `show`/`hide` values — log `progress` in the scroll handler to find the right values |
| Video is choppy | Re-extract at lower fps: change `fps=15` to `fps=10` in the FFmpeg command |
| Frames blurry on Retina display | Already handled by `devicePixelRatio` scaling in `sizeCanvas()` |
| Loading bar never reaches 100% | Check frame files exist at the correct path and `FRAME_COUNT` matches |
| Cards readable on dark video but not light | Keep `background: "rgba(0,0,0,0.85)"` on cards — don't make it transparent |

---

## Adjusting Scroll Speed

The section height controls how fast/slow the video plays relative to scrolling:

```tsx
// In the return statement, change "400vh":
style={{ height: "400vh" }}  // default — comfortable pace
style={{ height: "300vh" }}  // faster scroll-through
style={{ height: "500vh" }}  // slower, more cinematic
```

---

## Adjusting Snap-Stop Duration

Change how long the scroll pauses at each card:

```tsx
const HOLD_MS = 600   // 600ms pause (default)
const HOLD_MS = 400   // shorter pause, less jarring
const HOLD_MS = 900   // longer pause, more dramatic
```
