// =========================================
// INDICATOR PAGE CONTROLLERS
// Extracted from indicator.html.j2
// =========================================

// --- 1. Code Panel State ---
const AppState = {
    activeLang: 'csharp',
    codeType: 'simple',
    isPanelVisible: false,
    isPanelExpanded: false,
    codeLoaded: false,
    codeLoading: false,
};

// --- 2. Canvas State (Full Pan/Zoom) ---
const CanvasState = {
    scale: 1, panX: 0, panY: 0,
    isDragging: false, startX: 0, startY: 0,
    minScale: 0.1, maxScale: 5.0
};

// Element references (populated after DOM ready)
let els = {};

// --- 3. Code Panel Functions ---
function updateView() {
    // 1. Code Content Visibility
    document.querySelectorAll('.code-content').forEach(el => el.classList.add('hidden'));
    const activeId = `code-${AppState.activeLang}-${AppState.codeType}`;
    const activeEl = document.getElementById(activeId);
    if (activeEl) activeEl.classList.remove('hidden');

    // 2. Overlay Visibility
    const overlay = document.getElementById('code-panel-overlay');
    if (overlay) {
        if (AppState.isPanelVisible) overlay.classList.remove('panel-hidden');
        else overlay.classList.add('panel-hidden');

        if (AppState.isPanelExpanded) {
            overlay.classList.add('panel-expanded');
            const iconExp = document.getElementById('icon-expand');
            const iconCol = document.getElementById('icon-collapse');
            if (iconExp) iconExp.classList.add('hidden');
            if (iconCol) iconCol.classList.remove('hidden');
        } else {
            overlay.classList.remove('panel-expanded');
            const iconExp = document.getElementById('icon-expand');
            const iconCol = document.getElementById('icon-collapse');
            if (iconExp) iconExp.classList.remove('hidden');
            if (iconCol) iconCol.classList.add('hidden');
        }
    }

    // 3. Button States
    const btnCs = document.getElementById('btn-lang-csharp');
    const btnPy = document.getElementById('btn-lang-python');

    [btnCs, btnPy].forEach(btn => {
        if (btn) btn.className = "px-2 py-1 text-xs rounded transition-colors text-slate-500 hover:bg-slate-100";
    });

    if (AppState.activeLang === 'csharp' && btnCs) {
        btnCs.className = "px-2 py-1 text-xs rounded transition-colors btn-lang-active";
    } else if (AppState.activeLang === 'python' && btnPy) {
        btnPy.className = "px-2 py-1 text-xs rounded transition-colors btn-lang-active";
    }

    const btnSimple = document.getElementById('btn-type-simple');
    const btnDetailed = document.getElementById('btn-type-detailed');

    if (btnSimple) btnSimple.className = `text-xs transition-colors ${AppState.codeType === 'simple' ? 'btn-type-active' : 'text-slate-500 hover:text-indigo-600'}`;
    if (btnDetailed) btnDetailed.className = `text-xs transition-colors ${AppState.codeType === 'detailed' ? 'btn-type-active' : 'text-slate-500 hover:text-indigo-600'}`;
}

// --- Code Lazy Loading ---
// --- Code Lazy Loading (JSONP-style for file:// support) ---
window.registerIndicatorCode = (indicatorName, codes) => {
    // 1. Inject into DOM immediately
    const ids = ['csharp_simple', 'csharp_detailed', 'python_simple', 'python_detailed'];
    ids.forEach(key => {
        const elId = 'code-' + key.replace('_', '-');
        const el = document.getElementById(elId);
        if (el && codes[key]) {
            el.innerHTML = codes[key].trim();
        }
    });

    // 2. Resolve pending promise if any
    if (window._resolveCodeLoad) {
        window._resolveCodeLoad(codes);
        window._resolveCodeLoad = null;
    }

    AppState.codeLoaded = true;
    updateView();
};

async function loadCodeIfNeeded() {
    if (AppState.codeLoaded || AppState.codeLoading) return;

    AppState.codeLoading = true;
    const panelBody = document.getElementById('code-panel-body');
    const loadingEl = document.getElementById('code-loading');
    const codeSrc = panelBody?.dataset.codeSrc;

    if (!codeSrc) {
        console.warn('Code source not found');
        AppState.codeLoading = false;
        return;
    }

    if (loadingEl) loadingEl.classList.remove('hidden');

    return new Promise((resolve) => {
        window._resolveCodeLoad = resolve;

        const script = document.createElement('script');
        script.src = codeSrc;
        script.onerror = () => {
            console.error('Failed to load code script:', codeSrc);
            if (loadingEl) {
                loadingEl.textContent = "Error loading code.";
                loadingEl.classList.remove('hidden'); // Keep visible on error
            }
            AppState.codeLoading = false;
            resolve(null);
        };
        document.body.appendChild(script);
    }).finally(() => {
        if (loadingEl && AppState.codeLoaded) { // Only hide if success
            loadingEl.classList.add('hidden');
        }
        // codeLoading reset is handled in registerIndicatorCode or onerror, 
        // but for safety we can reset here if we want to allow retries, 
        // though registerIndicatorCode sets codeLoaded=true preventing retry.
        // If error, codeLoaded=false, so retry is possible.
    });
}

