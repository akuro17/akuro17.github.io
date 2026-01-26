class DirectionalMovementIndex {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.plusDI = [];
        this.minusDI = [];
    }

    calculate(candles) {
        this.plusDI = [];
        this.minusDI = [];
        if (candles.length < 2) return;
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
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period) { smoothedTR += trueRanges[i]; smoothedPDM += plusDMs[i]; smoothedMDM += minusDMs[i]; this.plusDI.push(null); this.minusDI.push(null); continue; }
            if (i === this.period) { this.plusDI.push(smoothedTR > 0 ? (smoothedPDM / smoothedTR) * 100 : 0); this.minusDI.push(smoothedTR > 0 ? (smoothedMDM / smoothedTR) * 100 : 0); continue; }
            smoothedTR = smoothedTR - (smoothedTR / this.period) + trueRanges[i];
            smoothedPDM = smoothedPDM - (smoothedPDM / this.period) + plusDMs[i];
            smoothedMDM = smoothedMDM - (smoothedMDM / this.period) + minusDMs[i];
            this.plusDI.push(smoothedTR > 0 ? (smoothedPDM / smoothedTR) * 100 : 0);
            this.minusDI.push(smoothedTR > 0 ? (smoothedMDM / smoothedTR) * 100 : 0);
        }
    }

    static calculate(candles, period = 14) {
        const dmi = new DirectionalMovementIndex(period);
        dmi.calculate(candles);
        return { plusDI: dmi.plusDI, minusDI: dmi.minusDI };
    }
}
