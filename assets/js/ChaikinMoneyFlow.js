class ChaikinMoneyFlow {
    constructor(period = 21) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const mfVolumes = [];
        const volumes = [];
        for (let i = 0; i < candles.length; i++) {
            const range = candles[i].high - candles[i].low;
            const mult = range !== 0 ? ((candles[i].close - candles[i].low) - (candles[i].high - candles[i].close)) / range : 0;
            mfVolumes.push(mult * candles[i].volume);
            volumes.push(candles[i].volume);
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sumMf = 0, sumVol = 0;
            for (let j = 0; j < this.period; j++) { sumMf += mfVolumes[i - j]; sumVol += volumes[i - j]; }
            this.values.push(sumVol === 0 ? 0 : sumMf / sumVol);
        }
    }

    static calculate(candles, period = 21) {
        const cmf = new ChaikinMoneyFlow(period);
        cmf.calculate(candles);
        return cmf.values;
    }
}
