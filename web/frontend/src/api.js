import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE_URL });

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebaseToken');
  if (token) {
    config.headers['x-firebase-token'] = token;
    const uid = localStorage.getItem('uid');
    if (uid) config.headers['x-user-id'] = uid;
  }
  return config;
});

export const apiClient = {
  // Auth
  signup: (email, password) => api.post('/auth/signup', { email, password }),
  verifyToken: (idToken) => api.post('/auth/verify', { idToken }),

  // Venues
  getVenues: () => api.get('/venues'),
  createVenue: (venue) => api.post('/venues', venue),
  updateVenue: (venueId, venue) => api.put(`/venues/${venueId}`, venue),
  deleteVenue: (venueId) => api.delete(`/venues/${venueId}`),

  // Photos
  uploadPhoto: (venueId, file, caption) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption || '');
    return api.post(`/venues/${venueId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getPhotos: (venueId) => api.get(`/venues/${venueId}/photos`),
  deletePhoto: (venueId, photoId) => api.delete(`/venues/${venueId}/photos/${photoId}`)
};
