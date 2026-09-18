class RollingHedgeRatioFeature {
    constructor(period = 60) {
        if (period <= 1) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(asset1, asset2) {
        this.values = [];
        const n = Math.min(asset1.length, asset2.length);
        if (n < this.period) return;
        for (let i = 0; i < n; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            for (let j = 0; j < this.period; j++) { const x = asset2[i - j].close, y = asset1[i - j].close; sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x; }
            const denom = this.period * sumX2 - sumX * sumX;
            this.values.push(denom === 0 ? null : (this.period * sumXY - sumX * sumY) / denom);
        }
    }

    static calculate(asset1, asset2, period = 60) {
        const hr = new RollingHedgeRatioFeature(period);
        hr.calculate(asset1, asset2);
        return hr.values;
    }
}