// Global exports for inline onclick handlers
window.setLang = (lang) => { AppState.activeLang = lang; updateView(); }
window.setType = (type) => { AppState.codeType = type; updateView(); }
window.toggleCodePanel = () => {
    AppState.isPanelVisible = !AppState.isPanelVisible;
    if (AppState.isPanelVisible) {
        loadCodeIfNeeded();  // Lazy load on first open
    }
    updateView();
}
window.toggleExpand = () => { AppState.isPanelExpanded = !AppState.isPanelExpanded; updateView(); }
window.copyCode = async () => {
    const activeId = `code-${AppState.activeLang}-${AppState.codeType}`;
    const el = document.getElementById(activeId);
    if (!el) return;
    let text = "";
    const lines = el.querySelectorAll('.code-line');
    if (lines.length > 0) {
        text = Array.from(lines).map(line => {
            const clone = line.cloneNode(true);
            // Remove line number span (always the first child with user-select:none)
            const firstSpan = clone.querySelector('span');
            if (firstSpan && firstSpan.style.userSelect === 'none') {
                firstSpan.remove();
            } else if (firstSpan && firstSpan.getAttribute('style') && firstSpan.getAttribute('style').includes('user-select:none')) {
                // Fallback for inline style string check
                firstSpan.remove();
            }
            return clone.textContent; // .trimRight() might be good but let's keep it raw for now
        }).join('\n');
    } else {
        text = el.textContent;
    }
    try {
        await navigator.clipboard.writeText(text);
        const iconCopy = document.getElementById('icon-copy');
        const iconDone = document.getElementById('icon-copy-done');
        if (iconCopy && iconDone) {
            iconCopy.classList.add('hidden');
            iconDone.classList.remove('hidden');
            setTimeout(() => {
                iconCopy.classList.remove('hidden');
                iconDone.classList.add('hidden');
            }, 2000);
        }
    } catch (err) { console.error("Failed to copy:", err); }
}

// --- 4. Keyboard Controls for Canvas ---
window.handleCanvasKeyboard = (event) => {
    const step = 30;
    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            CanvasState.panY += step;
            break;
        case 'ArrowDown':
            event.preventDefault();
            CanvasState.panY -= step;
            break;
        case 'ArrowLeft':
            event.preventDefault();
            CanvasState.panX += step;
            break;
        case 'ArrowRight':
            event.preventDefault();
            CanvasState.panX -= step;
            break;
        case '+':
        case '=':
            event.preventDefault();
            if (window.zoomAction) window.zoomAction('in');
            return;
        case '-':
            event.preventDefault();
            if (window.zoomAction) window.zoomAction('out');
            return;
        case 'r':
        case 'R':
            event.preventDefault();
            if (window.resetView) window.resetView();
            return;
        default:
            return;
    }
    // Update canvas transform after pan
    const content = document.getElementById('canvas-content');
    if (content) {
        content.style.transform = `translate(${CanvasState.panX}px, ${CanvasState.panY}px) scale(${CanvasState.scale})`;
    }
};

