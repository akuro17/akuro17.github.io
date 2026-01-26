class BandWidth {
    constructor(period = 20, multiplier = 2.0) {
        this.period = period;
        this.multiplier = multiplier;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sum = 0; for (let j = i - this.period + 1; j <= i; j++) sum += candles[j].close;
            const sma = sum / this.period;
            let sumSqDiff = 0; for (let j = i - this.period + 1; j <= i; j++) sumSqDiff += Math.pow(candles[j].close - sma, 2);
            const stdDev = Math.sqrt(sumSqDiff / this.period);
            const upper = sma + this.multiplier * stdDev;
            const lower = sma - this.multiplier * stdDev;
            this.values.push(sma === 0 ? null : (upper - lower) / sma * 100);
        }
    }

    static calculate(candles, period = 20, multiplier = 2.0) {
        const bw = new BandWidth(period, multiplier);
        bw.calculate(candles);
        return bw.values;
    }
}
