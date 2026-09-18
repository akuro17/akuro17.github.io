class VolumeMovingAverage {
    constructor(period = 20) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        let sum = 0;
        for (let i = 0; i < candles.length; i++) {
            sum += candles[i].volume;
            if (i >= this.period) sum -= candles[i - this.period].volume;
            this.values.push(i < this.period - 1 ? null : sum / this.period);
        }
    }

    static calculate(candles, period = 20) {
        const vma = new VolumeMovingAverage(period);
        vma.calculate(candles);
        return vma.values;
    }
}
