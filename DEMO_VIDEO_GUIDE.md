# Demo Video Production Guide

**Status:** Pending - Need to record before launch

## Video Specs

- **Duration:** 30 seconds (perfect for Product Hunt)
- **Format:** GIF or WebM (small file size, good quality)
- **Resolution:** 1080p (1920x1080)
- **Frame rate:** 30fps
- **No audio** (pure visual showcase)

## What to Show

### Opening (0-3 seconds)
- App loading animation or instant open
- Main dashboard with all features visible

### Files View (3-8 seconds)
- Click "Files" in sidebar
- Show file tree with folder structure
- Type in search box: "agent" or "workspace"
- Show filtered results appearing instantly

### Kanban View (8-15 seconds)
- Click "Kanban" in sidebar
- Show 4 columns with colorful task cards
- Click a card to see it expand
- Show tags (revenue, urgent, tech) visible

### Graph View (15-22 seconds)
- Click "Graph" in sidebar
- Show force-directed graph animation
- Drag a node with mouse
- Show connections forming dynamically
- Use zoom controls to show scale

### Mission Control (22-28 seconds)
- Click "Mission" in sidebar
- Show dashboard with stats row
- Show timeline with milestones
- Toggle a feature checkbox
- End with mission control looking active

### Closing (28-30 seconds)
- Quick pan across all 4 views
- End on main dashboard

## Recording Tools

### Option 1: OBS Studio (Recommended - Free)
1. Download: https://obsproject.com
2. Set source: "Display Capture" (your screen)
3. Set output: MP4, 1920x1080, 30fps
4. Record: 30 seconds
5. Export as GIF using "OBS GIF Recorder" or use ffmpeg

### Option 2: QuickTime (macOS - Simple)
1. Cmd+Ctrl+N for New Screen Recording
2. Select portion to record
3. Start recording (Cmd+Ctrl+O)
4. Play the demo
5. Cmd+Ctrl+Stop
6. File → Export As → GIF or WebM

### Option 3: ShareX (Windows - Advanced)
1. Download: https://getsharex.com
2. Configure screen capture
3. Record with hotkey
4. Export as GIF directly

### Option 4: Simple Screen Capture (Linux)
```bash
# Using ffmpeg (if installed)
ffmpeg -f x11grab -s 1920x1080 -r 30 -i :0.0 -t 30 demo.mp4
```

## Processing to GIF

### Using FFmpeg (Best Quality)
```bash
ffmpeg -i demo.mp4 -vf "fps=15,scale=480:-1:flags=lanczos" demo.gif
```

### Using ImageMagick (Simple)
```bash
convert -delay 33 -loop 0 demo.mp4 demo.gif
```

### Online Tools (No Installation)
- ezgif.com
- cloudconvert.com/gif-to-video

## Timeline (30 Seconds)

| Time | View | Action | Why |
|------|------|--------|-----|
| 0-3 | Dashboard | Show all features visible | Hook immediately |
| 3-8 | Files | Search + filter | Show search speed |
| 8-15 | Kanban | Click cards + show tags | Core feature demo |
| 15-22 | Graph | Drag nodes + show connections | Unique visual |
| 22-28 | Mission | Toggle features | Show interactivity |
| 28-30 | Dashboard | Quick pan across all | Wrap up nicely |

## Audio (Optional)

**Recommended:** No audio
- Keeps file size small
- Works everywhere (Product Hunt, Reddit, Twitter)
- Focus on visual impact

**Alternative:** Minimal ambient sound
- Subtle background
- Voiceover: "AbyssNotes - Your brain, your data, your rules"
- Very brief (2-3 seconds)

## Deliverables

1. **GIF:** 480x270 or 720x405 resolution
   - Use for: Twitter, Reddit, Product Hunt
2. **MP4:** 1080p resolution
   - Use for: GitHub README (optional)
3. **WebM:** High quality
   - Use for: Landing page (if needed)

## After Recording

1. **Upload to GitHub:**
```bash
git add demo.gif
git commit -m "Add demo GIF"
git push
```

2. **Update README.md:**
```markdown
## Demo

[![AbyssNotes Demo](https://img.shields.io/badge/Demo-Live-red)](https://github.com/leviathofnoesia/abyssnotes)

A quick tour of AbyssNotes:
![Demo GIF](screenshots/demo.gif)
```

3. **Product Hunt:**
   - Upload as "Product image" (3 max)
   - Add demo as "Additional images" (2 max)
   - Use GIF for best impact

4. **Social Media:**
   - Twitter: Share GIF with caption
   - Reddit: Post GIF in relevant subs
   - Indie Hackers: Share GIF in build-in-public thread

## Current Status

- [x] Server running at http://localhost:3000
- [ ] Record 30-second demo video
- [ ] Export as GIF (480x270 or 720x405)
- [ ] Upload to GitHub
- [ ] Update README with demo link
- [ ] Prepare Product Hunt demo images

**Next Action:** Leviath should record demo using OBS, QuickTime, or built-in screen capture.
