class PnFColumn {
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.bottomPrice = 0;
        this.topPrice = 0;
        this.columnType = 'X';
        this.boxCount = 0;
    }
}

class PointAndFigure {
    constructor(boxSize = 1.0, reversalBoxes = 3) {
        if (boxSize <= 0) throw new Error("boxSize");
        if (reversalBoxes < 1) throw new Error("reversalBoxes");
        this.boxSize = boxSize;
        this.reversalBoxes = reversalBoxes;
        this.columns = [];
    }

    calculate(candles) {
        this.columns = [];
        if (candles.length === 0) return;
        let currentTop = this._roundToBox(candles[0].high);
        let currentBottom = this._roundToBox(candles[0].low);
        let currentType = candles[0].close >= candles[0].open ? 'X' : 'O';
        let startTime = candles[0].timestamp;
        for (let i = 1; i < candles.length; i++) {
            const high = this._roundToBox(candles[i].high);
            const low = this._roundToBox(candles[i].low);
            const time = candles[i].timestamp;
            if (currentType === 'X') {
                if (high > currentTop) currentTop = high;
                else if (currentTop - low >= this.boxSize * this.reversalBoxes) {
                    const col = new PnFColumn();
                    col.startTime = startTime; col.endTime = time;
                    col.bottomPrice = currentBottom; col.topPrice = currentTop;
                    col.columnType = 'X'; col.boxCount = Math.floor((currentTop - currentBottom) / this.boxSize) + 1;
                    this.columns.push(col);
                    currentTop = currentTop - this.boxSize; currentBottom = low;
                    currentType = 'O'; startTime = time;
                }
            } else {
                if (low < currentBottom) currentBottom = low;
                else if (high - currentBottom >= this.boxSize * this.reversalBoxes) {
                    const col = new PnFColumn();
                    col.startTime = startTime; col.endTime = time;
                    col.bottomPrice = currentBottom; col.topPrice = currentTop;
                    col.columnType = 'O'; col.boxCount = Math.floor((currentTop - currentBottom) / this.boxSize) + 1;
                    this.columns.push(col);
                    currentBottom = currentBottom + this.boxSize; currentTop = high;
                    currentType = 'X'; startTime = time;
                }
            }
        }
        const col = new PnFColumn();
        col.startTime = startTime; col.endTime = candles[candles.length - 1].timestamp;
        col.bottomPrice = currentBottom; col.topPrice = currentTop;
        col.columnType = currentType; col.boxCount = Math.floor((currentTop - currentBottom) / this.boxSize) + 1;
        this.columns.push(col);
    }

    _roundToBox(price) { return Math.floor(price / this.boxSize) * this.boxSize; }

    static calculate(candles, boxSize = 1.0, reversalBoxes = 3) {
        const pnf = new PointAndFigure(boxSize, reversalBoxes);
        pnf.calculate(candles);
        return pnf.columns;
    }
}

export { PointAndFigure, PnFColumn };
