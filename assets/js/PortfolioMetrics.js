function calculateCAGR(startValue, endValue, years) {
    if (startValue <= 0 || years <= 0) return 0;
    return Math.pow(endValue / startValue, 1.0 / years) - 1.0;
}

function calculateMaxDrawdown(equityCurve) {
    let peak = -Infinity, maxDrawdown = 0;
    for (const value of equityCurve) { if (value > peak) peak = value; if (peak > 0) { const dd = (peak - value) / peak; if (dd > maxDrawdown) maxDrawdown = dd; } }
    return maxDrawdown;
}

function calculateSharpeRatio(returns, riskFreeRate = 0.0) {
    if (returns.length === 0) return 0;
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const excess = avg - riskFreeRate;
    const sumSqDiff = returns.reduce((s, r) => s + Math.pow(r - avg, 2), 0);
    const stdDev = returns.length > 1 ? Math.sqrt(sumSqDiff / (returns.length - 1)) : 0;
    return stdDev === 0 ? 0 : excess / stdDev;
}

function calculateSortinoRatio(returns, targetReturn = 0.0) {
    if (returns.length === 0) return 0;
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const excess = avg - targetReturn;
    const sumSqDown = returns.filter(r => r < targetReturn).reduce((s, r) => s + Math.pow(r - targetReturn, 2), 0);
    const downsideDev = Math.sqrt(sumSqDown / returns.length);
    return downsideDev === 0 ? 0 : excess / downsideDev;
}

export { calculateCAGR, calculateMaxDrawdown, calculateSharpeRatio, calculateSortinoRatio };
