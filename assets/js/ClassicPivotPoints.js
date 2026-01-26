class ClassicPivotPoints {
    constructor() {
        this.pivot = [];
        this.r1 = [];
        this.r2 = [];
        this.r3 = [];
        this.s1 = [];
        this.s2 = [];
        this.s3 = [];
    }

    calculate(candles) {
        this.pivot = []; this.r1 = []; this.r2 = []; this.r3 = [];
        this.s1 = []; this.s2 = []; this.s3 = [];
        if (candles.length < 2) return;
        this.pivot.push(null); this.r1.push(null); this.r2.push(null); this.r3.push(null);
        this.s1.push(null); this.s2.push(null); this.s3.push(null);
        for (let i = 1; i < candles.length; i++) {
            const prev = candles[i - 1];
            const p = (prev.high + prev.low + prev.close) / 3;
            this.pivot.push(p);
            this.r1.push(2 * p - prev.low);
            this.s1.push(2 * p - prev.high);
            this.r2.push(p + (prev.high - prev.low));
            this.s2.push(p - (prev.high - prev.low));
            this.r3.push(prev.high + 2 * (p - prev.low));
            this.s3.push(prev.low - 2 * (prev.high - p));
        }
    }

    static calculate(candles) {
        const pp = new ClassicPivotPoints();
        pp.calculate(candles);
        return { pivot: pp.pivot, r1: pp.r1, r2: pp.r2, r3: pp.r3, s1: pp.s1, s2: pp.s2, s3: pp.s3 };
    }
}
