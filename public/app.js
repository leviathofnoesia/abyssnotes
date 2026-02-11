// ============================================================================
// AbyssNotes - Obsidian Clone with Enhanced Features
// ============================================================================

// State Management
const state = {
  currentView: 'files',
  currentFile: null,
  files: [],
  history: [],
  historyIndex: -1,
  searchQuery: '',
  graphZoom: 1,
  kanbanData: null,
  missionData: null
};

// DOM Elements
const elements = {
  sidebar: document.getElementById('sidebar'),
  sidebarContent: document.getElementById('sidebarContent'),
  fileView: document.getElementById('fileView'),
  kanbanView: document.getElementById('kanbanView'),
  graphView: document.getElementById('graphView'),
  missionView: document.getElementById('missionView'),
  fileContent: document.getElementById('fileContent'),
  breadcrumb: document.getElementById('breadcrumb'),
  searchInput: document.getElementById('searchInput'),
  viewTabs: document.querySelectorAll('.view-tab'),
  backBtn: document.getElementById('backBtn'),
  forwardBtn: document.getElementById('forwardBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  menuToggle: document.getElementById('menuToggle'),
  graphCanvas: document.getElementById('graph-canvas')
};

// Initialize marked with options
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

// ============================================================================
// API Functions
// ============================================================================

async function fetchFiles() {
  try {
    const response = await fetch('/api/files');
    state.files = await response.json();
    renderFileList();
  } catch (error) {
    console.error('Error fetching files:', error);
    elements.sidebarContent.innerHTML = '<div class="empty-state"><div class="empty-state-text">Error loading files</div></div>';
  }
}

async function fetchFileContent(filePath) {
  try {
    const response = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
}

async function fetchKanbanData() {
  try {
    const response = await fetch('/api/kanban');
    return await response.json();
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    return null;
  }
}

async function fetchMissionData() {
  try {
    const response = await fetch('/api/mission');
    return await response.json();
  } catch (error) {
    console.error('Error fetching mission data:', error);
    return null;
  }
}

// ============================================================================
// View Switching
// ============================================================================

function switchView(viewName) {
  state.currentView = viewName;

  // Update tab buttons
  elements.viewTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewName);
  });

  // Show/hide views
  elements.fileView.classList.toggle('active', viewName === 'files');
  elements.kanbanView.classList.toggle('active', viewName === 'kanban');
  elements.graphView.classList.toggle('active', viewName === 'graph');
  elements.missionView.classList.toggle('active', viewName === 'mission');

  // Toggle search input
  elements.searchInput.style.display = viewName === 'files' ? 'block' : 'none';
  elements.sidebarContent.style.display = viewName === 'files' ? 'block' : 'none';

  // Load view-specific data
  if (viewName === 'kanban') {
    loadKanbanView();
  } else if (viewName === 'graph') {
    loadGraphView();
  } else if (viewName === 'mission') {
    loadMissionView();
  }

  updateBreadcrumb(viewName);
}

// ============================================================================
// File List Rendering
// ============================================================================

function renderFileList() {
  const filteredFiles = filterFiles(state.files, state.searchQuery);

  if (filteredFiles.length === 0) {
    elements.sidebarContent.innerHTML = '<div class="empty-state"><div class="empty-state-text">No files found</div></div>';
    return;
  }

  // Group by directory
  const groups = {};
  filteredFiles.forEach(file => {
    const dir = file.path.split('/').slice(0, -1).join('/') || 'root';
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(file);
  });

  let html = '<div class="file-tree">';

  Object.keys(groups).sort().forEach(dir => {
    html += `<div style="margin-bottom: 8px;">
      <div style="font-size: 11px; color: var(--text-muted); padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
        ${dir === 'root' ? 'Root' : dir}
      </div>`;

    groups[dir].sort((a, b) => a.name.localeCompare(b.name)).forEach(file => {
      const isActive = state.currentFile === file.path;
      html += `
        <div class="tree-item ${isActive ? 'active' : ''}" data-path="${file.path}">
          <span class="tree-icon">📄</span>
          <span class="tree-name">${file.name}</span>
        </div>
      `;
    });

    html += '</div>';
  });

  html += '</div>';
  elements.sidebarContent.innerHTML = html;

  // Add click handlers
  document.querySelectorAll('.tree-item').forEach(item => {
    item.addEventListener('click', () => loadFile(item.dataset.path));
  });
}

function filterFiles(files, query) {
  if (!query) return files;
  const lowerQuery = query.toLowerCase();
  return files.filter(file =>
    file.name.toLowerCase().includes(lowerQuery) ||
    file.path.toLowerCase().includes(lowerQuery)
  );
}

