class FractalDimensionIndex {
    constructor(period = 30) {
        if (period <= 1) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sumDiff = 0, highestHigh = -Infinity, lowestLow = Infinity;
            for (let j = 0; j < this.period; j++) {
                const high = candles[i - j].high, low = candles[i - j].low;
                if (high > highestHigh) highestHigh = high;
                if (low < lowestLow) lowestLow = low;
                if (j < this.period - 1) sumDiff += Math.abs(candles[i - j].close - candles[i - j - 1].close);
            }
            const priceRange = highestHigh - lowestLow;
            if (priceRange === 0 || sumDiff === 0) { this.values.push(1.5); continue; }
            const n = this.period - 1;
            let fdi = 1 + (Math.log(sumDiff / priceRange) + Math.log(n)) / Math.log(2 * n);
            fdi = Math.max(1, Math.min(2, fdi));
            this.values.push(fdi);
        }
    }

    static calculate(candles, period = 30) {
        const fdi = new FractalDimensionIndex(period);
        fdi.calculate(candles);
        return fdi.values;
    }
}
