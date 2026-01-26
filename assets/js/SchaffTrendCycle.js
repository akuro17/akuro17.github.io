class SchaffTrendCycle {
    constructor(macdShort = 23, macdLong = 50, cyclePeriod = 10) {
        this.macdShort = macdShort;
        this.macdLong = macdLong;
        this.cyclePeriod = cyclePeriod;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const macd = this._calculateMACD(candles, this.macdShort, this.macdLong);
        const stoch1 = [];
        for (let i = 0; i < candles.length; i++) {
            if (i < this.cyclePeriod - 1 || macd[i] === null) { stoch1.push(null); continue; }
            const window = [];
            for (let j = i - this.cyclePeriod + 1; j <= i; j++) if (macd[j] !== null) window.push(macd[j]);
            if (window.length === 0) { stoch1.push(null); continue; }
            const highest = Math.max(...window), lowest = Math.min(...window);
            stoch1.push(highest === lowest ? 0 : (macd[i] - lowest) / (highest - lowest) * 100);
        }
        const smoothed1 = this._emaSmooth(stoch1, 3);
        const stoch2 = [];
        for (let i = 0; i < candles.length; i++) {
            if (i < this.cyclePeriod - 1 || smoothed1[i] === null) { stoch2.push(null); continue; }
            const window = [];
            for (let j = i - this.cyclePeriod + 1; j <= i; j++) if (smoothed1[j] !== null) window.push(smoothed1[j]);
            if (window.length === 0) { stoch2.push(null); continue; }
            const highest = Math.max(...window), lowest = Math.min(...window);
            stoch2.push(highest === lowest ? 0 : (smoothed1[i] - lowest) / (highest - lowest) * 100);
        }
        const stc = this._emaSmooth(stoch2, 3);
        for (const v of stc) this.values.push(v !== null ? Math.max(0, Math.min(100, v)) : null);
    }

    _calculateMACD(candles, shortP, longP) {
        const shortEma = this._calculateEma(candles, shortP), longEma = this._calculateEma(candles, longP);
        return candles.map((_, i) => shortEma[i] !== null && longEma[i] !== null ? shortEma[i] - longEma[i] : null);
    }

    _calculateEma(candles, period) {
        const results = [];
        const k = 2.0 / (period + 1);
        let prev = null;
        for (let i = 0; i < candles.length; i++) {
            if (i < period - 1) { results.push(null); continue; }
            if (i === period - 1) { let sum = 0; for (let j = 0; j < period; j++) sum += candles[i - j].close; prev = sum / period; results.push(prev); continue; }
            if (prev !== null) { const ema = (candles[i].close - prev) * k + prev; results.push(ema); prev = ema; } else results.push(null);
        }
        return results;
    }

    _emaSmooth(source, period) {
        const results = [];
        const k = 2.0 / (period + 1);
        let prev = null;
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) { results.push(null); continue; }
            if (prev === null) { prev = source[i]; results.push(prev); continue; }
            const v = (source[i] - prev) * k + prev;
            results.push(v); prev = v;
        }
        return results;
    }

    static calculate(candles, macdShort = 23, macdLong = 50, cyclePeriod = 10) {
        const stc = new SchaffTrendCycle(macdShort, macdLong, cyclePeriod);
        stc.calculate(candles);
        return stc.values;
    }
}
