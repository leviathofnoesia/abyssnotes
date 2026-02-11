#!/usr/bin/env node

/**
 * AbyssNotes CLI
 * Command-line interface for AbyssNotes workspace viewer
 */

const { program } = require('commander');
const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'kanban.json');
const MISSION_FILE = path.join(__dirname, 'mission.json');

program
  .name('abyssnotes')
  .description('AbyssNotes CLI - Manage your Obsidian-like workspace')
  .version('1.0.0');

// ============================================================================
// File Commands
// ============================================================================

program
  .command('files')
  .description('List all markdown files in workspace')
  .option('-p, --pattern <pattern>', 'Filter files by pattern')
  .action(async (options) => {
    const workspacePath = path.join(__dirname, '..');
    const files = await scanWorkspace(workspacePath);

    let filtered = files;
    if (options.pattern) {
      const pattern = new RegExp(options.pattern, 'i');
      filtered = files.filter(f => pattern.test(f.name) || pattern.test(f.path));
    }

    console.log(`\n📄 Files (${filtered.length}):\n`);
    filtered.forEach(file => {
      console.log(`  ${file.path}`);
    });
  });

program
  .command('open <path>')
  .description('Open a file in AbyssNotes (starts web server)')
  .action(async (filePath) => {
    console.log(`\n🦞 Opening AbyssNotes...`);
    console.log(`   File: ${filePath}`);
    console.log(`   URL: http://localhost:3000\n`);
    console.log(`   Press Ctrl+C to stop\n`);

    const { startServer } = require('./server');
    startServer();
  });

// ============================================================================
// Kanban Commands
// ============================================================================

program
  .command('kanban')
  .description('Manage kanban board')
  .option('-l, --list', 'List all tasks')
  .option('-a, --add <title>', 'Add new task to todo')
  .option('-m, --move <id> <column>', 'Move task to column (todo|progress|done|blocked)')
  .option('-d, --delete <id>', 'Delete task')
  .action(async (options) => {
    const data = await readJson(CONFIG_FILE);

    if (options.list) {
      console.log('\n📋 Kanban Board:\n');

      ['todo', 'progress', 'done', 'blocked'].forEach(column => {
        const tasks = data[column] || [];
        if (tasks.length === 0) return;

        const icons = { todo: '📝', progress: '🔄', done: '✅', blocked: '🚫' };
        console.log(`${icons[column]} ${column.toUpperCase()} (${tasks.length})`);

        tasks.forEach(task => {
          const tags = (task.tags || []).map(t => `[${t}]`).join(' ');
          console.log(`   [${task.id}] ${task.title} ${tags}`);
        });
        console.log('');
      });
    }

    if (options.add) {
      const newId = Math.max(...Object.values(data).flat().map(t => t.id), 0) + 1;
      data.todo.push({
        id: newId,
        title: options.add,
        tags: [],
        priority: 'medium'
      });
      await writeJson(CONFIG_FILE, data);
      console.log(`\n✅ Added task [${newId}]: ${options.add}`);
    }

    if (options.move) {
      const [idStr, targetColumn] = options.move;
      const taskId = parseInt(idStr);

      // Find and remove task
      let task = null;
      for (const column of ['todo', 'progress', 'done', 'blocked']) {
        const index = data[column].findIndex(t => t.id === taskId);
        if (index !== -1) {
          task = data[column].splice(index, 1)[0];
          break;
        }
      }

      if (task && ['todo', 'progress', 'done', 'blocked'].includes(targetColumn)) {
        data[targetColumn].push(task);
        await writeJson(CONFIG_FILE, data);
        console.log(`\n✅ Moved task [${taskId}] to ${targetColumn}`);
      } else {
        console.log(`\n❌ Invalid task or column`);
      }
    }

    if (options.delete) {
      const taskId = parseInt(options.delete);

      for (const column of ['todo', 'progress', 'done', 'blocked']) {
        const index = data[column].findIndex(t => t.id === taskId);
        if (index !== -1) {
          data[column].splice(index, 1);
          await writeJson(CONFIG_FILE, data);
          console.log(`\n✅ Deleted task [${taskId}]`);
          return;
        }
      }

      console.log(`\n❌ Task not found`);
    }
  });

// ============================================================================
// Mission Commands
// ============================================================================

program
  .command('mission')
  .description('View mission control status')
  .option('-s, --stats', 'Show key metrics')
  .option('-t, --timeline', 'Show timeline')
  .option('-f, --features', 'Show feature checklist')
  .action(async (options) => {
    const data = await readJson(MISSION_FILE);

    if (options.stats || Object.keys(options).length === 0) {
      console.log('\n📊 Key Metrics:\n');
      data.stats.forEach(stat => {
        const icon = stat.status === 'positive' ? '✓' : stat.status === 'warning' ? '⚠' : '!';
        console.log(`  ${icon} ${stat.label}: ${stat.value}`);
      });
    }

    if (options.timeline) {
      console.log('\n📅 Timeline:\n');
      data.milestones.forEach(ms => {
        const statusIcons = { completed: '✅', 'in-progress': '🔄', blocked: '🚫' };
        console.log(`  ${statusIcons[ms.status]} ${ms.date} - ${ms.title}`);
      });
    }

    if (options.features) {
      console.log('\n✨ Features:\n');
      data.features.forEach(feature => {
        const icon = feature.completed ? '✅' : '⬜';
        console.log(`  ${icon} ${feature.title}`);
        console.log(`     ${feature.description}`);
      });
    }
  });

// ============================================================================
// Server Commands
// ============================================================================

program
  .command('start')
  .description('Start AbyssNotes web server')
  .action(async () => {
    console.log('\n🦞 AbyssNotes starting...\n');
    console.log(`   URL: http://localhost:3000`);
    console.log(`   Press Ctrl+C to stop\n`);

    const { startServer } = require('./server');
    startServer();
  });

// ============================================================================
// Utility Functions
// ============================================================================

async function scanDirectory(dir, basePath = '') {
  const files = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath, relativePath);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.md')) {
        files.push({
          name: entry.name,
          path: relativePath
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }

  return files;
}

async function scanWorkspace(workspacePath) {
  return await scanDirectory(workspacePath);
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============================================================================
// Export server start for use by other commands
// ============================================================================

const express = require('express');
const PORT = 3000;

function startServer() {
  const app = express();
  const WORKSPACE_ROOT = path.join(__dirname, '..');

  app.use(express.json());
  app.use(express.static('public'));

  // API endpoints
  app.get('/api/files', async (req, res) => {
    try {
      const files = await scanWorkspace(WORKSPACE_ROOT);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/file', async (req, res) => {
    try {
      const fullPath = path.join(WORKSPACE_ROOT, req.query.path);
      const content = await fs.readFile(fullPath, 'utf-8');
      res.json({ path: req.query.path, content });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/kanban', async (req, res) => {
    try {
      const content = await fs.readFile(CONFIG_FILE, 'utf-8');
      res.json(JSON.parse(content));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/mission', async (req, res) => {
    try {
      const content = await fs.readFile(MISSION_FILE, 'utf-8');
      res.json(JSON.parse(content));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`🦞 AbyssNotes running at http://localhost:${PORT}`);
  });
}

// Export for use in open command
module.exports = { startServer };

// ============================================================================
// Parse arguments
// ============================================================================

program.parse();
