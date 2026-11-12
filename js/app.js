/* ============================================================
   BIBLIOTECA DEPARTAMENTAL JORGE GARCÉS BORRERO
   Autoevaluación de Estándares Mínimos SG-SST
   Decreto 1072 de 2015 · Resolución 0312 de 2019
   ============================================================ */
(function () {
  'use strict';

  const DATA = window.SG_SST_DATA;
  if (!DATA) {
    document.body.insertAdjacentHTML('afterbegin', '<p style="padding:20px;font-family:Arial;color:#B3412F">No se pudo cargar la base de estándares (js/data.js).</p>');
    return;
  }

  const { CYCLES, CRITERIA, STANDARDS, TOTAL_WEIGHT } = DATA;

  const BY_CODE = {};
  STANDARDS.forEach(function (s) { BY_CODE[s.code] = s; });

  const CRITERION_BY_ID = {};
  CRITERIA.forEach(function (c) { CRITERION_BY_ID[c.id] = c; });

  const STORAGE_KEY = 'sg_sst_biblioteca_assessment_v1';
  const DB_NAME = 'sg_sst_biblioteca_evidence';
  const DB_STORE = 'files';
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  const STATUS = {
    cumple: { label: 'Cumple', factor: 1, color: '#2F6B3A' },
    parcial: { label: 'Parcial', factor: 0.5, color: '#B89A6A' },
    no: { label: 'No cumple', factor: 0, color: '#B3412F' },
    na: { label: 'No aplica', factor: null, color: '#7E8A99' }
  };
  const STATUS_ORDER = ['cumple', 'parcial', 'no', 'na'];

  const CATEGORY_ORDER = ['1.1', '1.2', '2', '3.1', '3.2', '3.3', '4.1', '4.2', '5.1', '6.1', '7.1'];
  const CATEGORY_NAMES = {
    '1.1': 'Recursos del SG-SST',
    '1.2': 'Capacitación en SST',
    '2': 'Gestión integral del SG-SST',
    '3.1': 'Condiciones de salud',
    '3.2': 'Registro, reporte e investigación',
    '3.3': 'Mecanismos de vigilancia',
    '4.1': 'Identificación de peligros',
    '4.2': 'Control de peligros y riesgos',
    '5.1': 'Gestión de amenazas',
    '6.1': 'Verificación del SG-SST',
    '7.1': 'Mejoramiento'
  };

  function categoryOf(s) {
    return s.code.charAt(0) === '2' ? '2' : s.group;
  }

  /* ============================================================
     Utilidades
     ============================================================ */
  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function num(value, digits) {
    const d = typeof digits === 'number' ? digits : 1;
    return Number(value || 0).toFixed(d).replace('.', ',');
  }

  function sum(list) {
    return list.reduce(function (total, value) { return total + value; }, 0);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return num(n / 1024, 0) + ' KB';
    return num(n / (1024 * 1024), 1) + ' MB';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function dateStamp() {
    const d = new Date();
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'ev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /* ============================================================
     Estado de la evaluación (localStorage)
     ============================================================ */
  const state = {
    statuses: {},
    notes: {},
    justifications: {},
    meta: {
      entity: 'Biblioteca Departamental Jorge Garcés Borrero',
      year: new Date().getFullYear(),
      responsible: ''
    }
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      if (parsed.meta && typeof parsed.meta === 'object') Object.assign(state.meta, parsed.meta);

      if (parsed.statuses && typeof parsed.statuses === 'object') {
        Object.keys(parsed.statuses).forEach(function (code) {
          if (BY_CODE[code] && STATUS[parsed.statuses[code]]) state.statuses[code] = parsed.statuses[code];
        });
      }
      if (parsed.notes && typeof parsed.notes === 'object') {
        Object.keys(parsed.notes).forEach(function (code) {
          if (BY_CODE[code] && typeof parsed.notes[code] === 'string' && parsed.notes[code].trim()) {
            state.notes[code] = parsed.notes[code];
          }
        });
      }
      if (parsed.justifications && typeof parsed.justifications === 'object') {
        Object.keys(parsed.justifications).forEach(function (code) {
          if (BY_CODE[code] && typeof parsed.justifications[code] === 'string') {
            state.justifications[code] = parsed.justifications[code];
          }
        });
      }

      /* Compatibilidad con la estructura { items: { code: { status, note, j } } } */
      if (parsed.items && typeof parsed.items === 'object') {
        Object.keys(parsed.items).forEach(function (code) {
          if (!BY_CODE[code]) return;
          const item = parsed.items[code] || {};
          if (STATUS[item.status]) state.statuses[code] = item.status;
          if (typeof item.note === 'string' && item.note.trim()) state.notes[code] = item.note;
          const justification = typeof item.justification === 'string' ? item.justification : item.j;
          if (typeof justification === 'string' && justification.trim()) state.justifications[code] = justification;
        });
      }
    } catch (err) {
      console.warn('No se pudo leer la evaluación guardada.', err);
    }
  }

  function getStatus(code) {
    return state.statuses[code] || '';
  }

  function setStatus(code, value) {
    if (value && STATUS[value]) state.statuses[code] = value;
    else delete state.statuses[code];
    saveState();
  }

  function getNote(code) {
    return state.notes[code] || '';
  }

  function getJustification(code) {
    return state.justifications[code] || '';
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        statuses: state.statuses,
        notes: state.notes,
        justifications: state.justifications,
        meta: state.meta
      }));
      updateSaveBadge(true);
    } catch (err) {
      console.warn('No se pudo guardar la evaluación.', err);
      const label = $('#saveState');
      const detail = $('#saveStateText');
      if (label) label.textContent = 'Sin almacenamiento';
      if (detail) detail.textContent = 'Los cambios no se conservarán';
    }
  }

  let badgeTimer = null;
  function updateSaveBadge(saved) {
    const label = $('#saveState');
    const detail = $('#saveStateText');
    if (!label || !detail) return;
    if (saved) {
      const stats = compute();
      label.textContent = 'Guardado local';
      detail.textContent = stats.total.evaluated + '/60 evaluados · ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      clearTimeout(badgeTimer);
      badgeTimer = setTimeout(function () {
        if (label.textContent === 'Guardado local') {
          detail.textContent = stats.total.evaluated + '/60 evaluados';
        }
      }, 4000);
    } else {
      label.textContent = 'Guardado local';
      detail.textContent = 'Listo para evaluar';
    }
  }

  /* ============================================================
     Evidencias (IndexedDB con respaldo en memoria)
     ============================================================ */
  const filesByCode = {};
  const memoryFiles = [];
  let dbPromise = null;
  let memoryOnly = false;

  function openEvidenceDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      if (!('indexedDB' in window)) {
        memoryOnly = true;
        resolve(null);
        return;
      }
      let request;
      try {
        request = indexedDB.open(DB_NAME, 1);
      } catch (err) {
        memoryOnly = true;
        resolve(null);
        return;
      }
      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () {
        console.warn('IndexedDB no disponible; se usará memoria temporal.');
        memoryOnly = true;
        resolve(null);
      };
      request.onblocked = function () {
        memoryOnly = true;
        resolve(null);
      };
    });
    return dbPromise;
  }

  function dbRequest(mode, operation) {
    return openEvidenceDB().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          const tx = db.transaction(DB_STORE, mode);
          const store = tx.objectStore(DB_STORE);
          const request = operation(store);
          tx.oncomplete = function () { resolve(request ? request.result : null); };
          tx.onerror = function () { resolve(null); };
          tx.onabort = function () { resolve(null); };
        } catch (err) {
          resolve(null);
        }
      });
    });
  }

  function normalizeRecord(record) {
    if (!record) return null;
    const standardCode = record.standardCode || record.code;
    if (!standardCode || !BY_CODE[standardCode]) return null;
    return {
      id: record.id || uid(),
      standardCode: standardCode,
      name: record.name || 'soporte',
      type: record.type || record.mime || 'application/octet-stream',
      size: record.size || (record.blob ? record.blob.size : 0),
      addedAt: record.addedAt || record.uploadedAt || new Date().toISOString(),
      blob: record.blob || null
    };
  }

  function metadataOf(record) {
    return {
      id: record.id,
      standardCode: record.standardCode,
      name: record.name,
      type: record.type,
      size: record.size,
      addedAt: record.addedAt
    };
  }

  function sortFiles(files) {
    return files.sort(function (a, b) {
      return String(a.addedAt).localeCompare(String(b.addedAt));
    });
  }

  async function loadEvidence() {
    const records = await dbRequest('readonly', function (store) { return store.getAll(); });
    const source = records && records.length ? records : memoryFiles;
    source.forEach(function (raw) {
      const record = normalizeRecord(raw);
      if (!record) return;
      record.blob = null;
      if (!filesByCode[record.standardCode]) filesByCode[record.standardCode] = [];
      filesByCode[record.standardCode].push(metadataOf(record));
    });
    Object.keys(filesByCode).forEach(function (code) { sortFiles(filesByCode[code]); });
  }

  async function addEvidence(code, file) {
    const record = {
      id: uid(),
      standardCode: code,
      name: file.name || 'soporte',
      type: file.type || 'application/octet-stream',
      size: file.size,
      addedAt: new Date().toISOString(),
      blob: file
    };

    let stored = false;
    if (!memoryOnly) {
      const key = await dbRequest('readwrite', function (store) { return store.put(record); });
      stored = Boolean(key);
    }
    if (!stored) {
      memoryOnly = true;
      memoryFiles.push(record);
    }
    if (!filesByCode[code]) filesByCode[code] = [];
    filesByCode[code].push(metadataOf(record));
    sortFiles(filesByCode[code]);
    return record;
  }

  async function getEvidence(id) {
    if (!memoryOnly) {
      const record = await dbRequest('readonly', function (store) { return store.get(id); });
      if (record) return normalizeRecord(record);
    }
    return normalizeRecord(memoryFiles.find(function (item) { return item.id === id; }));
  }

  async function removeEvidence(id) {
    if (!memoryOnly) {
      await dbRequest('readwrite', function (store) { return store.delete(id); });
    }
    const index = memoryFiles.findIndex(function (item) { return item.id === id; });
    if (index >= 0) memoryFiles.splice(index, 1);
    Object.keys(filesByCode).forEach(function (code) {
      filesByCode[code] = filesByCode[code].filter(function (file) { return file.id !== id; });
      if (!filesByCode[code].length) delete filesByCode[code];
    });
  }

  async function allEvidence() {
    const records = await dbRequest('readonly', function (store) { return store.getAll(); });
    const source = records && records.length ? records : memoryFiles;
    return source.map(normalizeRecord).filter(Boolean);
  }

  async function clearEvidence() {
    await dbRequest('readwrite', function (store) { return store.clear(); });
    memoryFiles.length = 0;
    Object.keys(filesByCode).forEach(function (code) { delete filesByCode[code]; });
  }

  function filesOf(code) {
    return filesByCode[code] || [];
  }

  /* ============================================================
     Cálculo de indicadores
     ============================================================ */
  function blankBucket(max) {
    return { max: max || 0, applicable: 0, obtained: 0, evaluated: 0, pending: 0, count: 0, percentage: 0 };
  }

  function bucketPercentage(bucket) {
    if (bucket.applicable > 0) return bucket.obtained / bucket.applicable * 100;
    return bucket.count > 0 && bucket.evaluated === bucket.count ? 100 : 0;
  }

  function compute() {
    const result = {
      total: blankBucket(TOTAL_WEIGHT),
      counts: { cumple: 0, parcial: 0, no: 0, na: 0, pending: 0 },
      cycles: {},
      categories: {},
      files: 0,
      withEvidence: 0,
      complete: false,
      percentage: 0
    };

    CYCLES.forEach(function (c) { result.cycles[c.id] = blankBucket(); });
    CATEGORY_ORDER.forEach(function (k) { result.categories[k] = blankBucket(); });

    STANDARDS.forEach(function (s) {
      const status = getStatus(s.code);
      const key = status || 'pending';
      result.counts[key] += 1;

      const cycle = result.cycles[s.cycle];
      const category = result.categories[categoryOf(s)];
      [result.total, cycle, category].forEach(function (bucket) {
        bucket.count += 1;
        bucket.max += s.weight;
      });

      if (!status) {
        [result.total, cycle, category].forEach(function (bucket) { bucket.pending += 1; });
      } else {
        [result.total, cycle, category].forEach(function (bucket) { bucket.evaluated += 1; });
        if (status !== 'na') {
          const factor = STATUS[status].factor || 0;
          [result.total, cycle, category].forEach(function (bucket) {
            bucket.applicable += s.weight;
            bucket.obtained += s.weight * factor;
          });
        }
      }

      const count = filesOf(s.code).length;
      if (count) {
        result.withEvidence += 1;
        result.files += count;
      }
    });

    result.total.percentage = bucketPercentage(result.total);
    Object.keys(result.cycles).forEach(function (id) { result.cycles[id].percentage = bucketPercentage(result.cycles[id]); });
    Object.keys(result.categories).forEach(function (id) { result.categories[id].percentage = bucketPercentage(result.categories[id]); });
    result.complete = result.total.pending === 0;
    result.percentage = result.total.percentage;
    return result;
  }

  function ratingFor(bucket, complete) {
    if (bucket.evaluated === 0) return { label: 'Sin evaluar', color: '#7E8A99', tone: 'pending' };
    if (bucket.applicable === 0 && (!complete || bucket.evaluated === bucket.count)) {
      return { label: 'No aplica', color: '#7E8A99', tone: 'na' };
    }
    if (bucket.percentage < 60) return { label: 'Crítico', color: '#B3412F', tone: 'no' };
    if (bucket.percentage <= 85) return { label: 'Moderadamente aceptable', color: '#B89A6A', tone: 'parcial' };
    return { label: 'Aceptable', color: '#2F6B3A', tone: 'cumple' };
  }

  function cycleById(id) {
    return CYCLES.find(function (c) { return c.id === id; });
  }

  /* ============================================================
     Render general
     ============================================================ */
  let activeCycle = 'TODOS';
  let searchTerm = '';
  let statusFilter = 'all';

  function render() {
    const stats = compute();
    renderBanner(stats);
    renderKpis(stats);
    renderCycles(stats);
    renderCategories(stats);
    renderAnalysis(stats);
    renderTabs(stats);
    renderList(stats);
    const year = $('#footerYear');
    if (year) year.textContent = state.meta.year || new Date().getFullYear();
  }

  function renderBanner(stats) {
    const root = $('#banner');
    if (!root) return;
    let html = '';

    if (stats.total.evaluated === 0) {
      html = '<div class="banner-card">' +
        '<div class="banner-copy"><b>Listo para comenzar:</b> evalúa los <b>60 estándares</b>, adjunta los soportes documentales y obtén la calificación automática. Los avances se guardan en este navegador.</div>' +
        '<button class="btn btn-navy" type="button" data-banner-next>Empezar por el primero →</button>' +
        '</div>';
    } else if (!stats.complete) {
      html = '<div class="banner-card">' +
        '<div class="banner-copy"><b class="warn-text">Evaluación incompleta:</b> faltan <b>' + stats.total.pending + ' de 60</b> estándares. La calificación es provisional y puede variar al completar la evaluación. Los “No aplica” requieren justificación.</div>' +
        '<button class="btn btn-navy" type="button" data-banner-next>Ir al siguiente pendiente →</button>' +
        '</div>';
    } else {
      html = '<div class="banner-card ok">' +
        '<div class="banner-copy"><b class="ok-text">Evaluación completa:</b> los 60 estándares fueron evaluados. Resultado: <b>' + num(stats.percentage) + ' %</b> · ' + esc(ratingFor(stats.total, true).label) + '.</div>' +
        '<button class="btn btn-ghost" type="button" data-banner-report>Ver informe</button>' +
        '</div>';
    }

    root.innerHTML = html;
    const next = root.querySelector('[data-banner-next]');
    if (next) next.addEventListener('click', goNextPending);
    const report = root.querySelector('[data-banner-report]');
    if (report) report.addEventListener('click', openPrintReport);
  }

  function renderKpis(stats) {
    const root = $('#kpis');
    if (!root) return;

    const rating = ratingFor(stats.total, stats.complete);
    const percentage = clamp(stats.percentage, 0, 100);
    const gaugeLabel = stats.total.evaluated === 0 ? 'Sin evaluar' : stats.complete ? 'Evaluación completa' : 'Avance provisional';

    const entries = [
      { label: 'Cumplen', color: '#2F6B3A', count: stats.counts.cumple },
      { label: 'Parciales', color: '#B89A6A', count: stats.counts.parcial },
      { label: 'No cumplen', color: '#B3412F', count: stats.counts.no },
      { label: 'No aplica', color: '#7E8A99', count: stats.counts.na },
      { label: 'Pendientes', color: '#D8C7A3', count: stats.counts.pending }
    ];

    let offset = 0;
    const segments = entries.filter(function (entry) { return entry.count > 0; }).map(function (entry) {
      const value = entry.count / STANDARDS.length * 100;
      const segment = '<circle cx="21" cy="21" r="15.9" pathLength="100" stroke="' + entry.color + '" stroke-dasharray="' + value + ' ' + (100 - value) + '" stroke-dashoffset="' + (-offset) + '"/>';
      offset += value;
      return segment;
    }).join('');

    const legend = entries.map(function (entry) {
      return '<div><i style="background:' + entry.color + '"></i>' + entry.label + '<b>' + entry.count + '</b></div>';
    }).join('');

    root.innerHTML =
      '<article class="card kpi-card">' +
        '<div class="kpi-head">' +
          '<h3>Calificación total' + (stats.complete ? '' : ' · provisional') + '</h3>' +
          '<span class="kpi-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 13l4.5-3.5"/><circle cx="12" cy="17" r="1.6"/></svg></span>' +
        '</div>' +
        '<div class="gauge-wrap">' +
          '<svg class="gauge-svg" viewBox="0 0 200 118" role="img" aria-label="Calificación total ' + num(stats.percentage) + ' por ciento">' +
            '<path class="gauge-track" d="M14 102a86 86 0 0 1 172 0" pathLength="100"/>' +
            '<path class="gauge-value" d="M14 102a86 86 0 0 1 172 0" pathLength="100" stroke="' + rating.color + '" stroke-dasharray="' + percentage + ' 100"/>' +
            '<text class="gauge-text" x="100" y="90" text-anchor="middle">' + num(stats.percentage) + '%</text>' +
            '<text class="gauge-label" x="100" y="109" text-anchor="middle">' + esc(gaugeLabel) + '</text>' +
          '</svg>' +
        '</div>' +
        '<div class="kpi-row"><b class="rating-text" style="color:' + rating.color + '">' + esc(rating.label) + '</b><span>' + num(stats.total.obtained) + ' / ' + num(stats.total.applicable) + ' pts</span></div>' +
      '</article>' +

      '<article class="card kpi-card">' +
        '<div class="kpi-head">' +
          '<h3>Estado de estándares</h3>' +
          '<span class="kpi-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v8.5h8.5"/></svg></span>' +
        '</div>' +
        '<div class="donut-wrap">' +
          '<svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Distribución de estados de los 60 estándares">' +
            '<circle cx="21" cy="21" r="15.9" stroke="rgba(31,58,95,.10)"/>' + segments +
          '</svg>' +
          '<div class="donut-legend">' + legend + '</div>' +
        '</div>' +
        '<div class="kpi-row"><span>' + stats.total.evaluated + ' evaluados</span><b>' + stats.total.pending + ' pendientes</b></div>' +
      '</article>' +

      '<article class="card kpi-card">' +
        '<div class="kpi-head">' +
          '<h3>Soportes documentales</h3>' +
          '<span class="kpi-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.5-8.5a3.4 3.4 0 0 1 4.8 4.8l-8.5 8.5a1.8 1.8 0 0 1-2.5-2.5l7.9-7.9"/></svg></span>' +
        '</div>' +
        '<div class="support-big"><strong>' + stats.withEvidence + '</strong><span>/ 60 estándares</span></div>' +
        '<div class="bar"><i style="width:' + (stats.withEvidence / STANDARDS.length * 100) + '%"></i></div>' +
        '<div class="kpi-row"><span>' + stats.files + ' archivo(s) adjunto(s)</span><b>' + num(stats.withEvidence / STANDARDS.length * 100) + ' %</b></div>' +
      '</article>';
  }

  function renderCycles(stats) {
    const root = $('#cycles');
    if (!root) return;
    root.innerHTML = CYCLES.map(function (cycle) {
      const bucket = stats.cycles[cycle.id];
      const rating = ratingFor(bucket, bucket.pending === 0);
      return '<article class="card cycle-card" style="border-top-color:' + cycle.color + '">' +
        '<h3 style="color:' + cycle.color + '">' + esc(cycle.name) + '</h3>' +
        '<div class="big" style="color:' + rating.color + '">' + num(bucket.percentage) + '%</div>' +
        '<div class="bar"><i style="width:' + clamp(bucket.percentage, 0, 100) + '%;background:linear-gradient(180deg,' + cycle.color + 'cc,' + cycle.color + ');box-shadow:0 3px 0 rgba(0,0,0,.18)"></i></div>' +
        '<div class="cycle-meta"><span>' + num(bucket.obtained) + ' de ' + num(bucket.applicable) + ' pts</span><b>' + bucket.count + ' estándares</b></div>' +
        '<div class="cycle-meta"><span style="color:' + rating.color + ';font-weight:800">' + esc(rating.label) + '</span><span>' + bucket.pending + ' pendiente(s)</span></div>' +
      '</article>';
    }).join('');
  }

  function renderCategories(stats) {
    const root = $('#categories');
    const chip = $('#categorySummary');
    if (!root) return;

    root.innerHTML = CATEGORY_ORDER.map(function (key) {
      const bucket = stats.categories[key];
      const rating = ratingFor(bucket, bucket.pending === 0);
      return '<div class="cat-row">' +
        '<div class="row"><span><em>' + key + '</em>' + esc(CATEGORY_NAMES[key]) + '</span>' +
        '<b>' + num(bucket.obtained) + '/' + num(bucket.applicable) + ' pts · ' + num(bucket.percentage) + ' %</b></div>' +
        '<div class="bar"><i style="width:' + clamp(bucket.percentage, 0, 100) + '%;background:linear-gradient(180deg,' + rating.color + 'cc,' + rating.color + ');box-shadow:0 3px 0 rgba(0,0,0,.16)"></i></div>' +
      '</div>';
    }).join('');

    if (chip) {
      const achieved = CATEGORY_ORDER.filter(function (key) {
        const bucket = stats.categories[key];
        return bucket.evaluated > 0 && bucket.percentage > 85;
      }).length;
      chip.textContent = achieved + ' de ' + CATEGORY_ORDER.length + ' categorías ≥ 85 %';
    }
  }

  function buildAnalysis(stats) {
    const items = [];
    const rating = ratingFor(stats.total, stats.complete);
    const pending = STANDARDS.filter(function (s) { return !getStatus(s.code); });

    items.push({
      title: 'Alcance',
      text: '138 personas (58 directas + 80 contratistas). Al superar 50 trabajadores aplican los 60 estándares mínimos, sin exclusiones; todos deben evaluarse.'
    });

    if (pending.length) {
      items.push({
        title: 'Integridad de la evaluación',
        tone: 'alert',
        text: 'INCOMPLETA: faltan ' + pending.length + ' de 60 estándares (' + pending.slice(0, 15).map(function (s) { return s.code; }).join(', ') + (pending.length > 15 ? '…' : '') + '). La calificación es provisional.'
      });
    } else {
      items.push({
        title: 'Integridad de la evaluación',
        tone: 'ok',
        text: 'COMPLETA: se evaluaron los 60 estándares mínimos.'
      });
    }

    let recommendation;
    if (stats.total.evaluated === 0) {
      recommendation = 'Registra el estado de los 60 estándares para obtener la calificación y el plan de acción priorizado.';
    } else if (rating.tone === 'no') {
      recommendation = 'Requiere plan de mejoramiento inmediato y reporte a la ARL; hay riesgo de requerimientos de la autoridad laboral.';
    } else if (rating.tone === 'parcial') {
      recommendation = 'Requiere plan de mejoramiento con seguimiento a las brechas e informe a la ARL.';
    } else if (rating.tone === 'cumple') {
      recommendation = 'Mantener el plan anual, sostener los soportes y socializar los resultados con el COPASST y la alta dirección.';
    } else {
      recommendation = 'Los estándares evaluados no resultaron aplicables; documenta las justificaciones.';
    }
    items.push({
      title: 'Calificación global',
      tone: rating.tone === 'no' ? 'alert' : rating.tone === 'cumple' ? 'ok' : '',
      text: num(stats.total.obtained) + ' de ' + num(stats.total.applicable) + ' puntos aplicables (' + num(stats.percentage) + ' %): ' + rating.label + '. ' + recommendation
    });

    const missingPoints = stats.total.applicable * 0.85 - stats.total.obtained;
    items.push({
      title: 'Meta del 85 %',
      tone: stats.total.applicable > 0 && stats.percentage > 85 ? 'ok' : 'alert',
      text: stats.total.applicable > 0 && stats.percentage > 85
        ? 'Alcanzada.'
        : 'Faltan ' + num(Math.max(0, missingPoints)) + ' puntos para superar el umbral de aceptable' + (stats.complete ? '.' : ' (cálculo provisional).')
    });

    const cycleText = CYCLES.map(function (cycle) {
      const bucket = stats.cycles[cycle.id];
      return cycle.name.replace(/^[IVX]+\.\s*/, '') + ' ' + num(bucket.percentage) + ' %';
    }).join(' · ');
    items.push({ title: 'Ciclos PHVA', text: cycleText + '. Las brechas se priorizan en el ciclo con menor avance.' });

    const categoryRanks = CATEGORY_ORDER.map(function (key) {
      const bucket = stats.categories[key];
      return { key: key, name: CATEGORY_NAMES[key], percentage: bucket.percentage, missing: bucket.applicable - bucket.obtained };
    }).sort(function (a, b) { return a.percentage - b.percentage; });

    items.push({
      title: 'Categorías con menor avance',
      text: categoryRanks.slice(0, 3).map(function (c) {
        return c.key + '. ' + c.name + ' (' + num(c.percentage) + ' %, ' + num(Math.max(0, c.missing)) + ' pts por ganar)';
      }).join('; ') + '.'
    });

    const gaps = STANDARDS.filter(function (s) { return getStatus(s.code) !== 'cumple'; })
      .sort(function (a, b) { return b.weight - a.weight; });
    items.push({
      title: 'Mayores brechas por puntaje',
      text: gaps.length
        ? gaps.slice(0, 5).map(function (s) {
            const st = getStatus(s.code);
            return s.code + ' ' + s.name + ' (' + num(s.weight) + ' pts, ' + (STATUS[st] ? STATUS[st].label.toLowerCase() : 'pendiente') + ')';
          }).join('; ') + '.'
        : 'Sin brechas: los 60 estándares están marcados como Cumple.'
    });

    const passingWithoutEvidence = STANDARDS.filter(function (s) {
      return getStatus(s.code) === 'cumple' && filesOf(s.code).length === 0;
    });
    const naWithoutReason = STANDARDS.filter(function (s) {
      return getStatus(s.code) === 'na' && !getJustification(s.code).trim();
    });
    let evidenceText = stats.withEvidence + ' de 60 estándares con soporte (' + stats.files + ' archivo(s)). ';
    if (passingWithoutEvidence.length) {
      evidenceText += 'Marcados Cumple sin soporte: ' + passingWithoutEvidence.map(function (s) { return s.code; }).join(', ') + '. ';
    }
    if (naWithoutReason.length) {
      evidenceText += 'No aplica sin justificar: ' + naWithoutReason.map(function (s) { return s.code; }).join(', ') + '.';
    }
    if (!passingWithoutEvidence.length && !naWithoutReason.length) {
      evidenceText += 'Trazabilidad documental sin alertas.';
    }
    items.push({
      title: 'Soportes documentales',
      tone: passingWithoutEvidence.length || naWithoutReason.length ? 'alert' : 'ok',
      text: evidenceText.trim()
    });

    return items;
  }

  function renderAnalysis(stats) {
    const root = $('#analysis');
    const chip = $('#analysisChip');
    if (!root) return;
    const items = buildAnalysis(stats);
    root.innerHTML = '<div class="analysis-list">' + items.map(function (item) {
      return '<div class="analysis-item ' + (item.tone || '') + '"><div><b>' + esc(item.title) + ':</b> ' + esc(item.text) + '</div></div>';
    }).join('') + '</div>';

    if (chip) {
      const alerts = items.filter(function (item) { return item.tone === 'alert'; }).length;
      chip.textContent = alerts ? alerts + ' alerta(s) por atender' : 'Sin alertas críticas';
    }
  }

  function renderTabs(stats) {
    const root = $('#tabs');
    if (!root) return;
    const entries = [{ id: 'TODOS', name: 'Todos', pending: stats.total.pending }].concat(CYCLES.map(function (cycle) {
      return { id: cycle.id, name: cycle.name, pending: stats.cycles[cycle.id].pending };
    }));

    root.innerHTML = entries.map(function (entry) {
      return '<button class="tab' + (entry.id === activeCycle ? ' on' : '') + '" type="button" role="tab" aria-selected="' + (entry.id === activeCycle) + '" data-cycle="' + esc(entry.id) + '">' +
        esc(entry.name) + '<span class="tab-count" title="Estándares pendientes">' + entry.pending + '</span>' +
      '</button>';
    }).join('');
  }

  /* ============================================================
     Lista de estándares
     ============================================================ */
  function visibleStandards() {
    const q = searchTerm.trim().toLowerCase();
    return STANDARDS.filter(function (s) {
      if (activeCycle !== 'TODOS' && s.cycle !== activeCycle) return false;
      const status = getStatus(s.code);
      const hasFiles = filesOf(s.code).length > 0;

      if (statusFilter === 'pending' && status) return false;
      if (statusFilter === 'evidence' && !hasFiles) return false;
      if (statusFilter !== 'all' && statusFilter !== 'pending' && statusFilter !== 'evidence' && status !== statusFilter) return false;

      if (!q) return true;
      const haystack = [
        s.code,
        s.name,
        s.desc,
        s.verify,
        CATEGORY_NAMES[categoryOf(s)] || '',
        getNote(s.code)
      ].join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  function statusHint(code) {
    const status = getStatus(code);
    const count = filesOf(code).length;
    if (!status) return { text: count ? 'Con soporte, sin evaluar' : 'Sin evaluar', cls: '' };
    if (status === 'na') {
      return getJustification(code).trim()
        ? { text: 'Excluido del cálculo', cls: 'ok' }
        : { text: 'Falta justificación', cls: 'warn' };
    }
    if ((status === 'cumple' || status === 'parcial') && count === 0) {
      return { text: 'Falta soporte', cls: 'warn' };
    }
    return { text: count + ' soporte' + (count === 1 ? '' : 's'), cls: count ? 'ok' : '' };
  }

  function standardRow(s) {
    const status = getStatus(s.code);
    const note = getNote(s.code);
    const justification = getJustification(s.code);
    const files = filesOf(s.code);
    const hint = statusHint(s.code);

    const options = '<option value=""' + (!status ? ' selected' : '') + '>Pendiente</option>' +
      STATUS_ORDER.map(function (key) {
        return '<option value="' + key + '"' + (status === key ? ' selected' : '') + '>' + STATUS[key].label + '</option>';
      }).join('');

    const fileRows = files.map(function (file) {
      return '<li class="file-row">' +
        '<button type="button" class="file-name" data-preview="' + esc(file.id) + '" title="Vista previa: ' + esc(file.name) + '">' + esc(file.name) + '</button>' +
        '<span class="file-actions">' +
          '<button type="button" class="file-action" data-download="' + esc(file.id) + '" title="Descargar" aria-label="Descargar ' + esc(file.name) + '">↓</button>' +
          '<button type="button" class="file-action danger" data-delete="' + esc(file.id) + '" title="Eliminar" aria-label="Eliminar ' + esc(file.name) + '">×</button>' +
        '</span>' +
      '</li>';
    }).join('');

    return '<div class="std ' + (status || 'pending') + '" id="std-' + esc(s.code) + '" data-code="' + esc(s.code) + '">' +
      '<div class="std-code">' + esc(s.code) + '</div>' +
      '<div class="std-title">' +
        '<b>' + esc(s.name) + '</b>' +
        '<span class="std-verify">' + esc(s.verify) + '</span>' +
        '<div class="std-note-line">' +
          '<button type="button" class="note-link" data-note="' + esc(s.code) + '">' + (note ? 'Observación' : '+ Observación') + '</button>' +
          (note ? '<span class="note-snippet">' + esc(note) + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="std-weight">' + num(s.weight) + ' %<small>del total</small></div>' +
      '<div class="std-status">' +
        '<select data-status="' + esc(s.code) + '" aria-label="Estado del estándar ' + esc(s.code) + '">' + options + '</select>' +
        '<span class="status-hint ' + hint.cls + '">' + esc(hint.text) + '</span>' +
      '</div>' +
      '<div class="std-files">' +
        (status === 'na'
          ? '<input class="justify-input" type="text" data-justify="' + esc(s.code) + '" value="' + esc(justification) + '" placeholder="Justificación obligatoria (No aplica)" aria-label="Justificación de No aplica para el estándar ' + esc(s.code) + '">'
          : '') +
        (files.length ? '<ul class="file-list">' + fileRows + '</ul>' : '') +
        '<label class="file-add">+ Adjuntar soporte' +
          '<input type="file" multiple data-files="' + esc(s.code) + '" aria-label="Adjuntar soportes al estándar ' + esc(s.code) + '">' +
        '</label>' +
      '</div>' +
    '</div>';
  }

  function renderList(stats) {
    const root = $('#list');
    if (!root) return;

    const visible = visibleStandards();
    const counter = $('#resultCount');
    if (counter) {
      const filtered = activeCycle !== 'TODOS' || searchTerm.trim() || statusFilter !== 'all';
      counter.textContent = filtered
        ? visible.length + ' de ' + STANDARDS.length + ' estándares'
        : STANDARDS.length + ' estándares';
    }

    if (!visible.length) {
      root.innerHTML = '<div class="empty-state"><b>Sin resultados</b>No hay estándares que coincidan con el filtro actual.<br><button type="button" class="link-btn" data-clear-filters>Limpiar filtros</button></div>';
      return;
    }

    const grouped = {};
    visible.forEach(function (s) {
      const key = categoryOf(s);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });

    let html = '';
    CATEGORY_ORDER.forEach(function (key) {
      if (!grouped[key]) return;
      const bucket = stats.categories[key];
      html += '<h2 class="cat">' + key + '. ' + esc(CATEGORY_NAMES[key]) +
        '<span class="cat-meta">' + grouped[key].length + ' estándar(es) · ' + num(bucket.percentage) + ' %</span></h2>';
      grouped[key].forEach(function (s) { html += standardRow(s); });
    });

    root.innerHTML = html;
  }

  /* ============================================================
     Modales, avisos y acciones sobre soportes
     ============================================================ */
  let lastFocused = null;
  const modalUrls = [];

  function openModal(options) {
    const backdrop = $('#modalBackdrop');
    if (!backdrop) return;
    lastFocused = document.activeElement;
    $('#modalKicker').textContent = options.kicker || 'Detalle';
    $('#modalTitle').textContent = options.title || 'Detalle';
    $('#modalBody').innerHTML = options.body || '';
    $('#modalFoot').innerHTML = options.foot || '';
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    if (typeof options.onMount === 'function') options.onMount($('#modalBody'), $('#modalFoot'));
    window.setTimeout(function () {
      const target = backdrop.querySelector('[data-autofocus]') || backdrop.querySelector('#modalClose') || backdrop.querySelector('button');
      if (target && target.focus) target.focus();
    }, 40);
  }

  function closeModal() {
    const backdrop = $('#modalBackdrop');
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.style.overflow = '';
    modalUrls.splice(0).forEach(function (url) { URL.revokeObjectURL(url); });
    if (lastFocused && lastFocused.focus) {
      try { lastFocused.focus({ preventScroll: true }); } catch (err) { /* sin foco */ }
    }
    lastFocused = null;
  }

  function confirmAction(options) {
    openModal({
      kicker: options.kicker || 'Confirmar',
      title: options.title || 'Confirmar acción',
      body: '<p class="confirm-copy">' + options.message + '</p>',
      foot: (options.note ? '<span class="modal-note">' + esc(options.note) + '</span>' : '') +
        '<button type="button" class="btn btn-ghost" data-modal-cancel>Cancelar</button>' +
        '<button type="button" class="btn ' + (options.danger ? 'btn-red' : 'btn-green') + '" id="modalConfirm">' + esc(options.confirmLabel || 'Confirmar') + '</button>'
    });

    const cancel = $('#modalFoot [data-modal-cancel]');
    const confirm = $('#modalConfirm');
    if (cancel) cancel.addEventListener('click', closeModal);
    if (confirm) {
      confirm.addEventListener('click', async function () {
        confirm.disabled = true;
        confirm.textContent = 'Procesando…';
        try { await options.onConfirm(); }
        finally { closeModal(); }
      });
    }
  }

  function toast(message, type) {
    const stack = $('#toastStack');
    if (!stack) return;
    const node = document.createElement('div');
    node.className = 'toast' + (type === 'error' ? ' error' : type === 'info' ? ' info' : '');
    node.textContent = message;
    stack.appendChild(node);
    window.setTimeout(function () {
      node.classList.add('is-out');
      window.setTimeout(function () { node.remove(); }, 320);
    }, 4200);
  }

  function downloadBlob(name, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2500);
  }

  async function addFiles(code, fileList) {
    const selected = Array.from(fileList || []);
    if (!selected.length) return;
    let added = 0;
    let rejected = 0;

    for (const file of selected) {
      if (!file.size || file.size > MAX_FILE_SIZE) {
        rejected += 1;
        continue;
      }
      await addEvidence(code, file);
      added += 1;
    }

    if (added) {
      render();
      toast(added === 1 ? 'Soporte adjuntado al estándar ' + code + '.' : added + ' soportes adjuntados al estándar ' + code + '.', 'ok');
    }
    if (rejected) {
      toast(rejected + ' archivo(s) no se adjuntaron: vacíos o superiores a 25 MB.', 'error');
    }
  }

  function findFileMeta(id) {
    const codes = Object.keys(filesByCode);
    for (const code of codes) {
      const found = filesByCode[code].find(function (file) { return file.id === id; });
      if (found) return found;
    }
    return null;
  }

  async function previewEvidence(id) {
    const record = await getEvidence(id);
    if (!record || !record.blob) {
      toast('No se encontró el archivo en este navegador.', 'error');
      return;
    }

    const url = URL.createObjectURL(record.blob);
    modalUrls.push(url);
    const mime = record.type || '';
    let preview;

    if (mime === 'application/pdf' || /\.pdf$/i.test(record.name)) {
      preview = '<iframe class="preview-frame" src="' + url + '" title="Vista previa de ' + esc(record.name) + '"></iframe>';
    } else if (mime.indexOf('image/') === 0 || /\.(png|jpe?g|gif|webp|svg)$/i.test(record.name)) {
      preview = '<img class="preview-image" src="' + url + '" alt="Vista previa de ' + esc(record.name) + '">';
    } else if (mime.indexOf('text/') === 0 || /\.(txt|csv|md|json|log|xml)$/i.test(record.name)) {
      let text = '';
      try { text = await record.blob.text(); } catch (err) { text = ''; }
      preview = text
        ? '<pre class="preview-text">' + esc(text.slice(0, 120000)) + '</pre>'
        : '<div class="preview-unavailable">No se pudo leer el contenido de texto de este archivo.</div>';
    } else {
      preview = '<div class="preview-unavailable"><div><b>Vista previa no disponible</b><br>Este formato no se puede visualizar en el navegador. Descárgalo para abrirlo con la aplicación correspondiente.</div></div>';
    }

    const standard = BY_CODE[record.standardCode];

    openModal({
      kicker: 'Soporte documental · ' + record.standardCode,
      title: record.name,
      body: preview +
        '<div class="file-detail">' +
          '<div><span>Estándar</span><b>' + esc(record.standardCode) + ' · ' + esc(standard ? standard.name : '') + '</b></div>' +
          '<div><span>Tipo</span><b>' + esc(record.type || 'Desconocido') + '</b></div>' +
          '<div><span>Tamaño</span><b>' + formatBytes(record.size) + '</b></div>' +
          '<div><span>Adjuntado</span><b>' + formatDate(record.addedAt) + '</b></div>' +
        '</div>',
      foot: '<button type="button" class="btn btn-ghost" data-close-modal>Cerrar</button>' +
        '<button type="button" class="btn btn-green" id="previewDownload">Descargar archivo</button>',
      onMount: function (body, foot) {
        const close = foot.querySelector('[data-close-modal]');
        if (close) close.addEventListener('click', closeModal);
        const download = foot.querySelector('#previewDownload');
        if (download) download.addEventListener('click', function () {
          downloadBlob(record.name, record.blob);
          toast('Descargando ' + record.name + '.', 'info');
        });
      }
    });
  }

  async function downloadEvidence(id) {
    const record = await getEvidence(id);
    if (!record || !record.blob) {
      toast('No se encontró el archivo en este navegador.', 'error');
      return;
    }
    downloadBlob(record.name, record.blob);
    toast('Descargando ' + record.name + '.', 'info');
  }

  function deleteEvidenceAction(id) {
    const meta = findFileMeta(id);
    if (!meta) {
      toast('No se encontró el soporte.', 'error');
      return;
    }
    confirmAction({
      kicker: 'Eliminar soporte',
      title: 'Quitar archivo del estándar',
      message: '¿Eliminar <b>' + esc(meta.name) + '</b> del estándar <b>' + esc(meta.standardCode) + '</b>? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar soporte',
      danger: true,
      onConfirm: async function () {
        await removeEvidence(id);
        render();
        toast('Soporte eliminado.', 'ok');
      }
    });
  }

  function openNote(code) {
    const standard = BY_CODE[code];
    if (!standard) return;
    openModal({
      kicker: 'Estándar ' + code,
      title: standard.name,
      body: '<p class="modal-help">' + esc(standard.verify) + '</p>' +
        '<label class="modal-help" for="noteField" style="display:block;margin-top:14px;font-weight:800;color:#1F3A5F">Observaciones y plan de acción</label>' +
        '<textarea id="noteField" class="modal-textarea" data-autofocus maxlength="2000" placeholder="Registra hallazgos, responsables, fechas o acciones de mejora…">' + esc(getNote(code)) + '</textarea>',
      foot: '<span class="modal-note">La observación se guarda en este navegador</span>' +
        '<button type="button" class="btn btn-ghost" data-modal-cancel>Cancelar</button>' +
        '<button type="button" class="btn btn-green" id="saveNote">Guardar observación</button>',
      onMount: function (body, foot) {
        foot.querySelector('[data-modal-cancel]').addEventListener('click', closeModal);
        foot.querySelector('#saveNote').addEventListener('click', function () {
          const value = body.querySelector('#noteField').value.trim();
          if (value) state.notes[code] = value;
          else delete state.notes[code];
          saveState();
          closeModal();
          render();
          toast('Observación guardada.', 'ok');
        });
      }
    });
  }

  function goNextPending() {
    const next = STANDARDS.find(function (s) { return !getStatus(s.code); });
    if (!next) {
      toast('Los 60 estándares ya están evaluados.', 'ok');
      return;
    }

    activeCycle = next.cycle;
    searchTerm = '';
    statusFilter = 'all';
    const search = $('#searchInput');
    const filter = $('#statusFilter');
    if (search) search.value = '';
    if (filter) filter.value = 'all';
    render();

    const row = document.getElementById('std-' + next.code);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('is-highlight');
      window.setTimeout(function () { row.classList.remove('is-highlight'); }, 2000);
      const select = row.querySelector('[data-status]');
      if (select) select.focus({ preventScroll: true });
    }
  }

  function clearFilters() {
    activeCycle = 'TODOS';
    searchTerm = '';
    statusFilter = 'all';
    const search = $('#searchInput');
    const filter = $('#statusFilter');
    if (search) search.value = '';
    if (filter) filter.value = 'all';
    render();
  }

  function bindListEvents() {
    const list = $('#list');
    if (!list) return;

    list.addEventListener('change', function (event) {
      const statusSelect = event.target.closest('select[data-status]');
      if (statusSelect) {
        const code = statusSelect.getAttribute('data-status');
        setStatus(code, statusSelect.value);
        render();
        const restored = document.getElementById('std-' + code);
        const nextSelect = restored && restored.querySelector('[data-status]');
        if (nextSelect) nextSelect.focus({ preventScroll: true });
        return;
      }

      const fileInput = event.target.closest('input[data-files]');
      if (fileInput) {
        addFiles(fileInput.getAttribute('data-files'), fileInput.files);
        fileInput.value = '';
        return;
      }

      const justifyInput = event.target.closest('input[data-justify]');
      if (justifyInput) {
        const code = justifyInput.getAttribute('data-justify');
        const value = justifyInput.value.trim();
        if (value) state.justifications[code] = value;
        else delete state.justifications[code];
        saveState();
        render();
        toast(value ? 'Justificación guardada.' : 'La justificación de No aplica es obligatoria.', value ? 'ok' : 'error');
      }
    });

    list.addEventListener('click', function (event) {
      const preview = event.target.closest('[data-preview]');
      if (preview) { previewEvidence(preview.getAttribute('data-preview')); return; }

      const download = event.target.closest('[data-download]');
      if (download) { downloadEvidence(download.getAttribute('data-download')); return; }

      const remove = event.target.closest('[data-delete]');
      if (remove) { deleteEvidenceAction(remove.getAttribute('data-delete')); return; }

      const note = event.target.closest('[data-note]');
      if (note) { openNote(note.getAttribute('data-note')); return; }

      if (event.target.closest('[data-clear-filters]')) clearFilters();
    });

    list.addEventListener('dragover', function (event) {
      const row = event.target.closest('.std');
      if (!row) return;
      const types = event.dataTransfer && event.dataTransfer.types;
      if (types && Array.prototype.indexOf.call(types, 'Files') === -1) return;
      event.preventDefault();
      row.classList.add('is-dragover');
    });

    list.addEventListener('dragleave', function (event) {
      const row = event.target.closest('.std');
      if (!row) return;
      if (!row.contains(event.relatedTarget)) row.classList.remove('is-dragover');
    });

    list.addEventListener('drop', function (event) {
      const row = event.target.closest('.std');
      if (!row) return;
      event.preventDefault();
      row.classList.remove('is-dragover');
      if (event.dataTransfer && event.dataTransfer.files.length) {
        addFiles(row.getAttribute('data-code'), event.dataTransfer.files);
      }
    });
  }

  /* ============================================================
     Exportaciones
     ============================================================ */
  function statusLabel(code) {
    const status = getStatus(code);
    return status ? STATUS[status].label : 'Pendiente';
  }

  function summaryLines(stats) {
    const rating = ratingFor(stats.total, stats.complete);
    return [
      ['Institución', state.meta.entity],
      ['Corte', new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Calificación', num(stats.percentage) + ' %'],
      ['Valoración', rating.label],
      ['Puntos obtenidos', num(stats.total.obtained) + ' de ' + num(stats.total.applicable) + ' puntos aplicables (máximo ' + num(TOTAL_WEIGHT) + ')'],
      ['Estándares evaluados', stats.total.evaluated + ' de 60'],
      ['Estándares pendientes', stats.total.pending],
      ['Estándares con soporte', stats.withEvidence + ' de 60'],
      ['Archivos adjuntos', stats.files]
    ];
  }

  function standardRows() {
    const stats = compute();
    const rows = [[
      'Código', 'Ciclo', 'Categoría', 'Estándar', 'Descripción', 'Criterio de verificación',
      'Valor (%)', 'Estado', 'Puntaje obtenido', 'Justificación (No aplica)', 'Observación',
      'N.° de soportes', 'Soportes documentales'
    ]];

    STANDARDS.forEach(function (s) {
      const status = getStatus(s.code);
      const files = filesOf(s.code);
      rows.push([
        s.code,
        s.cycle,
        CATEGORY_NAMES[categoryOf(s)],
        s.name,
        s.desc,
        s.verify,
        s.weight,
        statusLabel(s.code),
        status && status !== 'na' ? s.weight * STATUS[status].factor : 0,
        getJustification(s.code),
        getNote(s.code),
        files.length,
        files.map(function (file) { return file.name; }).join(' | ')
      ]);
    });

    rows.push(['', '', '', 'TOTAL', '', '', TOTAL_WEIGHT, '', stats.total.obtained, '', '', stats.files, '']);
    return rows;
  }

  function evidenceRows() {
    const rows = [['Código', 'Estándar', 'Archivo', 'Tipo', 'Tamaño (KB)', 'Fecha de carga']];
    STANDARDS.forEach(function (s) {
      filesOf(s.code).forEach(function (file) {
        rows.push([s.code, s.name, file.name, file.type || '', Math.round((file.size || 0) / 1024 * 10) / 10, formatDate(file.addedAt)]);
      });
    });
    return rows;
  }

  function csvCell(value) {
    if (value == null) return '';
    const text = String(value);
    return /[;"\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function exportCSV() {
    const stats = compute();
    const lines = [
      ['BIBLIOTECA DEPARTAMENTAL JORGE GARCÉS BORRERO'],
      ['Autoevaluación de Estándares Mínimos SG-SST · Decreto 1072 de 2015 · Resolución 0312 de 2019'],
      []
    ].concat(summaryLines(stats)).concat([
      [],
      ['DETALLE POR ESTÁNDAR']
    ]).concat(standardRows()).concat([
      [],
      ['RESUMEN POR CICLO PHVA'],
      ['Ciclo', 'Puntaje máximo', 'Puntaje aplicable', 'Obtenido', '% cumplimiento']
    ]).concat(CYCLES.map(function (cycle) {
      const bucket = stats.cycles[cycle.id];
      return [cycle.name, bucket.max, bucket.applicable, bucket.obtained, num(bucket.percentage) + ' %'];
    })).concat([
      [],
      ['RESUMEN POR CATEGORÍA'],
      ['Categoría', 'Puntaje máximo', 'Puntaje aplicable', 'Obtenido', '% cumplimiento']
    ]).concat(CATEGORY_ORDER.map(function (key) {
      const bucket = stats.categories[key];
      return [key + '. ' + CATEGORY_NAMES[key], bucket.max, bucket.applicable, bucket.obtained, num(bucket.percentage) + ' %'];
    })).concat([
      [],
      ['ANÁLISIS E INTERPRETACIÓN'],
      ['Hallazgo', 'Interpretación']
    ]).concat(buildAnalysis(stats).map(function (item) { return [item.title, item.text]; }));

    const content = '\ufeff' + lines.map(function (row) { return row.map(csvCell).join(';'); }).join('\r\n');
    downloadBlob('estandares-minimos-SGSST-' + dateStamp() + '.csv', new Blob([content], { type: 'text/csv;charset=utf-8;' }));
    toast('CSV generado con el detalle y el análisis.', 'ok');
  }

  function exportXLSX() {
    if (!window.XLSX) {
      toast('El generador de Excel no está disponible sin conexión; se descargó el CSV.', 'info');
      exportCSV();
      return;
    }

    const stats = compute();
    const wb = XLSX.utils.book_new();

    const resumen = [
      ['BIBLIOTECA DEPARTAMENTAL JORGE GARCÉS BORRERO'],
      ['Autoevaluación de Estándares Mínimos SG-SST'],
      [],
      ['Indicador', 'Valor']
    ].concat(summaryLines(stats)).concat([
      [],
      ['RESUMEN POR CICLO PHVA'],
      ['Ciclo', 'Puntaje máximo', 'Puntaje aplicable', 'Obtenido', '% cumplimiento']
    ]).concat(CYCLES.map(function (cycle) {
      const bucket = stats.cycles[cycle.id];
      return [cycle.name, bucket.max, bucket.applicable, bucket.obtained, num(bucket.percentage) + ' %'];
    })).concat([
      [],
      ['RESUMEN POR CATEGORÍA'],
      ['Categoría', 'Puntaje máximo', 'Puntaje aplicable', 'Obtenido', '% cumplimiento']
    ]).concat(CATEGORY_ORDER.map(function (key) {
      const bucket = stats.categories[key];
      return [key + '. ' + CATEGORY_NAMES[key], bucket.max, bucket.applicable, bucket.obtained, num(bucket.percentage) + ' %'];
    })).concat([
      [],
      ['ANÁLISIS E INTERPRETACIÓN'],
      ['Hallazgo', 'Interpretación']
    ]).concat(buildAnalysis(stats).map(function (item) { return [item.title, item.text]; }));

    const wsSummary = XLSX.utils.aoa_to_sheet(resumen);
    wsSummary['!cols'] = [{ wch: 42 }, { wch: 110 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

    const wsStandards = XLSX.utils.aoa_to_sheet(standardRows());
    wsStandards['!cols'] = [8, 12, 28, 58, 58, 70, 9, 13, 10, 38, 38, 10, 48].map(function (width) { return { wch: width }; });
    XLSX.utils.book_append_sheet(wb, wsStandards, 'Estándares');

    const wsEvidence = XLSX.utils.aoa_to_sheet(evidenceRows());
    wsEvidence['!cols'] = [{ wch: 9 }, { wch: 58 }, { wch: 46 }, { wch: 34 }, { wch: 12 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, wsEvidence, 'Evidencias');

    XLSX.writeFile(wb, 'estandares-minimos-SGSST-' + dateStamp() + '.xlsx');
    toast('Excel generado con las hojas Resumen, Estándares y Evidencias.', 'ok');
  }

  function hexToRgb(hex) {
    const value = String(hex || '#4A4A4A').replace('#', '');
    return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
  }

  function exportPDF() {
    const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) {
      toast('El generador de PDF no está disponible; se abrió la vista imprimible.', 'info');
      openPrintReport();
      return;
    }

    const stats = compute();
    const rating = ratingFor(stats.total, stats.complete);
    const doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });

    if (typeof doc.autoTable !== 'function') {
      toast('El complemento de tablas PDF no está disponible; se abrió la vista imprimible.', 'info');
      openPrintReport();
      return;
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 34;
    const rgb = hexToRgb(rating.color);

    doc.setFillColor(31, 58, 95);
    doc.rect(0, 0, pageWidth, 92, 'F');
    doc.setFillColor(184, 154, 106);
    doc.rect(0, 92, pageWidth, 5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('Biblioteca Departamental Jorge Garcés Borrero', margin, 36);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('Autoevaluación de Estándares Mínimos del SG-SST', margin, 55);
    doc.setFontSize(8);
    doc.text('Decreto 1072 de 2015, Capítulo III · Resolución 0312 de 2019 · 138 personas (58 directas + 80 contratistas)', margin, 70);
    doc.text('Corte: ' + new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) + ' · ' + stats.total.evaluated + '/60 estándares evaluados', margin, 83);

    doc.setTextColor(31, 58, 95);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    const scoreText = 'Calificación: ' + num(stats.percentage) + ' %';
    doc.text(scoreText, margin, 124);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.text('· ' + rating.label, margin + doc.getTextWidth(scoreText) + 6, 124);
    doc.setTextColor(74, 74, 74);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(num(stats.total.obtained) + ' de ' + num(stats.total.applicable) + ' puntos aplicables · ' + stats.withEvidence + ' estándares con soporte · ' + stats.files + ' archivos adjuntos', margin, 141);

    doc.autoTable({
      startY: 156,
      margin: { left: margin, right: margin },
      head: [['Ciclo PHVA', 'Puntaje máximo', 'Puntaje aplicable', 'Obtenido', '% cumplimiento']],
      body: CYCLES.map(function (cycle) {
        const bucket = stats.cycles[cycle.id];
        return [cycle.name, num(bucket.max), num(bucket.applicable), num(bucket.obtained), num(bucket.percentage) + ' %'];
      }),
      styles: { fontSize: 8, cellPadding: 4, textColor: [74, 74, 74] },
      headStyles: { fillColor: [31, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [244, 238, 225] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 14,
      margin: { left: margin, right: margin },
      head: [['Categoría', 'Puntaje máximo', 'Puntaje aplicable', 'Obtenido', '% cumplimiento']],
      body: CATEGORY_ORDER.map(function (key) {
        const bucket = stats.categories[key];
        return [key + '. ' + CATEGORY_NAMES[key], num(bucket.max), num(bucket.applicable), num(bucket.obtained), num(bucket.percentage) + ' %'];
      }),
      styles: { fontSize: 8, cellPadding: 3.5, textColor: [74, 74, 74] },
      headStyles: { fillColor: [47, 107, 58], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [244, 238, 225] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 14,
      margin: { left: margin, right: margin },
      head: [['Análisis e interpretación', 'Lectura']],
      body: buildAnalysis(stats).map(function (item) { return [item.title, item.text]; }),
      styles: { fontSize: 7.5, cellPadding: 4, textColor: [74, 74, 74], overflow: 'linebreak' },
      headStyles: { fillColor: [31, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 105, fontStyle: 'bold', textColor: [31, 58, 95] } }
    });

    doc.addPage();
    doc.setTextColor(31, 58, 95);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Detalle de los 60 estándares mínimos', margin, 40);

    doc.autoTable({
      startY: 52,
      margin: { left: margin, right: margin },
      head: [['Código', 'Estándar', 'Valor', 'Estado', 'Pts', 'Soportes']],
      body: STANDARDS.map(function (s) {
        const status = getStatus(s.code);
        const points = status && status !== 'na' ? s.weight * STATUS[status].factor : 0;
        return [s.code, s.name, num(s.weight) + ' %', statusLabel(s.code), num(points), String(filesOf(s.code).length)];
      }),
      styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak', textColor: [74, 74, 74] },
      headStyles: { fillColor: [31, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 248, 243] },
      columnStyles: {
        0: { cellWidth: 36 },
        1: { cellWidth: 250 },
        2: { cellWidth: 38, halign: 'center' },
        3: { cellWidth: 62, halign: 'center' },
        4: { cellWidth: 32, halign: 'center' },
        5: { cellWidth: 42, halign: 'center' }
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 3) {
          const standard = STANDARDS[data.row.index];
          const status = getStatus(standard.code);
          const color = status ? hexToRgb(STATUS[status].color) : [126, 138, 153];
          data.cell.styles.textColor = color;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text('Biblioteca Departamental Jorge Garcés Borrero · SG-SST', margin, pageHeight - 20);
      doc.text('Página ' + page + ' de ' + pageCount, pageWidth - margin, pageHeight - 20, { align: 'right' });
    }

    doc.save('informe-estandares-minimos-SGSST-' + dateStamp() + '.pdf');
    toast('Informe PDF generado.', 'ok');
  }

  function openPrintReport() {
    const stats = compute();
    const rating = ratingFor(stats.total, stats.complete);

    const standardRowsHtml = STANDARDS.map(function (s) {
      const status = getStatus(s.code);
      const color = status ? STATUS[status].color : '#7E8A99';
      const points = status && status !== 'na' ? s.weight * STATUS[status].factor : 0;
      return '<tr>' +
        '<td class="code">' + esc(s.code) + '</td>' +
        '<td>' + esc(s.name) + '</td>' +
        '<td class="num">' + num(s.weight) + ' %</td>' +
        '<td><span class="dot" style="background:' + color + '"></span>' + statusLabel(s.code) + '</td>' +
        '<td class="num">' + num(points) + '</td>' +
        '<td class="num">' + filesOf(s.code).length + '</td>' +
      '</tr>';
    }).join('');

    const cycleRows = CYCLES.map(function (cycle) {
      const bucket = stats.cycles[cycle.id];
      return '<tr><td>' + esc(cycle.name) + '</td><td class="num">' + num(bucket.max) + '</td><td class="num">' + num(bucket.applicable) + '</td><td class="num">' + num(bucket.obtained) + '</td><td class="num">' + num(bucket.percentage) + ' %</td></tr>';
    }).join('');

    const categoryRows = CATEGORY_ORDER.map(function (key) {
      const bucket = stats.categories[key];
      return '<tr><td>' + key + '. ' + esc(CATEGORY_NAMES[key]) + '</td><td class="num">' + num(bucket.max) + '</td><td class="num">' + num(bucket.applicable) + '</td><td class="num">' + num(bucket.obtained) + '</td><td class="num">' + num(bucket.percentage) + ' %</td></tr>';
    }).join('');

    const analysisRows = buildAnalysis(stats).map(function (item) {
      return '<tr><td class="strong">' + esc(item.title) + '</td><td>' + esc(item.text) + '</td></tr>';
    }).join('');

    const generated = new Date().toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
    const html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Informe SG-SST · Biblioteca Departamental</title><style>' +
      '@page{size:letter landscape;margin:10mm}' +
      '*{box-sizing:border-box}' +
      'body{font-family:"Segoe UI",Arial,sans-serif;color:#333;margin:0;font-size:9pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      'header{background:#1F3A5F;color:#fff;padding:14px 18px;border-bottom:5px solid #B89A6A}' +
      'header h1{margin:0;font-size:19px}header p{margin:3px 0 0;font-size:8.5pt;opacity:.85}' +
      '.meta{display:flex;gap:8px;margin:12px 0}' +
      '.box{flex:1;border:1px solid #ddd;border-top:4px solid #0B86D9;border-radius:4px;padding:8px 10px;background:#fff}' +
      '.box b{display:block;font-size:15px;color:#1F3A5F}.box span{display:block;font-size:7.5pt;color:#666;text-transform:uppercase;letter-spacing:.06em}' +
      'h2{font-size:11.5pt;color:#1F3A5F;margin:14px 0 6px;padding-left:8px;border-left:4px solid #B89A6A}' +
      'table{width:100%;border-collapse:collapse;font-size:7.8pt;margin:6px 0 10px}' +
      'thead{display:table-header-group}tr{break-inside:avoid}' +
      'th{background:#1F3A5F;color:#fff;text-align:left;padding:5px 6px;font-size:7.4pt}' +
      'td{padding:4px 6px;border-bottom:1px solid #e6e0d3;vertical-align:top}' +
      'tbody tr:nth-child(even){background:#FAF8F3}' +
      '.num{text-align:right;white-space:nowrap}.code{font-weight:700;color:#0868A8;white-space:nowrap}' +
      '.strong{font-weight:700;color:#1F3A5F;width:20%}' +
      '.dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:4px}' +
      'footer{margin-top:10px;font-size:7pt;color:#777;border-top:1px solid #ddd;padding-top:5px;display:flex;justify-content:space-between}' +
      '</style></head><body>' +
      '<header><h1>Biblioteca Departamental Jorge Garcés Borrero</h1>' +
      '<p>Evaluación de Estándares Mínimos del SG-SST · Decreto 1072 de 2015, Capítulo III · Resolución 0312 de 2019 · 138 personas (58 directas + 80 contratistas)</p></header>' +
      '<div class="meta">' +
        '<div class="box"><span>Calificación total</span><b style="color:' + rating.color + '">' + num(stats.percentage) + ' %</b><span>' + esc(rating.label) + '</span></div>' +
        '<div class="box"><span>Puntos obtenidos</span><b>' + num(stats.total.obtained) + ' / ' + num(stats.total.applicable) + '</b><span>Máximo ' + num(TOTAL_WEIGHT) + '</span></div>' +
        '<div class="box"><span>Evaluación</span><b>' + stats.total.evaluated + ' / 60</b><span>' + stats.total.pending + ' pendientes</span></div>' +
        '<div class="box"><span>Soportes</span><b>' + stats.withEvidence + ' / 60</b><span>' + stats.files + ' archivos</span></div>' +
      '</div>' +
      '<h2>Cumplimiento por ciclo PHVA</h2><table><thead><tr><th>Ciclo</th><th>Máximo</th><th>Aplicable</th><th>Obtenido</th><th>% cumplimiento</th></tr></thead><tbody>' + cycleRows + '</tbody></table>' +
      '<h2>Cumplimiento por categoría</h2><table><thead><tr><th>Categoría</th><th>Máximo</th><th>Aplicable</th><th>Obtenido</th><th>% cumplimiento</th></tr></thead><tbody>' + categoryRows + '</tbody></table>' +
      '<h2>Análisis e interpretación de indicadores</h2><table><tbody>' + analysisRows + '</tbody></table>' +
      '<h2>Detalle de los 60 estándares mínimos</h2><table><thead><tr><th>Código</th><th>Estándar</th><th>Valor</th><th>Estado</th><th>Pts</th><th>Soportes</th></tr></thead><tbody>' + standardRowsHtml + '</tbody></table>' +
      '<footer><span>Generado el ' + esc(generated) + ' · Los soportes quedan almacenados en el navegador de origen.</span><span>SG-SST · Biblioteca Departamental</span></footer>' +
      '</body></html>';

    let iframe = document.getElementById('printFrame');
    if (iframe) iframe.remove();
    iframe = document.createElement('iframe');
    iframe.id = 'printFrame';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
    iframe.onload = function () {
      window.setTimeout(function () {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          toast('No se pudo abrir el diálogo de impresión.', 'error');
        }
      }, 350);
      window.setTimeout(function () { iframe.remove(); }, 60000);
    };
    document.body.appendChild(iframe);
    iframe.srcdoc = html;
    toast('Vista imprimible generada. Elige “Guardar como PDF” en el diálogo.', 'info');
  }

  async function exportZIP() {
    if (!window.JSZip) {
      toast('No se pudo cargar el compresor ZIP. Revisa la conexión e inténtalo de nuevo.', 'error');
      return;
    }

    const records = await allEvidence();
    if (!records.length) {
      toast('No hay soportes adjuntos para comprimir.', 'error');
      return;
    }

    const zip = new window.JSZip();
    const used = {};
    records.forEach(function (record) {
      if (!record.blob) return;
      const folder = 'soportes/' + record.standardCode;
      let path = folder + '/' + record.name;
      if (used[path]) path = folder + '/' + record.id.slice(0, 6) + '-' + record.name;
      used[path] = true;
      zip.file(path, record.blob);
    });

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    downloadBlob('soportes-SG-SST-' + dateStamp() + '.zip', blob);
    toast('ZIP generado con ' + records.length + ' soporte(s).', 'ok');
  }

  /* ============================================================
     Eventos globales e inicio
     ============================================================ */
  function resetAll() {
    confirmAction({
      kicker: 'Reiniciar evaluación',
      title: 'Borrar evaluación y soportes',
      message: 'Se eliminarán <b>los estados, observaciones, justificaciones y todos los archivos adjuntos</b> de los 60 estándares. Esta acción no se puede deshacer.',
      confirmLabel: 'Sí, reiniciar',
      danger: true,
      note: 'Se conservan los datos de la institución.',
      onConfirm: async function () {
        state.statuses = {};
        state.notes = {};
        state.justifications = {};
        try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* sin almacenamiento */ }
        await clearEvidence();
        activeCycle = 'TODOS';
        searchTerm = '';
        statusFilter = 'all';
        const search = $('#searchInput');
        const filter = $('#statusFilter');
        if (search) search.value = '';
        if (filter) filter.value = 'all';
        saveState();
        render();
        toast('Evaluación reiniciada. Todos los estándares quedaron pendientes.', 'ok');
      }
    });
  }

  function bindGlobalEvents() {
    const modalClose = $('#modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);

    const backdrop = $('#modalBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', function (event) {
        if (event.target === backdrop) closeModal();
      });
      backdrop.addEventListener('keydown', function (event) {
        if (event.key !== 'Tab') return;
        const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', backdrop).filter(function (el) {
          return !el.disabled && el.offsetParent !== null;
        });
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && backdrop && !backdrop.hidden) closeModal();
    });

    const tabs = $('#tabs');
    if (tabs) {
      tabs.addEventListener('click', function (event) {
        const button = event.target.closest('[data-cycle]');
        if (!button) return;
        activeCycle = button.getAttribute('data-cycle');
        render();
      });
    }

    const search = $('#searchInput');
    if (search) {
      search.addEventListener('input', function (event) {
        searchTerm = event.target.value;
        if (searchTerm.trim() && activeCycle !== 'TODOS') activeCycle = 'TODOS';
        render();
      });
    }

    const filter = $('#statusFilter');
    if (filter) {
      filter.addEventListener('change', function (event) {
        statusFilter = event.target.value;
        render();
      });
    }

    $$('[data-export]').forEach(function (button) {
      button.addEventListener('click', function () {
        const kind = button.getAttribute('data-export');
        if (kind === 'csv') exportCSV();
        else if (kind === 'xlsx') exportXLSX();
        else if (kind === 'pdf') exportPDF();
      });
    });

    const zip = $('#zipBtn');
    if (zip) zip.addEventListener('click', exportZIP);
    const print = $('#printBtn');
    if (print) print.addEventListener('click', openPrintReport);
    const next = $('#nextPendingBtn');
    if (next) next.addEventListener('click', goNextPending);
    const reset = $('#resetBtn');
    if (reset) reset.addEventListener('click', resetAll);

    window.addEventListener('storage', function (event) {
      if (event.key !== STORAGE_KEY) return;
      state.statuses = {};
      state.notes = {};
      state.justifications = {};
      loadState();
      render();
      toast('Evaluación actualizada desde otra pestaña.', 'info');
    });
  }

  async function boot() {
    loadState();
    await loadEvidence();
    bindListEvents();
    bindGlobalEvents();
    render();
    updateSaveBadge(true);

    if (memoryOnly) {
      window.setTimeout(function () {
        toast('El almacenamiento local no está disponible: los soportes se conservarán solo durante esta sesión.', 'info');
      }, 900);
    }
  }

  boot();
})();
