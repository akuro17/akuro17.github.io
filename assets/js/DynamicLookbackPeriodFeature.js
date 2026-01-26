class DynamicLookbackPeriodFeature {
    constructor(minPeriod = 5, maxPeriod = 50, volatilityPeriod = 20) {
        if (minPeriod <= 0 || maxPeriod < minPeriod || volatilityPeriod <= 0) throw new Error("invalid parameters");
        this.minPeriod = minPeriod;
        this.maxPeriod = maxPeriod;
        this.volatilityPeriod = volatilityPeriod;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const volatility = [];
        for (let i = 0; i < candles.length; i++) {
            if (i < this.volatilityPeriod) { volatility.push(null); continue; }
            let sum = 0;
            for (let j = 0; j < this.volatilityPeriod; j++) sum += candles[i - j].close;
            const mean = sum / this.volatilityPeriod;
            let sumSq = 0;
            for (let j = 0; j < this.volatilityPeriod; j++) sumSq += Math.pow(candles[i - j].close - mean, 2);
            volatility.push(Math.sqrt(sumSq / this.volatilityPeriod));
        }
        let minVol = null, maxVol = null;
        for (const v of volatility) { if (v === null) continue; if (minVol === null || v < minVol) minVol = v; if (maxVol === null || v > maxVol) maxVol = v; }
        for (let i = 0; i < candles.length; i++) {
            if (volatility[i] === null || minVol === null || maxVol === null || maxVol === minVol) { this.values.push(null); continue; }
            const normalized = (volatility[i] - minVol) / (maxVol - minVol);
            let dynamicPeriod = this.maxPeriod - Math.floor((this.maxPeriod - this.minPeriod) * normalized);
            dynamicPeriod = Math.max(this.minPeriod, Math.min(this.maxPeriod, dynamicPeriod));
            this.values.push(dynamicPeriod);
        }
    }

    static calculate(candles, min = 5, max = 50, volPeriod = 20) {
        const dp = new DynamicLookbackPeriodFeature(min, max, volPeriod);
        dp.calculate(candles);
        return dp.values;
    }
}
