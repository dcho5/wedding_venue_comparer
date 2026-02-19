import React, { useState, useEffect } from 'react';
import { apiClient } from './api';

export default function VenueDetail({ venue, onClose }) {
  const [photos, setPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const loadPhotos = async () => {
      if (venue?.id) {
        try {
          const response = await apiClient.getPhotos(venue.id);
          setPhotos(response.data);
        } catch (error) {
          console.error('Error loading photos:', error);
        }
      }
    };
    loadPhotos();
  }, [venue?.id]);

  if (!venue) return null;

  const formatMoney = (v) => `$${Number(v || 0).toFixed(2)}`;

  const guests = Number(venue.guest_count || 0);
  const catering = (Number(venue.catering_per_person || 0) * guests) + Number(venue.catering_flat_fee || 0);
  const bar = (Number(venue.bar_service_rate || 0) * guests) + Number(venue.bar_flat_fee || 0);
  const total = Number(venue.venue_rental_cost || 0) + catering + bar + 
    Number(venue.coordinator_fee || 0) + Number(venue.event_insurance || 0) + 
    Number(venue.other_costs || 0);

  const handleKeyDown = (e) => {
    if (lightboxIndex !== null) {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxIndex, photos.length]);

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, minWidth: 0, width: '98vw', margin: '40px auto' }}>
        <button onClick={onClose}>Close</button>
        <div id="detailContent">
          <h2>{venue.name}</h2>
          <div className="meta" style={{ fontSize: '0.95em', color: '#888', fontWeight: 500, marginBottom: 8 }}>
            {venue.guest_count || 0} guests &bull; {venue.event_duration_hours || 0} hrs
          </div>

          <div style={{ fontWeight: 600, fontSize: '1.1em', margin: '18px 0 8px 0' }}>Cost Breakdown</div>
          <div className="costs">
            <div className="cost-row">
              <div>Venue Rental</div>
              <div>{formatMoney(venue.venue_rental_cost)}</div>
            </div>
            <div className="cost-row">
              <div>Catering</div>
              <div>{formatMoney(catering)}</div>
            </div>
            <div className="cost-row">
              <div>Bar Service</div>
              <div>{formatMoney(bar)}</div>
            </div>
            <div className="cost-row">
              <div>Coordinator</div>
              <div>{formatMoney(venue.coordinator_fee)}</div>
            </div>
            <div className="cost-row">
              <div>Insurance</div>
              <div>{formatMoney(venue.event_insurance)}</div>
            </div>
            <div className="cost-row">
              <div>Other Costs</div>
              <div>{formatMoney(venue.other_costs)}</div>
            </div>
            <hr style={{ border: 0, borderTop: '1px solid #e0e0e0', margin: '12px 0 8px 0' }} />
            <div className="cost-row">
              <div><strong>Total</strong></div>
              <div><strong>{formatMoney(total)}</strong></div>
            </div>
          </div>

          {/* Photos (#) section, always shown */}
          <div style={{ margin: '20px 0 8px 0', fontWeight: 600, fontSize: '1.1em' }}>
            Photos ({photos.length})
          </div>

          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="gallery">
              {photos.map((photo, index) => (
                <img
                  key={photo.id}
                  className="thumbnail"
                  src={photo.url}
                  alt=""
                  style={{ cursor: 'pointer' }}
                  onClick={() => setLightboxIndex(index)}
                />
              ))}
            </div>
          )}

          {venue.notes && <div style={{ marginTop: '16px' }}>{venue.notes}</div>}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div id="lightbox" onClick={() => setLightboxIndex(null)}>
          <button 
            className="lightbox-arrow left" 
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
            }}
          >
            ◀
          </button>
          <img src={photos[lightboxIndex].url} alt="" />
          <button 
            className="lightbox-arrow right" 
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex + 1) % photos.length);
            }}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
