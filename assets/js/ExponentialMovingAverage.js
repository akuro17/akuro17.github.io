class ExponentialMovingAverage {
    constructor(period) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        if (this.period === 1) {
            for (const c of candles) this.values.push(c.close);
            return;
        }
        const k = 2.0 / (this.period + 1);
        let prevEma = null;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) {
                this.values.push(null);
                continue;
            }
            if (i === this.period - 1) {
                let sum = 0;
                for (let j = 0; j < this.period; j++) sum += candles[i - j].close;
                prevEma = sum / this.period;
                this.values.push(prevEma);
                continue;
            }
            if (prevEma === null) {
                this.values.push(null);
            } else {
                const ema = (candles[i].close - prevEma) * k + prevEma;
                this.values.push(ema);
                prevEma = ema;
            }
        }
    }

    static calculate(candles, period) {
        const ema = new ExponentialMovingAverage(period);
        ema.calculate(candles);
        return ema.values;
    }
}
