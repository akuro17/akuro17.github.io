class WilliamsPercentR {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let highestHigh = -Infinity;
            let lowestLow = Infinity;
            for (let j = i - this.period + 1; j <= i; j++) {
                if (candles[j].high > highestHigh) highestHigh = candles[j].high;
                if (candles[j].low < lowestLow) lowestLow = candles[j].low;
            }
            const range = highestHigh - lowestLow;
            if (range === 0) { this.values.push(-50); }
            else {
                const r = ((highestHigh - candles[i].close) / range) * -100;
                this.values.push(Math.max(-100, Math.min(0, r)));
            }
        }
    }

    static calculate(candles, period = 14) {
        const wr = new WilliamsPercentR(period);
        wr.calculate(candles);
        return wr.values;
    }
}
