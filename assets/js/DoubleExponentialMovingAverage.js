class DoubleExponentialMovingAverage {
    constructor(period) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const ema1 = this._calcEma(candles, this.period);
        const ema2 = this._calcEmaFromValues(ema1, this.period);
        for (let i = 0; i < candles.length; i++) {
            if (i < ema1.length && i < ema2.length && ema1[i] !== null && ema2[i] !== null)
                this.values.push(2 * ema1[i] - ema2[i]);
            else this.values.push(null);
        }
    }

    _calcEma(candles, period) {
        const results = [];
        if (candles.length === 0 || period <= 0) return results;
        const k = 2.0 / (period + 1);
        let prevEma = null;
        for (let i = 0; i < candles.length; i++) {
            if (i < period - 1) { results.push(null); continue; }
            if (i === period - 1) { let sum = 0; for (let j = 0; j < period; j++) sum += candles[i - j].close; prevEma = sum / period; results.push(prevEma); continue; }
            if (prevEma !== null) { const ema = (candles[i].close - prevEma) * k + prevEma; results.push(ema); prevEma = ema; } else results.push(null);
        }
        return results;
    }

    _calcEmaFromValues(source, period) {
        const results = [];
        if (source.length === 0 || period <= 0) return results;
        const k = 2.0 / (period + 1);
        let prevEma = null;
        let validCount = 0;
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) { results.push(null); continue; }
            validCount++;
            if (validCount < period) { results.push(null); continue; }
            if (validCount === period) {
                let sum = 0, count = 0;
                for (let j = i; j >= 0 && count < period; j--) { if (source[j] !== null) { sum += source[j]; count++; } }
                prevEma = count > 0 ? sum / count : null;
                results.push(prevEma);
                continue;
            }
            if (prevEma !== null) { const ema = (source[i] - prevEma) * k + prevEma; results.push(ema); prevEma = ema; } else results.push(null);
        }
        return results;
    }

    static calculate(candles, period) {
        const dema = new DoubleExponentialMovingAverage(period);
        dema.calculate(candles);
        return dema.values;
    }
}
