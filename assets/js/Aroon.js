class Aroon {
    constructor(period = 25) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.aroonUp = [];
        this.aroonDown = [];
        this.aroonOscillator = [];
    }

    calculate(candles) {
        this.aroonUp = [];
        this.aroonDown = [];
        this.aroonOscillator = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period) {
                this.aroonUp.push(null);
                this.aroonDown.push(null);
                this.aroonOscillator.push(null);
                continue;
            }
            let highestIdx = 0;
            let lowestIdx = 0;
            let highest = -Infinity;
            let lowest = Infinity;
            for (let j = 0; j <= this.period; j++) {
                const idx = i - this.period + j;
                if (candles[idx].high > highest) { highest = candles[idx].high; highestIdx = j; }
                if (candles[idx].low < lowest) { lowest = candles[idx].low; lowestIdx = j; }
            }
            const aroonUpVal = (highestIdx / this.period) * 100;
            const aroonDownVal = (lowestIdx / this.period) * 100;
            this.aroonUp.push(aroonUpVal);
            this.aroonDown.push(aroonDownVal);
            this.aroonOscillator.push(aroonUpVal - aroonDownVal);
        }
    }

    static calculate(candles, period = 25) {
        const aroon = new Aroon(period);
        aroon.calculate(candles);
        return { up: aroon.aroonUp, down: aroon.aroonDown, oscillator: aroon.aroonOscillator };
    }
}
