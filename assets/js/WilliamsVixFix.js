class WilliamsVixFix {
    constructor(period = 22) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let highestClose = -Infinity;
            for (let j = i - this.period + 1; j <= i; j++) if (candles[j].close > highestClose) highestClose = candles[j].close;
            if (highestClose === 0) this.values.push(null);
            else this.values.push(((highestClose - candles[i].low) / highestClose) * 100);
        }
    }

    static calculate(candles, period = 22) {
        const wvf = new WilliamsVixFix(period);
        wvf.calculate(candles);
        return wvf.values;
    }
}
