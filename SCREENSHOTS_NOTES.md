# Screenshots Documentation

**Status:** Pending - Need to capture before launch

## What to Screenshot

### 1. File Browser with Search (Priority 1)
- **Where:** Main dashboard, visible immediately
- **Key elements:**
  - File tree with folder structure
  - Search bar with "agent" or "workspace" sample search
  - Markdown preview panel
  - Back/forward buttons
- **Why important:** First impression of the app

### 2. Kanban Board (Priority 1)
- **Where:** Click "Kanban" in sidebar or navigate to `/kanban`
- **Key elements:**
  - 4 columns: To Do, In Progress, Done, Blocked
  - Task cards with tags (revenue, urgent, tech)
  - Priority color indicators
- **Why important:** Core feature, differentiates from Obsidian

### 3. Graph View (Priority 1)
- **Where:** Click "Graph" in sidebar or navigate to `/graph`
- **Key elements:**
  - Force-directed graph with colored nodes
  - Interactive nodes (drag/drop)
  - Zoom controls
  - Connected file relationships
- **Why important:** Unique visual appeal, shows "wow" factor

### 4. Mission Control Dashboard (Priority 1)
- **Where:** Click "Mission" in sidebar or navigate to `/mission`
- **Key elements:**
  - Stats row (revenue, tasks, API health)
  - Timeline with milestones
  - Feature checklist with interactive toggles
  - Dark mode with purple accents
- **Why important:** "Mission control" concept is unique value prop

### 5. Full UI (Secondary)
- **Complete screen capture** showing:
  - Sidebar navigation
  - Main content area
  - Breadcrumb navigation
  - Keyboard shortcuts visible
  - Dark mode appearance

## Technical Setup for Screenshots

### Method 1: Native Screenshot (Recommended)
**Linux:**
```bash
# Install scrot if not present
sudo apt install scrot

# Capture full viewport
scrot -u abyssnotes-dashboard.png

# Capture specific area
scrot -s abyssnotes-kanban.png
```

**macOS:**
```bash
# Use Cmd+Shift+4 for region capture
# Or use screenshot app to save to file
```

**Windows:**
```bash
# Use Windows + Shift + S for snipping tool
# Save as PNG
```

### Method 2: Browser DevTools (Quick & Easy)
1. Open AbyssNotes at http://localhost:3000
2. Right-click page → "Inspect"
3. Ctrl+Shift+P → "Capture screenshot"
4. Select "Full size" or "Capture node"

### Method 3: Record Video (Demo)
Use OBS Studio or QuickTime:
- Record 30 seconds showing:
  - Opening the app
  - Navigating to different views (Files, Kanban, Graph, Mission)
  - Interacting with elements (search, drag nodes, toggle features)
- Export as GIF or WebM
- Use for social media + product hunt

## File Naming Convention

```
abyssnotes-filebrowser.png
abyssnotes-kanban.png
abyssnotes-graph.png
abyssnotes-mission.png
abyssnotes-fullui.png
abyssnotes-demo.gif
```

Place in `/screenshots/` directory.

## After Screenshots

1. **Update README.md** with screenshot URLs
2. **Add to Product Hunt description** (max 3 images)
3. **Create social media posts** with GIF
4. **Update landing page** if one exists

## Current Status

- [ ] Server running at http://localhost:3000
- [ ] Capture 4-5 screenshots (high quality, dark mode)
- [ ] Create demo GIF (30 seconds)
- [ ] Add screenshots to GitHub README
- [ ] Upload to Product Hunt

**Next Action:** Leviath should capture screenshots manually since browser control isn't available.
