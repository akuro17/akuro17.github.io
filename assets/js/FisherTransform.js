class FisherTransform {
    constructor(period = 10) {
        if (period <= 0) throw new Error("period");
        this.period = period;
        this.values = [];
        this.trigger = [];
    }

    calculate(candles) {
        this.values = [];
        this.trigger = [];
        if (candles.length === 0) return;
        let prevValue = 0;
        let prevFisher = 0;
        for (let i = 0; i < candles.length; i++) {
            if (i < this.period - 1) { this.values.push(null); this.trigger.push(null); continue; }
            let highest = -Infinity, lowest = Infinity;
            for (let j = i - this.period + 1; j <= i; j++) {
                const hl2 = (candles[j].high + candles[j].low) / 2;
                if (hl2 > highest) highest = hl2;
                if (hl2 < lowest) lowest = hl2;
            }
            const hl2Current = (candles[i].high + candles[i].low) / 2;
            const range = highest - lowest;
            let value;
            if (range === 0) { value = 0; }
            else {
                let normalized = 2 * ((hl2Current - lowest) / range) - 1;
                normalized = Math.max(-0.999, Math.min(0.999, normalized));
                value = 0.5 * prevValue + 0.5 * normalized;
            }
            let fisher = 0.5 * Math.log((1 + value) / (1 - value));
            fisher = prevFisher * 0.5 + fisher;
            this.trigger.push(prevFisher);
            this.values.push(fisher);
            prevValue = value;
            prevFisher = fisher;
        }
    }

    static calculate(candles, period = 10) {
        const ft = new FisherTransform(period);
        ft.calculate(candles);
        return { fisher: ft.values, trigger: ft.trigger };
    }
}
