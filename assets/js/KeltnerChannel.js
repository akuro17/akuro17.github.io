class KeltnerChannel {
    constructor(emaPeriod = 20, atrPeriod = 10, multiplier = 2.0) {
        this.emaPeriod = emaPeriod;
        this.atrPeriod = atrPeriod;
        this.multiplier = multiplier;
        this.upperBand = [];
        this.middleBand = [];
        this.lowerBand = [];
    }

    calculate(candles) {
        this.upperBand = [];
        this.middleBand = [];
        this.lowerBand = [];
        if (candles.length === 0) return;
        const ema = this._calcEma(candles, this.emaPeriod);
        const atr = this._calcAtr(candles, this.atrPeriod);
        for (let i = 0; i < candles.length; i++) {
            if (i < ema.length && i < atr.length && ema[i] !== null && atr[i] !== null) {
                this.middleBand.push(ema[i]);
                this.upperBand.push(ema[i] + this.multiplier * atr[i]);
                this.lowerBand.push(ema[i] - this.multiplier * atr[i]);
            } else {
                this.upperBand.push(null);
                this.middleBand.push(null);
                this.lowerBand.push(null);
            }
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

    _calcAtr(candles, period) {
        const results = [];
        if (candles.length === 0) return results;
        const trValues = [candles[0].high - candles[0].low];
        for (let i = 1; i < candles.length; i++) {
            const tr1 = candles[i].high - candles[i].low;
            const tr2 = Math.abs(candles[i].high - candles[i - 1].close);
            const tr3 = Math.abs(candles[i].low - candles[i - 1].close);
            trValues.push(Math.max(tr1, tr2, tr3));
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < period - 1) { results.push(null); continue; }
            if (i === period - 1) { let sum = 0; for (let j = 0; j < period; j++) sum += trValues[j]; results.push(sum / period); continue; }
            const prevAtr = results[i - 1];
            results.push((prevAtr * (period - 1) + trValues[i]) / period);
        }
        return results;
    }

    static calculate(candles, emaPeriod = 20, atrPeriod = 10, multiplier = 2.0) {
        const kc = new KeltnerChannel(emaPeriod, atrPeriod, multiplier);
        kc.calculate(candles);
        return { upper: kc.upperBand, middle: kc.middleBand, lower: kc.lowerBand };
    }
}
