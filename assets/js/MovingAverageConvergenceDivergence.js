class MovingAverageConvergenceDivergence {
    constructor(shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
        if (shortPeriod <= 0) throw new Error("shortPeriod");
        if (longPeriod <= 0) throw new Error("longPeriod");
        if (signalPeriod <= 0) throw new Error("signalPeriod");
        if (shortPeriod >= longPeriod) throw new Error("shortPeriod must be less than longPeriod");
        this.shortPeriod = shortPeriod;
        this.longPeriod = longPeriod;
        this.signalPeriod = signalPeriod;
        this.macdLine = [];
        this.signalLine = [];
        this.histogram = [];
    }

    calculate(candles) {
        this.macdLine = [];
        this.signalLine = [];
        this.histogram = [];
        if (candles.length === 0) return;
        const shortEma = this._calcEma(candles, this.shortPeriod);
        const longEma = this._calcEma(candles, this.longPeriod);
        for (let i = 0; i < candles.length; i++) {
            if (i < shortEma.length && i < longEma.length && shortEma[i] !== null && longEma[i] !== null) {
                this.macdLine.push(shortEma[i] - longEma[i]);
            } else {
                this.macdLine.push(null);
            }
        }
        this._calcEmaFromValues(this.macdLine, this.signalPeriod, this.signalLine);
        for (let i = 0; i < this.macdLine.length; i++) {
            if (this.macdLine[i] !== null && i < this.signalLine.length && this.signalLine[i] !== null) {
                this.histogram.push(this.macdLine[i] - this.signalLine[i]);
            } else {
                this.histogram.push(null);
            }
        }
    }

    _calcEma(candles, period) {
        const results = [];
        if (candles.length === 0 || period <= 0) return results;
        const k = 2.0 / (period + 1);
        let prevEma = null;
        for (let i = 0; i < candles.length; i++) {
            if (i < period - 1) {
                results.push(null);
                continue;
            }
            if (i === period - 1) {
                let sum = 0;
                for (let j = 0; j < period; j++) sum += candles[i - j].close;
                prevEma = sum / period;
                results.push(prevEma);
                continue;
            }
            if (prevEma !== null) {
                const ema = (candles[i].close - prevEma) * k + prevEma;
                results.push(ema);
                prevEma = ema;
            } else {
                results.push(null);
            }
        }
        return results;
    }

    _calcEmaFromValues(source, period, results) {
        results.length = 0;
        if (source.length === 0 || period <= 0) return;
        const k = 2.0 / (period + 1);
        let prevEma = null;
        let validCount = 0;
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) {
                results.push(null);
                continue;
            }
            validCount++;
            if (validCount < period) {
                results.push(null);
                continue;
            }
            if (validCount === period) {
                let sum = 0;
                let count = 0;
                for (let j = i; j >= 0 && count < period; j--) {
                    if (source[j] !== null) {
                        sum += source[j];
                        count++;
                    }
                }
                prevEma = count > 0 ? sum / count : null;
                results.push(prevEma);
                continue;
            }
            if (prevEma !== null) {
                const ema = (source[i] - prevEma) * k + prevEma;
                results.push(ema);
                prevEma = ema;
            } else {
                results.push(null);
            }
        }
    }

    static calculate(candles, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
        const macd = new MovingAverageConvergenceDivergence(shortPeriod, longPeriod, signalPeriod);
        macd.calculate(candles);
        return { macd: macd.macdLine, signal: macd.signalLine, histogram: macd.histogram };
    }
}
