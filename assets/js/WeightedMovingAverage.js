class WeightedMovingAverage {
    constructor(period) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const denominator = this.period * (this.period + 1) / 2;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let numerator = 0;
            for (let j = 0; j < this.period; j++) {
                const dataIndex = i - this.period + 1 + j;
                const weight = j + 1;
                numerator += candles[dataIndex].close * weight;
            }
            this.values.push(numerator / denominator);
        }
    }

    static calculate(candles, period) {
        const wma = new WeightedMovingAverage(period);
        wma.calculate(candles);
        return wma.values;
    }
}
