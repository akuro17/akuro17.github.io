class ArnaudLegouxMovingAverage {
    constructor(period = 9, offset = 0.85, sigma = 6.0) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.offset = offset;
        this.sigma = sigma;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const m = this.offset * (this.period - 1);
        const s = this.period / this.sigma;
        const weights = [];
        let weightSum = 0;
        for (let i = 0; i < this.period; i++) {
            const w = Math.exp(-(Math.pow(i - m, 2)) / (2 * s * s));
            weights.push(w);
            weightSum += w;
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sum = 0;
            for (let j = 0; j < this.period; j++) sum += candles[i - this.period + 1 + j].close * weights[j];
            this.values.push(sum / weightSum);
        }
    }

    static calculate(candles, period = 9, offset = 0.85, sigma = 6.0) {
        const alma = new ArnaudLegouxMovingAverage(period, offset, sigma);
        alma.calculate(candles);
        return alma.values;
    }
}
