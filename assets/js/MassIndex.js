class MassIndex {
    constructor(emaPeriod = 9, sumPeriod = 25) {
        this.emaPeriod = emaPeriod;
        this.sumPeriod = sumPeriod;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const highLow = candles.map(c => c.high - c.low);
        const ema1 = this._calcEmaPrices(highLow, this.emaPeriod);
        const ema2 = this._calcEmaValues(ema1, this.emaPeriod);
        const ratio = [];
        for (let i = 0; i < candles.length; i++) {
            if (ema1[i] !== null && ema2[i] !== null && ema2[i] !== 0) ratio.push(ema1[i] / ema2[i]);
            else ratio.push(null);
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < this.sumPeriod - 1) { this.values.push(null); continue; }
            let sum = 0, valid = true;
            for (let j = i - this.sumPeriod + 1; j <= i; j++) { if (ratio[j] === null) { valid = false; break; } sum += ratio[j]; }
            this.values.push(valid ? sum : null);
        }
    }

    _calcEmaPrices(prices, period) {
        const results = [];
        const k = 2.0 / (period + 1);
        let prevEma = null;
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) { results.push(null); continue; }
            if (i === period - 1) { let sum = 0; for (let j = 0; j < period; j++) sum += prices[i - j]; prevEma = sum / period; results.push(prevEma); continue; }
            if (prevEma !== null) { const ema = (prices[i] - prevEma) * k + prevEma; results.push(ema); prevEma = ema; } else results.push(null);
        }
        return results;
    }

    _calcEmaValues(source, period) {
        const results = [];
        const k = 2.0 / (period + 1);
        let prevEma = null, validCount = 0;
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) { results.push(null); continue; }
            validCount++;
            if (validCount < period) { results.push(null); continue; }
            if (validCount === period) { let sum = 0, count = 0; for (let j = i; j >= 0 && count < period; j--) if (source[j] !== null) { sum += source[j]; count++; } prevEma = count > 0 ? sum / count : null; results.push(prevEma); continue; }
            if (prevEma !== null) { const ema = (source[i] - prevEma) * k + prevEma; results.push(ema); prevEma = ema; } else results.push(null);
        }
        return results;
    }

    static calculate(candles, emaPeriod = 9, sumPeriod = 25) {
        const mi = new MassIndex(emaPeriod, sumPeriod);
        mi.calculate(candles);
        return mi.values;
    }
}
