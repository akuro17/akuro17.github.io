class KaufmanAdaptiveMovingAverage {
    constructor(period = 10, fastPeriod = 2, slowPeriod = 30) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.fastPeriod = fastPeriod;
        this.slowPeriod = slowPeriod;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const fastSC = 2.0 / (this.fastPeriod + 1);
        const slowSC = 2.0 / (this.slowPeriod + 1);
        let prevKama = null;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period) { this.values.push(null); continue; }
            const change = Math.abs(candles[i].close - candles[i - this.period].close);
            let volatility = 0;
            for (let j = i - this.period + 1; j <= i; j++) volatility += Math.abs(candles[j].close - candles[j - 1].close);
            const er = volatility !== 0 ? change / volatility : 0;
            let sc = er * (fastSC - slowSC) + slowSC;
            sc = sc * sc;
            if (prevKama === null) prevKama = candles[i].close;
            else prevKama = prevKama + sc * (candles[i].close - prevKama);
            this.values.push(prevKama);
        }
    }

    static calculate(candles, period = 10, fastPeriod = 2, slowPeriod = 30) {
        const kama = new KaufmanAdaptiveMovingAverage(period, fastPeriod, slowPeriod);
        kama.calculate(candles);
        return kama.values;
    }
}
