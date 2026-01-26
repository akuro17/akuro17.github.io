class BollingerBands {
    constructor(period = 20, multiplier = 2.0) {
        if (period <= 0) throw new Error("period");
        if (multiplier <= 0) throw new Error("multiplier");
        this.period = period;
        this.multiplier = multiplier;
        this.upperBand = [];
        this.middleBand = [];
        this.lowerBand = [];
    }

    calculate(candles) {
        this.upperBand = [];
        this.middleBand = [];
        this.lowerBand = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) {
                this.upperBand.push(null);
                this.middleBand.push(null);
                this.lowerBand.push(null);
                continue;
            }
            let sum = 0;
            for (let j = i - this.period + 1; j <= i; j++) sum += candles[j].close;
            const sma = sum / this.period;
            let sumSqDiff = 0;
            for (let j = i - this.period + 1; j <= i; j++) {
                const diff = candles[j].close - sma;
                sumSqDiff += diff * diff;
            }
            const stdDev = Math.sqrt(sumSqDiff / this.period);
            this.middleBand.push(sma);
            this.upperBand.push(sma + this.multiplier * stdDev);
            this.lowerBand.push(sma - this.multiplier * stdDev);
        }
    }

    static calculate(candles, period = 20, multiplier = 2.0) {
        const bb = new BollingerBands(period, multiplier);
        bb.calculate(candles);
        return { upper: bb.upperBand, middle: bb.middleBand, lower: bb.lowerBand };
    }
}
