class ZeroLagExponentialMovingAverage {
    constructor(period) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const lag = Math.floor((this.period - 1) / 2);
        const k = 2.0 / (this.period + 1);
        let prev = null;
        for (let i = 0; i < candles.length; i++) {
            const price = i >= lag ? 2 * candles[i].close - candles[i - lag].close : candles[i].close;
            if (i < this.period - 1) { this.values.push(null); continue; }
            if (prev === null) { let sum = 0; for (let j = 0; j < this.period; j++) sum += candles[i - j].close; prev = sum / this.period; this.values.push(prev); continue; }
            const zlema = (price - prev) * k + prev;
            this.values.push(zlema); prev = zlema;
        }
    }

    static calculate(candles, period) {
        const z = new ZeroLagExponentialMovingAverage(period);
        z.calculate(candles);
        return z.values;
    }
}