// --- 5. PlaygroundController ---
window.PlaygroundController = {
    instanceChart: null,
    showError: (msg) => {
        console.error('Playground Error:', msg);
        const outputEl = document.getElementById('output-data');
        if (outputEl) outputEl.value = 'Error: ' + msg;
    },
    clearError: () => { },
    init: () => {
        try {
            // 1. Render Dynamic Settings if Config exists
            const settingsContainer = document.getElementById('settings-container');
            if (typeof IndicatorConfig !== 'undefined' && Array.isArray(IndicatorConfig) && IndicatorConfig.length > 0 && settingsContainer) {
                settingsContainer.innerHTML = '';
                IndicatorConfig.forEach(cfg => {
                    const div = document.createElement('div');
                    div.className = "flex flex-col";
                    const label = document.createElement('label');
                    label.className = "text-xs text-slate-500 mb-1";
                    label.textContent = cfg.label;
                    const input = document.createElement('input');
                    input.id = `param-${cfg.id}`;
                    input.type = cfg.type || "number";
                    input.className = "bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow";
                    input.value = cfg.value;
                    if (cfg.min !== undefined) input.min = cfg.min;
                    if (cfg.max !== undefined) input.max = cfg.max;
                    if (cfg.step !== undefined) input.step = cfg.step;
                    input.addEventListener('change', PlaygroundController.update);

                    div.appendChild(label);
                    div.appendChild(input);
                    settingsContainer.appendChild(div);
                });
            }

            // 2. Generate Initial Random Sample Data
            PlaygroundController.generateSample('ohlcv');
        } catch (e) { PlaygroundController.showError(e.message); }
    },
    generateSample: (type) => {
        const sampleData = [];
        const count = 150;
        let price = 100;

        if (type === 'ohlcv') {
            sampleData.push("Date,Open,High,Low,Close,Volume");
            const now = new Date();
            for (let i = 0; i < count; i++) {
                const date = new Date(now.getTime() - (count - i) * 86400000).toISOString().split('T')[0];
                const trend = Math.sin(i * 0.1) * 2;
                const noise = (Math.random() - 0.5) * 2;
                const close = 100 + trend + noise + (i * 0.1);
                const open = close + (Math.random() - 0.5);
                const high = Math.max(open, close) + Math.random();
                const low = Math.min(open, close) - Math.random();
                const vol = Math.floor(1000 + Math.random() * 500);
                sampleData.push(`${date},${open.toFixed(2)},${high.toFixed(2)},${low.toFixed(2)},${close.toFixed(2)},${vol}`);
            }
        } else {
            for (let i = 0; i < count; i++) {
                price = price + (Math.random() - 0.5) * 5;
                sampleData.push(price.toFixed(2));
            }
        }

        const inputEl = document.getElementById('input-data');
        if (inputEl) inputEl.value = sampleData.join('\n');
        PlaygroundController.update();
    },
    update: () => {
        PlaygroundController.clearError();

        // Dynamic Params Collection
        const params = {};
        if (typeof IndicatorConfig !== 'undefined' && Array.isArray(IndicatorConfig) && IndicatorConfig.length > 0) {
            IndicatorConfig.forEach(cfg => {
                const el = document.getElementById(`param-${cfg.id}`);
                if (el) params[cfg.id] = parseFloat(el.value);
            });
        } else {
            const periodEl = document.getElementById('param-period');
            params.period = periodEl ? parseInt(periodEl.value) || 14 : 14;
        }

        const rawData = document.getElementById('input-data').value.trim();
        let lines = [];
        if (rawData.includes('\n')) {
            lines = rawData.split('\n').map(l => l.trim()).filter(l => l);
            const firstVal = parseFloat(lines[0].split(/[,\t]/)[0]);
            const isHeader = isNaN(firstVal) && /[a-zA-Z]/.test(lines[0]);

            if (!isHeader && lines.some(l => l.includes(','))) {
                lines = rawData.split(/[\n,]+/).map(l => l.trim()).filter(l => l);
            }
        } else {
            lines = rawData.split(',').map(l => l.trim()).filter(l => l);
        }

        let parsedData = [];
        const firstLine = lines[0] || "";
        const firstVal = parseFloat(firstLine.split(/[,\t]/)[0]);
        const isMultiColumn = isNaN(firstVal) && /[a-zA-Z]/.test(firstLine);

        if (isMultiColumn && lines.length > 1) {
            const headers = firstLine.split(/[,\t]+/).map(h => h.trim().toLowerCase());
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(/[,\t]+/).map(v => parseFloat(v));
                if (parts.some(isNaN)) continue;
                const row = { time: i - 1 };
                headers.forEach((h, idx) => { row[h] = parts[idx]; });
                if (row.close === undefined && row.c !== undefined) row.close = row.c;
                parsedData.push(row);
            }
        } else {
            parsedData = lines.map((l, i) => {
                const val = parseFloat(l);
                return isNaN(val) ? null : { time: i, close: val };
            }).filter(d => d);
        }

        if (parsedData.length < 2) {
            PlaygroundController.showError("Insufficient data.");
            return;
        }

        let indicatorValues = [];
        try {
            if (typeof IndicatorLogic !== 'undefined' && IndicatorLogic.calculate) {
                indicatorValues = IndicatorLogic.calculate(parsedData, params);
            } else {
                indicatorValues = PlaygroundController.calculateRSI(parsedData, params.period);
            }
        } catch (e) {
            console.error("Calculation Error", e);
            PlaygroundController.showError("Calculation Error: " + e.message);
            return;
        }

        // Format Output
        const outputEl = document.getElementById('output-data');
        if (outputEl) {
            if (Array.isArray(indicatorValues)) {
                outputEl.value = indicatorValues.map(v => v === null ? "" : v).join('\n');
            } else if (typeof indicatorValues === 'object') {
                const keys = Object.keys(indicatorValues);
                if (keys.length === 0) {
                    outputEl.value = "";
                } else {
                    const length = indicatorValues[keys[0]].length;
                    const separator = ',';
                    let csv = keys.join(separator) + '\n';
                    for (let i = 0; i < length; i++) {
                        const row = keys.map(k => {
                            const val = indicatorValues[k][i];
                            return (val === null || val === undefined) ? "" : val;
                        });
                        csv += row.join(separator) + '\n';
                    }
                    outputEl.value = csv;
                }
            } else {
                outputEl.value = JSON.stringify(indicatorValues, null, 2);
            }
        }
        PlaygroundController.renderChart(parsedData, indicatorValues);
    },
    calculateRSI: (data, period) => {
        const values = [];
        values.push(null);
        if (data.length < 2) return values;
        let sumGains = 0, sumLosses = 0;
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            const gain = change > 0 ? change : 0;
            const loss = change < 0 ? -change : 0;
            if (i < period) {
                sumGains += gain; sumLosses += loss;
                values.push(null);
                continue;
            }
            if (i === period) {
                sumGains += gain; sumLosses += loss;
                const avgGain = sumGains / period;
                const avgLoss = sumLosses / period;
                const rs = avgLoss < 0.0001 ? 100 : avgGain / avgLoss;
                values.push(100 - (100 / (1 + rs)));
                sumGains = avgGain; sumLosses = avgLoss;
                continue;
            }
            sumGains = (sumGains * (period - 1) + gain) / period;
            sumLosses = (sumLosses * (period - 1) + loss) / period;
            const rs = sumLosses < 0.0001 ? 100 : sumGains / sumLosses;
            values.push(100 - (100 / (1 + rs)));
        }
        return values;
    },
    renderChart: (prices, indicatorValues) => {
        const canvas = document.getElementById('indicatorChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const labels = prices.map((_, i) => i);
        if (PlaygroundController.instanceChart) PlaygroundController.instanceChart.destroy();

        const datasets = [];
        const IndicatorDisplay = window.IndicatorDisplay || { isOverlay: false, plots: {} };

        // 1. Overlay: Close Price (if enabled)
        if (IndicatorDisplay && IndicatorDisplay.isOverlay) {
            datasets.push({
                label: 'Close Price',
                data: prices.map(p => p.close),
                borderColor: '#94a3b8',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                borderWidth: 1,
                pointRadius: 0,
                tension: 0.1
            });
        }

        // 2. Indicator Data
        const defaultColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

        if (Array.isArray(indicatorValues)) {
            datasets.push({
                label: 'Indicator',
                data: indicatorValues,
                borderColor: IndicatorDisplay.plots && IndicatorDisplay.plots.main ? IndicatorDisplay.plots.main.color : '#4F46E5',
                backgroundColor: 'transparent',
                tension: 0.1, pointRadius: 0, borderWidth: 2,
                spanGaps: true
            });
        } else if (typeof indicatorValues === 'object' && indicatorValues !== null) {
            Object.keys(indicatorValues).forEach((key, idx) => {
                const conf = (IndicatorDisplay.plots && IndicatorDisplay.plots[key]) || {};
                const color = conf.color || defaultColors[idx % defaultColors.length];

                const dataset = {
                    label: conf.label || key,
                    data: indicatorValues[key],
                    borderColor: color,
                    backgroundColor: conf.backgroundColor || 'transparent',
                    tension: 0.1,
                    pointRadius: 0,
                    borderWidth: 2,
                    spanGaps: true,
                    type: conf.type || 'line',
                    order: conf.type === 'bar' ? 10 : 0
                };

                if (conf.fill) {
                    dataset.fill = conf.fill;
                }

                datasets.push(dataset);
            });
        }

        PlaygroundController.instanceChart = new Chart(ctx, {
            type: 'line',
            data: { labels: labels, datasets: datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Value' } }
                }
            }
        });
    }
};

