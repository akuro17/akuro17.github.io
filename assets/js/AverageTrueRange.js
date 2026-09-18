class AverageTrueRange {
    constructor(period) {
        if (period <= 1) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const trValues = [];
        for (let i = 0; i < candles.length; i++) {
            const high = candles[i].high;
            const low = candles[i].low;
            if (i === 0) {
                trValues.push(high - low);
            } else {
                const prevClose = candles[i - 1].close;
                trValues.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
            }
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) {
                this.values.push(null);
                continue;
            }
            if (i === this.period - 1) {
                let sum = 0;
                for (let j = 0; j < this.period; j++) sum += trValues[j];
                this.values.push(sum / this.period);
            } else {
                const prevAtr = this.values[i - 1] !== null ? this.values[i - 1] : 0;
                this.values.push((prevAtr * (this.period - 1) + trValues[i]) / this.period);
            }
        }
    }

    static calculate(candles, period) {
        const atr = new AverageTrueRange(period);
        atr.calculate(candles);
        return atr.values;
    }
}
