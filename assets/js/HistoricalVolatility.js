class HistoricalVolatility {
    constructor(period = 20) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const logReturns = [0];
        for (let i = 1; i < candles.length; i++) {
            const close = candles[i].close;
            const prevClose = candles[i - 1].close;
            logReturns.push(prevClose > 0 ? Math.log(close / prevClose) : 0);
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period) { this.values.push(null); continue; }
            let sum = 0; for (let j = 0; j < this.period; j++) sum += logReturns[i - j];
            const mean = sum / this.period;
            let sumSq = 0; for (let j = 0; j < this.period; j++) sumSq += Math.pow(logReturns[i - j] - mean, 2);
            const stdDev = Math.sqrt(sumSq / (this.period - 1));
            this.values.push(stdDev * Math.sqrt(252) * 100);
        }
    }

    static calculate(candles, period = 20) {
        const hv = new HistoricalVolatility(period);
        hv.calculate(candles);
        return hv.values;
    }
}
