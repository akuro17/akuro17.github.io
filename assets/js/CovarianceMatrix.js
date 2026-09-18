function calculateCovarianceMatrix(assetReturns) {
    const returns = assetReturns.map(r => [...r]);
    const n = returns.length;
    if (n === 0) return [];
    const periods = returns[0].length;
    for (let i = 1; i < n; i++) if (returns[i].length !== periods) throw new Error("All assets must have the same number of return periods");
    const means = returns.map(r => r.reduce((a, b) => a + b, 0) / r.length);
    const covariance = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0;
            for (let t = 0; t < periods; t++) sum += (returns[i][t] - means[i]) * (returns[j][t] - means[j]);
            const cov = periods > 1 ? sum / (periods - 1) : 0;
            covariance[i][j] = cov; covariance[j][i] = cov;
        }
    }
    return covariance;
}

function calculateCorrelationMatrix(covarianceMatrix) {
    const n = covarianceMatrix.length;
    const stdDevs = covarianceMatrix.map((row, i) => Math.sqrt(row[i]));
    return covarianceMatrix.map((row, i) => row.map((cov, j) => (stdDevs[i] === 0 || stdDevs[j] === 0) ? 0 : cov / (stdDevs[i] * stdDevs[j])));
}

function calculateExpectedReturns(assetReturns, annualizationFactor = 252) {
    return assetReturns.map(r => r.reduce((a, b) => a + b, 0) / r.length * annualizationFactor);
}

function annualizeCovarianceMatrix(dailyCovariance, tradingDaysPerYear = 252) {
    return dailyCovariance.map(row => row.map(v => v * tradingDaysPerYear));
}

export { calculateCovarianceMatrix, calculateCorrelationMatrix, calculateExpectedReturns, annualizeCovarianceMatrix };
