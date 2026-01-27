/**
 * screening_core.js
 * Phase 2: Core Filtering Logic, Dynamic Metadata, and UI Interactivity
 */

/**
 * Constants & Config
 */
const CONFIG = {
    DEBOUNCE_MS: 300,
    MAX_VISIBLE_ROWS: 100
};

/**
 * Core Application Logic
 */
class ScreeningApp {
    constructor() {
        this.state = {
            data: [],         // All loaded rows (normalized)
            displayData: [],  // Filtered rows
            conditions: [],   // Active filters: [{ id, indicatorKey, operator, value }]
            metaMap: {},      // Map key -> metadata object { type, category }
            sortCol: 'Volume',
            sortAsc: false
        };

        this.applyFiltersDebounced = this.debounce(this.applyFilters.bind(this), CONFIG.DEBOUNCE_MS);
    }

    /**
     * Initialization Sequence
     */
    async init() {
        console.log("Initializing Screening App...");
        await this.loadData();
        this.generateMetadata(); // Dynamic generation based on loaded data
        this.renderInitialUI();
    }

    async loadData() {
        let loadedData = null;

        // 1. Try fetching from static JSON (Production/GitHub Pages)
        try {
            const response = await fetch('../data/screening/latest_screening_data.json');
            if (response.ok) {
                const json = await response.json();
                console.log("Loaded data from JSON fetch:", json.generated_at);
                loadedData = json.data;
            }
        } catch (e) {
            console.warn("Failed to fetch JSON data:", e);
        }

        // 2. Fallback to PRELOADED_DATA (Local Dev / Fallback)
        if (!loadedData && typeof PRELOADED_DATA !== 'undefined' && PRELOADED_DATA.data) {
            console.log("Loaded data from cache (PRELOADED_DATA):", PRELOADED_DATA.generated_at);
            loadedData = PRELOADED_DATA.data;
        }

        // 3. Process Data
        if (loadedData) {
            this.state.data = this.normalizeData(loadedData);
            this.state.displayData = [...this.state.data];
            this.sortData();
        } else {
            console.warn("No preloaded data found. Ensure data_loader.js is loaded or JSON is accessible.");
            document.getElementById('table-body').innerHTML = `<tr><td colspan="100" class="p-8 text-center text-red-500">Error: Data not loaded.</td></tr>`;
        }
    }

    /**
     * Data Normalization
     * Flattens nested indicator structures and numericizes values
     */
    normalizeData(rawData) {
        return rawData.map(item => {
            const flat = { ...item };

            // Flatten indicators
            if (item.indicators) {
                Object.keys(item.indicators).forEach(k => {
                    let val = item.indicators[k];
                    if (Array.isArray(val)) val = val[0];
                    flat[k] = val;
                });
                delete flat.indicators; // Cleanup
            }

            // Remove internal keys (nu_)
            Object.keys(flat).forEach(k => {
                if (k.startsWith('nu_') || k === 'valid' || k === 'error') delete flat[k];
            });

            // Map standard keys if missing (Fix for case sensitivity)
            if (!flat.Symbol && flat.symbol) { flat.Symbol = flat.symbol; delete flat.symbol; }
            if (!flat.Close && flat.price) { flat.Close = flat.price; delete flat.price; }
            if (!flat.Volume && flat.volume) { flat.Volume = flat.volume; delete flat.volume; }
            if (!flat.High && flat.high) { flat.High = flat.high; delete flat.high; }
            if (!flat.Low && flat.low) { flat.Low = flat.low; delete flat.low; }
            if (!flat.Open && flat.open) { flat.Open = flat.open; delete flat.open; }

            // Ensure numeric types for core columns
            ['Close', 'Volume', 'High', 'Low', 'Open'].forEach(k => {
                if (flat[k]) flat[k] = parseFloat(flat[k]);
            });

            return flat;
        }).filter(r => r.Close > 0 && r.Symbol);
    }

