class ThreeLineBreakBlock {
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.open = 0;
        this.close = 0;
        this.high = 0;
        this.low = 0;
        this.direction = 'up';
    }
}

class ThreeLineBreak {
    constructor(linesToBreak = 3) {
        if (linesToBreak < 1) throw new Error("linesToBreak");
        this.linesToBreak = linesToBreak;
        this.blocks = [];
    }

    calculate(candles) {
        this.blocks = [];
        if (candles.length === 0) return;
        const first = candles[0];
        const block = new ThreeLineBreakBlock();
        block.startTime = first.timestamp; block.endTime = first.timestamp;
        block.open = first.open; block.close = first.close;
        block.high = Math.max(first.open, first.close);
        block.low = Math.min(first.open, first.close);
        block.direction = first.close >= first.open ? 'up' : 'down';
        this.blocks.push(block);
        for (let i = 1; i < candles.length; i++) {
            const close = candles[i].close;
            const time = candles[i].timestamp;
            const lastBlock = this.blocks[this.blocks.length - 1];
            const lastHigh = lastBlock.high, lastLow = lastBlock.low;
            const lookback = Math.min(this.linesToBreak, this.blocks.length);
            let breakHigh = -Infinity, breakLow = Infinity;
            for (let j = this.blocks.length - 1; j >= this.blocks.length - lookback; j--) {
                if (this.blocks[j].high > breakHigh) breakHigh = this.blocks[j].high;
                if (this.blocks[j].low < breakLow) breakLow = this.blocks[j].low;
            }
            if (lastBlock.direction === 'up') {
                if (close > lastHigh) {
                    const nb = new ThreeLineBreakBlock();
                    nb.startTime = time; nb.endTime = time;
                    nb.open = lastBlock.close; nb.close = close;
                    nb.high = close; nb.low = lastBlock.close;
                    nb.direction = 'up';
                    this.blocks.push(nb);
                } else if (close < breakLow) {
                    const nb = new ThreeLineBreakBlock();
                    nb.startTime = time; nb.endTime = time;
                    nb.open = lastBlock.close; nb.close = close;
                    nb.high = lastBlock.close; nb.low = close;
                    nb.direction = 'down';
                    this.blocks.push(nb);
                }
            } else {
                if (close < lastLow) {
                    const nb = new ThreeLineBreakBlock();
                    nb.startTime = time; nb.endTime = time;
                    nb.open = lastBlock.close; nb.close = close;
                    nb.high = lastBlock.close; nb.low = close;
                    nb.direction = 'down';
                    this.blocks.push(nb);
                } else if (close > breakHigh) {
                    const nb = new ThreeLineBreakBlock();
                    nb.startTime = time; nb.endTime = time;
                    nb.open = lastBlock.close; nb.close = close;
                    nb.high = close; nb.low = lastBlock.close;
                    nb.direction = 'up';
                    this.blocks.push(nb);
                }
            }
        }
    }

    static calculate(candles, linesToBreak = 3) {
        const tlb = new ThreeLineBreak(linesToBreak);
        tlb.calculate(candles);
        return tlb.blocks;
    }
}

export { ThreeLineBreak, ThreeLineBreakBlock };
