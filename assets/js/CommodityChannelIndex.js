class CommodityChannelIndex {
    static CONSTANT = 0.015;

    constructor(period = 20) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const tpValues = candles.map(c => (c.high + c.low + c.close) / 3);
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sumTp = 0;
            for (let j = i - this.period + 1; j <= i; j++) sumTp += tpValues[j];
            const smaTp = sumTp / this.period;
            let sumAbsDiff = 0;
            for (let j = i - this.period + 1; j <= i; j++) sumAbsDiff += Math.abs(tpValues[j] - smaTp);
            const meanDev = sumAbsDiff / this.period;
            this.values.push(meanDev === 0 ? 0 : (tpValues[i] - smaTp) / (CommodityChannelIndex.CONSTANT * meanDev));
        }
    }

    static calculate(candles, period = 20) {
        const cci = new CommodityChannelIndex(period);
        cci.calculate(candles);
        return cci.values;
    }
}
