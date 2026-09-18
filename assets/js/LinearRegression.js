class LinearRegression {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
        this.slope = [];
        this.rSquared = [];
    }

    calculate(candles) {
        this.values = []; this.slope = []; this.rSquared = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); this.slope.push(null); this.rSquared.push(null); continue; }
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
            for (let j = 0; j < this.period; j++) {
                const x = j;
                const y = candles[i - this.period + 1 + j].close;
                sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x; sumY2 += y * y;
            }
            const n = this.period;
            const denominator = n * sumX2 - sumX * sumX;
            if (denominator === 0) { this.values.push(null); this.slope.push(null); this.rSquared.push(null); continue; }
            const slope = (n * sumXY - sumX * sumY) / denominator;
            const intercept = (sumY - slope * sumX) / n;
            const lrValue = intercept + slope * (this.period - 1);
            const ssTotal = sumY2 - (sumY * sumY) / n;
            let r2 = 0;
            if (ssTotal !== 0) {
                let ssRes = 0;
                for (let j = 0; j < this.period; j++) { const predicted = intercept + slope * j; const actual = candles[i - this.period + 1 + j].close; ssRes += Math.pow(actual - predicted, 2); }
                r2 = 1 - ssRes / ssTotal;
            }
            this.values.push(lrValue); this.slope.push(slope); this.rSquared.push(r2);
        }
    }

    static calculate(candles, period = 14) {
        const lr = new LinearRegression(period);
        lr.calculate(candles);
        return { values: lr.values, slope: lr.slope, rSquared: lr.rSquared };
    }
}
