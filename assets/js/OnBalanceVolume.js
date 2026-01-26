class OnBalanceVolume {
    constructor() {
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        let currentObv = 0;
        this.values.push(currentObv);
        for (let i = 1; i < candles.length; i++) {
            const close = candles[i].close;
            const prevClose = candles[i - 1].close;
            const volume = candles[i].volume;
            if (close > prevClose) currentObv += volume;
            else if (close < prevClose) currentObv -= volume;
            this.values.push(currentObv);
        }
    }

    static calculate(candles) {
        const obv = new OnBalanceVolume();
        obv.calculate(candles);
        return obv.values;
    }
}