// ============================================================================
// File Loading
// ============================================================================

async function loadFile(filePath) {
  try {
    const data = await fetchFileContent(filePath);
    state.currentFile = filePath;

    // Update history
    if (state.historyIndex === -1 || state.history[state.historyIndex] !== filePath) {
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(filePath);
      state.historyIndex = state.history.length - 1;
    }

    // Render markdown
    elements.fileContent.innerHTML = `<div class="markdown-content">${marked.parse(data.content)}</div>`;

    // Update UI
    updateNavButtons();
    updateBreadcrumb('files', filePath);
    renderFileList();

    // Close sidebar on mobile
    elements.sidebar.classList.remove('open');
  } catch (error) {
    elements.fileContent.innerHTML = `<div class="empty-state"><div class="empty-state-text">Error loading file: ${error.message}</div></div>`;
  }
}

// ============================================================================
// Kanban View
// ============================================================================

async function loadKanbanView() {
  if (!state.kanbanData) {
    state.kanbanData = await fetchKanbanData();
  }

  if (!state.kanbanData) {
    elements.kanbanView.innerHTML = '<div class="empty-state"><div class="empty-state-text">Error loading kanban data</div></div>';
    return;
  }

  const columns = [
    { id: 'todo', title: '📝 To Do', color: '#f59e0b' },
    { id: 'progress', title: '🔄 In Progress', color: '#3b82f6' },
    { id: 'done', title: '✅ Done', color: '#22c55e' },
    { id: 'blocked', title: '🚫 Blocked', color: '#ef4444' }
  ];

  let html = '';
  columns.forEach(col => {
    const cards = state.kanbanData[col.id] || [];
    html += `
      <div class="kanban-column">
        <div class="kanban-header">
          <span class="kanban-header-title">${col.title}</span>
          <span class="kanban-header-count">${cards.length}</span>
        </div>
        <div class="kanban-cards">
          ${cards.map(card => `
            <div class="kanban-card" data-id="${card.id}">
              <div class="kanban-card-title">${card.title}</div>
              <div class="kanban-card-tags">
                ${(card.tags || []).map(tag => `<span class="tag tag-${tag}">${tag}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  elements.kanbanView.innerHTML = html;
}

// ============================================================================
// Graph View
// ============================================================================

function loadGraphView() {
  const width = elements.graphCanvas.clientWidth;
  const height = elements.graphCanvas.clientHeight;

  // Create nodes from files
  const nodes = state.files.map((file, i) => ({
    id: file.path,
    name: file.name,
    group: 1
  }));

  // Create links (simple implementation - link files in same directory)
  const links = [];
  const dirGroups = {};
  nodes.forEach(node => {
    const dir = node.id.split('/').slice(0, -1).join('/') || 'root';
    if (!dirGroups[dir]) dirGroups[dir] = [];
    dirGroups[dir].push(node.id);
  });

  Object.values(dirGroups).forEach(group => {
    for (let i = 0; i < group.length - 1; i++) {
      links.push({
        source: group[i],
        target: group[i + 1]
      });
    }
  });

  // Clear previous graph
  d3.select('#graph-canvas').selectAll('*').remove();

  // Create SVG
  const svg = d3.select('#graph-canvas')
    .attr('width', width)
    .attr('height', height);

  // Create simulation
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30));

  // Create links
  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#27272a')
    .attr('stroke-width', 2);

  // Create nodes
  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 20)
    .attr('fill', '#7c3aed')
    .attr('stroke', '#a855f7')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  // Add labels
  const labels = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .text(d => d.name)
    .attr('font-size', '10px')
    .attr('fill', '#a1a1aa')
    .attr('text-anchor', 'middle')
    .attr('dy', 35)
    .style('pointer-events', 'none');

  // Update positions on tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    labels
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  });

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // Click handler
  node.on('click', (event, d) => {
    switchView('files');
    loadFile(d.id);
  });
}

// ============================================================================
// Mission Control View
// ============================================================================

async function loadMissionView() {
  if (!state.missionData) {
    state.missionData = await fetchMissionData();
  }

  if (!state.missionData) {
    elements.missionView.innerHTML = '<div class="empty-state"><div class="empty-state-text">Error loading mission data</div></div>';
    return;
  }

  const { stats, milestones, features } = state.missionData;

  // Stats grid
  const statsHtml = `
    <div class="mission-stats-grid">
      ${stats.map(stat => `
        <div class="mission-stat-card">
          <div class="mission-stat-label">${stat.label}</div>
          <div class="mission-stat-value ${stat.status}">${stat.value}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Timeline
  const timelineHtml = `
    <div class="mission-section">
      <div class="mission-section-title">📅 Timeline</div>
      <div class="timeline">
        ${milestones.map(ms => `
          <div class="timeline-item ${ms.status}">
            <div class="timeline-date">${ms.date}</div>
            <div class="timeline-content">
              <div class="timeline-title">${ms.title}</div>
              <div class="timeline-status">${ms.status.replace('-', ' ')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Features
  const featuresHtml = `
    <div class="mission-section">
      <div class="mission-section-title">✨ Feature Sets</div>
      <div class="features-list">
        ${features.map(feature => `
          <div class="feature-item" onclick="toggleFeature(this)">
            <div class="feature-checkbox ${feature.completed ? 'checked' : ''}"></div>
            <div class="feature-content">
              <div class="feature-title ${feature.completed ? 'completed' : ''}">${feature.title}</div>
              <div class="feature-desc">${feature.description}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  elements.missionView.innerHTML = statsHtml + timelineHtml + featuresHtml;
}

window.toggleFeature = function(element) {
  const checkbox = element.querySelector('.feature-checkbox');
  const title = element.querySelector('.feature-title');
  checkbox.classList.toggle('checked');
  title.classList.toggle('completed');
};

// ============================================================================
// Navigation
// ============================================================================

function updateNavButtons() {
  elements.backBtn.disabled = state.historyIndex <= 0;
  elements.forwardBtn.disabled = state.historyIndex >= state.history.length - 1;
}

function goBack() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    loadFile(state.history[state.historyIndex]);
  }
}

function goForward() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    loadFile(state.history[state.historyIndex]);
  }
}

function updateBreadcrumb(view, path) {
  let html = '<span class="breadcrumb-item">Workspace</span>';

  if (view === 'files' && path) {
    const parts = path.split('/');
    parts.forEach((part, i) => {
      html += '<span class="breadcrumb-separator">/</span>';
      if (i === parts.length - 1) {
        html += `<span class="breadcrumb-current">${part}</span>`;
      } else {
        html += `<span class="breadcrumb-item">${part}</span>`;
      }
    });
  } else if (view !== 'files') {
    html += '<span class="breadcrumb-separator">/</span>';
    html += `<span class="breadcrumb-current">${view.charAt(0).toUpperCase() + view.slice(1)}</span>`;
  }

  elements.breadcrumb.innerHTML = html;
}

// ============================================================================
// Event Listeners
// ============================================================================

// View tabs
elements.viewTabs.forEach(tab => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

// Search
elements.searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  renderFileList();
});

// Navigation
elements.backBtn.addEventListener('click', goBack);
elements.forwardBtn.addEventListener('click', goForward);
elements.refreshBtn.addEventListener('click', () => {
  if (state.currentView === 'files') {
    fetchFiles();
  } else if (state.currentView === 'kanban') {
    state.kanbanData = null;
    loadKanbanView();
  } else if (state.currentView === 'mission') {
    state.missionData = null;
    loadMissionView();
  } else if (state.currentView === 'graph') {
    loadGraphView();
  }
});

// Mobile menu toggle
elements.menuToggle.addEventListener('click', () => {
  elements.sidebar.classList.toggle('open');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768 &&
      !elements.sidebar.contains(e.target) &&
      !elements.menuToggle.contains(e.target)) {
    elements.sidebar.classList.remove('open');
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.altKey && e.key === 'ArrowLeft') {
    e.preventDefault();
    goBack();
  } else if (e.altKey && e.key === 'ArrowRight') {
    e.preventDefault();
    goForward();
  } else if (e.key === 'Escape') {
    if (elements.sidebar.classList.contains('open')) {
      elements.sidebar.classList.remove('open');
    }
  }
});

// Graph controls
document.getElementById('graphZoomIn')?.addEventListener('click', () => {
  state.graphZoom = Math.min(state.graphZoom * 1.2, 3);
  loadGraphView();
});

document.getElementById('graphZoomOut')?.addEventListener('click', () => {
  state.graphZoom = Math.max(state.graphZoom / 1.2, 0.3);
  loadGraphView();
});

document.getElementById('graphReset')?.addEventListener('click', () => {
  state.graphZoom = 1;
  loadGraphView();
});

// Window resize
window.addEventListener('resize', () => {
  if (state.currentView === 'graph') {
    loadGraphView();
  }
});

// ============================================================================
// Initialization
// ============================================================================

fetchFiles();
