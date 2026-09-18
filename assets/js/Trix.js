class Trix {
    constructor(period = 15) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const closes = candles.map(c => c.close);
        const ema1 = this._calcEma(closes, this.period);
        const ema2 = this._calcEmaFromNullable(ema1, this.period);
        const ema3 = this._calcEmaFromNullable(ema2, this.period);
        for (let i = 0; i < candles.length; i++) {
            if (i === 0 || ema3[i] === null || ema3[i - 1] === null || ema3[i - 1] === 0) { this.values.push(null); continue; }
            this.values.push(((ema3[i] - ema3[i - 1]) / ema3[i - 1]) * 100);
        }
    }

    _calcEma(source, period) {
        const results = [];
        const k = 2.0 / (period + 1);
        for (let i = 0; i < source.length; i++) {
            if (i < period - 1) { results.push(null); continue; }
            if (i === period - 1) { let sum = 0; for (let j = 0; j < period; j++) sum += source[i - j]; results.push(sum / period); continue; }
            const prev = results[i - 1];
            if (prev !== null) results.push((source[i] - prev) * k + prev);
            else results.push(null);
        }
        return results;
    }

    _calcEmaFromNullable(source, period) {
        const results = [];
        const k = 2.0 / (period + 1);
        let sum = 0, validCount = 0, prev = null;
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) { results.push(null); continue; }
            if (prev === null) {
                sum += source[i]; validCount++;
                if (validCount === period) { prev = sum / period; results.push(prev); } else results.push(null);
            } else { const ema = (source[i] - prev) * k + prev; results.push(ema); prev = ema; }
        }
        return results;
    }

    static calculate(candles, period = 15) {
        const t = new Trix(period);
        t.calculate(candles);
        return t.values;
    }
}
