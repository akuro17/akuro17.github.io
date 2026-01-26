function multiplyMatrix(a, b, m, n, p) {
    const result = Array.from({ length: m }, () => Array(p).fill(0));
    for (let i = 0; i < m; i++) for (let j = 0; j < p; j++) for (let l = 0; l < n; l++) result[i][j] += a[i][l] * b[l][j];
    return result;
}

function invertMatrix(matrix, n) {
    const aug = Array.from({ length: n }, (_, i) => [...matrix[i], ...Array(n).fill(0)]);
    for (let i = 0; i < n; i++) aug[i][n + i] = 1;
    for (let col = 0; col < n; col++) {
        let pivot = col;
        for (let row = col + 1; row < n; row++) if (Math.abs(aug[row][col]) > Math.abs(aug[pivot][col])) pivot = row;
        [aug[col], aug[pivot]] = [aug[pivot], aug[col]];
        let div = aug[col][col];
        if (Math.abs(div) < 1e-10) div = 1e-10;
        for (let j = 0; j < 2 * n; j++) aug[col][j] /= div;
        for (let row = 0; row < n; row++) { if (row === col) continue; const factor = aug[row][col]; for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j]; }
    }
    return aug.map(row => row.slice(n));
}

function calculatePosteriorReturns(equilibriumReturns, covarianceMatrix, viewMatrix, viewReturns, viewConfidence, tau = 0.05) {
    const n = equilibriumReturns.length;
    if (n === 0 || viewMatrix.length === 0) return equilibriumReturns;
    const scaledCov = covarianceMatrix.map(row => row.map(v => tau * v));
    const k = viewMatrix.length;
    const omega = Array.from({ length: k }, () => Array(k).fill(0));
    for (let i = 0; i < k; i++) {
        let pSigmaP = 0;
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) pSigmaP += viewMatrix[i][a] * scaledCov[a][b] * viewMatrix[i][b];
        omega[i][i] = pSigmaP / viewConfidence[i];
    }
    const pT = Array.from({ length: n }, (_, j) => viewMatrix.map(row => row[j]));
    const term1 = multiplyMatrix(scaledCov, pT, n, n, k);
    const pSigmaPt = Array.from({ length: k }, () => Array(k).fill(0));
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) { let sum = 0; for (let a = 0; a < n; a++) sum += viewMatrix[i][a] * term1[a][j]; pSigmaPt[i][j] = sum; }
    const middle = pSigmaPt.map((row, i) => row.map((v, j) => v + omega[i][j]));
    const middleInv = invertMatrix(middle, k);
    const term2 = multiplyMatrix(term1, middleInv, n, k, k);
    const qMinusPPi = viewMatrix.map((view, i) => viewReturns[i] - view.reduce((sum, v, j) => sum + v * equilibriumReturns[j], 0));
    return equilibriumReturns.map((eq, i) => eq + term2[i].reduce((sum, v, j) => sum + v * qMinusPPi[j], 0));
}
