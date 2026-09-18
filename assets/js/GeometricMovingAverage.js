class GeometricMovingAverage {
    constructor(period = 10) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let product = 1.0, valid = true;
            for (let j = i - this.period + 1; j <= i; j++) {
                if (candles[j].close <= 0) { valid = false; break; }
                product *= candles[j].close;
            }
            this.values.push(valid ? Math.pow(product, 1.0 / this.period) : null);
        }
    }

    static calculate(candles, period = 10) {
        const gma = new GeometricMovingAverage(period);
        gma.calculate(candles);
        return gma.values;
    }
}
