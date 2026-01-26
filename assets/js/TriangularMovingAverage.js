class TriangularMovingAverage {
    constructor(period) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length < this.period) return;
        const sma1 = [];
        let sum = 0;
        for (let i = 0; i < candles.length; i++) {
            sum += candles[i].close;
            if (i >= this.period) sum -= candles[i - this.period].close;
            sma1.push(i >= this.period - 1 ? sum / this.period : null);
        }
        let sum2 = 0;
        for (let i = 0; i < candles.length; i++) {
            if (sma1[i] !== null) { sum2 += sma1[i]; if (i >= 2 * this.period - 1) sum2 -= sma1[i - this.period]; }
            this.values.push(i >= 2 * this.period - 2 ? sum2 / this.period : null);
        }
    }

    static calculate(candles, period) {
        const tma = new TriangularMovingAverage(period);
        tma.calculate(candles);
        return tma.values;
    }
}