    /**
     * Metadata Generation
     * Scans data to discover available indicators and categorizes them
     */
    generateMetadata() {
        if (this.state.data.length === 0) return;

        const sample = this.state.data[0];
        const keys = Object.keys(sample).filter(k => k !== 'Symbol' && k !== 'data');

        keys.forEach(key => {
            let category = 'Other';
            if (['Close', 'Volume', 'High', 'Low', 'Open', 'change', 'price'].some(s => key.includes(s))) category = 'Market';
            else if (['RSI', 'Stoch', 'CCI', 'MOM', 'Macd'].some(s => key.includes(s))) category = 'Oscillator';
            else if (['SMA', 'EMA', 'WMA', 'ADX', 'SuperTrend', 'Ichimoku', 'Parabolic'].some(s => key.includes(s))) category = 'Trend';
            else if (['BB', 'ATR', 'Keltner'].some(s => key.includes(s))) category = 'Volatility';

            // Metadata Cleaning: Skip internal or invalid keys
            if (key.startsWith('nu_') && !['nu_error'].includes(key)) return; // Skip nu_ internal keys
            if (key === 'Symbol' || key === 'generated_at') return;

            // Beautify Name
            let name = key.replace(/_/g, ' ');

            // Expansion Map
            const INDICATOR_NAMES = {
                'SMA': 'Simple Moving Average',
                'EMA': 'Exponential Moving Average',
                'WMA': 'Weighted Moving Average',
                'DEMA': 'Double Exponential Moving Average',
                'TEMA': 'Triple Exponential Moving Average',
                'TRIMA': 'Triangular Moving Average',
                'KAMA': 'Kaufman Adaptive Moving Average',
                'MAMA': 'MESA Adaptive Moving Average',
                'T3': 'T3 Moving Average',
                'MACD': 'MACD',
                'MACDEXT': 'MACD with Controllable MA Type',
                'MACDFIX': 'MACD Fix 12/26',
                'RSI': 'Relative Strength Index',
                'STOCH': 'Stochastic',
                'STOCHF': 'Stochastic Fast',
                'STOCHRSI': 'Stochastic RSI',
                'WILLR': 'Williams %R',
                'ADX': 'Average Directional Movement Index',
                'ADXR': 'Average Directional Movement Index Rating',
                'APO': 'Absolute Price Oscillator',
                'PPO': 'Percentage Price Oscillator',
                'MOM': 'Momentum',
                'BOP': 'Balance Of Power',
                'CCI': 'Commodity Channel Index',
                'CMO': 'Chande Momentum Oscillator',
                'ROC': 'Rate of Change',
                'ROCR': 'Rate of Change Ratio',
                'ROCP': 'Rate of Change Percentage',
                'ROCR100': 'Rate of Change Ratio 100 Scale',
                'AROON': 'Aroon',
                'AROONOSC': 'Aroon Oscillator',
                'MFI': 'Money Flow Index',
                'TRIX': 'Triple Smooth EMA (TRIX) 1-Day ROC',
                'ULTOSC': 'Ultimate Oscillator',
                'DX': 'Directional Movement Index',
                'MINUS_DI': 'Minus Directional Indicator',
                'PLUS_DI': 'Plus Directional Indicator',
                'MINUS_DM': 'Minus Directional Movement',
                'PLUS_DM': 'Plus Directional Movement',
                'BB': 'Bollinger Bands',
                'BBANDS': 'Bollinger Bands',
                'MIDPOINT': 'MidPoint over period',
                'MIDPRICE': 'Midpoint Price over period',
                'SAR': 'Parabolic SAR',
                'SAREXT': 'Parabolic SAR - Extended',
                'TRANGE': 'True Range',
                'ATR': 'Average True Range',
                'NATR': 'Normalized Average True Range',
                'OBV': 'On Balance Volume',
                'AD': 'Chaikin A/D Line',
                'ADOSC': 'Chaikin A/D Oscillator',
                'HT_TRENDLINE': 'Hilbert Transform - Instantaneous Trendline',
                'HT_SINE': 'Hilbert Transform - SineWave',
                'HT_TRENDMODE': 'Hilbert Transform - Trend vs Cycle Mode',
                'HT_DCPERIOD': 'Hilbert Transform - Dominant Cycle Period',
                'HT_DCPHASE': 'Hilbert Transform - Dominant Cycle Phase',
                'HT_PHASOR': 'Hilbert Transform - Phasor Components',
                'AVGPRICE': 'Average Price',
                'MEDPRICE': 'Median Price',
                'TYPPRICE': 'Typical Price',
                'WCLPRICE': 'Weighted Close Price',
                'AO': 'Awesome Oscillator',
                'KST': 'Know Sure Thing',
                'ICHIMOKU': 'Ichimoku Cloud',
                'SUPERTREND': 'SuperTrend',
                'PARABOLIC': 'Parabolic SAR',
                'AC': 'Accelerator Oscillator',
                'ADL': 'Accumulation/Distribution Line',
                'ALMA': 'Arnaud Legoux Moving Average',
                'HMA': 'Hull Moving Average',
                'ZLEMA': 'Zero Lag EMA',
                'VAMA': 'Variable Adaptive Moving Average',
                'SMMA': 'Smoothed Moving Average',
                'DPO': 'Detrended Price Oscillator',
                'COPPOCK': 'Coppock Curve',
                'FISHER': 'Fisher Transform',
                'KVO': 'Klinger Volume Oscillator',
                'QSTICK': 'QStick',
                'VO': 'Volume Oscillator',
                'VWAP': 'Volume Weighted Average Price',
                'BBR': 'Bollinger Bands %B',
                'BBW': 'Bollinger Bands Width',
                'CHOP': 'Choppiness Index',
                'CMF': 'Chaikin Money Flow',
                'DMA': 'Displaced Moving Average',
                'DMI': 'Directional Movement Index',
                'EMV': 'Ease of Movement',
                'FDI': 'Fractal Dimension Index',
                'GMA': 'Guppy Moving Average',
                'HLBand': 'High Low Bands',
                'KC': 'Keltner Channels',
                'LSMA': 'Least Squares Moving Average',
                'MADR': 'Moving Average Deviation Rate',
                'NVI': 'Negative Volume Index',
                'PVI': 'Positive Volume Index',
                'PVT': 'Price Volume Trend',
                'PSAR': 'Parabolic SAR',
                'PSY': 'Psychological Line',
                'RCI': 'Rank Correlation Index',
                'SMI': 'Stochastic Momentum Index',
                'STC': 'Schaff Trend Cycle',
                'TMA': 'Triangular Moving Average',
                'UDVR': 'Up/Down Volume Ratio',
                'UO': 'Ultimate Oscillator',
                'VixFix': 'CM Williams Vix Fix',
                'VolMA': 'Volume Moving Average',
                'VWMA': 'Volume Weighted Moving Average',
                'WPR': 'Williams %R',
                'Wilder': 'Wilders Smoothing',
                'RegSlope': 'Linear Regression Slope',
                'LinReg': 'Linear Regression',
                'LinRegSlope': 'Linear Regression Slope',
                'Mass': 'Mass Index',
                'Force': 'Force Index',
                'Envelope': 'Moving Average Envelope',
                'Entropy': 'Sample Entropy',
                'StdDev': 'Standard Deviation',
                'Var': 'Variance',
                'Vortex': 'Vortex Indicator',
                'YangZhang': 'Yang Zhang Volatility',
                'ElderImpulse': 'Elder Impulse System',
                'ElderRay': 'Elder Ray Index',
                'ChaikinOsc': 'Chaikin Oscillator',
                'ChaikinVol': 'Chaikin Volatility',
                'HV': 'Historical Volatility',
                'MACD': 'Moving Average Convergence Divergence'
            };

            // Replace Acronyms with Full Names
            Object.keys(INDICATOR_NAMES).forEach(acronym => {
                const regex = new RegExp(`\\b${acronym}\\b`, 'gi');
                name = name.replace(regex, (match) => {
                    return INDICATOR_NAMES[acronym];
                });
            });

            // Handle Candle Patterns (CDL*) generically
            if (name.startsWith('CDL')) {
                name = name.replace('CDL', 'Pattern: ').replace(/_/g, ' ');
            }

            // Fallback Capitalization for any unmapped
            name = name.replace(/\b(sma|ema|wma|rsi|macd|bb|atr|roc|obv|mfi|uo|ao|kst|ac|adl|alma|hma|zlema|dma|dmi|kc|lsma|nvi|pvi|pvt|psar|psy|rci|smi|stc|tma|udvr|uo|wpr|vwma|hv)\b/gi, (match) => match.toUpperCase());

            this.state.metaMap[key] = {
                id: key,
                code: key, // Display Code (Short)
                name: name, // Full Name (Long)
                category: category,
                type: 'numeric'
            };
        });
        console.log("Generated Metadata for keys:", Object.keys(this.state.metaMap).length);
    }

