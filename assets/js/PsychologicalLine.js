class PsychologicalLine {
    constructor(period = 12) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length < 2) return;
        const upDays = [0];
        for (let i = 1; i < candles.length; i++) upDays.push(candles[i].close > candles[i - 1].close ? 1 : 0);
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period) { this.values.push(null); continue; }
            let countUp = 0;
            for (let j = i - this.period + 1; j <= i; j++) countUp += upDays[j];
            this.values.push(countUp / this.period * 100);
        }
    }

    static calculate(candles, period = 12) {
        const psy = new PsychologicalLine(period);
        psy.calculate(candles);
        return psy.values;
    }
}
