class AwesomeOscillator {
    static FAST_PERIOD = 5;
    static SLOW_PERIOD = 34;

    constructor() { this.values = []; }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        const midpoints = candles.map(c => (c.high + c.low) / 2);
        for (let i = 0; i < candles.length; i++) {
            if (i < AwesomeOscillator.SLOW_PERIOD - 1) { this.values.push(null); continue; }
            let sumFast = 0, sumSlow = 0;
            for (let j = 0; j < AwesomeOscillator.FAST_PERIOD; j++) sumFast += midpoints[i - j];
            for (let j = 0; j < AwesomeOscillator.SLOW_PERIOD; j++) sumSlow += midpoints[i - j];
            this.values.push(sumFast / AwesomeOscillator.FAST_PERIOD - sumSlow / AwesomeOscillator.SLOW_PERIOD);
        }
    }

    static calculate(candles) {
        const ao = new AwesomeOscillator();
        ao.calculate(candles);
        return ao.values;
    }
}
