// ==========================================
// 1. GLOBAL STATE & UTILITIES
// ==========================================
console.log("Script Loaded: UI and Playground Initializing...");

// Mermaid Zoom/Pan State
let mermaidScale = 1;
let mermaidX = 0;
let mermaidY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

// Code Panel State
let currentLang = 'csharp';
let currentType = 'simple';

// ==========================================
// 2. MERMAID FLOWCHART CONTROLLER
// ==========================================
function updateCanvasTransform() {
    const canvas = document.getElementById('canvas-transform-layer');
    if (canvas) {
        canvas.style.transform = `translate(${mermaidX}px, ${mermaidY}px) scale(${mermaidScale})`;
    }
}

function zoomAction(type) {
    if (type === 'in') mermaidScale *= 1.2;
    if (type === 'out') mermaidScale /= 1.2;
    updateCanvasTransform();
}

function resetView() {
    mermaidScale = 1;
    centerView();
    updateCanvasTransform();
}

function centerView() {
    const container = document.getElementById('canvas-container');
    const content = document.querySelector('.mermaid'); // The actual svg wrapper

    if (container && content) {
        const cWidth = container.clientWidth;
        const cHeight = container.clientHeight;
        // Mermaid often renders SVG lazily. We might need bounding client rect.
        const addWidth = content.scrollWidth || 600;

        // Simple heuristic: Center horizontally, Top 20px vertically
        mermaidX = Math.max(0, (cWidth - addWidth) / 2);
        mermaidY = 20;
    } else {
        mermaidX = 0;
        mermaidY = 0;
    }
}

function initMermaidDrag() {
    const container = document.getElementById('canvas-container');
    if (!container) return; // Guard

    // Initialize Center Position
    // Delay slightly to allow Mermaid to render
    setTimeout(() => {
        centerView();
        updateCanvasTransform();
    }, 500);

    // Use Capture Phase to grab events before Mermaid/SVG children
    container.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - mermaidX;
        startY = e.clientY - mermaidY;
        container.style.cursor = 'grabbing';
    }, { capture: true });

    // Wheel Zoom Support
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        mermaidScale *= delta;

        // Clamping scale to reasonable limits
        mermaidScale = Math.min(Math.max(0.1, mermaidScale), 5);

        updateCanvasTransform();
    }, { passive: false });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        mermaidX = e.clientX - startX;
        mermaidY = e.clientY - startY;
        updateCanvasTransform();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        if (container) container.style.cursor = 'grab';
    });

    container.style.cursor = 'grab';
}

// ==========================================
// 3. CODE PANEL CONTROLLER
// ==========================================
function setLang(lang) {
    currentLang = lang;
    updateCodeVisibility();
    updateButtonStates();
}

function setType(type) {
    currentType = type;
    updateCodeVisibility();
    updateButtonStates();
}

function updateCodeVisibility() {
    // Hide all first
    document.querySelectorAll('.code-content').forEach(el => el.classList.add('hidden'));
    // Show selected
    const id = `code-${currentLang}-${currentType}`;
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function updateButtonStates() {
    // Reset buttons
    document.querySelectorAll('.code-panel-header button').forEach(btn => btn.classList.remove('font-bold', 'text-blue-500'));
    // Highlight active
    const langBtn = document.getElementById(`btn-lang-${currentLang}`);
    if (langBtn) langBtn.classList.add('font-bold', 'text-blue-500');
    const typeBtn = document.getElementById(`btn-type-${currentType}`);
    if (typeBtn) typeBtn.classList.add('font-bold', 'text-blue-500');
}

function toggleCodePanel() {
    const overlay = document.getElementById('code-panel-overlay');
    if (overlay) overlay.classList.toggle('hidden');
}

function toggleExpand() {
    const overlay = document.getElementById('code-panel-overlay');
    const expandIcon = document.getElementById('icon-expand');
    const collapseIcon = document.getElementById('icon-collapse');

    if (overlay) {
        // Use class defined in style.css for width toggle
        overlay.classList.toggle('panel-expanded');
        const isExpanded = overlay.classList.contains('panel-expanded');

        if (isExpanded) {
            if (expandIcon) expandIcon.classList.add('hidden');
            if (collapseIcon) collapseIcon.classList.remove('hidden');
        } else {
            if (expandIcon) expandIcon.classList.remove('hidden');
            if (collapseIcon) collapseIcon.classList.add('hidden');
        }
    }
}

function copyCode() {
    const id = `code-${currentLang}-${currentType}`;
    const el = document.getElementById(id);
    if (!el) return;

    const text = el.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const check = document.getElementById('icon-copy-done');
        const copy = document.getElementById('icon-copy');
        if (check && copy) {
            copy.classList.add('hidden');
            check.classList.remove('hidden');
            setTimeout(() => {
                copy.classList.remove('hidden');
                check.classList.add('hidden');
            }, 2000);
        }
    });
}