// --- 6. Canvas Transform Functions ---
function updateTransform() {
    if (els.content) {
        els.content.style.transform = `translate(${CanvasState.panX}px, ${CanvasState.panY}px) scale(${CanvasState.scale})`;
    }
}

function handleWheel(e) {
    e.preventDefault();
    const rect = els.container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    let newScale = CanvasState.scale * (1 + delta);
    newScale = Math.max(CanvasState.minScale, Math.min(CanvasState.maxScale, newScale));
    const scaleRatio = newScale / CanvasState.scale;
    CanvasState.panX = mouseX - (mouseX - CanvasState.panX) * scaleRatio;
    CanvasState.panY = mouseY - (mouseY - CanvasState.panY) * scaleRatio;
    CanvasState.scale = newScale;
    updateTransform();
}

function startDrag(e) {
    if (e.button !== 0 && e.button !== 1) return;
    CanvasState.isDragging = true;
    CanvasState.startX = e.clientX;
    CanvasState.startY = e.clientY;
    els.container.style.cursor = 'grabbing';
}

function drag(e) {
    if (!CanvasState.isDragging) return;
    e.preventDefault();
    const dx = e.clientX - CanvasState.startX;
    const dy = e.clientY - CanvasState.startY;
    CanvasState.panX += dx;
    CanvasState.panY += dy;
    CanvasState.startX = e.clientX;
    CanvasState.startY = e.clientY;
    updateTransform();
}

