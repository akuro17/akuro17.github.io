class PositiveVolumeIndex {
    constructor() { this.values = []; }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        let pvi = 1000;
        this.values.push(pvi);
        for (let i = 1; i < candles.length; i++) {
            if (candles[i].volume > candles[i - 1].volume) {
                if (candles[i - 1].close !== 0) {
                    const roc = (candles[i].close - candles[i - 1].close) / candles[i - 1].close;
                    pvi += pvi * roc;
                }
            }
            this.values.push(pvi);
        }
    }

    static calculate(candles) {
        const pvi = new PositiveVolumeIndex();
        pvi.calculate(candles);
        return pvi.values;
    }
}
