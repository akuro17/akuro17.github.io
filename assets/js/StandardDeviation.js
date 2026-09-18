class StandardDeviation {
    constructor(period) {
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
            for (let j = 0; j < this.period; j++) sum += candles[i - this.period + 1 + j].close;
            const mean = sum / this.period;
            let sumSqDiff = 0;
            for (let j = 0; j < this.period; j++) sumSqDiff += Math.pow(candles[i - this.period + 1 + j].close - mean, 2);
            this.values.push(Math.sqrt(sumSqDiff / this.period));
        }
    }

    static calculate(candles, period) {
        const sd = new StandardDeviation(period);
        sd.calculate(candles);
        return sd.values;
    }
}
