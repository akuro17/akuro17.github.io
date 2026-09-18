class UltimateOscillator {
    constructor(p1 = 7, p2 = 14, p3 = 28) {
        if (p1 <= 0 || p2 <= 0 || p3 <= 0) throw new Error("periods");
        this.period1 = p1; this.period2 = p2; this.period3 = p3;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const bp = [], tr = [];
        for (let i = 0; i < candles.length; i++) {
            const priorClose = i > 0 ? candles[i - 1].close : candles[i].close;
            const minLowPrior = i > 0 ? Math.min(candles[i].low, priorClose) : candles[i].low;
            const maxHighPrior = i > 0 ? Math.max(candles[i].high, priorClose) : candles[i].high;
            bp.push(candles[i].close - minLowPrior);
            tr.push(maxHighPrior - minLowPrior);
        }
        const maxP = Math.max(this.period1, this.period2, this.period3);
        for (let i = 0; i < candles.length; i++) {
            if (i < maxP - 1) { this.values.push(null); continue; }
            let sumBp1 = 0, sumTr1 = 0, sumBp2 = 0, sumTr2 = 0, sumBp3 = 0, sumTr3 = 0;
            for (let j = 0; j < this.period1; j++) { sumBp1 += bp[i - j]; sumTr1 += tr[i - j]; }
            for (let j = 0; j < this.period2; j++) { sumBp2 += bp[i - j]; sumTr2 += tr[i - j]; }
            for (let j = 0; j < this.period3; j++) { sumBp3 += bp[i - j]; sumTr3 += tr[i - j]; }
            const a1 = sumTr1 === 0 ? 0 : sumBp1 / sumTr1;
            const a2 = sumTr2 === 0 ? 0 : sumBp2 / sumTr2;
            const a3 = sumTr3 === 0 ? 0 : sumBp3 / sumTr3;
            this.values.push(100 * ((4 * a1) + (2 * a2) + a3) / 7);
        }
    }

    static calculate(candles, p1 = 7, p2 = 14, p3 = 28) {
        const uo = new UltimateOscillator(p1, p2, p3);
        uo.calculate(candles);
        return uo.values;
    }
}
