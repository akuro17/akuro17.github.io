class AverageDirectionalIndex {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
        this.plusDI = [];
        this.minusDI = [];
    }

    calculate(candles) {
        this.values = [];
        this.plusDI = [];
        this.minusDI = [];
        if (candles.length < 2) return;
        this.values.push(null);
        this.plusDI.push(null);
        this.minusDI.push(null);
        let sumTR = 0, sumPDM = 0, sumMDM = 0;
        const dx = [];
        for (let i = 1; i < candles.length; i++) {
            const tr = Math.max(candles[i].high - candles[i].low, Math.abs(candles[i].high - candles[i - 1].close), Math.abs(candles[i].low - candles[i - 1].close));
            const up = candles[i].high - candles[i - 1].high;
            const down = candles[i - 1].low - candles[i].low;
            const pDM = up > down && up > 0 ? up : 0;
            const mDM = down > up && down > 0 ? down : 0;
            if (i < this.period) {
                sumTR += tr; sumPDM += pDM; sumMDM += mDM;
                this.plusDI.push(null); this.minusDI.push(null);
                dx.push(null);
                continue;
            }
            if (i === this.period) { sumTR += tr; sumPDM += pDM; sumMDM += mDM; }
            else { sumTR = sumTR - sumTR / this.period + tr; sumPDM = sumPDM - sumPDM / this.period + pDM; sumMDM = sumMDM - sumMDM / this.period + mDM; }
            const pdi = sumTR !== 0 ? 100 * sumPDM / sumTR : 0;
            const mdi = sumTR !== 0 ? 100 * sumMDM / sumTR : 0;
            this.plusDI.push(pdi); this.minusDI.push(mdi);
            const diSum = pdi + mdi;
            dx.push(diSum !== 0 ? 100 * Math.abs(pdi - mdi) / diSum : 0);
        }
        let adx = null;
        for (let i = 0; i < dx.length; i++) {
            if (i < this.period - 1 || dx[i] === null) { this.values.push(null); continue; }
            if (adx === null) {
                let s = 0, cnt = 0;
                for (let j = i - this.period + 1; j <= i; j++) if (dx[j] !== null) { s += dx[j]; cnt++; }
                adx = cnt > 0 ? s / cnt : null;
            } else { adx = (adx * (this.period - 1) + dx[i]) / this.period; }
            this.values.push(adx);
        }
    }

    static calculate(candles, period = 14) {
        const a = new AverageDirectionalIndex(period);
        a.calculate(candles);
        return { adx: a.values, plusDI: a.plusDI, minusDI: a.minusDI };
    }
}
