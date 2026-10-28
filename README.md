# Yakov Reels — Remotion Video Pipeline

Video automation & graphics pipeline for Yakov's Reels/TikTok content, powered by [Remotion](https://www.remotion.dev/).

---

## Project Structure

```text
├── 01_Inbox/          # Raw input videos (ignored from Git)
├── 02_Outbox/         # Output analyses, stills, QA reviews & rendered videos
│   ├── IG-9-RUS/      # Render reviews, stills, loudness & probe reports
│   ├── IG_Analys/     # Instagram account analysis (.md & .pdf)
│   └── TT_Analys/     # TikTok account audit (.md & .pdf)
└── motion/            # Remotion project (React + TypeScript)
    ├── public/
    │   ├── source.mp4 # Base video source for rendering
    │   └── sfx/       # Audio SFX assets
    ├── scripts/
    │   ├── finish.sh  # Loudness normalization & QA check script
    │   └── stills.mjs # Frame extraction script
    └── src/
        ├── Edit.tsx   # Video layout & cue rendering
        ├── Gfx.tsx    # Motion graphics & visual cards
        ├── Root.tsx   # Remotion composition definitions
        ├── theme.ts   # Typography, palette & styling
        └── timeline.ts# Word-level timing & cue triggers
```

---

## Quick Start (For Developers & AI Agents)

### 1. Requirements
- Node.js `>=20.19.0` (or `22.x`)
- FFmpeg (for `scripts/finish.sh` loudness normalization and QA)

### 2. Install Dependencies
```bash
cd motion
npm install
```

### 3. Run Remotion Studio (Preview)
```bash
npm run dev
```
Studio will open at `http://localhost:3000` with interactive timeline preview.

### 4. Build / Render
```bash
# Render via Remotion CLI
npm run build
```
To run the automated two-pass loudness normalization (`-14 LUFS / -1.5 dBTP`) and generate QA reports:
```bash
./scripts/finish.sh <raw_output.mp4> <final_output.mp4>
```
