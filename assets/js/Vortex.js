class Vortex {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.plusVI = [];
        this.minusVI = [];
    }

    calculate(candles) {
        this.plusVI = []; this.minusVI = [];
        if (candles.length < 2) return;
        const plusVMs = [0], minusVMs = [0], trueRanges = [candles[0].high - candles[0].low];
        for (let i = 1; i < candles.length; i++) {
            plusVMs.push(Math.abs(candles[i].high - candles[i - 1].low));
            minusVMs.push(Math.abs(candles[i].low - candles[i - 1].high));
            const tr1 = candles[i].high - candles[i].low;
            const tr2 = Math.abs(candles[i].high - candles[i - 1].close);
            const tr3 = Math.abs(candles[i].low - candles[i - 1].close);
            trueRanges.push(Math.max(tr1, tr2, tr3));
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period) { this.plusVI.push(null); this.minusVI.push(null); continue; }
            let sumPlusVM = 0, sumMinusVM = 0, sumTR = 0;
            for (let j = i - this.period + 1; j <= i; j++) { sumPlusVM += plusVMs[j]; sumMinusVM += minusVMs[j]; sumTR += trueRanges[j]; }
            if (sumTR === 0) { this.plusVI.push(null); this.minusVI.push(null); }
            else { this.plusVI.push(sumPlusVM / sumTR); this.minusVI.push(sumMinusVM / sumTR); }
        }
    }

    static calculate(candles, period = 14) {
        const v = new Vortex(period);
        v.calculate(candles);
        return { plus: v.plusVI, minus: v.minusVI };
    }
}
