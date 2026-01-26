class RollingSpreadZScore {
    constructor(period = 20) {
        if (period <= 1) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(spreadValues) {
        this.values = [];
        const spreads = [...spreadValues];
        if (spreads.length === 0) return;
        for (let i = 0; i < spreads.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sum = 0;
            for (let j = 0; j < this.period; j++) sum += spreads[i - j];
            const mean = sum / this.period;
            let sumSq = 0;
            for (let j = 0; j < this.period; j++) sumSq += Math.pow(spreads[i - j] - mean, 2);
            const stdDev = Math.sqrt(sumSq / this.period);
            this.values.push(stdDev === 0 ? 0 : (spreads[i] - mean) / stdDev);
        }
    }

    calculateFromPair(asset1, asset2, hedgeRatio = 1.0) {
        const n = Math.min(asset1.length, asset2.length);
        const spreads = [];
        for (let i = 0; i < n; i++) spreads.push(asset1[i].close - hedgeRatio * asset2[i].close);
        this.calculate(spreads);
    }

    static calculate(spreads, period = 20) {
        const zs = new RollingSpreadZScore(period);
        zs.calculate(spreads);
        return zs.values;
    }
}
