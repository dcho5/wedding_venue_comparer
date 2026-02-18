import React, { useState, useEffect } from 'react';
import { apiClient } from './api';

export default function VenueForm({ venue, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    venue || {
      name: '',
      guest_count: 100,
      event_duration_hours: 12,
      venue_rental_cost: 0,
      catering_per_person: 0,
      catering_flat_fee: 0,
      bar_service_rate: 0,
      bar_flat_fee: 0,
      coordinator_fee: 0,
      event_insurance: 0,
      other_costs: 0,
      notes: ''
    }
  );

  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [titlePhotoId, setTitlePhotoId] = useState(null);

  // Load photos when editing existing venue
  useEffect(() => {
    const loadPhotos = async () => {
      if (venue?.id) {
        try {
          const response = await apiClient.getPhotos(venue.id);
          setPhotos(response.data);
          // Set title photo if venue has one
          if (venue.title_photo) {
            const titlePhoto = response.data.find(p => p.file_path === venue.title_photo || p.url === venue.title_photo);
            if (titlePhoto) setTitlePhotoId(titlePhoto.id);
          }
        } catch (error) {
          console.error('Error loading photos:', error);
        }
      }
    };
    loadPhotos();
  }, [venue?.id, venue?.title_photo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Keep notes and name as strings, convert numeric fields to numbers
    const isStringField = name === 'notes' || name === 'name';
    setFormData(prev => ({
      ...prev,
      [name]: isStringField ? value : (isNaN(value) ? value : parseFloat(value) || 0)
    }));
  };

  const uploadFiles = async (files) => {
    if (!venue?.id) return;
    setUploading(true);

    try {
      for (const file of files) {
        const response = await apiClient.uploadPhoto(venue.id, file, '');
        setPhotos(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    await uploadFiles(files);
  };

  const handleNumericKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X
      (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    await uploadFiles(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Venue name is required');
      return;
    }
    // Find the title photo's file_path or url
    const titlePhoto = photos.find(p => p.id === titlePhotoId);
    const dataToSave = {
      ...formData,
      title_photo: titlePhoto ? (titlePhoto.file_path || titlePhoto.url) : null
    };
    onSave(dataToSave);
  };

  const totalCost = (formData.venue_rental_cost || 0) +
    ((formData.catering_per_person || 0) * (formData.guest_count || 0)) +
    (formData.catering_flat_fee || 0) +
    ((formData.bar_service_rate || 0) * (formData.guest_count || 0)) +
    (formData.bar_flat_fee || 0) +
    (formData.coordinator_fee || 0) +
    (formData.event_insurance || 0) +
    (formData.other_costs || 0);

  const perGuestCost = formData.guest_count > 0 ? (totalCost / formData.guest_count).toFixed(2) : '0.00';
  const cateringTotal = ((formData.catering_per_person || 0) * (formData.guest_count || 0)) + (formData.catering_flat_fee || 0);
  const barTotal = ((formData.bar_service_rate || 0) * (formData.guest_count || 0)) + (formData.bar_flat_fee || 0);

  return (
    <div className="modal" onClick={(e) => e.target.className === 'modal' && onCancel()}>
      <div className="modal-content">
        <h2>{venue ? 'Edit Venue' : 'Add Venue'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-layout">
            <div className="left">
              <label className="full">
                Name
                <input name="name" value={formData.name} onChange={handleChange} required />
              </label>
              <div className="title-photo-area">
                <div className="title-photo-help muted">Tip: click any photo thumbnail below to mark it as the title photo.</div>
                {titlePhotoId && (
                  <div id="titlePhotoPreview" className="title-photo-preview">
                    <img 
                      src={photos.find(p => p.id === titlePhotoId)?.url} 
                      alt="Title" 
                      className="title-thumb"
                    />
                  </div>
                )}
              </div>

              <div className="row">
                <label>
                  Guests
                  <div className="slider-wrap">
                    <button type="button" className="slider-btn" onClick={() => setFormData(prev => ({ ...prev, guest_count: Math.max(0, prev.guest_count - 1) }))}>−</button>
                    <input
                      name="guest_count"
                      type="range"
                      min="0"
                      max="250"
                      step="5"
                      value={formData.guest_count}
                      onChange={handleChange}
                    />
                    <button type="button" className="slider-btn" onClick={() => setFormData(prev => ({ ...prev, guest_count: Math.min(250, prev.guest_count + 1) }))}>+</button>
                    <span>{formData.guest_count}</span>
                  </div>
                </label>
                <label>
                  Duration (hrs)
                  <div className="slider-wrap">
                    <button type="button" className="slider-btn" onClick={() => setFormData(prev => ({ ...prev, event_duration_hours: Math.max(0, prev.event_duration_hours - 0.5) }))}>−</button>
                    <input
                      name="event_duration_hours"
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      value={formData.event_duration_hours}
                      onChange={handleChange}
                    />
                    <button type="button" className="slider-btn" onClick={() => setFormData(prev => ({ ...prev, event_duration_hours: Math.min(24, prev.event_duration_hours + 0.5) }))}>+</button>
                    <span>{formData.event_duration_hours}</span>
                  </div>
                </label>
              </div>

              <label className="full">
                Notes
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" style={{ resize: 'none' }}></textarea>
              </label>

              <div className="photos-placeholder">
                <div className="photo-actions">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={!venue?.id || uploading}
                    id="photoInput"
                    style={{ display: 'none' }}
                  />
                  <button type="button" onClick={() => document.getElementById('photoInput').click()} disabled={!venue?.id || uploading}>
                    📷 {uploading ? 'Uploading...' : 'Browse Photos'}
                  </button>
                </div>
                <div 
                  id="dropZone" 
                  className="drop-zone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !uploading && venue?.id && document.getElementById('photoInput').click()}
                  style={{ cursor: venue?.id && !uploading ? 'pointer' : 'not-allowed', opacity: venue?.id ? 1 : 0.5 }}
                >
                  📸 Drag & drop photos here or click to browse
                </div>
                {photos.length > 0 && (
                  <>
                    <div id="photoPreview" className="photo-preview">
                      {photos.map(photo => (
                        <div 
                          key={photo.id} 
                          className={`thumb ${titlePhotoId === photo.id ? 'is-title' : ''}`}
                          onClick={() => setTitlePhotoId(photo.id)}
                          style={{ cursor: 'pointer', position: 'relative' }}
                        >
                          <img src={photo.url} alt="Venue" />
                          <button
                            type="button"
                            className="remove-photo"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('Delete this photo?')) {
                                try {
                                  await apiClient.deletePhoto(venue.id, photo.id);
                                  setPhotos(prev => prev.filter(p => p.id !== photo.id));
                                  if (titlePhotoId === photo.id) setTitlePhotoId(null);
                                } catch (error) {
                                  console.error('Error deleting photo:', error);
                                  alert('Failed to delete photo');
                                }
                              }
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <span className="muted">{photos.length} photos</span>
              </div>
            </div>

            <div className="right">
              <div className="cost-cards">
                <div className="card cost-card">
                  <div className="card-header">Venue Rental</div>
                  <div className="card-body">
                    <label className="input-label">Amount</label>
                    <input
                      name="venue_rental_cost"
                      className="cost-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.venue_rental_cost || ''}
                      onChange={handleChange}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="$"
                    />
                  </div>
                </div>

                <div className="card cost-card">
                  <div className="card-header">Catering</div>
                  <div className="card-body">
                    <label className="input-label">Per Person</label>
                    <input
                      name="catering_per_person"
                      className="cost-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.catering_per_person || ''}
                      onChange={handleChange}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="$/person"
                    />
                    <label className="input-label">Flat Fee</label>
                    <input
                      name="catering_flat_fee"
                      className="cost-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.catering_flat_fee || ''}
                      onChange={handleChange}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="$"
                    />
                    <div className="muted">${cateringTotal.toFixed(2)}</div>
                  </div>
                </div>

                <div className="card cost-card">
                  <div className="card-header">Bar Service</div>
                  <div className="card-body">
                    <label className="input-label">Per Person</label>
                    <input
                      name="bar_service_rate"
                      className="cost-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.bar_service_rate || ''}
                      onChange={handleChange}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="$/person"
                    />
                    <label className="input-label">Flat Fee</label>
                    <input
                      name="bar_flat_fee"
                      className="cost-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.bar_flat_fee || ''}
                      onChange={handleChange}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="$"
                    />
                    <div className="muted">${barTotal.toFixed(2)}</div>
                  </div>
                </div>

                <div className="card cost-card">
                  <div className="card-header">Coordinator Fee</div>
                  <div className="card-body">
                    <label className="input-label">Amount</label>
                    <input
                      name="coordinator_fee"
                      className="cost-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.coordinator_fee || ''}
                      onChange={handleChange}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="$"
                    />
                  </div>
                </div>

                <div className="card cost-card">
                  <div className="card-header">Event Insurance</div>
                  <div className="card-body">
                    <label className="input-label">Amount</label>
                    <input
                      name="event_insurance"
                      className="cost-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.event_insurance || ''}
                      onChange={handleChange}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="$"
                    />
                  </div>
                </div>

                <div className="card cost-card">
                  <div className="card-header">Other Costs</div>
                  <div className="card-body">
                    <label className="input-label">Amount</label>
                    <input
                      name="other_costs"
                      className="cost-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.other_costs || ''}
                      onChange={handleChange}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="$"
                    />
                  </div>
                </div>
              </div>

              <div className="summary-panel">
                <div>Summary</div>
                <div className="total">${totalCost.toFixed(2)}</div>
                <div className="muted">Per guest: ${perGuestCost}</div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <div className="spacer"></div>
            <div>Total: <span>${totalCost.toFixed(2)}</span></div>
            <button type="submit">Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
