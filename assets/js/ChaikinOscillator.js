class ChaikinOscillator {
    constructor(fast = 3, slow = 10) {
        this.fastPeriod = fast;
        this.slowPeriod = slow;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const adl = [];
        let adlVal = 0;
        for (const c of candles) {
            const range = c.high - c.low;
            const clv = range !== 0 ? ((c.close - c.low) - (c.high - c.close)) / range : 0;
            adlVal += clv * c.volume;
            adl.push(adlVal);
        }
        const fastEma = this._emaFromValues(adl, this.fastPeriod);
        const slowEma = this._emaFromValues(adl, this.slowPeriod);
        for (let i = 0; i < candles.length; i++) {
            if (fastEma[i] !== null && slowEma[i] !== null) this.values.push(fastEma[i] - slowEma[i]);
            else this.values.push(null);
        }
    }

    _emaFromValues(s, p) {
        const r = [];
        const k = 2.0 / (p + 1);
        let prev = null;
        for (let i = 0; i < s.length; i++) {
            if (i < p - 1) { r.push(null); continue; }
            if (i === p - 1) { let sum = 0; for (let j = 0; j < p; j++) sum += s[i - j]; prev = sum / p; r.push(prev); continue; }
            const e = (s[i] - prev) * k + prev; r.push(e); prev = e;
        }
        return r;
    }

    static calculate(candles, fast = 3, slow = 10) {
        const co = new ChaikinOscillator(fast, slow);
        co.calculate(candles);
        return co.values;
    }
}
