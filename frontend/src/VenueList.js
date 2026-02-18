import React from 'react';
import VenuePhoto from './VenuePhoto';
import { calculateBestWorst, getHighlightClass } from './highlightUtils';

export default function VenueList({ venues, selectedVenues, onSelectVenue, onViewVenue, onEditVenue, loading }) {
  if (loading) return <div className="loading">Loading venues...</div>;

  // Calculate totals for each venue
  const mapped = venues.map(v => {
    const guests = Number(v.guest_count || 0);
    const catering = (Number(v.catering_per_person || 0) * guests) + Number(v.catering_flat_fee || 0);
    const bar = (Number(v.bar_service_rate || 0) * guests) + Number(v.bar_flat_fee || 0);
    const total = Number(v.venue_rental_cost || 0) + catering + bar + Number(v.coordinator_fee || 0) + Number(v.event_insurance || 0) + Number(v.other_costs || 0);
    const perGuest = guests > 0 ? (total / guests) : 0;
    return { ...v, catering, bar, total, perGuest };
  });

  // Calculate min/max for highlighting
  const stats = calculateBestWorst(mapped, ['venue_rental_cost', 'catering', 'bar', 'coordinator_fee', 'event_insurance', 'other_costs', 'total']);

  const formatMoney = (v) => `$${Number(v || 0).toFixed(2)}`;

  return (
    <div id="venuesContainer" className="venues">
      {mapped.map(v => (
        <div
          key={v.id}
          className={`card ${selectedVenues.has(v.id) ? 'compare-selected' : ''}`}
          onClick={(e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            onSelectVenue(v.id);
          }}
        >
          <VenuePhoto venue={v} />
          <h3>{v.name || 'Untitled'}</h3>
          <div className="meta">{v.guest_count || 0} guests • {v.event_duration_hours || 0} hrs</div>
          
          <div className="costs">
            <div className={`cost-row ${getHighlightClass(v.venue_rental_cost, stats['venue_rental_cost'])}`}>
              <div>Rental</div>
              <div>{formatMoney(v.venue_rental_cost)}</div>
            </div>
            <div className={`cost-row ${getHighlightClass(v.catering, stats['catering'])}`}>
              <div>Catering</div>
              <div>{formatMoney(v.catering)}</div>
            </div>
            <div className={`cost-row ${getHighlightClass(v.bar, stats['bar'])}`}>
              <div>Bar</div>
              <div>{formatMoney(v.bar)}</div>
            </div>
            <div className={`cost-row ${getHighlightClass(v.coordinator_fee, stats['coordinator_fee'])}`}>
              <div>Coordinator</div>
              <div>{formatMoney(v.coordinator_fee)}</div>
            </div>
            <div className={`cost-row ${getHighlightClass(v.event_insurance, stats['event_insurance'])}`}>
              <div>Event Insurance</div>
              <div>{formatMoney(v.event_insurance)}</div>
            </div>
            <div className={`cost-row ${getHighlightClass(v.other_costs, stats['other_costs'])}`}>
              <div>Other</div>
              <div>{formatMoney(v.other_costs)}</div>
            </div>
            <div className={`cost-row ${getHighlightClass(v.total, stats['total'])}`}>
              <strong>Total</strong>
              <strong>{formatMoney(v.total)}</strong>
            </div>
            <div className="meta">Per guest: {formatMoney(v.perGuest)}</div>
          </div>

          <div className="venue-actions" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onViewVenue(v)}>View</button>
            <button className="secondary" onClick={() => onEditVenue(v)}>Edit</button>
          </div>
        </div>
      ))}
    </div>
  );
}
