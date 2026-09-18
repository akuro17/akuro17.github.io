class LinRegSlopeIndicator {
    constructor(period = 20) {
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
                const x = j;
                const y = candles[i - this.period + 1 + j].close;
                sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
            }
            const n = this.period;
            const denom = n * sumX2 - sumX * sumX;
            if (denom === 0) { this.values.push(0); continue; }
            this.values.push((n * sumXY - sumX * sumY) / denom);
        }
    }

    static calculate(candles, period = 20) {
        const lrs = new LinRegSlopeIndicator(period);
        lrs.calculate(candles);
        return lrs.values;
    }
}
