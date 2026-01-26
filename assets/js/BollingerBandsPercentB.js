/**
 * BollingerBandsPercentB (%B)
 * Alias for BollingerBandsRatio - these are mathematically identical indicators.
 * %B = (Close - Lower Band) / (Upper Band - Lower Band)
 */
class BollingerBandsPercentB {
    constructor(period = 20, multiplier = 2.0) {
        this.period = period;
        this.multiplier = multiplier;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sum = 0; for (let j = i - this.period + 1; j <= i; j++) sum += candles[j].close;
            const sma = sum / this.period;
            let sumSqDiff = 0; for (let j = i - this.period + 1; j <= i; j++) sumSqDiff += Math.pow(candles[j].close - sma, 2);
            const stdDev = Math.sqrt(sumSqDiff / this.period);
            const bandWidth = 2 * this.multiplier * stdDev;
            this.values.push(bandWidth === 0 ? null : (candles[i].close - (sma - this.multiplier * stdDev)) / bandWidth);
        }
    }

    static calculate(candles, period = 20, multiplier = 2.0) {
        const bbr = new BollingerBandsPercentB(period, multiplier);
        bbr.calculate(candles);
        return bbr.values;
    }
}
