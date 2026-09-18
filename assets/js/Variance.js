class Variance {
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
            for (let j = 0; j < this.period; j++) sum += candles[i - j].close;
            const mean = sum / this.period;
            let sumSqDiff = 0;
            for (let j = 0; j < this.period; j++) sumSqDiff += Math.pow(candles[i - j].close - mean, 2);
            this.values.push(sumSqDiff / this.period);
        }
    }

    static calculate(candles, period = 20) {
        const v = new Variance(period);
        v.calculate(candles);
        return v.values;
    }
}
