class EaseOfMovement {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length < 2) return;
        const rawEom = [null];
        for (let i = 1; i < candles.length; i++) {
            const distanceMoved = ((candles[i].high + candles[i].low) / 2) - ((candles[i - 1].high + candles[i - 1].low) / 2);
            const boxRatio = candles[i].high - candles[i].low;
            if (boxRatio === 0 || candles[i].volume === 0) rawEom.push(0);
            else { let volumeFactor = candles[i].volume / 10000; if (volumeFactor === 0) volumeFactor = 1; rawEom.push(distanceMoved / (volumeFactor * boxRatio) * 10000); }
        }
        let sum = 0;
        for (let i = 0; i < candles.length; i++) {
            if (rawEom[i] === null) { this.values.push(null); continue; }
            sum += rawEom[i];
            if (i >= this.period && rawEom[i - this.period] !== null) sum -= rawEom[i - this.period];
            if (i < this.period) this.values.push(null);
            else this.values.push(sum / this.period);
        }
    }

    static calculate(candles, period = 14) {
        const eom = new EaseOfMovement(period);
        eom.calculate(candles);
        return eom.values;
    }
}
