import React, { useState, useEffect } from 'react';

export default function VenuePhoto({ venue }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [venue.id, venue.title_photo]);

  if (loading) {
    return <div style={{ background: '#f0f2f6', height: '140px', borderRadius: '6px' }} />;
  }

  if (!venue.title_photo) {
    return <div style={{ background: '#f0f2f6', height: '140px', borderRadius: '6px' }} />;
  }

  return (
    <img 
      src={venue.title_photo} 
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
