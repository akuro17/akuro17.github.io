class VolumeWeightedAveragePrice {
    constructor() {
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        let cumulativeTPVolume = 0;
        let cumulativeVolume = 0;
        for (let i = 0; i < candles.length; i++) {
            const tp = (candles[i].high + candles[i].low + candles[i].close) / 3;
            cumulativeTPVolume += tp * candles[i].volume;
            cumulativeVolume += candles[i].volume;
            if (cumulativeVolume === 0) this.values.push(null);
            else this.values.push(cumulativeTPVolume / cumulativeVolume);
        }
    }

    static calculate(candles) {
        const vwap = new VolumeWeightedAveragePrice();
        vwap.calculate(candles);
        return vwap.values;
    }
}
