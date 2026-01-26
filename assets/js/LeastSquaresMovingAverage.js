class LeastSquaresMovingAverage {
    constructor(period = 25) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            for (let j = 0; j < this.period; j++) {
                const x = j + 1;
                const y = candles[i - this.period + 1 + j].close;
                sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
            }
            const n = this.period;
            const denominator = n * sumX2 - sumX * sumX;
            if (denominator === 0) { this.values.push(null); continue; }
            const slope = (n * sumXY - sumX * sumY) / denominator;
            const intercept = (sumY - slope * sumX) / n;
            this.values.push(intercept + slope * this.period);
        }
    }

    static calculate(candles, period = 25) {
        const lsma = new LeastSquaresMovingAverage(period);
        lsma.calculate(candles);
        return lsma.values;
    }
}
