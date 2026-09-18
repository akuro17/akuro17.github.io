class WilderSmoothing {
    constructor(period) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        let prev = null;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            if (i === this.period - 1) { let sum = 0; for (let j = 0; j < this.period; j++) sum += candles[i - j].close; prev = sum / this.period; this.values.push(prev); continue; }
            if (prev !== null) { const smoothed = (prev * (this.period - 1) + candles[i].close) / this.period; this.values.push(smoothed); prev = smoothed; }
            else this.values.push(null);
        }
    }

    static calculate(candles, period) {
        const ws = new WilderSmoothing(period);
        ws.calculate(candles);
        return ws.values;
    }
}
