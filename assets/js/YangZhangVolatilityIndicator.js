class YangZhangVolatilityIndicator {
    constructor(period = 20) {
        if (period <= 1) throw new Error("period");
        this.period = period;
        this.values = [];
    }

    calculate(candles) {
        this.values = [];
        if (candles.length < 2) return;
        this.values.push(null);
        for (let i = 1; i < candles.length; i++) {
            if (i < this.period) { this.values.push(null); continue; }
            let sumOvernightSq = 0, sumOpenCloseSq = 0, sumRsSq = 0;
            for (let j = 0; j < this.period; j++) {
                const idx = i - j;
                if (idx < 1) continue;
                const prevClose = candles[idx - 1].close;
                const open = candles[idx].open, high = candles[idx].high, low = candles[idx].low, close = candles[idx].close;
                if (prevClose <= 0 || open <= 0) continue;
                const overnight = Math.log(open / prevClose);
                const openClose = Math.log(close / open);
                const logHighOpen = Math.log(high / open);
                const logLowOpen = Math.log(low / open);
                const logHighClose = Math.log(high / close);
                const logLowClose = Math.log(low / close);
                const rs = logHighOpen * logHighClose + logLowOpen * logLowClose;
                sumOvernightSq += overnight * overnight;
                sumOpenCloseSq += openClose * openClose;
                sumRsSq += rs;
            }
            const k = 0.34 / (1.34 + (this.period + 1.0) / (this.period - 1.0));
            const overnightVar = sumOvernightSq / this.period;
            const openCloseVar = sumOpenCloseSq / this.period;
            const rsVar = sumRsSq / this.period;
            const yzVar = overnightVar + k * openCloseVar + (1 - k) * rsVar;
            this.values.push(Math.sqrt(yzVar * 252) * 100);
        }
    }

    static calculate(candles, period = 20) {
        const yz = new YangZhangVolatilityIndicator(period);
        yz.calculate(candles);
        return yz.values;
    }
}
