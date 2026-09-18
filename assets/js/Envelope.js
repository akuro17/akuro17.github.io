class Envelope {
    constructor(period = 20, percentage = 2.5) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.percentage = percentage;
        this.upperBand = [];
        this.middleBand = [];
        this.lowerBand = [];
    }

    calculate(candles) {
        this.upperBand = [];
        this.middleBand = [];
        this.lowerBand = [];
        if (candles.length === 0) return;
        let sum = 0;
        for (let i = 0; i < candles.length; i++) {
            sum += candles[i].close;
            if (i >= this.period) sum -= candles[i - this.period].close;
            if (i < this.period - 1) { this.upperBand.push(null); this.middleBand.push(null); this.lowerBand.push(null); continue; }
            const sma = sum / this.period;
            const offset = sma * (this.percentage / 100);
            this.middleBand.push(sma);
            this.upperBand.push(sma + offset);
            this.lowerBand.push(sma - offset);
        }
    }

    static calculate(candles, period = 20, percentage = 2.5) {
        const env = new Envelope(period, percentage);
        env.calculate(candles);
        return { upper: env.upperBand, middle: env.middleBand, lower: env.lowerBand };
    }
}
