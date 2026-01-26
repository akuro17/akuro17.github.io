class ParabolicSAR {
    constructor(accelerationFactor = 0.02, maxAcceleration = 0.2) {
        this.accelerationFactor = accelerationFactor;
        this.maxAcceleration = maxAcceleration;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length < 2) {
            for (let i = 0; i < candles.length; i++) this.values.push(null);
            return;
        }
        let isUptrend = candles[1].close > candles[0].close;
        let sar = isUptrend ? candles[0].low : candles[0].high;
        let ep = isUptrend ? candles[0].high : candles[0].low;
        let af = this.accelerationFactor;
        this.values.push(null);
        for (let i = 1; i < candles.length; i++) {
            const c = candles[i];
            if (isUptrend) {
                if (c.low < sar) {
                    isUptrend = false;
                    sar = ep;
                    ep = c.low;
                    af = this.accelerationFactor;
                } else {
                    if (c.high > ep) { ep = c.high; af = Math.min(af + this.accelerationFactor, this.maxAcceleration); }
                    sar = sar + af * (ep - sar);
                    sar = Math.min(sar, candles[i - 1].low, i > 1 ? candles[i - 2].low : candles[i - 1].low);
                }
            } else {
                if (c.high > sar) {
                    isUptrend = true;
                    sar = ep;
                    ep = c.high;
                    af = this.accelerationFactor;
                } else {
                    if (c.low < ep) { ep = c.low; af = Math.min(af + this.accelerationFactor, this.maxAcceleration); }
                    sar = sar + af * (ep - sar);
                    sar = Math.max(sar, candles[i - 1].high, i > 1 ? candles[i - 2].high : candles[i - 1].high);
                }
            }
            this.values.push(sar);
        }
    }

    static calculate(candles, af = 0.02, maxAf = 0.2) {
        const psar = new ParabolicSAR(af, maxAf);
        psar.calculate(candles);
        return psar.values;
    }
}
