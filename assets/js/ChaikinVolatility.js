class ChaikinVolatility {
    constructor(emaPeriod = 10, rocPeriod = 10) {
        this.emaPeriod = emaPeriod;
        this.rocPeriod = rocPeriod;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const highLow = candles.map(c => c.high - c.low);
        const ema = this._calcEma(highLow, this.emaPeriod);
        for (let i = 0; i < candles.length; i++) {
            if (i < this.rocPeriod || ema[i] === null || ema[i - this.rocPeriod] === null || ema[i - this.rocPeriod] === 0) { this.values.push(null); continue; }
            const cv = ((ema[i] - ema[i - this.rocPeriod]) / ema[i - this.rocPeriod]) * 100;
            this.values.push(cv);
        }
    }

    _calcEma(prices, period) {
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

    static calculate(candles, emaPeriod = 10, rocPeriod = 10) {
        const cv = new ChaikinVolatility(emaPeriod, rocPeriod);
        cv.calculate(candles);
        return cv.values;
    }
}
