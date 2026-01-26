class PriceVolumeTrend {
    constructor() { this.values = []; }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        let pvt = 0;
        this.values.push(pvt);
        for (let i = 1; i < candles.length; i++) {
            if (candles[i - 1].close === 0) { this.values.push(pvt); continue; }
            const change = (candles[i].close - candles[i - 1].close) / candles[i - 1].close;
            pvt += change * candles[i].volume;
            this.values.push(pvt);
        }
    }

    static calculate(candles) {
        const pvt = new PriceVolumeTrend();
        pvt.calculate(candles);
        return pvt.values;
    }
}
