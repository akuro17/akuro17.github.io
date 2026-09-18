class ZScore {
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
            let sum = 0;
            for (let j = i - this.period + 1; j <= i; j++) sum += candles[j].close;
            const mean = sum / this.period;
            let sumSqDiff = 0;
            for (let j = i - this.period + 1; j <= i; j++) sumSqDiff += Math.pow(candles[j].close - mean, 2);
            const stdDev = Math.sqrt(sumSqDiff / this.period);
            this.values.push(stdDev === 0 ? 0 : (candles[i].close - mean) / stdDev);
        }
    }

    static calculate(candles, period = 20) {
        const zscore = new ZScore(period);
        zscore.calculate(candles);
        return zscore.values;
    }
}
