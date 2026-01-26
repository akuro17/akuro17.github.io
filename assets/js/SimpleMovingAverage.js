class SimpleMovingAverage {
    constructor(period) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        let sum = 0;
        for (let i = 0; i < candles.length; i++) {
            sum += candles[i].close;
            if (i >= this.period) sum -= candles[i - this.period].close;
            this.values.push(i < this.period - 1 ? null : sum / this.period);
        }
    }

    static calculate(candles, period) {
        const sma = new SimpleMovingAverage(period);
        sma.calculate(candles);
        return sma.values;
    }
}