// ==========================================
// 4. PLAYGROUND CONTROLLER
// ==========================================
const FallbackConfig = [{ id: 'period', label: 'Period', type: 'number', value: 14 }];
const FallbackLogic = { calculate: () => [] };
const FallbackDisplay = { isOverlay: false, plots: { main: { color: '#1A73E8' } } };

window.PlaygroundController = {
    chart: null,
    config: [],
    logic: null,
    display: null,

    init: function () {
        console.log("Playground Init...");
        // Load Config from Global Scope (injected variables)
        this.config = typeof IndicatorConfig !== 'undefined' ? IndicatorConfig : (typeof DefaultConfig !== 'undefined' ? DefaultConfig : FallbackConfig);
        this.logic = typeof IndicatorLogic !== 'undefined' ? IndicatorLogic : (typeof DefaultLogic !== 'undefined' ? DefaultLogic : FallbackLogic);
        this.display = typeof IndicatorDisplay !== 'undefined' ? IndicatorDisplay : (typeof DefaultDisplay !== 'undefined' ? DefaultDisplay : FallbackDisplay);

        // Initialize UI
        this.renderSettings();

        // Set Default Input Data (Simple Close Prices)
        const dateInput = document.getElementById('input-data');
        if (dateInput && !dateInput.value.trim()) {
            dateInput.value = `2023-01-01,150.00,155.00,149.00,153.00,1000000
2023-01-02,153.00,158.00,152.00,157.00,1200000
2023-01-03,157.00,157.50,154.00,155.00,900000
2023-01-04,155.00,156.00,150.00,151.00,1100000
2023-01-05,151.00,152.00,148.00,149.00,1050000
2023-01-06,149.00,150.00,145.00,146.00,1300000
2023-01-07,146.00,148.00,145.00,147.00,1000000
2023-01-08,147.00,149.00,146.00,148.00,950000
2023-01-09,148.00,152.00,148.00,151.00,1150000
2023-01-10,151.00,155.00,150.00,154.00,1400000
2023-01-11,154.00,160.00,154.00,159.00,1600000
2023-01-12,159.00,162.00,158.00,161.00,1500000
2023-01-13,161.00,165.00,160.00,163.00,1700000
2023-01-14,163.00,163.00,158.00,159.00,1800000
2023-01-15,159.00,160.00,155.00,156.00,1400000`;
        }

        // Initialize Chart
        this.initChart();

        // Bind Events
        document.getElementById('btn-run')?.addEventListener('click', () => this.update());

        // Initial Run (if logic exists)
        if (this.logic && this.logic.calculate) {
            this.update(); // Initial calculation
        }
    },

    switchTab: function (tabId) {
        // Toggle Buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`tab-btn-${tabId}`);
        if (activeBtn) activeBtn.classList.add('active');

        // Toggle Content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const activeContent = document.getElementById(`tab-content-${tabId}`);
        if (activeContent) activeContent.classList.add('active');
    },

    renderSettings: function () {
        const container = document.getElementById('settings-container');
        if (!container) return;
        container.innerHTML = '';

        this.config.forEach(param => {
            const div = document.createElement('div');
            div.className = "flex flex-col mb-3";
            div.innerHTML = `
                <label class="text-xs text-[var(--text-muted)] mb-1">${param.label}</label>
                <input type="${param.type}" id="param-${param.id}" value="${param.value}"
                    class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none"
                    ${param.min ? `min="${param.min}"` : ''} ${param.max ? `max="${param.max}"` : ''}>
            `;
            container.appendChild(div);
        });
    },

    getParams: function () {
        const params = {};
        this.config.forEach(param => {
            const el = document.getElementById(`param-${param.id}`);
            if (el) params[param.id] = param.type === 'number' ? parseFloat(el.value) : el.value;
        });
        return params;
    },

    parseData: function (text) {
        const lines = text.trim().split('\n');
        const data = [];
        let globalIndex = 0;

        lines.forEach((line, i) => {
            // Split by comma or whitespace, allow empty inputs to be filtered
            const parts = line.split(/[,\s]+/).filter(x => x);
            if (parts.length === 0) return;

            // Heuristic for OHLCV: 
            // 1. Minimum 5 columns (Date, O, H, L, C)
            // 2. Maximum ~8 columns (to avoid misleading long streams)
            // 3. First column usually looks like a Date (String with - or /) OR is NaN if we parse it strictly?
            //    Actually, simple check: is the first part a number?
            const firstIsNumber = !isNaN(parseFloat(parts[0]));

            // If it looks like OHLCV (Date string at start, right column count)
            if (parts.length >= 5 && parts.length <= 8 && !firstIsNumber) {
                data.push({
                    date: parts[0],
                    open: parseFloat(parts[1]),
                    high: parseFloat(parts[2]),
                    low: parseFloat(parts[3]),
                    close: parseFloat(parts[4]),
                    volume: parts[5] ? parseFloat(parts[5]) : 0
                });
            } else {
                // Otherwise, treat every token on this line as a Close price (Stream Mode)
                // This handles "100, 101, 102..." (First is number, length > 8)
                // And "100\n101" (Length 1)
                parts.forEach(p => {
                    const val = parseFloat(p);
                    if (!isNaN(val)) {
                        data.push({
                            date: globalIndex++, // Incrementing index for x-axis
                            open: val, high: val, low: val,
                            close: val,
                            volume: 0
                        });
                    }
                });
            }
        });
        return data;
    },

    initChart: function () {
        const canvas = document.getElementById('indicatorChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Dynamically build datasets based on plots config
        const datasets = [];
        const plots = this.display.plots || {};
        const defaultColors = ['#1A73E8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

        // For overlay indicators, add Close Price dataset first
        if (this.display.isOverlay) {
            datasets.push({
                label: 'Close Price',
                data: [],
                borderColor: '#9ca3af',
                borderWidth: 1,
                borderDash: [5, 5],
                tension: 0.1,
                pointRadius: 0,
                order: 100,
                yAxisID: 'y',
                fill: false
            });
        }

        Object.keys(plots).forEach((key, idx) => {
            const conf = plots[key] || {};
            const color = conf.color || defaultColors[idx % defaultColors.length];
            const isScatter = conf.type === 'scatter';

            const dataset = {
                label: conf.label || key,
                data: [],
                borderColor: isScatter ? 'transparent' : color,
                backgroundColor: isScatter ? color : (conf.backgroundColor || 'transparent'),
                borderWidth: isScatter ? 0 : 2,
                tension: 0.1,
                pointRadius: isScatter ? (conf.pointRadius || 4) : 0,
                pointBorderWidth: 0,
                pointStyle: isScatter ? 'circle' : 'circle',
                order: conf.type === 'bar' ? 10 : idx,
                yAxisID: this.display.isOverlay ? 'y' : 'y1',
                fill: conf.fill || false
            };

            // For scatter, use 'scatter' type which doesn't draw lines
            if (isScatter) {
                dataset.type = 'scatter';
            } else {
                dataset.type = conf.type || 'line';
                dataset.showLine = true;
            }

            datasets.push(dataset);
        });

        // Fallback: If no plots defined, create a single default dataset
        if (datasets.length === 0) {
            datasets.push({
                label: 'Indicator',
                data: [],
                borderColor: '#1A73E8',
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 3,
                order: 1,
                yAxisID: this.display.isOverlay ? 'y' : 'y1'
            });
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { grid: { color: '#E0E3E7' } },
                    y: {
                        display: true,
                        grid: { color: '#E0E3E7' },
                        position: 'right'
                    },
                    y1: {
                        display: !this.display.isOverlay,
                        position: 'left',
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    },

    update: function () {
        console.log("Playground Update...");
        const logKey = (msg) => {
            const el = document.getElementById('output-data');
            if (el) el.value = msg + "\n" + el.value;
            console.log(msg);
        };

        const el = document.getElementById('output-data');
        if (el) el.value = "";

        logKey("[1] Reading Input...");

        const rawText = document.getElementById('input-data').value;
        const data = this.parseData(rawText);
        const params = this.getParams();

        logKey(`[2] Parsed ${data.length} rows.`);

        // Run Calculation
        let results = null;
        try {
            logKey("[3] Calculating...");
            if (this.logic && this.logic.calculate) {
                results = this.logic.calculate(data, params);

                // Detect result type
                const isObject = typeof results === 'object' && !Array.isArray(results) && results !== null;
                if (isObject) {
                    const keys = Object.keys(results);
                    const firstLen = results[keys[0]] ? results[keys[0]].length : 0;
                    logKey(`[4] Calculation done. Multi-plot object with ${keys.length} series, ${firstLen} values each.`);
                } else if (Array.isArray(results)) {
                    logKey(`[4] Calculation done. Array with ${results.length} values.`);
                } else {
                    logKey(`[4] Calculation done. Unknown result type.`);
                }
            } else {
                logKey("[Error] Logic (this.logic.calculate) not found.");
                return;
            }
        } catch (e) {
            console.error("Calculation Error:", e);
            logKey(`[Error] Calc Failed: ${e.message}`);
            return;
        }

        // Update Chart
        if (this.chart) {
            logKey("[5] Updating Chart...");
            this.chart.data.labels = data.map(d => d.date || d.time);

            // Update Close Price dataset if it exists (for overlay indicators)
            const closePriceDataset = this.chart.data.datasets.find(ds => ds.label === 'Close Price');
            if (closePriceDataset) {
                closePriceDataset.data = data.map(d => d.close);
            }

            const isObjectResult = typeof results === 'object' && !Array.isArray(results) && results !== null;

            if (isObjectResult) {
                // Multi-plot indicator (e.g., Bollinger Bands: {upper, middle, lower})
                const labels = this.chart.data.labels;
                Object.keys(results).forEach((key, idx) => {
                    // Find matching dataset by label or index
                    const dataset = this.chart.data.datasets.find(ds =>
                        ds.label.toLowerCase() === key.toLowerCase() ||
                        ds.label.toLowerCase().includes(key.toLowerCase())
                    ) || this.chart.data.datasets[idx];

                    if (dataset) {
                        // For scatter type, convert to {x, y} format
                        if (dataset.type === 'scatter') {
                            dataset.data = results[key].map((val, i) =>
                                val !== null ? { x: i, y: val } : null
                            ).filter(p => p !== null);
                        } else {
                            dataset.data = results[key];
                        }
                        console.log(`Assigned ${key} data to dataset "${dataset.label}":`, dataset.data.slice(0, 3), '...');
                    }
                });
                logKey(`[6] Mapped ${Object.keys(results).length} series to chart.`);
            } else if (Array.isArray(results)) {
                // Single-plot indicator
                if (this.chart.data.datasets.length > 0) {
                    this.chart.data.datasets[0].data = results;
                }
                logKey(`[6] Assigned ${results.length} values to dataset.`);
            }

            try {
                this.chart.update();
                logKey("[7] Chart Updated Successfully.");
            } catch (e) {
                console.error("Chart Update Failed:", e);
                logKey(`[Error] Chart Failed: ${e.message}`);
            }
        } else {
            logKey("[Error] Chart instance missing.");
        }

        // Output results to text area
        if (results) {
            let csvOutput = "\n[--- Calculated Results ---]\n";
            const isObjectResult = typeof results === 'object' && !Array.isArray(results) && results !== null;

            if (isObjectResult) {
                const keys = Object.keys(results);
                const length = results[keys[0]] ? results[keys[0]].length : 0;
                csvOutput += keys.join(',') + '\n';
                for (let i = 0; i < length; i++) {
                    const row = keys.map(k => {
                        const val = results[k][i];
                        return (val === null || val === undefined) ? '' : (typeof val === 'number' ? val.toFixed(4) : val);
                    });
                    csvOutput += row.join(',') + '\n';
                }
            } else if (Array.isArray(results)) {
                results.forEach((val, idx) => {
                    const dateStr = (data[idx] && data[idx].date !== undefined) ? data[idx].date : `Row-${idx}`;
                    const valStr = (val !== null && !isNaN(val)) ? val.toFixed(4) : "NaN";
                    csvOutput += `${dateStr}, ${valStr}\n`;
                });
            }
            csvOutput += "--------------------------------------------\n";
            const el = document.getElementById('output-data');
            if (el) el.value = csvOutput + el.value;
        }
    },

    copyOutput: function () {
        const el = document.getElementById('output-data');
        if (el) navigator.clipboard.writeText(el.value);
    }
};

// ==========================================
// 5. EXPOSE GLOBALS & INIT
// ==========================================
window.zoomAction = zoomAction;
window.resetView = resetView;
window.toggleCodePanel = toggleCodePanel;
window.toggleExpand = toggleExpand;
window.setLang = setLang;
window.setType = setType;
window.copyCode = copyCode;

function initApp() {
    console.log("Initializing App...");
    updateCodeVisibility(); // Initial Code Panel State
    initMermaidDrag();      // Flowchart Drag

    if (window.PlaygroundController) {
        window.PlaygroundController.init();
    }
}
window.initApp = initApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
