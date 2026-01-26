function calculateStdDev(values) {
    if (values.length < 2) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const sumSq = values.reduce((s, d) => s + Math.pow(d - avg, 2), 0);
    return Math.sqrt(sumSq / (values.length - 1));
}

function calculateSharpeRatio(dailyReturns, tradingDaysPerYear = 252, riskFreeRate = 0.0) {
    if (dailyReturns.length < 2) return 0;
    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const stdDev = calculateStdDev(dailyReturns);
    if (stdDev === 0) return 0;
    const dailyRiskFree = riskFreeRate / tradingDaysPerYear;
    return ((avgReturn - dailyRiskFree) / stdDev) * Math.sqrt(tradingDaysPerYear);
}

function calculateSortinoRatio(dailyReturns, tradingDaysPerYear = 252, riskFreeRate = 0.0) {
    if (dailyReturns.length < 2) return 0;
    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const negativeReturns = dailyReturns.filter(r => r < 0);
    if (negativeReturns.length === 0) return Infinity;
    const sumSq = negativeReturns.reduce((s, r) => s + r * r, 0);
    const downsideDev = Math.sqrt(sumSq / dailyReturns.length);
    if (downsideDev === 0) return 0;
    const dailyRiskFree = riskFreeRate / tradingDaysPerYear;
    return ((avgReturn - dailyRiskFree) / downsideDev) * Math.sqrt(tradingDaysPerYear);
}

function calculateCalmarRatio(totalReturnPercent, maxDrawdownPercent, days) {
    if (maxDrawdownPercent === 0 || days <= 0) return 0;
    const years = days / 365.25;
    const cagr = Math.pow(1 + totalReturnPercent / 100, 1.0 / years) - 1;
    return cagr / (maxDrawdownPercent / 100);
}

function calculateMaxDrawdown(equityCurve) {
    if (equityCurve.length < 2) return 0;
    let maxDrawdown = 0, peak = -Infinity;
    for (const value of equityCurve) { if (value > peak) peak = value; const dd = peak > 0 ? (peak - value) / peak : 0; if (dd > maxDrawdown) maxDrawdown = dd; }
    return maxDrawdown * 100;
}

function calculateCAGR(beginningValue, endingValue, years) {
    if (beginningValue <= 0 || years <= 0) return 0;
    return (Math.pow(endingValue / beginningValue, 1.0 / years) - 1) * 100;
}

function calculateVolatility(dailyReturns, tradingDaysPerYear = 252) {
    if (dailyReturns.length < 2) return 0;
    return calculateStdDev(dailyReturns) * Math.sqrt(tradingDaysPerYear) * 100;
}

function calculateInformationRatio(portfolioReturns, benchmarkReturns, tradingDaysPerYear = 252) {
    const count = Math.min(portfolioReturns.length, benchmarkReturns.length);
    if (count < 2) return 0;
    const activeReturns = Array.from({ length: count }, (_, i) => portfolioReturns[i] - benchmarkReturns[i]);
    const avgActive = activeReturns.reduce((a, b) => a + b, 0) / activeReturns.length;
    const trackingError = calculateStdDev(activeReturns);
    if (trackingError === 0) return 0;
    return (avgActive / trackingError) * Math.sqrt(tradingDaysPerYear);
}

function calculateValueAtRisk(dailyReturns, confidenceLevel = 0.95) {
    const sorted = [...dailyReturns].sort((a, b) => a - b);
    if (sorted.length === 0) return { var: 0, cvar: 0 };
    let varIndex = Math.floor((1 - confidenceLevel) * sorted.length);
    varIndex = Math.max(0, Math.min(varIndex, sorted.length - 1));
    const varVal = -sorted[varIndex] * 100;
    const cvar = varIndex > 0 ? -sorted.slice(0, varIndex + 1).reduce((a, b) => a + b, 0) / (varIndex + 1) * 100 : 0;
    return { var: varVal, cvar };
}

export { calculateSharpeRatio, calculateSortinoRatio, calculateCalmarRatio, calculateMaxDrawdown, calculateCAGR, calculateVolatility, calculateInformationRatio, calculateValueAtRisk };
