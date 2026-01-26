class MoneyFlowIndex {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length < 2) return;
        const tp = candles.map(c => (c.high + c.low + c.close) / 3);
        const rawMf = candles.map((c, i) => tp[i] * c.volume);
        this.values.push(null);
        for (let i = 1; i < candles.length; i++) {
            if (i < this.period) { this.values.push(null); continue; }
            let posFlow = 0, negFlow = 0;
            for (let j = i - this.period + 1; j <= i; j++) {
                if (tp[j] > tp[j - 1]) posFlow += rawMf[j];
                else if (tp[j] < tp[j - 1]) negFlow += rawMf[j];
            }
            if (negFlow === 0) { this.values.push(100); }
            else {
                const mfr = posFlow / negFlow;
                const mfi = 100 - (100 / (1 + mfr));
                this.values.push(Math.max(0, Math.min(100, mfi)));
            }
        }
    }

    static calculate(candles, period = 14) {
        const mfi = new MoneyFlowIndex(period);
        mfi.calculate(candles);
        return mfi.values;
    }
}
