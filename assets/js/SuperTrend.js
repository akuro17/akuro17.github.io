class SuperTrend {
    constructor(period = 10, multiplier = 3.0) {
        this.period = period;
        this.multiplier = multiplier;
        this.values = [];
        this.trend = [];
    }

    calculate(candles) {
        this.values = [];
        this.trend = [];
        if (candles.length === 0) return;
        const atr = this._calcAtr(candles, this.period);
        const upperBands = [];
        const lowerBands = [];
        for (let i = 0; i < candles.length; i++) {
            if (atr[i] === null) {
                upperBands.push(null);
                lowerBands.push(null);
                this.values.push(null);
                this.trend.push(0);
                continue;
            }
            const hl2 = (candles[i].high + candles[i].low) / 2;
            const basicUpper = hl2 + this.multiplier * atr[i];
            const basicLower = hl2 - this.multiplier * atr[i];
            let finalUpper = basicUpper;
            let finalLower = basicLower;
            if (i > 0 && upperBands[i - 1] !== null) {
                finalUpper = (basicUpper < upperBands[i - 1] || candles[i - 1].close > upperBands[i - 1]) ? basicUpper : upperBands[i - 1];
                finalLower = (basicLower > lowerBands[i - 1] || candles[i - 1].close < lowerBands[i - 1]) ? basicLower : lowerBands[i - 1];
            }
            upperBands.push(finalUpper);
            lowerBands.push(finalLower);
            let t = 1;
            if (i > 0 && this.values[i - 1] !== null) {
                if (this.values[i - 1] === upperBands[i - 1]) t = candles[i].close > finalUpper ? 1 : -1;
                else t = candles[i].close < finalLower ? -1 : 1;
            }
            this.trend.push(t);
            this.values.push(t === 1 ? finalLower : finalUpper);
        }
    }

    _calcAtr(candles, period) {
        const results = [];
        if (candles.length === 0) return results;
        const trValues = [candles[0].high - candles[0].low];
        for (let i = 1; i < candles.length; i++) {
            const tr1 = candles[i].high - candles[i].low;
            const tr2 = Math.abs(candles[i].high - candles[i - 1].close);
            const tr3 = Math.abs(candles[i].low - candles[i - 1].close);
            trValues.push(Math.max(tr1, tr2, tr3));
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < period - 1) { results.push(null); continue; }
            if (i === period - 1) { let sum = 0; for (let j = 0; j < period; j++) sum += trValues[j]; results.push(sum / period); continue; }
            const prevAtr = results[i - 1];
            results.push((prevAtr * (period - 1) + trValues[i]) / period);
        }
        return results;
    }

    static calculate(candles, period = 10, multiplier = 3.0) {
        const st = new SuperTrend(period, multiplier);
        st.calculate(candles);
        return st.values;
    }
}
