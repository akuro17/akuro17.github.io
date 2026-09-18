class RateOfChange {
    constructor(period = 10) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period) {
                this.values.push(null);
            } else {
                const prevClose = candles[i - this.period].close;
                if (prevClose === 0) {
                    this.values.push(null);
                } else {
                    this.values.push(((candles[i].close - prevClose) / prevClose) * 100);
                }
            }
        }
    }

    static calculate(candles, period = 10) {
        const roc = new RateOfChange(period);
        roc.calculate(candles);
        return roc.values;
    }
}
