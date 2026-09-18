class NegativeVolumeIndex {
    constructor() { this.values = []; }

    calculate(candles) {
        this.values = [];
        if (candles.length === 0) return;
        let nvi = 1000;
        this.values.push(nvi);
        for (let i = 1; i < candles.length; i++) {
            if (candles[i].volume < candles[i - 1].volume && candles[i - 1].close !== 0) {
                const roc = (candles[i].close - candles[i - 1].close) / candles[i - 1].close;
                nvi = nvi + (nvi * roc);
            }
            this.values.push(nvi);
        }
    }

    static calculate(candles) {
        const nvi = new NegativeVolumeIndex();
        nvi.calculate(candles);
        return nvi.values;
    }
}
