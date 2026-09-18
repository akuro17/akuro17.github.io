class ForceIndex {
    constructor(period = 13) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length < 2) return;
        const rawForce = [null];
        for (let i = 1; i < candles.length; i++) {
            rawForce.push((candles[i].close - candles[i - 1].close) * candles[i].volume);
        }
        const k = 2.0 / (this.period + 1);
        let prevEma = null;
        let validCount = 0;
        for (let i = 0; i < candles.length; i++) {
            if (rawForce[i] === null) { this.values.push(null); continue; }
            validCount++;
            if (validCount < this.period) { this.values.push(null); continue; }
            if (validCount === this.period) {
                let sum = 0, count = 0;
                for (let j = i; j >= 0 && count < this.period; j--) {
                    if (rawForce[j] !== null) { sum += rawForce[j]; count++; }
                }
                prevEma = count > 0 ? sum / count : null;
                this.values.push(prevEma);
                continue;
            }
            if (prevEma !== null) {
                const ema = (rawForce[i] - prevEma) * k + prevEma;
                this.values.push(ema);
                prevEma = ema;
            } else { this.values.push(null); }
        }
    }

    static calculate(candles, period = 13) {
        const fi = new ForceIndex(period);
        fi.calculate(candles);
        return fi.values;
    }
}
