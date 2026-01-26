class VolumeWeightedMovingAverage {
    constructor(period) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        if (candles.length < this.period) { this.values = new Array(candles.length).fill(null); return; }
        let rollingSumPV = 0, rollingSumV = 0;
        for (let i = 0; i < this.period; i++) { if (candles[i].volume >= 0) { rollingSumPV += candles[i].close * candles[i].volume; rollingSumV += candles[i].volume; } }
        for (let i = 0; i < this.period - 1; i++) this.values.push(null);
        this.values.push(rollingSumV > 0 ? rollingSumPV / rollingSumV : null);
        for (let i = this.period; i < candles.length; i++) {
            const old = candles[i - this.period];
            if (old.volume >= 0) { rollingSumPV -= old.close * old.volume; rollingSumV -= old.volume; }
            const newC = candles[i];
            if (newC.volume >= 0) { rollingSumPV += newC.close * newC.volume; rollingSumV += newC.volume; }
            this.values.push(rollingSumV > 0 ? rollingSumPV / rollingSumV : null);
        }
    }

    static calculate(candles, period) {
        const vwma = new VolumeWeightedMovingAverage(period);
        vwma.calculate(candles);
        return vwma.values;
    }
}