    copyDebugInfo() {
        const lines = Object.values(this.state.metaMap)
            .sort((a, b) => a.code.localeCompare(b.code))
            .map(m => `${m.code} \t ${m.name}`);

        const text = "CODE \t NAME\n" + lines.join("\n");
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied " + lines.length + " indicator names to clipboard!");
        }).catch(err => {
            console.error("Failed to copy", err);
            alert("Failed to copy. See console.");
        });
    }

    /**
     * Filtering Engine
     */
    applyFilters() {
        console.time("Filtering");
        const conditions = this.state.conditions.filter(c => {
            // Context: Left side must be valid. Right side depends on type.
            if (!c.indicatorKey || !c.operator) return false;
            if (c.targetType === 'value') return c.value !== null && c.value !== '';
            if (c.targetType === 'indicator') return c.targetKey !== null; // Must have selected 2nd indicator
            return false;
        });

        this.state.displayData = this.state.data.filter(row => {
            for (const cond of conditions) {
                const rowVal = parseFloat(row[cond.indicatorKey]);

                // Determine Right Side Value
                let targetVal;
                if (cond.targetType === 'indicator') {
                    targetVal = parseFloat(row[cond.targetKey]);
                } else {
                    targetVal = parseFloat(cond.value);
                }

                if (isNaN(rowVal) || isNaN(targetVal)) return false; // Strict: missing data excludes

                switch (cond.operator) {
                    case 'gt': if (!(rowVal > targetVal)) return false; break;
                    case 'lt': if (!(rowVal < targetVal)) return false; break;
                    case 'gte': if (!(rowVal >= targetVal)) return false; break;
                    case 'lte': if (!(rowVal <= targetVal)) return false; break;
                    case 'eq': if (!(Math.abs(rowVal - targetVal) < 0.0001)) return false; break;
                }
            }
            return true;
        });
        console.timeEnd("Filtering");

        this.sortData();
        this.updateStats();
        this.renderTable();
    }

    sortData() {
        const { sortCol, sortAsc } = this.state;
        this.state.displayData.sort((a, b) => {
            let valA = a[sortCol], valB = b[sortCol];
            if (valA == null) return 1;
            if (valB == null) return -1;

            if (typeof valA === 'string') {
                return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return sortAsc ? valA - valB : valB - valA;
        });
    }

    /**
     * UI Logic
     */
    renderInitialUI() {
        this.updateStats();
        this.renderTable();
        // Add one empty condition to start if none
        if (this.state.conditions.length === 0) this.addCondition();

        // Bind Export Button
        const btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportCSV());
        }
    }

    updateStats() {
        document.getElementById('row-count').textContent = this.state.displayData.length;
        document.getElementById('total-count').textContent = `/ ${this.state.data.length} loaded`;
    }

    /**
     * Table Render
     */
    renderTable() {
        const tbody = document.getElementById('table-body');
        const thead = document.getElementById('table-header-row');
        if (!tbody || !thead) return;

        const rows = this.state.displayData.slice(0, CONFIG.MAX_VISIBLE_ROWS);

        // Determine Columns: Defaults + Active Filter Keys (Both Left and Right)
        const defaultCols = ['Symbol', 'Close', 'Volume'];
        const activeKeys = new Set();
        this.state.conditions.forEach(c => {
            if (c.indicatorKey) activeKeys.add(c.indicatorKey);
            if (c.targetType === 'indicator' && c.targetKey) activeKeys.add(c.targetKey);
        });

        const cols = [...defaultCols, ...[...activeKeys].filter(k => !defaultCols.includes(k))];

        // Render Header
        thead.innerHTML = cols.map(c => {
            const isSorted = this.state.sortCol === c;
            const sortIcon = isSorted ? (this.state.sortAsc ? 'arrow_upward' : 'arrow_downward') : '';
            const sortClass = isSorted ? 'text-indigo-600 font-bold' : 'text-slate-500';
            const align = c === 'Symbol' ? 'text-left' : 'text-right';

            return `<th class="px-4 py-2 text-xs font-semibold uppercase ${sortClass} ${align} cursor-pointer select-none sticky-header hover:bg-slate-100"
                        onclick="screeningApp.handleSort('${c}')">
                        <div class="flex items-center gap-1 ${align === 'text-right' ? 'justify-end' : ''}">
                            ${c} <span class="material-symbols-outlined text-[12px]">${sortIcon}</span>
                        </div>
                    </th>`;
        }).join('');

        // Render Body
        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${cols.length}" class="p-8 text-center text-slate-500">No results match your filters.</td></tr>`;
            return;
        }

        tbody.innerHTML = rows.map(row => {
            return `<tr class="hover:bg-slate-50 border-b border-slate-100 group transition-colors">
                ${cols.map(c => {
                let val = row[c];
                let displayVal = val;
                let classes = "px-4 py-2 text-sm tabular-nums text-slate-600";

                if (c === 'Symbol') {
                    classes += " font-bold text-slate-800 sticky-col bg-white group-hover:bg-slate-50";
                } else if (typeof val === 'number') {
                    classes += " text-right font-mono";
                    if (c === 'Volume') displayVal = (val / 1000000).toFixed(2) + 'M';
                    else displayVal = val.toFixed(2);

                    if (c.includes('RSI')) {
                        if (val > 70) displayVal = `<span class="text-red-600 font-bold">${displayVal}</span>`;
                        else if (val < 30) displayVal = `<span class="text-emerald-600 font-bold">${displayVal}</span>`;
                    }
                } else {
                    displayVal = val || '-';
                    classes += " text-right";
                }

                return `<td class="${classes}">${displayVal}</td>`;
            }).join('')}
            </tr>`;
        }).join('');
    }

    handleSort(col) {
        if (this.state.sortCol === col) this.state.sortAsc = !this.state.sortAsc;
        else {
            this.state.sortCol = col;
            this.state.sortAsc = false; // Default desc
        }
        this.sortData();
        this.renderTable();
    }

    /**
     * Condition Management
     */
    addCondition() {
        const id = 'cond-' + Math.random().toString(36).substr(2, 9);
        const newCond = {
            id,
            indicatorKey: null,
            operator: 'gt',
            targetType: 'value', // 'value' | 'indicator' 
            value: null,
            targetKey: null
        };
        this.state.conditions.unshift(newCond); // Add to TOP
        this.renderConditionRow(id, true); // true = prepend
    }

    removeCondition(id) {
        this.state.conditions = this.state.conditions.filter(c => c.id !== id);
        document.getElementById(id)?.remove();
        this.applyFilters();
    }

    updateCondition(id, field, value) {
        const cond = this.state.conditions.find(c => c.id === id);
        if (!cond) return;

        cond[field] = value;

        // If toggling Type, reset values to avoid confusion
        if (field === 'targetType') {
            cond.value = null;
            cond.targetKey = null;
            this.renderRightSide(id); // Re-render logic needed
        } else {
            this.applyFiltersDebounced();

            // UI Update for search boxes
            if (field === 'indicatorKey') this.updateConditionUI(id, 'left', value);
            if (field === 'targetKey') this.updateConditionUI(id, 'right', value);
        }
    }

    /**
     * UI: Render Single Condition Row
     */
    renderConditionRow(id, prepend = false) {
        const list = document.getElementById('filter-conditions-list');
        const div = document.createElement('div');
        div.className = 'condition-card';
        div.id = id;

        div.innerHTML = `
            <div class="condition-header">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condition</span>
                <button onclick="screeningApp.removeCondition('${id}')" class="text-slate-400 hover:text-red-500 flex items-center">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>
            
            <div class="flex flex-col gap-2">
                <!-- Left Side: Indicator Search -->
                <div class="indicator-search-container relative" onclick="event.stopPropagation()">
                    <input type="text" 
                           id="input-left-${id}"
                           class="input-sm w-full font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                           placeholder="Left Indicator..." 
                           autocomplete="off">
                    <div id="dropdown-left-${id}" class="search-dropdown hidden custom-scrollbar"></div>
                </div>

                <div class="flex gap-2 items-center">
                    <!-- Operator -->
                    <select class="input-sm input-operator bg-slate-50" onchange="screeningApp.updateCondition('${id}', 'operator', this.value)">
                        <option value="gt">&gt;</option>
                        <option value="gte">&ge;</option>
                        <option value="lt">&lt;</option>
                        <option value="lte">&le;</option>
                        <option value="eq">=</option>
                    </select>

                    <!-- Toggle Target Type -->
                    <div class="target-type-toggle">
                        <div class="target-type-btn active" id="btn-val-${id}" onclick="screeningApp.toggleTargetType('${id}', 'value')">123</div>
                        <div class="target-type-btn" id="btn-ind-${id}" onclick="screeningApp.toggleTargetType('${id}', 'indicator')">Ind</div>
                    </div>

                    <!-- Right Side: Dynamic (Value Input or Indicator Search) -->
                    <div id="right-side-container-${id}" class="flex-1 relative">
                        <!-- Default Value Input -->
                        <input type="number" 
                               class="input-sm w-full" 
                               placeholder="Value"
                               oninput="screeningApp.updateCondition('${id}', 'value', this.value)">
                    </div>
                </div>
            </div>
        `;
        if (prepend) {
            list.insertBefore(div, list.firstChild);
        } else {
            list.appendChild(div);
        }

        this.setupSearchAutocomplete(id, 'left');
    }

    toggleTargetType(id, type) {
        // Update State
        this.updateCondition(id, 'targetType', type);

        // Update Toggle Buttons
        const btnVal = document.getElementById(`btn-val-${id}`);
        const btnInd = document.getElementById(`btn-ind-${id}`);
        if (type === 'value') {
            btnVal.classList.add('active');
            btnInd.classList.remove('active');
        } else {
            btnVal.classList.remove('active');
            btnInd.classList.add('active');
        }
    }

    renderRightSide(id) {
        const container = document.getElementById(`right-side-container-${id}`);
        const cond = this.state.conditions.find(c => c.id === id);
        if (!container || !cond) return;

        container.innerHTML = ''; // Clear

        if (cond.targetType === 'value') {
            container.innerHTML = `
                <input type="number" 
                       class="input-sm w-full" 
                       placeholder="Value"
                       value="${cond.value || ''}"
                       oninput="screeningApp.updateCondition('${id}', 'value', this.value)">
            `;
        } else {
            container.innerHTML = `
                <input type="text" 
                       id="input-right-${id}"
                       class="input-sm w-full font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                       placeholder="Right Indicator..." 
                       autocomplete="off">
                <div id="dropdown-right-${id}" class="search-dropdown hidden custom-scrollbar"></div>
                <div class="indicator-search-container relative hidden" id="right-search-wrapper-${id}" onclick="event.stopPropagation()">
                     <!-- Wrapper for containment reference, though inputs are injected above. 
                          Actually, we need to wrap the injected input in the container div structure 
                          to match the class check in global listener. -->
                </div>
            `;
            // Re-write innerHTML correctly to wrap right side input
            container.innerHTML = `
                <div class="indicator-search-container relative" onclick="event.stopPropagation()">
                    <input type="text" 
                        id="input-right-${id}"
                        class="input-sm w-full font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="Right Indicator..." 
                        autocomplete="off">
                    <div id="dropdown-right-${id}" class="search-dropdown hidden custom-scrollbar"></div>
                </div>
            `;
            this.setupSearchAutocomplete(id, 'right');
            // If exists, set value
            this.updateConditionUI(id, 'right', cond.targetKey);
        }
    }

    updateConditionUI(id, side, key) {
        const input = document.getElementById(`input-${side}-${id}`);
        if (input && key) input.value = key;
    }

    /**
     * Autocomplete Logic
     */
    setupSearchAutocomplete(id, side) {
        const input = document.getElementById(`input-${side}-${id}`);
        // Dropdown ID logic needs to match HTML
        const dropdown = document.getElementById(`dropdown-${side}-${id}`);

        if (!input || !dropdown) return;

        const populate = (filter = '') => {
            const term = filter.toLowerCase();
            const matches = Object.values(this.state.metaMap)
                .filter(m => m.code.toLowerCase().includes(term) || m.name.toLowerCase().includes(term))
                .sort((a, b) => a.name.localeCompare(b.name)); // Sort Alphabetically by Name

            if (matches.length === 0) {
                dropdown.innerHTML = `<div class="p-2 text-xs text-slate-400 text-center">No matches</div>`;
                return;
            }

            dropdown.innerHTML = matches.slice(0, 10000).map(m => `
                <div class="search-item flex justify-between items-center group" onmousedown="event.preventDefault(); screeningApp.selectIndicator('${id}', '${side}', '${m.code}')">
                    <div>
                        <div class="search-item-code group-hover:text-indigo-600 transition-colors">${m.code}</div>
                        <div class="search-item-name">${m.name}</div>
                    </div>
                    <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">${m.category}</span>
                </div>
            `).join('');
        };

        input.addEventListener('focus', () => {
            // Hide others
            document.querySelectorAll('.search-dropdown').forEach(el => el.classList.add('hidden'));
            dropdown.classList.remove('hidden');
            populate(input.value);
        });

        input.addEventListener('input', (e) => {
            populate(e.target.value);
        });

        // Close on outside click is handled by global listener
    }

    selectIndicator(id, side, code) {
        const field = side === 'left' ? 'indicatorKey' : 'targetKey';
        this.updateCondition(id, field, code);
        const dropdown = document.getElementById(`dropdown-${side}-${id}`);
        dropdown?.classList.add('hidden');
    }

    /**
     * Utils
     */
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Export to CSV
     */
    exportCSV() {
        if (!this.state.displayData || this.state.displayData.length === 0) {
            alert("No data to export.");
            return;
        }

        // Determine Columns (same as visual table)
        const defaultCols = ['Symbol', 'Close', 'Volume'];
        const activeKeys = new Set();
        this.state.conditions.forEach(c => {
            if (c.indicatorKey) activeKeys.add(c.indicatorKey);
            if (c.targetType === 'indicator' && c.targetKey) activeKeys.add(c.targetKey);
        });
        const cols = [...defaultCols, ...[...activeKeys].filter(k => !defaultCols.includes(k))];

        // Header
        let csvContent = "data:text/csv;charset=utf-8,"
            + cols.join(",") + "\n";

        // Rows
        this.state.displayData.forEach(row => {
            const rowStr = cols.map(col => {
                let val = row[col];
                if (val === undefined || val === null) return "";
                return val;
            }).join(",");
            csvContent += rowStr + "\n";
        });

        // Download Trigger
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "screening_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Global Instance
const screeningApp = new ScreeningApp();
document.addEventListener('DOMContentLoaded', () => screeningApp.init());

// Global Click Listener for Dropdowns
document.addEventListener('click', (e) => {
    // If click is NOT inside any .indicator-search-container, close all dropdowns
    if (!e.target.closest('.indicator-search-container')) {
        document.querySelectorAll('.search-dropdown').forEach(el => el.classList.add('hidden'));
    }
});
