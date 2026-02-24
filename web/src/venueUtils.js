/**
 * Shared utility functions for venue formatting, cost calculations, and highlighting
 */

// ── Formatting ────────────────────────────────────────────────────────────────

/**
 * Format a number as a locale-aware currency string
 * @param {number} value
 * @returns {string} e.g. "$1,234.56"
 */
export function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

// ── Cost Calculations ─────────────────────────────────────────────────────────

/**
 * Calculate catering total for a venue
 * @param {Object} venue
 * @returns {number}
 */
export function calcCatering(venue) {
  const guests = Number(venue.guest_count || 0);
  return (Number(venue.catering_per_person || 0) * guests) + Number(venue.catering_flat_fee || 0);
}

/**
 * Calculate bar total for a venue
 * @param {Object} venue
 * @returns {number}
 */
export function calcBar(venue) {
  const guests = Number(venue.guest_count || 0);
  return (Number(venue.bar_service_rate || 0) * guests) + Number(venue.bar_flat_fee || 0);
}

/**
 * Calculate total cost for a venue
 * @param {Object} venue
 * @returns {number}
 */
export function calcTotal(venue) {
  return Number(venue.venue_rental_cost || 0) +
    calcCatering(venue) +
    calcBar(venue) +
    Number(venue.coordinator_fee || 0) +
    Number(venue.event_insurance || 0) +
    Number(venue.other_costs || 0);
}

/**
 * Calculate per-guest cost for a venue
 * @param {Object} venue
 * @returns {number}
 */
export function calcPerGuest(venue) {
  const total = calcTotal(venue);
  return Number(venue.guest_count || 0) > 0 ? total / venue.guest_count : 0;
}

/**
 * Enrich a venue object with computed cost fields
 * @param {Object} venue
 * @returns {Object} venue with catering, bar, total, perGuest added
 */
export function enrichVenue(venue) {
  return {
    ...venue,
    catering: calcCatering(venue),
    bar: calcBar(venue),
    total: calcTotal(venue),
    perGuest: calcPerGuest(venue),
  };
}

// ── Highlight Logic ───────────────────────────────────────────────────────────

/**
 * Calculate best and worst values for a set of metrics
 * @param {Array} items - Array of items to analyze
 * @param {Array} metricKeys - Array of metric keys to calculate min/max for
 * @returns {Object} Object with { best, worst } for each metric
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
 * Get CSS class for highlighting in the venue list view
 * @param {number} value
 * @param {Object} stats - { best, worst }
 * @returns {string} 'highlight-low' | 'highlight-high' | 'highlight-neutral' | ''
 */
export function getHighlightClass(value, stats) {
  const { best, worst } = stats;
  if (best === 0 && worst === 0) return '';
  if (best === worst) return 'highlight-neutral';
  if (Number(value) === best) return 'highlight-low';
  if (Number(value) === worst) return 'highlight-high';
  return '';
}

/**
 * Get CSS class for highlighting in the comparison grid (desktop)
 * @param {number} value
 * @param {Object} stats - { best, worst }
 * @param {number} venueCount
 * @returns {string} 'best' | 'worst' | ''
 */
export function getComparisonClass(value, stats, venueCount) {
  const { best, worst } = stats;
  if (best === 0 && worst === 0) return '';
  if (best === worst) return '';
  if (value === best) return 'best';
  if (value === worst && venueCount > 1) return 'worst';
  return '';
}

/**
 * Get CSS class for mobile comparison cards.
 *
 * Classes emitted:
 *   'mobile-card-best'    — lowest cost (green)
 *   'mobile-card-worst'   — highest cost (red)
 *   'mobile-card-neutral' — all same non-zero value (grey)
 *   'mobile-card-default' — no highlight
 *
 * @param {number} value
 * @param {Object} stats - { best, worst }
 * @param {number} venueCount
 * @returns {string}
 */
export function getMobileCardClass(value, stats, venueCount) {
  const { best, worst } = stats;
  const allSame = best === worst;
  const allZero = allSame && best === 0;
  if (!allSame && value === best) return 'mobile-card-best';
  if (!allSame && value === worst && venueCount > 1) return 'mobile-card-worst';
  if (allSame && !allZero) return 'mobile-card-neutral';
  return 'mobile-card-default';
}