class HighLowBand {
    constructor(period = 20) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.upper = [];
        this.lower = [];
        this.middle = [];
    }

    calculate(candles) {
        this.upper = [];
        this.lower = [];
        this.middle = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.upper.push(null); this.lower.push(null); this.middle.push(null); continue; }
            let maxHigh = -Infinity, minLow = Infinity;
            for (let j = 0; j < this.period; j++) {
                if (candles[i - j].high > maxHigh) maxHigh = candles[i - j].high;
                if (candles[i - j].low < minLow) minLow = candles[i - j].low;
            }
            this.upper.push(maxHigh);
            this.lower.push(minLow);
            this.middle.push((maxHigh + minLow) / 2);
        }
    }

    static calculate(candles, period = 20) {
        const hlb = new HighLowBand(period);
        hlb.calculate(candles);
        return { upper: hlb.upper, lower: hlb.lower, middle: hlb.middle };
    }
}
