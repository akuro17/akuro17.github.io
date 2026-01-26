class AccelerationOscillator {
    constructor(shortPeriod = 5, longPeriod = 34, smoothedPeriod = 5) {
        this.shortPeriod = shortPeriod;
        this.longPeriod = longPeriod;
        this.smoothedPeriod = smoothedPeriod;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const medianPrices = candles.map(c => (c.high + c.low) / 2);
        const shortSma = this._calcSma(medianPrices, this.shortPeriod);
        const longSma = this._calcSma(medianPrices, this.longPeriod);
        const ao = [];
        for (let i = 0; i < candles.length; i++) {
            if (shortSma[i] !== null && longSma[i] !== null) ao.push(shortSma[i] - longSma[i]);
            else ao.push(null);
        }
        const aoSma = this._calcSmaNullable(ao, this.smoothedPeriod);
        for (let i = 0; i < candles.length; i++) {
            if (ao[i] !== null && aoSma[i] !== null) this.values.push(ao[i] - aoSma[i]);
            else this.values.push(null);
        }
    }

    _calcSma(prices, period) {
        const results = [];
        let sum = 0;
        for (let i = 0; i < prices.length; i++) {
            sum += prices[i];
            if (i >= period) sum -= prices[i - period];
            results.push(i < period - 1 ? null : sum / period);
        }
        return results;
    }

    _calcSmaNullable(source, period) {
        const results = [];
        let sum = 0;
        const queue = [];
        for (let i = 0; i < source.length; i++) {
            if (source[i] === null) { results.push(null); continue; }
            sum += source[i];
            queue.push(source[i]);
            if (queue.length > period) sum -= queue.shift();
            results.push(queue.length < period ? null : sum / period);
        }
        return results;
    }

    static calculate(candles, shortPeriod = 5, longPeriod = 34, smoothedPeriod = 5) {
        const ac = new AccelerationOscillator(shortPeriod, longPeriod, smoothedPeriod);
        ac.calculate(candles);
        return ac.values;
    }
}
