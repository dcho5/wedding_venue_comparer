import React from 'react';
import VenuePhoto from './VenuePhoto';
import { formatMoney, enrichVenue, calculateBestWorst, getHighlightClass } from './venueUtils';

export default function VenueList({ venues, selectedVenues, onSelectVenue, onViewVenue, onEditVenue, loading }) {

  if (loading) return <div className="loading">Loading venues...</div>;

  // Filter out draft venues (empty or whitespace-only name)
  const filteredVenues = venues.filter(v => v.name && v.name.trim() !== '');

  // Calculate totals for each venue
  const mapped = filteredVenues.map(enrichVenue);

  // Calculate min/max for highlighting
  const stats = calculateBestWorst(mapped, ['venue_rental_cost', 'catering', 'bar', 'coordinator_fee', 'event_insurance', 'other_costs', 'total']);


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
          <div className="meta">
            {v.guest_count || 0} guests • {v.event_duration_hours || 0} hrs
            {v.photo_count > 0 && <span> • {v.photo_count} {v.photo_count === 1 ? 'photo' : 'photos'}</span>}
          </div>

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