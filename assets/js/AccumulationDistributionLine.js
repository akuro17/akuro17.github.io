class AccumulationDistributionLine {
    constructor() {
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        let adl = 0;
        for (let i = 0; i < candles.length; i++) {
            const highLow = candles[i].high - candles[i].low;
            if (highLow === 0) { this.values.push(adl); continue; }
            const clv = ((candles[i].close - candles[i].low) - (candles[i].high - candles[i].close)) / highLow;
            adl += clv * candles[i].volume;
            this.values.push(adl);
        }
    }

    static calculate(candles) {
        const adl = new AccumulationDistributionLine();
        adl.calculate(candles);
        return adl.values;
    }
}
