class ChoppinessIndex {
    constructor(period = 14) {
        if (period <= 1) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const tr = [];
        for (let i = 0; i < candles.length; i++) {
            if (i === 0) tr.push(candles[i].high - candles[i].low);
            else { const prevClose = candles[i - 1].close; tr.push(Math.max(candles[i].high - candles[i].low, Math.abs(candles[i].high - prevClose), Math.abs(candles[i].low - prevClose))); }
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sumTr = 0, maxH = -Infinity, minL = Infinity;
            for (let j = 0; j < this.period; j++) { sumTr += tr[i - j]; if (candles[i - j].high > maxH) maxH = candles[i - j].high; if (candles[i - j].low < minL) minL = candles[i - j].low; }
            const range = maxH - minL;
            this.values.push(range === 0 ? 0 : 100 * Math.log10(sumTr / range) / Math.log10(this.period));
        }
    }

    static calculate(candles, period = 14) {
        const ci = new ChoppinessIndex(period);
        ci.calculate(candles);
        return ci.values;
    }
}
