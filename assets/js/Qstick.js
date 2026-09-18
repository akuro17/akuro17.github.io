class Qstick {
    constructor(period = 8) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const closeOpenDiff = candles.map(c => c.close - c.open);
        let sum = 0;
        for (let i = 0; i < candles.length; i++) {
            sum += closeOpenDiff[i];
            if (i >= this.period) sum -= closeOpenDiff[i - this.period];
            this.values.push(i < this.period - 1 ? null : sum / this.period);
        }
    }

    static calculate(candles, period = 8) {
        const qs = new Qstick(period);
        qs.calculate(candles);
        return qs.values;
    }
}
