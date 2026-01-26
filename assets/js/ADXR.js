class ADXR {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
        this.adxValues = [];
    }

    calculate(candles) {
        this.values = [];
        this.adxValues = [];
        if (candles.length < 2) return;
        this._calculateADX(candles);
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period || this.adxValues[i] === null || this.adxValues[i - this.period] === null) { this.values.push(null); continue; }
            this.values.push((this.adxValues[i] + this.adxValues[i - this.period]) / 2);
        }
    }

    _calculateADX(candles) {
        const trueRanges = [candles[0].high - candles[0].low];
        const plusDMs = [0], minusDMs = [0];
        for (let i = 1; i < candles.length; i++) {
            const highDiff = candles[i].high - candles[i - 1].high;
            const lowDiff = candles[i - 1].low - candles[i].low;
            plusDMs.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
            minusDMs.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
            const tr1 = candles[i].high - candles[i].low;
            const tr2 = Math.abs(candles[i].high - candles[i - 1].close);
            const tr3 = Math.abs(candles[i].low - candles[i - 1].close);
            trueRanges.push(Math.max(tr1, tr2, tr3));
        }
        let smoothedTR = 0, smoothedPDM = 0, smoothedMDM = 0;
        const dxList = [];
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period) { smoothedTR += trueRanges[i]; smoothedPDM += plusDMs[i]; smoothedMDM += minusDMs[i]; this.adxValues.push(null); dxList.push(null); continue; }
            if (i === this.period) { const pdi = smoothedTR > 0 ? (smoothedPDM / smoothedTR) * 100 : 0; const mdi = smoothedTR > 0 ? (smoothedMDM / smoothedTR) * 100 : 0; const dx = pdi + mdi > 0 ? Math.abs(pdi - mdi) / (pdi + mdi) * 100 : 0; dxList.push(dx); this.adxValues.push(dx); continue; }
            smoothedTR = smoothedTR - (smoothedTR / this.period) + trueRanges[i];
            smoothedPDM = smoothedPDM - (smoothedPDM / this.period) + plusDMs[i];
            smoothedMDM = smoothedMDM - (smoothedMDM / this.period) + minusDMs[i];
            const plusDI = smoothedTR > 0 ? (smoothedPDM / smoothedTR) * 100 : 0;
            const minDI = smoothedTR > 0 ? (smoothedMDM / smoothedTR) * 100 : 0;
            const dxVal = plusDI + minDI > 0 ? Math.abs(plusDI - minDI) / (plusDI + minDI) * 100 : 0;
            dxList.push(dxVal);
            if (i < 2 * this.period - 1) { this.adxValues.push(null); continue; }
            const prevAdx = this.adxValues[i - 1];
            if (prevAdx !== null) { this.adxValues.push((prevAdx * (this.period - 1) + dxVal) / this.period); }
            else { let sum = 0, count = 0; for (let j = i - this.period + 1; j <= i; j++) if (dxList[j] !== null) { sum += dxList[j]; count++; } this.adxValues.push(count > 0 ? sum / count : null); }
        }
    }

    static calculate(candles, period = 14) {
        const adxr = new ADXR(period);
        adxr.calculate(candles);
        return adxr.values;
    }
}
