class DisplacedMovingAverage {
    constructor(period = 20, displacement = 5) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.displacement = displacement;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const sma = [];
        let sum = 0;
        for (let i = 0; i < candles.length; i++) {
            sum += candles[i].close;
            if (i >= this.period) sum -= candles[i - this.period].close;
            sma.push(i < this.period - 1 ? null : sum / this.period);
        }
        for (let i = 0; i < candles.length; i++) {
            const srcIdx = i - this.displacement;
            if (srcIdx >= 0 && srcIdx < sma.length && sma[srcIdx] !== null) this.values.push(sma[srcIdx]);
            else this.values.push(null);
        }
    }

    static calculate(candles, period = 20, displacement = 5) {
        const dma = new DisplacedMovingAverage(period, displacement);
        dma.calculate(candles);
        return dma.values;
    }
}
