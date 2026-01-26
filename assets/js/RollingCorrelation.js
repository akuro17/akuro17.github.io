class RollingCorrelation {
    constructor(period = 20) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles1, candles2) {
        this.values = [];
        const count = Math.min(candles1.length, candles2.length);
        if (count === 0) return;
        for (let i = 0; i < count; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
            for (let j = i - this.period + 1; j <= i; j++) { const x = candles1[j].close, y = candles2[j].close; sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x; sumY2 += y * y; }
            const n = this.period, numerator = n * sumXY - sumX * sumY;
            const denomX = n * sumX2 - sumX * sumX, denomY = n * sumY2 - sumY * sumY;
            if (denomX <= 0 || denomY <= 0) { this.values.push(null); continue; }
            const corr = numerator / Math.sqrt(denomX * denomY);
            this.values.push(Math.max(-1, Math.min(1, corr)));
        }
    }

    static calculate(candles1, candles2, period = 20) {
        const rc = new RollingCorrelation(period);
        rc.calculate(candles1, candles2);
        return rc.values;
    }
}
