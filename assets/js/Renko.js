class RenkoBrick {
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.open = 0;
        this.close = 0;
        this.brickType = 'up';
    }
}

class Renko {
    constructor(brickSize = 1.0) {
        if (brickSize <= 0) throw new Error("brickSize");
        this.brickSize = brickSize;
        this.bricks = [];
    }

    calculate(candles) {
        this.bricks = [];
        if (candles.length === 0) return;
        let currentLevel = Math.floor(candles[0].close / this.brickSize) * this.brickSize;
        let lastTime = candles[0].timestamp;
        for (let i = 0; i < candles.length; i++) {
            while (candles[i].high >= currentLevel + this.brickSize) {
                const brick = new RenkoBrick();
                brick.startTime = lastTime; brick.endTime = candles[i].timestamp;
                brick.open = currentLevel; brick.close = currentLevel + this.brickSize;
                brick.brickType = 'up';
                this.bricks.push(brick);
                currentLevel += this.brickSize; lastTime = candles[i].timestamp;
            }
            while (candles[i].low <= currentLevel - this.brickSize) {
                const brick = new RenkoBrick();
                brick.startTime = lastTime; brick.endTime = candles[i].timestamp;
                brick.open = currentLevel; brick.close = currentLevel - this.brickSize;
                brick.brickType = 'down';
                this.bricks.push(brick);
                currentLevel -= this.brickSize; lastTime = candles[i].timestamp;
            }
        }
    }

    static calculate(candles, brickSize = 1.0) {
        const r = new Renko(brickSize);
        r.calculate(candles);
        return r.bricks;
    }
}

export { Renko, RenkoBrick };
