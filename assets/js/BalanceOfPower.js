class BalanceOfPower {
    constructor(smoothPeriod = 14) {
        this.smoothPeriod = smoothPeriod;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const rawBop = [];
        for (let i = 0; i < candles.length; i++) {
            const range = candles[i].high - candles[i].low;
            rawBop.push(range === 0 ? 0 : (candles[i].close - candles[i].open) / range);
        }
        let sum = 0;
        for (let i = 0; i < candles.length; i++) {
            sum += rawBop[i];
            if (i >= this.smoothPeriod) sum -= rawBop[i - this.smoothPeriod];
            if (i < this.smoothPeriod - 1) this.values.push(null);
            else this.values.push(sum / this.smoothPeriod);
        }
    }

    static calculate(candles, smoothPeriod = 14) {
        const bop = new BalanceOfPower(smoothPeriod);
        bop.calculate(candles);
        return bop.values;
    }
}
