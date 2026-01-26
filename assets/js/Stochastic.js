class Stochastic {
    constructor(kPeriod = 14, dPeriod = 3) {
        if (kPeriod <= 0) throw new Error("kPeriod");
        if (dPeriod <= 0) throw new Error("dPeriod");
        this.kPeriod = kPeriod;
        this.dPeriod = dPeriod;
        this.percentK = [];
        this.percentD = [];
    }

    calculate(candles) {
        this.percentK = [];
        this.percentD = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.kPeriod - 1) {
                this.percentK.push(null);
                continue;
            }
            let highestHigh = -Infinity;
            let lowestLow = Infinity;
            for (let j = i - this.kPeriod + 1; j <= i; j++) {
                if (candles[j].high > highestHigh) highestHigh = candles[j].high;
                if (candles[j].low < lowestLow) lowestLow = candles[j].low;
            }
            const range = highestHigh - lowestLow;
            if (range === 0) {
                this.percentK.push(50);
            } else {
                const k = ((candles[i].close - lowestLow) / range) * 100;
                this.percentK.push(Math.max(0, Math.min(100, k)));
            }
        }
        this._calcSma(this.percentK, this.dPeriod, this.percentD);
    }

    _calcSma(source, period, results) {
        results.length = 0;
        if (source.length === 0 || period <= 0) return;
        let validCount = 0;
        let sum = 0;
        const validValues = [];
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) {
                results.push(null);
                continue;
            }
            validCount++;
            sum += source[i];
            validValues.push(source[i]);
            if (validValues.length > period) {
                sum -= validValues.shift();
            }
            if (validCount < period) {
                results.push(null);
            } else {
                results.push(sum / period);
            }
        }
    }

    static calculate(candles, kPeriod = 14, dPeriod = 3) {
        const stoch = new Stochastic(kPeriod, dPeriod);
        stoch.calculate(candles);
        return { k: stoch.percentK, d: stoch.percentD };
    }
}
