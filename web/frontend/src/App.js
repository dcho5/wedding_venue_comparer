import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { apiClient } from './api';
import VenueList from './VenueList';
import VenueForm from './VenueForm';
import VenueComparison from './VenueComparison';
import VenueDetail from './VenueDetail';

export default function App({ onLogout }) {
  const [venues, setVenues] = useState([]);
  const [selectedVenues, setSelectedVenues] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [detailVenue, setDetailVenue] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isDraftVenue, setIsDraftVenue] = useState(false);

  useEffect(() => {
    loadVenues();
  }, []);

  const getFilteredSortedVenues = () => {
    let filtered = venues.filter(v => 
      v.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'date') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'total') {
        const totalA = calculateTotal(a);
        const totalB = calculateTotal(b);
        return totalA - totalB;
      }
      return 0;
    });

    return filtered;
  };

  const calculateTotal = (venue) => {
    return (
      (venue.venue_rental_cost || 0) +
      ((venue.catering_per_person || 0) * (venue.guest_count || 0)) +
      (venue.catering_flat_fee || 0) +
      ((venue.bar_service_rate || 0) * (venue.guest_count || 0)) +
      (venue.bar_flat_fee || 0) +
      (venue.coordinator_fee || 0) +
      (venue.event_insurance || 0) +
      (venue.other_costs || 0)
    );
  };

  const loadVenues = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getVenues();
      setVenues(response.data);
    } catch (error) {
      console.error('Error loading venues:', error);
      // Only show alert for real errors (not 404 or network issues on first load)
      if (error.response?.status && error.response.status !== 404 && venues.length > 0) {
        alert('Failed to load venues');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVenue = async (venueData) => {
    try {
      if (editingVenue) {
        await apiClient.updateVenue(editingVenue.id, venueData);
      } else {
        await apiClient.createVenue(venueData);
      }
      await loadVenues();
      setShowForm(false);
      setEditingVenue(null);
      setIsDraftVenue(false);
    } catch (error) {
      console.error('Error saving venue:', error);
      alert('Failed to save venue');
    }
  };

  const handleAddVenue = async () => {
    try {
      // Create a draft venue immediately so photos can be uploaded
      const draftVenue = {
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
      };
      const response = await apiClient.createVenue(draftVenue);
      setEditingVenue(response.data);
      setIsDraftVenue(true);
      setShowForm(true);
    } catch (error) {
      console.error('Error creating draft venue:', error);
      alert('Failed to create venue');
    }
  };

  const handleCancelForm = async () => {
    if (isDraftVenue && editingVenue?.id) {
      // Delete the draft venue if user cancels without saving
      try {
        await apiClient.deleteVenue(editingVenue.id);
        await loadVenues();
      } catch (error) {
        console.error('Error deleting draft venue:', error);
      }
    }
    setShowForm(false);
    setEditingVenue(null);
    setIsDraftVenue(false);
  };

  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm('Delete this venue?')) return;
    try {
      await apiClient.deleteVenue(venueId);
      await loadVenues();
      setSelectedVenues(prev => {
        const updated = new Set(prev);
        updated.delete(venueId);
        return updated;
      });
    } catch (error) {
      console.error('Error deleting venue:', error);
      alert('Failed to delete venue');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggleVenueSelection = (venueId) => {
    setSelectedVenues(prev => {
      const updated = new Set(prev);
      if (updated.has(venueId)) {
        updated.delete(venueId);
      } else {
        updated.add(venueId);
      }
      return updated;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedVenues.size === 0) {
      alert('Select venues to delete');
      return;
    }
    if (!window.confirm(`Delete ${selectedVenues.size} venue(s)?`)) return;

    try {
      for (const venueId of selectedVenues) {
        await apiClient.deleteVenue(venueId);
      }
      await loadVenues();
      setSelectedVenues(new Set());
    } catch (error) {
      console.error('Error deleting venues:', error);
      alert('Failed to delete venues');
    }
  };

  const handleOpenComparison = () => {
    if (selectedVenues.size < 2) {
      alert('Please select at least 2 venues to compare');
      return;
    }
    if (selectedVenues.size > 3) {
      alert('You can compare up to 3 venues at a time');
      return;
    }
    setShowComparison(true);
  };

  if (showForm) {
    return (
      <VenueForm
        venue={editingVenue}
        onSave={(data) => {
          handleSaveVenue(data);
        }}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <>
      <header>
        <h1>Wedding Venue Comparer</h1>
        <div className="controls">
          <input
            id="search"
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search venues"
          />
          <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort venues">
            <option value="total">Sort: Total Cost</option>
            <option value="name">Sort: Name</option>
            <option value="date">Sort: Date Added</option>
          </select>
          <button
            id="compareBtn"
            className={selectedVenues.size >= 2 ? '' : 'hidden'}
            onClick={handleOpenComparison}
            aria-label="Compare selected venues"
          >
            Compare (<span id="compareCount">{selectedVenues.size}</span>)
          </button>
          <button
            id="deleteSelectedBtn"
            className={selectedVenues.size > 0 ? 'btn-danger' : 'hidden'}
            onClick={handleDeleteSelected}
            aria-label="Delete selected venues"
          >
            Delete (<span id="deleteCount">{selectedVenues.size}</span>)
          </button>
          <button id="addBtn" onClick={handleAddVenue} aria-label="Add new venue">
            Add Venue
          </button>
          <button onClick={handleLogout} className="secondary" aria-label="Sign out">
            Sign Out
          </button>
        </div>
      </header>

      <main>
        <VenueList
          venues={getFilteredSortedVenues()}
          selectedVenues={selectedVenues}
          onSelectVenue={handleToggleVenueSelection}
          onViewVenue={(venue) => setDetailVenue(venue)}
          onEditVenue={(venue) => {
            setEditingVenue(venue);
            setShowForm(true);
          }}
          loading={loading}
        />
      </main>

      {detailVenue && (
        <VenueDetail
          venue={detailVenue}
          onClose={() => setDetailVenue(null)}
        />
      )}

      {showComparison && selectedVenues.size > 0 && (
        <VenueComparison
          venues={venues.filter(v => selectedVenues.has(v.id))}
          onBack={() => setShowComparison(false)}
        />
      )}
    </>
  );
}
