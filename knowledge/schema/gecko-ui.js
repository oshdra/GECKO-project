/**
 * gecko-ui.js v1.0
 * Lightweight, zero-dependency UI library for GECKO Simulators.
 */
(function(window) {
  'use strict';

  const I18N = {
    en: {
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      export: 'Export State',
      import: 'Import State',
      importError: 'Invalid state file',
      confirmDelete: 'Are you sure?',
      debug: 'Debug Console',
      camZoomIn: 'Zoom +',
      camZoomOut: 'Zoom -',
      camRotXPos: 'Rot X+',
      camRotXNeg: 'Rot X-',
      camRotZPos: 'Rot Z+',
      camRotZNeg: 'Rot Z-',
      apply: 'Apply'
    },
    es: {
      play: 'Reproducir',
      pause: 'Pausar',
      reset: 'Reiniciar',
      export: 'Exportar Estado',
      import: 'Importar Estado',
      importError: 'Archivo de estado inválido',
      confirmDelete: '¿Estás seguro?',
      debug: 'Consola de Depuración',
      camZoomIn: 'Zoom +',
      camZoomOut: 'Zoom -',
      camRotXPos: 'Rot X+',
      camRotXNeg: 'Rot X-',
      camRotZPos: 'Rot Z+',
      camRotZNeg: 'Rot Z-',
      apply: 'Aplicar'
    }
  };

  function injectCSS(accentColor, sidebarWidth) {
    if (document.getElementById('gecko-ui-styles')) return;
    const style = document.createElement('style');
    style.id = 'gecko-ui-styles';
    style.textContent = `
      :root {
        --gecko-bg: #12141d;
        --gecko-bg-top: #181b28;
        --gecko-bg-card: #1c2030;
        --gecko-bg-input: #11131c;
        --gecko-border: #232736;
        --gecko-text: #e0e6ed;
        --gecko-text-dim: #8b9bb4;
        --gecko-accent: ${accentColor || '#00e5ff'};
        --gecko-accent-hover: #33ebff;
        --gecko-danger: #ff4757;
      }
      body {
        padding-right: ${sidebarWidth || 320}px !important;
        box-sizing: border-box !important;
      }
      #gecko-sidebar {
        position: fixed;
        top: 0;
        right: 0;
        width: ${sidebarWidth || 320}px;
        height: 100vh;
        background: var(--gecko-bg);
        border-left: 1px solid var(--gecko-border);
        color: var(--gecko-text);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        z-index: 999999;
        overflow: hidden;
        user-select: none;
      }
      #gecko-topbar {
        background: var(--gecko-bg-top);
        padding: 10px 14px;
        border-bottom: 1px solid var(--gecko-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .gecko-title {
        font-weight: 700;
        font-size: 14px;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .gecko-btn-group {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .gecko-btn {
        background: var(--gecko-bg-card);
        color: var(--gecko-text);
        border: 1px solid var(--gecko-border);
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }
      .gecko-btn:hover {
        border-color: var(--gecko-accent);
        color: #fff;
      }
      .gecko-btn-accent {
        background: var(--gecko-accent);
        color: #000;
        border-color: var(--gecko-accent);
      }
      .gecko-btn-accent:hover {
        background: var(--gecko-accent-hover);
        color: #000;
      }
      .gecko-btn-icon {
        padding: 4px 8px;
        font-size: 14px;
      }
      #gecko-camera {
        background: var(--gecko-bg-top);
        padding: 8px 14px;
        border-bottom: 1px solid var(--gecko-border);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .gecko-cam-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
      }
      .gecko-cam-info {
        font-size: 11px;
        color: var(--gecko-text-dim);
      }
      #gecko-panels {
        flex: 1;
        overflow-y: auto;
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      #gecko-panels::-webkit-scrollbar {
        width: 6px;
      }
      #gecko-panels::-webkit-scrollbar-thumb {
        background: var(--gecko-border);
        border-radius: 3px;
      }
      .gecko-panel {
        background: var(--gecko-bg-card);
        border: 1px solid var(--gecko-border);
        border-radius: 6px;
        overflow: hidden;
      }
      .gecko-panel-header {
        padding: 8px 12px;
        background: rgba(255,255,255,0.03);
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .gecko-panel-header:hover {
        color: var(--gecko-accent);
      }
      .gecko-panel-body {
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .gecko-panel-body.collapsed {
        display: none;
      }
      .gecko-control-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .gecko-control-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .gecko-label {
        font-size: 12px;
        color: var(--gecko-text-dim);
      }
      .gecko-val-badge {
        font-size: 12px;
        font-weight: 600;
        color: var(--gecko-accent);
      }
      .gecko-input-text {
        background: var(--gecko-bg-input);
        border: 1px solid var(--gecko-border);
        color: #fff;
        padding: 5px 8px;
        border-radius: 4px;
        font-size: 12px;
        width: 100%;
        box-sizing: border-box;
      }
      .gecko-input-text:focus {
        outline: none;
        border-color: var(--gecko-accent);
      }
      .gecko-range {
        width: 100%;
        accent-color: var(--gecko-accent);
        cursor: pointer;
      }
      .gecko-flex-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .gecko-checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      .gecko-checkbox {
        accent-color: var(--gecko-accent);
        cursor: pointer;
      }
      .gecko-select {
        background: var(--gecko-bg-input);
        border: 1px solid var(--gecko-border);
        color: #fff;
        padding: 5px 8px;
        border-radius: 4px;
        font-size: 12px;
        width: 100%;
        cursor: pointer;
      }
      .gecko-metrics-grid {
        display: flex;
        flex-direction: column;
        gap: 4px;
        background: var(--gecko-bg-input);
        padding: 8px;
        border-radius: 4px;
        border: 1px solid var(--gecko-border);
      }
      .gecko-metric-row {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
      }
      .gecko-metric-key {
        color: var(--gecko-text-dim);
      }
      .gecko-metric-val {
        font-weight: 600;
        color: #fff;
        font-family: monospace;
      }
      .gecko-separator {
        height: 1px;
        background: var(--gecko-border);
        margin: 4px 0;
      }
      #gecko-debug {
        background: #090a0f;
        border-top: 1px solid var(--gecko-border);
        max-height: 140px;
        display: flex;
        flex-direction: column;
      }
      .gecko-debug-header {
        padding: 4px 10px;
        font-size: 10px;
        font-weight: bold;
        color: var(--gecko-text-dim);
        background: #11131c;
        border-bottom: 1px solid var(--gecko-border);
      }
      .gecko-debug-content {
        padding: 6px 10px;
        font-family: monospace;
        font-size: 10px;
        color: #7bed9f;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-all;
        flex: 1;
      }
    `;
    document.head.appendChild(style);
  }

  class GeckoUI {
    constructor(config) {
      if (!config || !config.canvas) {
        throw new Error('GeckoUI requires a config object with a canvas property');
      }
      this.config = config;
      this.lang = config.language === 'es' ? 'es' : 'en';
      this.t = I18N[this.lang];
      this.sidebarWidth = config.sidebarWidth || 320;
      this.accentColor = config.accentColor || '#00e5ff';
      this.isPlaying = false;
      this.eventListeners = {};
      this.panels = [];
      this.controlsMap = new Map();
      this.debugLogs = [];
      this.lastFrameTime = null;
      this.rAFId = null;

      injectCSS(this.accentColor, this.sidebarWidth);
      this._initDOM();
      this._initDebugConsole();

      if (Array.isArray(config.panels)) {
        config.panels.forEach(p => this.addPanel(p));
      }

      if (config.onPlay) this.on('play', config.onPlay);
      if (config.onPause) this.on('pause', config.onPause);
      if (config.onReset) this.on('reset', config.onReset);
      if (config.onImport) this.on('import', config.onImport);

      this._startLoop();
    }

    _initDOM() {
      let sidebar = document.getElementById('gecko-sidebar');
      if (sidebar) sidebar.remove();

      sidebar = document.createElement('div');
      sidebar.id = 'gecko-sidebar';

      // Top bar
      const topbar = document.createElement('div');
      topbar.id = 'gecko-topbar';

      const titleEl = document.createElement('div');
      titleEl.className = 'gecko-title';
      titleEl.textContent = this.config.title || 'GECKO';
      topbar.appendChild(titleEl);

      const btnGroup = document.createElement('div');
      btnGroup.className = 'gecko-btn-group';

      // Play/Pause button
      this.playBtn = document.createElement('button');
      this.playBtn.className = 'gecko-btn gecko-btn-accent';
      this.playBtn.textContent = '▶ ' + this.t.play;
      this.playBtn.addEventListener('click', () => this.togglePlay());
      btnGroup.appendChild(this.playBtn);

      // Reset button
      const resetBtn = document.createElement('button');
      resetBtn.className = 'gecko-btn';
      resetBtn.textContent = '↺ ' + this.t.reset;
      resetBtn.addEventListener('click', () => {
        this.emit('reset');
      });
      btnGroup.appendChild(resetBtn);

      // Export button
      const exportBtn = document.createElement('button');
      exportBtn.className = 'gecko-btn gecko-btn-icon';
      exportBtn.title = this.t.export;
      exportBtn.textContent = '⤓';
      exportBtn.addEventListener('click', () => this.exportState());
      btnGroup.appendChild(exportBtn);

      // Import button
      const importBtn = document.createElement('button');
      importBtn.className = 'gecko-btn gecko-btn-icon';
      importBtn.title = this.t.import;
      importBtn.textContent = '⤒';
      
      const hiddenFileInput = document.createElement('input');
      hiddenFileInput.type = 'file';
      hiddenFileInput.accept = '.json';
      hiddenFileInput.style.display = 'none';
      hiddenFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target.result);
            this.emit('import', data);
            this.refresh();
          } catch (err) {
            alert(this.t.importError);
          }
        };
        reader.readAsText(file);
      });
      importBtn.appendChild(hiddenFileInput);
      importBtn.addEventListener('click', () => hiddenFileInput.click());
      btnGroup.appendChild(importBtn);

      topbar.appendChild(btnGroup);
      sidebar.appendChild(topbar);

      // Camera bar if provided
      if (this.config.camera) {
        const camContainer = document.createElement('div');
        camContainer.id = 'gecko-camera';

        const camGrid = document.createElement('div');
        camGrid.className = 'gecko-cam-grid';

        const c = this.config.camera;
        const createCamBtn = (text, fn) => {
          const btn = document.createElement('button');
          btn.className = 'gecko-btn';
          btn.textContent = text;
          btn.addEventListener('click', fn);
          return btn;
        };

        if (c.onZoomIn) camGrid.appendChild(createCamBtn(this.t.camZoomIn, c.onZoomIn));
        if (c.onZoomOut) camGrid.appendChild(createCamBtn(this.t.camZoomOut, c.onZoomOut));
        if (c.onRotateXPos) camGrid.appendChild(createCamBtn(this.t.camRotXPos, c.onRotateXPos));
        if (c.onRotateXNeg) camGrid.appendChild(createCamBtn(this.t.camRotXNeg, c.onRotateXNeg));
        if (c.onRotateZPos) camGrid.appendChild(createCamBtn(this.t.camRotZPos, c.onRotateZPos));
        if (c.onRotateZNeg) camGrid.appendChild(createCamBtn(this.t.camRotZNeg, c.onRotateZNeg));

        camContainer.appendChild(camGrid);

        if (c.getCameraInfo) {
          this.camInfoEl = document.createElement('div');
          this.camInfoEl.className = 'gecko-cam-info';
          camContainer.appendChild(this.camInfoEl);
        }

        sidebar.appendChild(camContainer);
      }

      // Panels container
      this.panelsContainer = document.createElement('div');
      this.panelsContainer.id = 'gecko-panels';
      sidebar.appendChild(this.panelsContainer);

      // Debug console if enabled
      if (this.config.debugConsole) {
        const debugContainer = document.createElement('div');
        debugContainer.id = 'gecko-debug';

        const debugHeader = document.createElement('div');
        debugHeader.className = 'gecko-debug-header';
        debugHeader.textContent = this.t.debug;
        debugContainer.appendChild(debugHeader);

        this.debugContentEl = document.createElement('div');
        this.debugContentEl.className = 'gecko-debug-content';
        debugContainer.appendChild(this.debugContentEl);

        sidebar.appendChild(debugContainer);
      }

      document.body.appendChild(sidebar);
    }

    _initDebugConsole() {
      if (!this.config.debugConsole) return;
      const self = this;
      const originalLog = console.log;
      const originalError = console.error;

      console.log = function(...args) {
        originalLog.apply(console, args);
        self.debugLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      console.error = function(...args) {
        originalError.apply(console, args);
        self.debugLog('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
    }

    debugLog(msg) {
      if (!this.debugContentEl) return;
      const maxLines = this.config.debugConsoleLines || 20;
      this.debugLogs.push(msg);
      if (this.debugLogs.length > maxLines) {
        this.debugLogs.shift();
      }
      this.debugContentEl.textContent = this.debugLogs.join('\n');
      this.debugContentEl.scrollTop = this.debugContentEl.scrollHeight;
    }

    // --- Lifecycle and Loop ---
    togglePlay() {
      this.setPlaying(!this.isPlaying);
    }

    setPlaying(playing) {
      this.isPlaying = !!playing;
      if (this.isPlaying) {
        this.playBtn.textContent = '⏸ ' + this.t.pause;
        this.emit('play');
      } else {
        this.playBtn.textContent = '▶ ' + this.t.play;
        this.emit('pause');
      }
    }

    _startLoop() {
      const step = (timestamp) => {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = timestamp;

        if (this.isPlaying) {
          this.emit('tick', dt);
        }

        this.refresh();

        this.rAFId = requestAnimationFrame(step);
      };
      this.rAFId = requestAnimationFrame(step);
    }

    refresh() {
      // Refresh camera info if function exists
      if (this.config.camera && this.config.camera.getCameraInfo && this.camInfoEl) {
        const info = this.config.camera.getCameraInfo();
        if (info) {
          this.camInfoEl.textContent = Object.entries(info)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ');
        }
      }

      // Refresh controls
      this.controlsMap.forEach((ctrl) => {
        if (ctrl.config.get && typeof ctrl.refresh === 'function') {
          ctrl.refresh();
        }
      });

      // Refresh metrics from getState()
      if (typeof this.config.getState === 'function') {
        const state = this.config.getState();
        if (state && typeof state === 'object') {
          this.controlsMap.forEach((ctrl) => {
            if (ctrl.config.type === 'metrics' && typeof ctrl.updateMetrics === 'function') {
              ctrl.updateMetrics(state);
            }
          });
        }
      }
    }

    exportState() {
      let data = {};
      if (typeof this.config.onExport === 'function') {
        data = this.config.onExport();
      } else if (typeof this.config.getState === 'function') {
        data = this.config.getState();
      }
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (this.config.title || 'gecko-simulator').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-state.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    // --- Event System ---
    on(event, fn) {
      if (!this.eventListeners[event]) this.eventListeners[event] = [];
      this.eventListeners[event].push(fn);
    }

    emit(event, payload) {
      if (this.eventListeners[event]) {
        this.eventListeners[event].forEach(fn => fn(payload));
      }
    }

    // --- Imperative Panel API ---
    addPanel(panelConfig) {
      if (!panelConfig || !panelConfig.id) return;
      const panelEl = document.createElement('div');
      panelEl.className = 'gecko-panel';
      panelEl.id = 'gecko-panel-' + panelConfig.id;

      const header = document.createElement('div');
      header.className = 'gecko-panel-header';
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = panelConfig.title || panelConfig.id;
      header.appendChild(titleSpan);

      const arrow = document.createElement('span');
      arrow.textContent = panelConfig.collapsed ? '►' : '▼';
      header.appendChild(arrow);

      const body = document.createElement('div');
      body.className = 'gecko-panel-body' + (panelConfig.collapsed ? ' collapsed' : '');

      header.addEventListener('click', () => {
        const isCollapsed = body.classList.toggle('collapsed');
        arrow.textContent = isCollapsed ? '►' : '▼';
      });

      panelEl.appendChild(header);
      panelEl.appendChild(body);
      this.panelsContainer.appendChild(panelEl);

      const panelRecord = {
        config: panelConfig,
        element: panelEl,
        body: body,
        arrow: arrow
      };
      this.panels.push(panelRecord);

      if (Array.isArray(panelConfig.controls)) {
        panelConfig.controls.forEach(ctrl => this.addControl(panelConfig.id, ctrl));
      }
    }

    removePanel(panelId) {
      const idx = this.panels.findIndex(p => p.config.id === panelId);
      if (idx !== -1) {
        this.panels[idx].element.remove();
        this.panels.splice(idx, 1);
      }
    }

    expandPanel(panelId) {
      const p = this.panels.find(p => p.config.id === panelId);
      if (p) {
        p.body.classList.remove('collapsed');
        p.arrow.textContent = '▼';
      }
    }

    collapsePanel(panelId) {
      const p = this.panels.find(p => p.config.id === panelId);
      if (p) {
        p.body.classList.add('collapsed');
        p.arrow.textContent = '►';
      }
    }

    // --- Control Renderers ---
    addControl(panelId, ctrlConfig) {
      const panel = this.panels.find(p => p.config.id === panelId);
      if (!panel) return;

      const row = document.createElement('div');
      row.className = 'gecko-control-row';

      let ctrlObj = { config: ctrlConfig, element: row };

      switch (ctrlConfig.type) {
        case 'slider': {
          const header = document.createElement('div');
          header.className = 'gecko-control-header';
          const label = document.createElement('span');
          label.className = 'gecko-label';
          label.textContent = ctrlConfig.label || ctrlConfig.id;
          const valBadge = document.createElement('span');
          valBadge.className = 'gecko-val-badge';

          header.appendChild(label);
          header.appendChild(valBadge);
          row.appendChild(header);

          const input = document.createElement('input');
          input.type = 'range';
          input.className = 'gecko-range';
          input.min = ctrlConfig.min !== undefined ? ctrlConfig.min : 0;
          input.max = ctrlConfig.max !== undefined ? ctrlConfig.max : 100;
          input.step = ctrlConfig.step !== undefined ? ctrlConfig.step : 1;
          input.value = ctrlConfig.value !== undefined ? ctrlConfig.value : (ctrlConfig.get ? ctrlConfig.get() : input.min);

          const updateVal = (val) => {
            valBadge.textContent = val + (ctrlConfig.unit ? ' ' + ctrlConfig.unit : '');
          };
          updateVal(input.value);

          input.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            updateVal(v);
            if (ctrlConfig.set) ctrlConfig.set(v);
            this.emit('change', { id: ctrlConfig.id, value: v });
          });

          row.appendChild(input);

          ctrlObj.refresh = () => {
            if (document.activeElement === input) return;
            if (ctrlConfig.get) {
              const current = ctrlConfig.get();
              if (current !== undefined && parseFloat(input.value) !== current) {
                input.value = current;
                updateVal(current);
              }
            }
          };
          break;
        }

        case 'number-input': {
          const header = document.createElement('div');
          header.className = 'gecko-control-header';
          const label = document.createElement('span');
          label.className = 'gecko-label';
          label.textContent = ctrlConfig.label + (ctrlConfig.unit ? ' (' + ctrlConfig.unit + ')' : '');
          header.appendChild(label);
          row.appendChild(header);

          const flexRow = document.createElement('div');
          flexRow.className = 'gecko-flex-row';

          const input = document.createElement('input');
          input.type = 'number';
          input.className = 'gecko-input-text';
          if (ctrlConfig.step !== undefined) input.step = ctrlConfig.step;
          let initVal = ctrlConfig.get ? ctrlConfig.get() : (ctrlConfig.default !== undefined ? ctrlConfig.default : 1.0);
          input.value = initVal;

          let lastValidVal = initVal;

          const applyVal = () => {
            let v = parseFloat(input.value);
            const minBound = ctrlConfig.min !== undefined ? ctrlConfig.min : 0.000001;
            if (isNaN(v) || v < minBound) {
              input.value = lastValidVal;
              return;
            }
            lastValidVal = v;
            if (ctrlConfig.set) ctrlConfig.set(v);
            this.emit('change', { id: ctrlConfig.id, value: v });
          };

          input.addEventListener('blur', applyVal);
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyVal();
          });

          flexRow.appendChild(input);

          if (ctrlConfig.applyOnIcon) {
            const btn = document.createElement('button');
            btn.className = 'gecko-btn';
            btn.textContent = '✓';
            btn.addEventListener('click', applyVal);
            flexRow.appendChild(btn);
          }

          row.appendChild(flexRow);

          ctrlObj.refresh = () => {
            if (document.activeElement === input) return;
            if (ctrlConfig.get) {
              const current = ctrlConfig.get();
              if (current !== undefined && lastValidVal !== current) {
                lastValidVal = current;
                input.value = current;
              }
            }
          };
          break;
        }

        case 'vector-input': {
          const header = document.createElement('div');
          header.className = 'gecko-control-header';
          const label = document.createElement('span');
          label.className = 'gecko-label';
          label.textContent = ctrlConfig.label + (ctrlConfig.unit ? ' (' + ctrlConfig.unit + ')' : '');
          header.appendChild(label);
          row.appendChild(header);

          const flexRow = document.createElement('div');
          flexRow.className = 'gecko-flex-row';

          let initVec = ctrlConfig.get ? ctrlConfig.get() : (ctrlConfig.default || { x: 0, y: 0, z: 0 });

          const inX = document.createElement('input');
          inX.type = 'number';
          inX.className = 'gecko-input-text';
          inX.placeholder = 'X';
          inX.value = initVec.x || 0;

          const inY = document.createElement('input');
          inY.type = 'number';
          inY.className = 'gecko-input-text';
          inY.placeholder = 'Y';
          inY.value = initVec.y || 0;

          const inZ = document.createElement('input');
          inZ.type = 'number';
          inZ.className = 'gecko-input-text';
          inZ.placeholder = 'Z';
          inZ.value = initVec.z || 0;

          flexRow.appendChild(inX);
          flexRow.appendChild(inY);
          flexRow.appendChild(inZ);

          const applyVec = () => {
            const vec = {
              x: parseFloat(inX.value) || 0,
              y: parseFloat(inY.value) || 0,
              z: parseFloat(inZ.value) || 0
            };
            if (ctrlConfig.set) ctrlConfig.set(vec);
            this.emit('change', { id: ctrlConfig.id, value: vec });
          };

          [inX, inY, inZ].forEach(inp => {
            inp.addEventListener('blur', applyVec);
            inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyVec(); });
          });

          if (ctrlConfig.applyOnIcon) {
            const btn = document.createElement('button');
            btn.className = 'gecko-btn';
            btn.textContent = '✓';
            btn.addEventListener('click', applyVec);
            flexRow.appendChild(btn);
          }

          row.appendChild(flexRow);

          ctrlObj.refresh = () => {
            if ([inX, inY, inZ].includes(document.activeElement)) return;
            if (ctrlConfig.get) {
              const current = ctrlConfig.get();
              if (current) {
                if (parseFloat(inX.value) !== current.x) inX.value = current.x;
                if (parseFloat(inY.value) !== current.y) inY.value = current.y;
                if (parseFloat(inZ.value) !== current.z) inZ.value = current.z;
              }
            }
          };
          break;
        }

        case 'checkbox': {
          const flexRow = document.createElement('div');
          flexRow.className = 'gecko-flex-row';

          const label = document.createElement('label');
          label.className = 'gecko-checkbox-label';

          const input = document.createElement('input');
          input.type = 'checkbox';
          input.className = 'gecko-checkbox';
          input.checked = ctrlConfig.get ? !!ctrlConfig.get() : !!ctrlConfig.default;

          input.addEventListener('change', (e) => {
            const checked = e.target.checked;
            if (ctrlConfig.set) ctrlConfig.set(checked);
            this.emit('change', { id: ctrlConfig.id, value: checked });
          });

          const span = document.createElement('span');
          span.className = 'gecko-label';
          span.textContent = ctrlConfig.label || ctrlConfig.id;

          label.appendChild(input);
          label.appendChild(span);
          flexRow.appendChild(label);
          row.appendChild(flexRow);

          ctrlObj.refresh = () => {
            if (ctrlConfig.get) {
              const current = !!ctrlConfig.get();
              if (input.checked !== current) {
                input.checked = current;
              }
            }
          };
          break;
        }

        case 'dropdown': {
          if (ctrlConfig.label) {
            const header = document.createElement('div');
            header.className = 'gecko-control-header';
            const label = document.createElement('span');
            label.className = 'gecko-label';
            label.textContent = ctrlConfig.label;
            header.appendChild(label);
            row.appendChild(header);
          }

          const select = document.createElement('select');
          select.className = 'gecko-select';

          if (Array.isArray(ctrlConfig.options)) {
            ctrlConfig.options.forEach(opt => {
              const option = document.createElement('option');
              option.value = opt.value;
              option.textContent = opt.label || opt.value;
              select.appendChild(option);
            });
          }

          if (ctrlConfig.default) select.value = ctrlConfig.default;
          if (ctrlConfig.get) select.value = ctrlConfig.get();

          select.addEventListener('change', (e) => {
            const val = e.target.value;
            if (ctrlConfig.set) ctrlConfig.set(val);
            this.emit('change', { id: ctrlConfig.id, value: val });
          });

          row.appendChild(select);

          ctrlObj.refresh = () => {
            if (document.activeElement === select) return;
            if (ctrlConfig.get) {
              const current = ctrlConfig.get();
              if (current !== undefined && select.value !== current) {
                select.value = current;
              }
            }
          };
          break;
        }

        case 'metrics': {
          const grid = document.createElement('div');
          grid.className = 'gecko-metrics-grid';
          const fieldElsMap = new Map();

          if (Array.isArray(ctrlConfig.fields)) {
            ctrlConfig.fields.forEach(f => {
              const mRow = document.createElement('div');
              mRow.className = 'gecko-metric-row';

              const mKey = document.createElement('span');
              mKey.className = 'gecko-metric-key';
              mKey.textContent = f.label || f.key;

              const mVal = document.createElement('span');
              mVal.className = 'gecko-metric-val';
              mVal.textContent = '-';

              mRow.appendChild(mKey);
              mRow.appendChild(mVal);
              grid.appendChild(mRow);

              fieldElsMap.set(f.key, { valEl: mVal, field: f });
            });
          }

          row.appendChild(grid);

          ctrlObj.updateMetrics = (stateObj) => {
            fieldElsMap.forEach(({ valEl, field }, key) => {
              if (stateObj[key] !== undefined) {
                valEl.textContent = stateObj[key] + (field.unit ? ' ' + field.unit : '');
              }
            });
          };
          break;
        }

        case 'html': {
          row.innerHTML = ctrlConfig.content || '';
          break;
        }

        case 'button': {
          const btn = document.createElement('button');
          btn.className = 'gecko-btn';
          btn.textContent = ctrlConfig.label || ctrlConfig.id;
          btn.style.width = '100%';
          btn.addEventListener('click', () => {
            if (typeof ctrlConfig.onClick === 'function') ctrlConfig.onClick();
          });
          row.appendChild(btn);
          break;
        }

        case 'separator': {
          const sep = document.createElement('div');
          sep.className = 'gecko-separator';
          row.appendChild(sep);
          break;
        }

        default:
          break;
      }

      panel.body.appendChild(row);
      if (ctrlConfig.id) {
        this.controlsMap.set(ctrlConfig.id, ctrlObj);
      }
    }

    setMetric(key, val) {
      this.controlsMap.forEach(ctrl => {
        if (ctrl.config.type === 'metrics' && typeof ctrl.updateMetrics === 'function') {
          ctrl.updateMetrics({ [key]: val });
        }
      });
    }
  }

  GeckoUI.VERSION = '1.0';
  window.GeckoUI = GeckoUI;

})(window);
