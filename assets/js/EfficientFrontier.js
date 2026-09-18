function solveLinearSystem(A, b) {
    const n = b.length;
    const aug = A.map((row, i) => [...row, b[i]]);
    for (let k = 0; k < n; k++) {
        let maxRow = k;
        for (let i = k + 1; i < n; i++) if (Math.abs(aug[i][k]) > Math.abs(aug[maxRow][k])) maxRow = i;
        [aug[k], aug[maxRow]] = [aug[maxRow], aug[k]];
        if (Math.abs(aug[k][k]) < 1e-10) return null;
        for (let i = k + 1; i < n; i++) { const factor = aug[i][k] / aug[k][k]; for (let j = k; j <= n; j++) aug[i][j] -= factor * aug[k][j]; }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) { x[i] = aug[i][n]; for (let j = i + 1; j < n; j++) x[i] -= aug[i][j] * x[j]; x[i] /= aug[i][i]; }
    return x;
}

function calculatePortfolioReturn(weights, expectedReturns) { return weights.reduce((s, w, i) => s + w * expectedReturns[i], 0); }

function calculatePortfolioStdDev(weights, covarianceMatrix) {
    let variance = 0;
    for (let i = 0; i < weights.length; i++) for (let j = 0; j < weights.length; j++) variance += weights[i] * weights[j] * covarianceMatrix[i][j];
    return Math.sqrt(variance);
}

function optimizeForTargetReturn(expectedReturns, covarianceMatrix, targetReturn) {
    const n = expectedReturns.length;
    const innerN = n + 2;
    const A = Array.from({ length: innerN }, () => Array(innerN).fill(0));
    const b = Array(innerN).fill(0);
    for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] = 2 * covarianceMatrix[i][j]; A[i][n] = expectedReturns[i]; A[i][n + 1] = 1; }
    for (let i = 0; i < n; i++) { A[n][i] = expectedReturns[i]; A[n + 1][i] = 1; }
    b[n] = targetReturn; b[n + 1] = 1;
    const solution = solveLinearSystem(A, b);
    return solution ? solution.slice(0, n) : null;
}

function calculateEfficientFrontier(expectedReturns, covarianceMatrix, numPoints = 50) {
    const n = expectedReturns.length;
    if (n === 0) return [];
    const minReturn = Math.min(...expectedReturns), maxReturn = Math.max(...expectedReturns);
    const frontier = [];
    for (let i = 0; i < numPoints; i++) {
        const targetReturn = minReturn + (maxReturn - minReturn) * i / (numPoints - 1);
        const weights = optimizeForTargetReturn(expectedReturns, covarianceMatrix, targetReturn);
        if (!weights) continue;
        frontier.push({ expectedReturn: calculatePortfolioReturn(weights, expectedReturns), stdDev: calculatePortfolioStdDev(weights, covarianceMatrix), weights });
    }
    return frontier;
}
