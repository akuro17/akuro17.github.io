class Ichimoku {
    constructor(tenkanPeriod = 9, kijunPeriod = 26, senkouSpanBPeriod = 52, displacement = 26) {
        this.tenkanPeriod = tenkanPeriod;
        this.kijunPeriod = kijunPeriod;
        this.senkouSpanBPeriod = senkouSpanBPeriod;
        this.displacement = displacement;
        this.tenkanSen = [];
        this.kijunSen = [];
        this.senkouSpanA = [];
        this.senkouSpanB = [];
        this.chikouSpan = [];
    }

    calculate(candles) {
        this.tenkanSen = [];
        this.kijunSen = [];
        this.senkouSpanA = [];
        this.senkouSpanB = [];
        this.chikouSpan = [];
        if (candles.length === 0) return;
        for (let i = 0; i < candles.length; i++) {
            this.tenkanSen.push(this._midpoint(candles, i, this.tenkanPeriod));
            this.kijunSen.push(this._midpoint(candles, i, this.kijunPeriod));
        }
        for (let i = 0; i < candles.length; i++) {
            if (this.tenkanSen[i] !== null && this.kijunSen[i] !== null) {
                this.senkouSpanA.push((this.tenkanSen[i] + this.kijunSen[i]) / 2);
            } else {
                this.senkouSpanA.push(null);
            }
            this.senkouSpanB.push(this._midpoint(candles, i, this.senkouSpanBPeriod));
        }
        for (let i = 0; i < candles.length; i++) {
            this.chikouSpan.push(candles[i].close);
        }
    }

    _midpoint(candles, index, period) {
        if (index < period - 1) return null;
        let highest = -Infinity;
        let lowest = Infinity;
        for (let i = index - period + 1; i <= index; i++) {
            if (candles[i].high > highest) highest = candles[i].high;
            if (candles[i].low < lowest) lowest = candles[i].low;
        }
        return (highest + lowest) / 2;
    }

    static calculate(candles, tenkan = 9, kijun = 26, spanB = 52, displacement = 26) {
        const ichi = new Ichimoku(tenkan, kijun, spanB, displacement);
        ichi.calculate(candles);
        return { tenkan: ichi.tenkanSen, kijun: ichi.kijunSen, spanA: ichi.senkouSpanA, spanB: ichi.senkouSpanB, chikou: ichi.chikouSpan };
    }
}
