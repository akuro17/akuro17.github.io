class HullMovingAverage {
    constructor(period) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const halfPeriod = Math.floor(this.period / 2);
        const sqrtPeriod = Math.floor(Math.sqrt(this.period));
        const wmaHalf = this._calcWma(candles, halfPeriod);
        const wmaFull = this._calcWma(candles, this.period);
        const rawHma = [];
        for (let i = 0; i < candles.length; i++) {
            if (i < wmaHalf.length && i < wmaFull.length && wmaHalf[i] !== null && wmaFull[i] !== null) {
                rawHma.push(2 * wmaHalf[i] - wmaFull[i]);
            } else {
                rawHma.push(null);
            }
        }
        const hmaValues = this._calcWmaFromValues(rawHma, sqrtPeriod);
        for (let i = 0; i < candles.length; i++) {
            this.values.push(i < hmaValues.length ? hmaValues[i] : null);
        }
    }

    _calcWma(candles, period) {
        const results = [];
        if (candles.length === 0 || period <= 0) return results;
        const weightSum = period * (period + 1) / 2;
        for (let i = 0; i < candles.length; i++) {
            if (i < period - 1) { results.push(null); continue; }
            let sum = 0;
            for (let j = 0; j < period; j++) sum += candles[i - j].close * (period - j);
            results.push(sum / weightSum);
        }
        return results;
    }

    _calcWmaFromValues(source, period) {
        const results = [];
        if (source.length === 0 || period <= 0) return results;
        const weightSum = period * (period + 1) / 2;
        let validCount = 0;
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) { results.push(null); continue; }
            validCount++;
            if (validCount < period) { results.push(null); continue; }
            let sum = 0;
            let weight = period;
            let count = 0;
            for (let j = i; j >= 0 && count < period; j--) {
                if (source[j] !== null) {
                    sum += source[j] * weight;
                    weight--;
                    count++;
                }
            }
            results.push(sum / weightSum);
        }
        return results;
    }

    static calculate(candles, period) {
        const hma = new HullMovingAverage(period);
        hma.calculate(candles);
        return hma.values;
    }
}
