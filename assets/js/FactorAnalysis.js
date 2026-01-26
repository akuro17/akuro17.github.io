function calculateSingleFactorRegression(assetReturns, factorReturns) {
    const n = Math.min(assetReturns.length, factorReturns.length);
    if (n < 2) return { alpha: 0, beta: 0, rSquared: 0 };
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) { sumX += factorReturns[i]; sumY += assetReturns[i]; sumXY += factorReturns[i] * assetReturns[i]; sumX2 += factorReturns[i] ** 2; sumY2 += assetReturns[i] ** 2; }
    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-10) return { alpha: 0, beta: 0, rSquared: 0 };
    const beta = (n * sumXY - sumX * sumY) / denom;
    const alpha = (sumY - beta * sumX) / n;
    const ssTot = sumY2 - (sumY ** 2) / n;
    let ssRes = 0;
    for (let i = 0; i < n; i++) ssRes += (assetReturns[i] - (alpha + beta * factorReturns[i])) ** 2;
    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;
    return { alpha, beta, rSquared };
}

function calculateMultiFactorBetas(assetReturns, factorReturnsList) {
    const n = assetReturns.length, k = factorReturnsList.length;
    if (n < k + 1 || k === 0) return [];
    const x = Array.from({ length: n }, (_, i) => [1, ...factorReturnsList.map(f => f[i])]);
    const xtx = Array.from({ length: k + 1 }, (_, i) => Array.from({ length: k + 1 }, (__, j) => x.reduce((s, row) => s + row[i] * row[j], 0)));
    const xty = Array.from({ length: k + 1 }, (_, i) => x.reduce((s, row, l) => s + row[i] * assetReturns[l], 0));
    return solveLinearSystem(xtx, xty, k + 1);
}

function calculateInformationRatio(activeReturns) {
    if (activeReturns.length < 2) return 0;
    const mean = activeReturns.reduce((a, b) => a + b, 0) / activeReturns.length;
    const sumSq = activeReturns.reduce((s, r) => s + (r - mean) ** 2, 0);
    const stdDev = Math.sqrt(sumSq / (activeReturns.length - 1));
    return stdDev === 0 ? 0 : mean / stdDev;
}

function solveLinearSystem(a, b, n) {
    const aug = a.map((row, i) => [...row, b[i]]);
    for (let col = 0; col < n; col++) {
        let pivot = col;
        for (let row = col + 1; row < n; row++) if (Math.abs(aug[row][col]) > Math.abs(aug[pivot][col])) pivot = row;
        [aug[col], aug[pivot]] = [aug[pivot], aug[col]];
        let div = aug[col][col];
        if (Math.abs(div) < 1e-10) div = 1e-10;
        for (let j = 0; j <= n; j++) aug[col][j] /= div;
        for (let row = 0; row < n; row++) { if (row === col) continue; const factor = aug[row][col]; for (let j = 0; j <= n; j++) aug[row][j] -= factor * aug[col][j]; }
    }
    return aug.map(row => row[n]);
}

export { calculateSingleFactorRegression, calculateMultiFactorBetas, calculateInformationRatio };
