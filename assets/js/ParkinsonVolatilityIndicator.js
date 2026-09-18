class ParkinsonVolatilityIndicator {
    constructor(period = 20) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const factor = 1.0 / (4.0 * Math.log(2));
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sum = 0;
            for (let j = 0; j < this.period; j++) {
                const high = candles[i - j].high, low = candles[i - j].low;
                if (low <= 0) continue;
                const logRatio = Math.log(high / low);
                sum += logRatio * logRatio;
            }
            const variance = factor * sum / this.period;
            this.values.push(Math.sqrt(variance * 252) * 100);
        }
    }

    static calculate(candles, period = 20) {
        const pv = new ParkinsonVolatilityIndicator(period);
        pv.calculate(candles);
        return pv.values;
    }
}
