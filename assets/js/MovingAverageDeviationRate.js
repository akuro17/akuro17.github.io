class MovingAverageDeviationRate {
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
            let sum = 0; for (let j = 0; j < this.period; j++) sum += candles[i - j].close;
            const sma = sum / this.period;
            this.values.push(sma !== 0 ? (candles[i].close - sma) / sma * 100 : 0);
        }
    }

    static calculate(candles, period = 20) {
        const madr = new MovingAverageDeviationRate(period);
        madr.calculate(candles);
        return madr.values;
    }
}
