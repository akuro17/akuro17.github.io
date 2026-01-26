class KagiLine {
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.startPrice = 0;
        this.endPrice = 0;
        this.lineType = 'yang';
        this.isShoulder = false;
        this.isWaist = false;
    }
}

class Kagi {
    constructor(reversalAmount = 4.0, usePercentage = true) {
        this.reversalAmount = reversalAmount;
        this.usePercentage = usePercentage;
        this.lines = [];
    }

    calculate(candles) {
        this.lines = [];
        if (candles.length < 2) return;
        let referencePrice = candles[0].close;
        let currentHigh = referencePrice;
        let currentLow = referencePrice;
        let startTime = candles[0].timestamp;
        let isRising = true;
        let currentType = 'yang';
        for (let i = 1; i < candles.length; i++) {
            const price = candles[i].close;
            const threshold = this._getThreshold(referencePrice);
            if (isRising) {
                if (price > currentHigh) currentHigh = price;
                else if (currentHigh - price >= threshold) {
                    const line = new KagiLine();
                    line.startTime = startTime; line.endTime = candles[i].timestamp;
                    line.startPrice = referencePrice; line.endPrice = currentHigh;
                    line.lineType = currentType;
                    this.lines.push(line);
                    if (currentHigh > referencePrice) currentType = 'yang';
                    referencePrice = currentHigh; currentLow = price;
                    startTime = candles[i].timestamp; isRising = false;
                }
            } else {
                if (price < currentLow) currentLow = price;
                else if (price - currentLow >= threshold) {
                    const line = new KagiLine();
                    line.startTime = startTime; line.endTime = candles[i].timestamp;
                    line.startPrice = referencePrice; line.endPrice = currentLow;
                    line.lineType = currentType;
                    this.lines.push(line);
                    if (currentLow < referencePrice) currentType = 'yin';
                    referencePrice = currentLow; currentHigh = price;
                    startTime = candles[i].timestamp; isRising = true;
                }
            }
        }
        const finalLine = new KagiLine();
        finalLine.startTime = startTime; finalLine.endTime = candles[candles.length - 1].timestamp;
        finalLine.startPrice = referencePrice; finalLine.endPrice = isRising ? currentHigh : currentLow;
        finalLine.lineType = currentType;
        this.lines.push(finalLine);
        this._markShoulders();
    }

    _getThreshold(price) {
        return this.usePercentage ? price * this.reversalAmount / 100 : this.reversalAmount;
    }

    _markShoulders() {
        if (this.lines.length < 3) return;
        for (let i = 1; i < this.lines.length - 1; i++) {
            const prevEnd = this.lines[i - 1].endPrice;
            const currEnd = this.lines[i].endPrice;
            const nextEnd = this.lines[i + 1].endPrice;
            if (currEnd > prevEnd && currEnd > nextEnd) this.lines[i].isShoulder = true;
            else if (currEnd < prevEnd && currEnd < nextEnd) this.lines[i].isWaist = true;
        }
    }

    static calculate(candles, reversalAmount = 4.0, usePercentage = true) {
        const kagi = new Kagi(reversalAmount, usePercentage);
        kagi.calculate(candles);
        return kagi.lines;
    }
}

export { Kagi, KagiLine };
