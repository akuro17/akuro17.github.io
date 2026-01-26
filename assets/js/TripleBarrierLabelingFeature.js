const TripleBarrierLabel = { Long: 1, Short: -1, Neutral: 0 };

class TripleBarrierLabelingFeature {
    constructor(upperBarrier = 0.02, lowerBarrier = 0.02, maxHoldingPeriod = 10) {
        if (maxHoldingPeriod <= 0) throw new Error("maxHoldingPeriod");
        this.upperBarrier = upperBarrier;
        this.lowerBarrier = lowerBarrier;
        this.maxHoldingPeriod = maxHoldingPeriod;
        this.labels = [];
    }

    calculate(candles) {
        this.labels = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            if (i + this.maxHoldingPeriod >= candles.length) { this.labels.push(TripleBarrierLabel.Neutral); continue; }
            const entryPrice = candles[i].close;
            const upperTarget = entryPrice * (1 + this.upperBarrier);
            const lowerTarget = entryPrice * (1 - this.lowerBarrier);
            let label = TripleBarrierLabel.Neutral;
            for (let j = 1; j <= this.maxHoldingPeriod && i + j < candles.length; j++) {
                if (candles[i + j].high >= upperTarget) { label = TripleBarrierLabel.Long; break; }
                if (candles[i + j].low <= lowerTarget) { label = TripleBarrierLabel.Short; break; }
            }
            this.labels.push(label);
        }
    }

    static calculate(candles, upper = 0.02, lower = 0.02, holdPeriod = 10) {
        const feature = new TripleBarrierLabelingFeature(upper, lower, holdPeriod);
        feature.calculate(candles);
        return feature.labels;
    }
}

export { TripleBarrierLabelingFeature, TripleBarrierLabel };
