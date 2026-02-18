import React, { useState, useEffect } from 'react';
import { apiClient } from './api';

export default function VenuePhoto({ venue }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhoto = async () => {
      try {
        // Always fetch photos to get the URLs
        const response = await apiClient.getPhotos(venue.id);
        if (response.data && response.data.length > 0) {
          if (venue.title_photo) {
            // Find the photo that matches the title_photo field
            const titlePhoto = response.data.find(p => 
              p.file_path === venue.title_photo || p.url === venue.title_photo
            );
            if (titlePhoto) {
              setPhotoUrl(titlePhoto.url);
            } else {
              // Fallback to first photo if title_photo doesn't match
              setPhotoUrl(response.data[0].url);
            }
          } else {
            // No title_photo set, use first photo
            setPhotoUrl(response.data[0].url);
          }
        }
      } catch (error) {
        console.error('Error loading photo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [venue.id, venue.title_photo]);

  if (loading) {
    return <div style={{ background: '#f0f2f6', height: '140px', borderRadius: '6px' }} />;
  }

  if (!photoUrl) {
    return <div style={{ background: '#f0f2f6', height: '140px', borderRadius: '6px' }} />;
  }

  return (
    <img 
      src={photoUrl} 
      alt={venue.name} 
      style={{ 
        width: '100%', 
        height: '140px', 
        objectFit: 'cover', 
        borderRadius: '6px' 
      }} 
    />
  );
}
