class Momentum {
    constructor(period = 10) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            this.values.push(i < this.period ? null : candles[i].close - candles[i - this.period].close);
        }
    }

    static calculate(candles, period = 10) {
        const m = new Momentum(period);
        m.calculate(candles);
        return m.values;
    }
}