function stopDrag() {
    CanvasState.isDragging = false;
    if (els.container) els.container.style.cursor = 'grab';
}

window.zoomAction = (direction) => {
    if (!els.container || !els.content) return;
    const factor = direction === 'in' ? 1.2 : 0.8;
    let newScale = CanvasState.scale * factor;
    newScale = Math.max(CanvasState.minScale, Math.min(CanvasState.maxScale, newScale));
    const rect = els.container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const scaleRatio = newScale / CanvasState.scale;
    CanvasState.panX = cx - (cx - CanvasState.panX) * scaleRatio;
    CanvasState.panY = cy - (cy - CanvasState.panY) * scaleRatio;
    CanvasState.scale = newScale;
    updateTransform();
}

window.resetView = () => { centerContent(); }

function centerContent() {
    if (!els.content || !els.container) return;
    const containerRect = els.container.getBoundingClientRect();
    const unscaledWidth = els.content.scrollWidth;
    const unscaledHeight = els.content.scrollHeight;
    let initialScale = 1.0;
    if (unscaledWidth > containerRect.width) {
        initialScale = (containerRect.width / unscaledWidth) * 0.9;
    }
    initialScale = Math.max(0.5, Math.min(1.0, initialScale));
    CanvasState.scale = initialScale;
    CanvasState.panX = (containerRect.width - unscaledWidth * initialScale) / 2;
    CanvasState.panY = (containerRect.height - unscaledHeight * initialScale) / 2;
    CanvasState.panY = Math.max(20, CanvasState.panY);
    updateTransform();
}

// --- 7. Page Initialization ---
async function initIndicatorPage() {
    // Bind element references
    els.container = document.getElementById('canvas-container');
    els.content = document.getElementById('canvas-content');

    // Init code panel state
    updateView();

    // Attach keyboard handler
    if (els.container) {
        els.container.addEventListener('keydown', window.handleCanvasKeyboard);
    }

    // Init Playground
    if (window.PlaygroundController) PlaygroundController.init();

    // Mermaid rendering + center
    if (window.mermaid) {
        try {
            const nodes = document.querySelectorAll('.mermaid');
            if (nodes.length > 0) {
                await mermaid.run({ nodes: nodes });
                setTimeout(centerContent, 100);
            }
        } catch (e) { console.error("Mermaid render failed", e); }
    }

    // Canvas Events (Wheel zoom + Drag pan)
    if (els.container) {
        els.container.addEventListener('wheel', handleWheel, { passive: false });
        els.container.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', stopDrag);
    }

    // KaTeX Auto Render
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
        });
    }

    // TOC ScrollSpy
    const tocLinks = document.querySelectorAll('.toc-link');
    if (tocLinks.length > 0) {
        const headings = document.querySelectorAll('article h2[id], article h3[id]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    const id = entry.target.getAttribute('id');
                    const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, { rootMargin: '-20% 0px -60% 0px' });
        headings.forEach(h => observer.observe(h));
    }

    // Load Sample buttons
    const btnOhlcv = document.getElementById('btn-load-sample-ohlcv');
    if (btnOhlcv) {
        btnOhlcv.addEventListener('click', () => {
            if (window.PlaygroundController) PlaygroundController.generateSample('ohlcv');
        });
    }
    const btnSingle = document.getElementById('btn-load-sample-single');
    if (btnSingle) {
        btnSingle.addEventListener('click', () => {
            if (window.PlaygroundController) PlaygroundController.generateSample('single');
        });
    }
}

// Execute initIndicatorPage on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndicatorPage);
} else {
    initIndicatorPage();
}
