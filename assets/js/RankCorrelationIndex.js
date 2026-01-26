class RankCorrelationIndex {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            const prices = [];
            for (let j = 0; j < this.period; j++) prices.push({ price: candles[i - this.period + 1 + j].close, originalIndex: j + 1 });
            prices.sort((a, b) => a.price - b.price);
            const priceRanks = new Array(this.period).fill(0);
            for (let j = 0; j < this.period; j++) priceRanks[prices[j].originalIndex - 1] = j + 1;
            let sumD2 = 0;
            for (let j = 0; j < this.period; j++) { const d = priceRanks[j] - (j + 1); sumD2 += d * d; }
            const n = this.period;
            this.values.push((1 - (6 * sumD2) / (n * (n * n - 1))) * 100);
        }
    }

    static calculate(candles, period = 14) {
        const rci = new RankCorrelationIndex(period);
        rci.calculate(candles);
        return rci.values;
    }
}
