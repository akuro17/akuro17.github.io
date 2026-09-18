class RelativeStrengthIndex {
    static NEAR_ZERO = 1e-10;

    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        this.values.push(null);
        if (candles.length < 2) return;
        let sumGains = 0;
        let sumLosses = 0;
        for (let i = 1; i < candles.length; i++) {
            const change = candles[i].close - candles[i - 1].close;
            const gain = change > 0 ? change : 0;
            const loss = change < 0 ? -change : 0;
            if (i < this.period) {
                sumGains += gain;
                sumLosses += loss;
                this.values.push(null);
                continue;
            }
            if (i === this.period) {
                sumGains += gain;
                sumLosses += loss;
                const avgGain = sumGains / this.period;
                const avgLoss = sumLosses / this.period;
                this.values.push(this._calcRsi(avgGain, avgLoss));
                sumGains = avgGain;
                sumLosses = avgLoss;
                continue;
            }
            const currentGain = change > 0 ? change : 0;
            const currentLoss = change < 0 ? -change : 0;
            sumGains = (sumGains * (this.period - 1) + currentGain) / this.period;
            sumLosses = (sumLosses * (this.period - 1) + currentLoss) / this.period;
            this.values.push(this._calcRsi(sumGains, sumLosses));
        }
    }

    _calcRsi(avgGain, avgLoss) {
        if (Math.abs(avgLoss) < RelativeStrengthIndex.NEAR_ZERO) {
            return Math.abs(avgGain) < RelativeStrengthIndex.NEAR_ZERO ? 50 : 100;
        }
        const rs = avgGain / (avgLoss + RelativeStrengthIndex.NEAR_ZERO);
        const rsi = 100 - (100 / (1 + rs));
        return Math.max(0, Math.min(100, rsi));
    }

    static calculate(candles, period = 14) {
        const rsi = new RelativeStrengthIndex(period);
        rsi.calculate(candles);
        return rsi.values;
    }
}
