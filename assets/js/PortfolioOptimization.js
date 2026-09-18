function calculateEqualWeights(assetCount) {
    if (assetCount <= 0) return [];
    const w = 1.0 / assetCount;
    return new Array(assetCount).fill(w);
}

function calculateInverseVolatilityWeights(returnsMatrix) {
    if (!returnsMatrix || returnsMatrix.length === 0) return [];
    const stdDevs = [];
    for (const returns of returnsMatrix) {
        if (returns.length < 2) { stdDevs.push(0); continue; }
        const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
        const sumSq = returns.reduce((s, r) => s + Math.pow(r - avg, 2), 0);
        stdDevs.push(Math.sqrt(sumSq / (returns.length - 1)));
    }
    const inverseVols = [];
    let sumInverse = 0;
    for (const vol of stdDevs) { if (vol > 0) { const inv = 1.0 / vol; inverseVols.push(inv); sumInverse += inv; } else inverseVols.push(0); }
    if (sumInverse === 0) return calculateEqualWeights(returnsMatrix.length);
    return inverseVols.map(inv => inv / sumInverse);
}

export { calculateEqualWeights, calculateInverseVolatilityWeights };
