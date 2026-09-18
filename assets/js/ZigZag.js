class ZigZag {
    constructor(threshold = 5.0) {
        if (threshold <= 0) throw new Error("threshold");
        this.threshold = threshold / 100;
        this.values = [];
    }

    calculate(candles) {
        this.values = new Array(candles.length).fill(null);
        if (candles.length < 2) return;
        let lastPivot = candles[0].close, lastPivotIndex = 0, direction = 0;
        this.values[0] = lastPivot;
        for (let i = 1; i < candles.length; i++) {
            const high = candles[i].high, low = candles[i].low;
            let change;
            if (direction >= 0) { change = lastPivot !== 0 ? (high - lastPivot) / lastPivot : 0; if (change >= this.threshold) { this.values[i] = high; lastPivot = high; lastPivotIndex = i; direction = 1; continue; } }
            if (direction <= 0) { change = lastPivot !== 0 ? (lastPivot - low) / lastPivot : 0; if (change >= this.threshold) { this.values[i] = low; lastPivot = low; lastPivotIndex = i; direction = -1; continue; } }
            if (direction === 1) {
                if (high > lastPivot) { this.values[lastPivotIndex] = null; this.values[i] = high; lastPivot = high; lastPivotIndex = i; }
                else { change = lastPivot !== 0 ? (lastPivot - low) / lastPivot : 0; if (change >= this.threshold) { this.values[i] = low; lastPivot = low; lastPivotIndex = i; direction = -1; } }
            } else if (direction === -1) {
                if (low < lastPivot) { this.values[lastPivotIndex] = null; this.values[i] = low; lastPivot = low; lastPivotIndex = i; }
                else { change = lastPivot !== 0 ? (high - lastPivot) / lastPivot : 0; if (change >= this.threshold) { this.values[i] = high; lastPivot = high; lastPivotIndex = i; direction = 1; } }
            }
        }
    }

    static calculate(candles, threshold = 5.0) {
        const zz = new ZigZag(threshold);
        zz.calculate(candles);
        return zz.values;
    }
}
