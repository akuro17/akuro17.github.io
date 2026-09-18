class StochasticMomentumIndex {
    constructor(kPeriod = 13, firstSmooth = 25, secondSmooth = 2, signalPeriod = 9) {
        this.kPeriod = kPeriod;
        this.firstSmooth = firstSmooth;
        this.secondSmooth = secondSmooth;
        this.signalPeriod = signalPeriod;
        this.values = [];
        this.signal = [];
    }

    calculate(candles) {
        this.values = [];
        this.signal = [];
        if (candles.length === 0) return;
        const diff = [], range = [];
        for (let i = 0; i < candles.length; i++) {
            if (i < this.kPeriod - 1) { diff.push(null); range.push(null); continue; }
            let highest = -Infinity, lowest = Infinity;
            for (let j = i - this.kPeriod + 1; j <= i; j++) { if (candles[j].high > highest) highest = candles[j].high; if (candles[j].low < lowest) lowest = candles[j].low; }
            diff.push(candles[i].close - (highest + lowest) / 2);
            range.push(highest - lowest);
        }
        const smoothDiff1 = this._emaNullable(diff, this.firstSmooth);
        const smoothDiff2 = this._emaNullable(smoothDiff1, this.secondSmooth);
        const smoothRange1 = this._emaNullable(range, this.firstSmooth);
        const smoothRange2 = this._emaNullable(smoothRange1, this.secondSmooth);
        for (let i = 0; i < candles.length; i++) {
            if (smoothDiff2[i] === null || smoothRange2[i] === null || smoothRange2[i] / 2 === 0) { this.values.push(null); continue; }
            const smi = 100 * smoothDiff2[i] / (smoothRange2[i] / 2);
            this.values.push(Math.max(-100, Math.min(100, smi)));
        }
        this.signal = this._emaNullable(this.values, this.signalPeriod);
    }

    _emaNullable(source, period) {
        const results = [];
        const k = 2.0 / (period + 1);
        let prevEma = null, validCount = 0;
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) { results.push(null); continue; }
            validCount++;
            if (validCount < period) { results.push(null); continue; }
            if (validCount === period) { let sum = 0, c = 0; for (let j = i; j >= 0 && c < period; j--) if (source[j] !== null) { sum += source[j]; c++; } prevEma = c > 0 ? sum / c : null; results.push(prevEma); continue; }
            if (prevEma !== null) { const ema = (source[i] - prevEma) * k + prevEma; results.push(ema); prevEma = ema; } else results.push(null);
        }
        return results;
    }

    static calculate(candles, kPeriod = 13, firstSmooth = 25, secondSmooth = 2, signalPeriod = 9) {
        const smi = new StochasticMomentumIndex(kPeriod, firstSmooth, secondSmooth, signalPeriod);
        smi.calculate(candles);
        return { smi: smi.values, signal: smi.signal };
    }
}
