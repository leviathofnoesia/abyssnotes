const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const WORKSPACE_ROOT = path.join(__dirname, '..');

app.use(express.json());
app.use(express.static('public'));

// Scan workspace for all .md files recursively
async function scanDirectory(dir, basePath = '') {
  const files = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      // Skip hidden directories and node_modules
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath, relativePath);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.md')) {
        files.push({
          name: entry.name,
          path: relativePath,
          fullPath: fullPath
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }

  return files;
}

// Get all markdown files
app.get('/api/files', async (req, res) => {
  try {
    const files = await scanDirectory(WORKSPACE_ROOT);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get file content
app.get('/api/file', async (req, res) => {
  const filePath = req.query.path;

  if (!filePath) {
    return res.status(400).json({ error: 'Path is required' });
  }

  try {
    const fullPath = path.join(WORKSPACE_ROOT, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    res.json({ path: filePath, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search files
app.get('/api/search', async (req, res) => {
  const query = req.query.q?.toLowerCase() || '';

  if (!query) {
    return res.json([]);
  }

  try {
    const files = await scanDirectory(WORKSPACE_ROOT);
    const filtered = files.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.path.toLowerCase().includes(query)
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get kanban data
app.get('/api/kanban', async (req, res) => {
  try {
    const content = await fs.readFile(
      path.join(__dirname, 'kanban.json'),
      'utf-8'
    );
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mission data
app.get('/api/mission', async (req, res) => {
  try {
    const content = await fs.readFile(
      path.join(__dirname, 'mission.json'),
      'utf-8'
    );
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🦞 AbyssNotes running at http://localhost:${PORT}`);
  console.log(`📁 Workspace: ${WORKSPACE_ROOT}`);
  console.log(`\n✨ Features:`);
  console.log(`   📄 File browser with markdown rendering`);
  console.log(`   📋 Kanban board`);
  console.log(`   🔗 Graph view (file relationships)`);
  console.log(`   🎯 Mission control dashboard\n`);
});
