/**
 * Shared highlighting logic for venue comparisons and lists
 */

/**
 * Calculate best and worst values for a set of metrics
 * @param {Array} items - Array of items to analyze
 * @param {Array} metricKeys - Array of metric keys to calculate min/max for
 * @returns {Object} Object with min/max for each metric
 */
export function calculateBestWorst(items, metricKeys) {
  const stats = {};
  metricKeys.forEach(key => {
    const values = items.map(item => Number(item[key] || 0));
    stats[key] = {
      best: Math.min(...values),
      worst: Math.max(...values)
    };
  });
  return stats;
}

/**
 * Get CSS class for highlighting based on value comparison
 * Used for dashboard list view
 * @param {number} value - The value to check
 * @param {Object} stats - Object with best/worst values { best, worst }
 * @returns {string} CSS class name ('highlight-low', 'highlight-high', 'highlight-neutral', or '')
 */
export function getHighlightClass(value, stats) {
  const { best, worst } = stats;
  
  // All values are 0, don't highlight
  if (best === 0 && worst === 0) {
    return '';
  }
  
  // All values are the same (non-zero), grey highlight
  if (best === worst) {
    return 'highlight-neutral';
  }
  
  // Highlight min as green, max as red
  if (Number(value) === best) return 'highlight-low';
  if (Number(value) === worst) return 'highlight-high';
  
  return '';
}

/**
 * Get CSS class for highlighting in comparison grid (desktop view)
 * @param {number} value - The value to check
 * @param {Object} stats - Object with best/worst values { best, worst }
 * @param {number} venueCount - Number of venues being compared
 * @returns {string} CSS class name ('best', 'worst', or '')
 */
export function getComparisonClass(value, stats, venueCount) {
  const { best, worst } = stats;
  
  // All values are 0, don't highlight
  if (best === 0 && worst === 0) {
    return '';
  }
  
  // All values are the same, don't highlight
  if (best === worst) {
    return '';
  }
  
  if (value === best) return 'best';
  if (value === worst && venueCount > 1) return 'worst';
  
  return '';
}

/**
 * Get card styling for mobile comparison view
 * @param {number} value - The value to check
 * @param {Object} stats - Object with best/worst values { best, worst }
 * @param {number} venueCount - Number of venues being compared
 * @returns {Object} Style object with background, border, textColor properties
 */
export function getMobileCardStyle(value, stats, venueCount) {
  const { best, worst } = stats;
  const allSame = best === worst;
  const allZero = allSame && best === 0;
  
  const isBest = !allSame && value === best;
  const isWorst = !allSame && value === worst && venueCount > 1;
  const showGrey = allSame && !allZero;
  
  return {
    background: showGrey ? '#f5f5f5' : isBest ? '#e8f5e9' : isWorst ? '#ffebee' : 'white',
    border: showGrey ? '#bdbdbd' : isBest ? '#4caf50' : isWorst ? '#ef4444' : '#e1e6f0',
    textColor: showGrey ? '#757575' : isBest ? '#2e7d32' : isWorst ? '#c62828' : '#333'
  };
}
