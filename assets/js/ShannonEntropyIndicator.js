class ShannonEntropyIndicator {
    constructor(period = 20, bins = 10) {
        if (period <= 0 || bins <= 1) throw new Error("period or bins");
        this.period = period;
        this.bins = bins;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const returns = [0];
        for (let i = 1; i < candles.length; i++) {
            const prevClose = candles[i - 1].close;
            returns.push(prevClose > 0 ? (candles[i].close - prevClose) / prevClose : 0);
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period) { this.values.push(null); continue; }
            const window = [];
            for (let j = 0; j < this.period; j++) window.push(returns[i - j]);
            const min = Math.min(...window), max = Math.max(...window);
            const range = max - min;
            if (range === 0) { this.values.push(0); continue; }
            const binCounts = new Array(this.bins).fill(0);
            for (const val of window) {
                let bin = Math.floor((val - min) / range * (this.bins - 1));
                bin = Math.max(0, Math.min(this.bins - 1, bin));
                binCounts[bin]++;
            }
            let entropy = 0;
            for (const count of binCounts) { if (count > 0) { const p = count / this.period; entropy -= p * Math.log(p); } }
            const maxEntropy = Math.log(this.bins);
            this.values.push(maxEntropy > 0 ? entropy / maxEntropy : 0);
        }
    }

    static calculate(candles, period = 20, bins = 10) {
        const se = new ShannonEntropyIndicator(period, bins);
        se.calculate(candles);
        return se.values;
    }
}
