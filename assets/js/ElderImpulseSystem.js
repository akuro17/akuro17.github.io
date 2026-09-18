class ElderImpulseSystem {
    constructor(emaPeriod = 13, macdShort = 12, macdLong = 26, signalPeriod = 9) {
        this.emaPeriod = emaPeriod;
        this.macdShort = macdShort;
        this.macdLong = macdLong;
        this.signalPeriod = signalPeriod;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length < 2) return;
        const ema = this._calcEma(candles, this.emaPeriod);
        const histogram = this._calcMACDHistogram(candles);
        this.values.push(0);
        for (let i = 1; i < candles.length; i++) {
            if (ema[i] === null || ema[i - 1] === null || histogram[i] === null || histogram[i - 1] === null) { this.values.push(0); continue; }
            const emaRising = ema[i] > ema[i - 1];
            const emaFalling = ema[i] < ema[i - 1];
            const histRising = histogram[i] > histogram[i - 1];
            const histFalling = histogram[i] < histogram[i - 1];
            if (emaRising && histRising) this.values.push(1);
            else if (emaFalling && histFalling) this.values.push(-1);
            else this.values.push(0);
        }
    }

    _calcEma(candles, period) {
        const results = [];
        const k = 2.0 / (period + 1);
        let prevEma = null;
        for (let i = 0; i < candles.length; i++) {
            if (i < period - 1) { results.push(null); continue; }
            if (i === period - 1) { let sum = 0; for (let j = 0; j < period; j++) sum += candles[i - j].close; prevEma = sum / period; results.push(prevEma); continue; }
            if (prevEma !== null) { const ema = (candles[i].close - prevEma) * k + prevEma; results.push(ema); prevEma = ema; } else results.push(null);
        }
        return results;
    }

    _calcMACDHistogram(candles) {
        const shortEma = this._calcEma(candles, this.macdShort);
        const longEma = this._calcEma(candles, this.macdLong);
        const macdLine = [];
        for (let i = 0; i < candles.length; i++) {
            if (shortEma[i] !== null && longEma[i] !== null) macdLine.push(shortEma[i] - longEma[i]);
            else macdLine.push(null);
        }
        const signalLine = this._emaSmooth(macdLine, this.signalPeriod);
        const histogram = [];
        for (let i = 0; i < candles.length; i++) {
            if (macdLine[i] !== null && signalLine[i] !== null) histogram.push(macdLine[i] - signalLine[i]);
            else histogram.push(null);
        }
        return histogram;
    }

    _emaSmooth(source, period) {
        const results = [];
        const k = 2.0 / (period + 1);
        let prev = null, validCount = 0;
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) { results.push(null); continue; }
            validCount++;
            if (validCount < period) { results.push(null); continue; }
            if (validCount === period) { let sum = 0, c = 0; for (let j = i; j >= 0 && c < period; j--) if (source[j] !== null) { sum += source[j]; c++; } prev = c > 0 ? sum / c : null; results.push(prev); continue; }
            if (prev !== null) { const v = (source[i] - prev) * k + prev; results.push(v); prev = v; } else results.push(null);
        }
        return results;
    }

    static calculate(candles, emaPeriod = 13, macdShort = 12, macdLong = 26, signalPeriod = 9) {
        const eis = new ElderImpulseSystem(emaPeriod, macdShort, macdLong, signalPeriod);
        eis.calculate(candles);
        return eis.values;
    }
}
