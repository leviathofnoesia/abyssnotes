# 🦞 AbyssNotes

**Your brain, your data, your rules.**

A local-first personal knowledge base and productivity dashboard that combines Obsidian-like note-taking with Kanban boards, graph visualization, and mission control dashboards.

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-blue)

---

## ✨ Features

### 📄 File Browser
- Recursive markdown file scanning
- Directory grouping
- Real-time search
- Beautiful markdown rendering with syntax highlighting
- Breadcrumb navigation
- Back/forward history (Alt+←/Alt+→)

### 📋 Kanban Board
- 4 columns: To Do, In Progress, Done, Blocked
- Task cards with tags (urgent, revenue, tech)
- Color-coded priority indicators
- CLI-based task management

### 🔗 Graph View
- Interactive force-directed graph of file relationships
- Drag and drop nodes
- Zoom in/out controls
- Click nodes to navigate to files
- Visualizes workspace structure

### 🎯 Mission Control
- Key metrics dashboard (revenue, tasks, API health)
- Timeline with milestones (completed, in-progress, blocked)
- Feature checklist with interactive toggles
- Status tracking for all revenue streams

### 🎨 Design
- Dark mode with Catppuccin-inspired palette
- Purple accent theme with glowing effects
- Smooth animations and transitions
- Responsive design (mobile-friendly)
- Custom fonts: Outfit (display) + JetBrains Mono (code)
- Subtle background gradients

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/leviathofnoesia/abyssnotes.git
cd abyssnotes

# Install dependencies
npm install

# Start the server
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ CLI Usage

The AbyssNotes CLI provides command-line access to all features:

```bash
# Start web server
npm start
# or
node abyssnotes.js start

# List all files
node abyssnotes.js files

# Search files
node abyssnotes.js files --pattern "agent"

# Open specific file
node abyssnotes.js open SOUL.md

# View kanban board
node abyssnotes.js kanban --list

# Add task
node abyssnotes.js kanban --add "New task"

# Move task
node abyssnotes.js kanban --move 1 progress

# Delete task
node abyssnotes.js kanban --delete 1

# View mission control
node abyssnotes.js mission --stats
node abyssnotes.js mission --timeline
node abyssnotes.js mission --features
```

---

## 📁 Project Structure

```
abyssnotes/
├── public/
│   ├── index.html      # Main UI
│   └── app.js          # Frontend logic
├── server.js            # Express server
├── abyssnotes.js        # CLI tool
├── kanban.json         # Kanban data (user-editable)
├── mission.json        # Mission control data (user-editable)
├── package.json        # Dependencies
├── LICENCE.md         # MIT License
└── README.md          # This file
```

---

## 📝 Data Management

### Kanban Data (`kanban.json`)

Edit this file to update tasks:

```json
{
  "todo": [
    { "id": 1, "title": "Task name", "tags": ["urgent", "revenue"] }
  ],
  "progress": [],
  "done": [],
  "blocked": []
}
```

### Mission Data (`mission.json`)

Edit this file to update mission control:

```json
{
  "stats": [
    { "label": "Revenue This Month", "value": "$0", "status": "critical" }
  ],
  "milestones": [
    { "date": "Feb 15", "title": "Target", "status": "in-progress" }
  ],
  "features": [
    { "title": "Feature", "description": "Description", "completed": false }
  ]
}
```

---

## ⌨️ Keyboard Shortcuts

- `Alt+←` - Back in history
- `Alt+→` - Forward in history
- `Escape` - Close sidebar (mobile)

---

## 🔧 Tech Stack

- **Backend:** Node.js + Express.js
- **Frontend:** Vanilla JavaScript (no framework)
- **Markdown:** marked.js
- **Syntax Highlighting:** highlight.js
- **Graph Visualization:** D3.js
- **CLI:** Commander.js
- **Fonts:** Google Fonts (Outfit, JetBrains Mono)

---

## 🎯 Use Cases

### For Founders
- Track revenue streams in Mission Control
- Manage launches with Kanban
- Document decisions in markdown

### For Developers
- Keep documentation in markdown
- Visualize code structure with Graph view
- Track bugs and features in Kanban

### For Researchers
- Organize research notes
- See connections between topics
- Track progress on papers/projects

---

## 🔒 Privacy First

AbyssNotes is **100% local**:

- No cloud sync
- No data collection
- No telemetry
- No account required
- Your data stays on your machine

---

## 🌐 Access from Other Devices

### SSH Tunnel
```bash
ssh -L 3000:localhost:3000 your-server
```

### ngrok
```bash
npm install -g ngrok
ngrok http 3000
```

### Localtunnel
```bash
npm install -g localtunnel
lt --port 3000
```

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENCE.md](LICENCE.md) for details.

## 🙏 Acknowledgments

- Obsidian - Inspiration for the markdown workflow
- D3.js - Graph visualization
- marked.js - Markdown parsing
- Catppuccin - Color palette inspiration

---

**Made with 🦞 by AbyssWalker**

> "Your brain, your data, your rules."
