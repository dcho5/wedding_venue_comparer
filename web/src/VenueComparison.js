import React, { useState, useEffect } from 'react';
import { apiClient } from './api';
import { formatMoney, enrichVenue, calculateBestWorst, getComparisonClass, getMobileCardClass } from './venueUtils';

export default function VenueComparison({ venues, onBack }) {
  const [venuePhotos, setVenuePhotos] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('total');

  useEffect(() => {
    const checkMobile = () => {
      const minWidth = 180 + (venues.length * 250) + 40;
      setIsMobile(window.innerWidth < Math.min(minWidth, 768));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [venues.length]);

  useEffect(() => {
    const loadPhotos = async () => {
      const photoPromises = venues.map(async (venue) => {
        try {
          const response = await apiClient.getPhotos(venue.id);
          return { venueId: venue.id, photos: response.data || [] };
        } catch (error) {
          console.error(`Error loading photos for venue ${venue.id}:`, error);
          return { venueId: venue.id, photos: [] };
        }
      });
      const results = await Promise.all(photoPromises);
      const photosMap = {};
      results.forEach(({ venueId, photos }) => {
        photosMap[venueId] = Array.isArray(photos) ? photos : [];
      });
      setVenuePhotos(photosMap);
    };
    loadPhotos();
  }, [venues]);

  const venuesWithTotals = venues.map(enrichVenue);

  const metrics = ['venue_rental_cost', 'catering', 'bar', 'coordinator_fee', 'event_insurance', 'other_costs', 'total', 'perGuest'];
  const stats = calculateBestWorst(venuesWithTotals, metrics);

  const getPhotoUrl = (venue) => {
    const photos = venuePhotos[venue.id] || [];
    if (venue.title_photo) {
      const titlePhoto = photos.find(p => p.file_path === venue.title_photo);
      if (titlePhoto) return titlePhoto.url;
    }
    return photos[0]?.url || '';
  };

  const getMetricValue = (venue) => {
    switch (selectedMetric) {
      case 'total':       return venuesWithTotals.find(v => v.id === venue.id)?.total || 0;
      case 'perGuest':    return venuesWithTotals.find(v => v.id === venue.id)?.perGuest || 0;
      case 'rental':      return Number(venue.venue_rental_cost || 0);
      case 'catering':    return venuesWithTotals.find(v => v.id === venue.id)?.catering || 0;
      case 'bar':         return venuesWithTotals.find(v => v.id === venue.id)?.bar || 0;
      case 'coordinator': return Number(venue.coordinator_fee || 0);
      case 'insurance':   return Number(venue.event_insurance || 0);
      case 'other':       return Number(venue.other_costs || 0);
      default:            return venuesWithTotals.find(v => v.id === venue.id)?.total || 0;
    }
  };

  // Mobile layout
  if (isMobile) {
    const metricKey = selectedMetric === 'rental'      ? 'venue_rental_cost' :
                      selectedMetric === 'coordinator'  ? 'coordinator_fee' :
                      selectedMetric === 'insurance'    ? 'event_insurance' :
                      selectedMetric === 'other'        ? 'other_costs' : selectedMetric;

    return (
      <div className="modal" onClick={onBack}>
        <div className="modal-content compare-content" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Venue Comparison</h2>
            <button onClick={onBack} aria-label="Close comparison">Close</button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <label style={{ fontWeight: 600, marginRight: '8px' }}>Compare by:</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="metric-select"
            >
              <option value="total">Total Cost</option>
              <option value="perGuest">Cost per Guest</option>
              <option value="rental">Venue Rental</option>
              <option value="catering">Catering</option>
              <option value="bar">Bar Service</option>
              <option value="coordinator">Coordinator Fee</option>
              <option value="insurance">Event Insurance</option>
              <option value="other">Other Costs</option>
            </select>
          </div>

          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            {venues.map(venue => {
              const value = getMetricValue(venue);
              const cardClass = getMobileCardClass(value, stats[metricKey], venues.length);

              return (
                <div key={venue.id} className={`mobile-card ${cardClass}`}>
                  {getPhotoUrl(venue) && (
                    <img
                      src={getPhotoUrl(venue)}
                      alt={venue.name || 'Venue'}
                      className="mobile-card-photo"
                    />
                  )}
                  <div className="mobile-card-body">
                    <h3 className="mobile-card-name">{venue.name || 'Untitled'}</h3>
                    <div className="meta">{venue.guest_count || 0} guests • {venue.event_duration_hours || 0} hrs</div>
                    <div className="mobile-card-value">{formatMoney(value)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="modal" onClick={onBack}>
      <div className="modal-content compare-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Venue Comparison</h2>
          <button onClick={onBack} aria-label="Close comparison">Close</button>
        </div>
        <div className="comparison-table">
          <div
            className="comparison-grid"
            style={{ gridTemplateColumns: `180px repeat(${venues.length}, 250px)` }}
          >
            {/* Header row */}
            <div className="comparison-cell header">Venue</div>
            {venuesWithTotals.map(v => (
              <div key={v.id} className="comparison-cell venue-header">
                <h3>{v.name || 'Untitled'}</h3>
                <div className="meta">{v.guest_count || 0} guests • {v.event_duration_hours || 0} hrs</div>
              </div>
            ))}

            {/* Photo row */}
            <div className="comparison-cell header">Photo</div>
            {venuesWithTotals.map(v => (
              <div key={`${v.id}-photo`} className="comparison-cell">
                {getPhotoUrl(v) ? <img src={getPhotoUrl(v)} alt={v.name || 'Venue'} /> : null}
              </div>
            ))}

            {/* Cost rows */}
            <div className="comparison-cell header">Venue Rental</div>
            {venuesWithTotals.map(v => (
              <div key={`${v.id}-rental`} className={`comparison-cell ${getComparisonClass(v.venue_rental_cost, stats['venue_rental_cost'], venues.length)}`}>
                {formatMoney(v.venue_rental_cost)}
              </div>
            ))}

            <div className="comparison-cell header">Catering</div>
            {venuesWithTotals.map(v => (
              <div key={`${v.id}-catering`} className={`comparison-cell ${getComparisonClass(v.catering, stats['catering'], venues.length)}`}>
                {formatMoney(v.catering)}
              </div>
            ))}

            <div className="comparison-cell header">Bar Service</div>
            {venuesWithTotals.map(v => (
              <div key={`${v.id}-bar`} className={`comparison-cell ${getComparisonClass(v.bar, stats['bar'], venues.length)}`}>
                {formatMoney(v.bar)}
              </div>
            ))}

            <div className="comparison-cell header">Coordinator</div>
            {venuesWithTotals.map(v => (
              <div key={`${v.id}-coord`} className={`comparison-cell ${getComparisonClass(v.coordinator_fee, stats['coordinator_fee'], venues.length)}`}>
                {formatMoney(v.coordinator_fee)}
              </div>
            ))}

            <div className="comparison-cell header">Insurance</div>
            {venuesWithTotals.map(v => (
              <div key={`${v.id}-insurance`} className={`comparison-cell ${getComparisonClass(v.event_insurance, stats['event_insurance'], venues.length)}`}>
                {formatMoney(v.event_insurance)}
              </div>
            ))}

            <div className="comparison-cell header">Other</div>
            {venuesWithTotals.map(v => (
              <div key={`${v.id}-other`} className={`comparison-cell ${getComparisonClass(v.other_costs, stats['other_costs'], venues.length)}`}>
                {formatMoney(v.other_costs)}
              </div>
            ))}

            <div className="comparison-cell header">Total</div>
            {venuesWithTotals.map(v => (
              <div key={`${v.id}-total`} className={`comparison-cell ${getComparisonClass(v.total, stats['total'], venues.length)}`} style={{ fontWeight: 700 }}>
                {formatMoney(v.total)}
              </div>
            ))}

            <div className="comparison-cell header">Per Guest</div>
            {venuesWithTotals.map(v => (
              <div key={`${v.id}-perguest`} className={`comparison-cell ${getComparisonClass(v.perGuest, stats['perGuest'], venues.length)}`}>
                {formatMoney(v.perGuest)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}