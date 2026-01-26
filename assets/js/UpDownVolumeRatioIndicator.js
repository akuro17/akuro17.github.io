class UpDownVolumeRatioIndicator {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const upVolume = [], downVolume = [];
        for (let i = 0; i < candles.length; i++) {
            if (i === 0) { upVolume.push(0); downVolume.push(0); }
            else if (candles[i].close > candles[i - 1].close) { upVolume.push(candles[i].volume); downVolume.push(0); }
            else if (candles[i].close < candles[i - 1].close) { upVolume.push(0); downVolume.push(candles[i].volume); }
            else { upVolume.push(0); downVolume.push(0); }
        }
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); continue; }
            let sumUp = 0, sumDown = 0;
            for (let j = 0; j < this.period; j++) { sumUp += upVolume[i - j]; sumDown += downVolume[i - j]; }
            this.values.push(sumDown === 0 ? (sumUp === 0 ? 1 : 100) : sumUp / sumDown);
        }
    }

    static calculate(candles, period = 14) {
        const indicator = new UpDownVolumeRatioIndicator(period);
        indicator.calculate(candles);
        return indicator.values;
    }
}
