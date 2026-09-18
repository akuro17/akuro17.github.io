class CoppockCurve {
    constructor(shortROC = 11, longROC = 14, wmaPeriod = 10) {
        this.shortROC = shortROC;
        this.longROC = longROC;
        this.wmaPeriod = wmaPeriod;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const rocSum = [];
        for (let i = 0; i < candles.length; i++) {
            if (i < this.longROC) { rocSum.push(null); continue; }
            const shortVal = candles[i - this.shortROC].close !== 0 ? ((candles[i].close - candles[i - this.shortROC].close) / candles[i - this.shortROC].close) * 100 : 0;
            const longVal = candles[i - this.longROC].close !== 0 ? ((candles[i].close - candles[i - this.longROC].close) / candles[i - this.longROC].close) * 100 : 0;
            rocSum.push(shortVal + longVal);
        }
        const weightSum = this.wmaPeriod * (this.wmaPeriod + 1) / 2;
        let validCount = 0;
        for (let i = 0; i < candles.length; i++) {
            if (rocSum[i] === null) { this.values.push(null); continue; }
            validCount++;
            if (validCount < this.wmaPeriod) { this.values.push(null); continue; }
            let sum = 0, weight = this.wmaPeriod, count = 0;
            for (let j = i; j >= 0 && count < this.wmaPeriod; j--) { if (rocSum[j] !== null) { sum += rocSum[j] * weight; weight--; count++; } }
            this.values.push(sum / weightSum);
        }
    }

    static calculate(candles, shortROC = 11, longROC = 14, wmaPeriod = 10) {
        const cc = new CoppockCurve(shortROC, longROC, wmaPeriod);
        cc.calculate(candles);
        return cc.values;
    }
}
