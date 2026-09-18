class ElderRay {
    constructor(period = 13) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.bullPower = [];
        this.bearPower = [];
    }

    calculate(candles) {
        this.bullPower = [];
        this.bearPower = [];
        if (candles.length === 0) return;
        const emaValues = [];
        const k = 2.0 / (this.period + 1);
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { emaValues.push(null); this.bullPower.push(null); this.bearPower.push(null); continue; }
            if (i === this.period - 1) { let sum = 0; for (let j = 0; j < this.period; j++) sum += candles[i - j].close; emaValues.push(sum / this.period); }
            else { const prev = emaValues[i - 1]; if (prev !== null) emaValues.push((candles[i].close - prev) * k + prev); else emaValues.push(null); }
            if (emaValues[i] !== null) { this.bullPower.push(candles[i].high - emaValues[i]); this.bearPower.push(candles[i].low - emaValues[i]); }
            else { this.bullPower.push(null); this.bearPower.push(null); }
        }
    }

    static calculate(candles, period = 13) {
        const er = new ElderRay(period);
        er.calculate(candles);
        return { bull: er.bullPower, bear: er.bearPower };
    }
}
