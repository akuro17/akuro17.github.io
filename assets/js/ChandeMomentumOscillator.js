class ChandeMomentumOscillator {
    constructor(period = 14) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length < 2) return;
        this.values.push(null);
        for (let i = 1; i < candles.length; i++) {
            if (i < this.period) { this.values.push(null); continue; }
            let sumUp = 0, sumDown = 0;
            for (let j = i - this.period + 1; j <= i; j++) {
                const change = candles[j].close - candles[j - 1].close;
                if (change > 0) sumUp += change;
                else sumDown += Math.abs(change);
            }
            if (sumUp + sumDown === 0) this.values.push(0);
            else this.values.push(((sumUp - sumDown) / (sumUp + sumDown)) * 100);
        }
    }

    static calculate(candles, period = 14) {
        const cmo = new ChandeMomentumOscillator(period);
        cmo.calculate(candles);
        return cmo.values;
    }
}
