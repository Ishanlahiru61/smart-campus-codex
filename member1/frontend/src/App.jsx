import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import Navigation from './components/Navigation';
import FacilitiesList from './components/FacilitiesList';
import FacilityForm from './components/FacilityForm';
import FacilityDetails from './components/FacilityDetails';
import Dashboard from './components/Dashboard';
import { facilitiesAPI } from './services/api';

const APP_STATE_KEY = 'smart-campus-facilities-ui-state';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem(APP_STATE_KEY);
    if (!saved) return 'dashboard';
    try {
      return JSON.parse(saved).currentPage || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingFacility, setEditingFacility] = useState(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState(() => {
    const saved = localStorage.getItem(APP_STATE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved).selectedFacilityId || null;
    } catch {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = localStorage.getItem(APP_STATE_KEY);
    if (!saved) return '';
    try {
      return JSON.parse(saved).searchQuery || '';
    } catch {
      return '';
    }
  });
  const [filterType, setFilterType] = useState(() => {
    const saved = localStorage.getItem(APP_STATE_KEY);
    if (!saved) return '';
    try {
      return JSON.parse(saved).filterType || '';
    } catch {
      return '';
    }
  });
  const [filterStatus, setFilterStatus] = useState(() => {
    const saved = localStorage.getItem(APP_STATE_KEY);
    if (!saved) return '';
    try {
      return JSON.parse(saved).filterStatus || '';
    } catch {
      return '';
    }
  });

  // Fetch all facilities
  const fetchFacilities = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await facilitiesAPI.getAllFacilities(filters);
      if (response.success) {
        setFacilities(response.data);
        if (selectedFacilityId) {
          const matched = response.data.find((f) => f.id === selectedFacilityId) || null;
          setSelectedFacility(matched);
        }
      }
    } catch (err) {
      setError('Failed to fetch facilities. Please try again.');
      console.error('Error fetching facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLoading(true);
      try {
        const response = await facilitiesAPI.searchByName(query);
        if (response.success) {
          setFacilities(response.data);
        }
      } catch (err) {
        setError('Failed to search facilities');
        console.error('Error searching:', err);
      } finally {
        setLoading(false);
      }
    } else {
      fetchFacilities({ type: filterType, status: filterStatus });
    }
  };

  // Handle filters
  const handleFilter = (type, status) => {
    setFilterType(type);
    setFilterStatus(status);
    fetchFacilities({ type: type || undefined, status: status || undefined });
  };

  // Handle create facility
  const handleCreateFacility = async (facilityData) => {
    try {
      const response = await facilitiesAPI.createFacility(facilityData);
      if (response.success) {
        setFacilities([...facilities, response.data]);
        setCurrentPage('list');
        setError(null);
      }
    } catch (err) {
      setError('Failed to create facility');
      console.error('Error creating facility:', err);
    }
  };

  // Handle update facility
  const handleUpdateFacility = async (id, facilityData) => {
    try {
      const response = await facilitiesAPI.updateFacility(id, facilityData);
      if (response.success) {
        setFacilities(
          facilities.map(f => f.id === id ? response.data : f)
        );
        setEditingFacility(null);
        setCurrentPage('list');
        setError(null);
      }
    } catch (err) {
      setError('Failed to update facility');
      console.error('Error updating facility:', err);
    }
  };

  // Handle delete facility
  const handleDeleteFacility = async (id) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await facilitiesAPI.deleteFacility(id);
        setFacilities(facilities.filter(f => f.id !== id));
        if (selectedFacility?.id === id) {
          setSelectedFacility(null);
          setSelectedFacilityId(null);
          setCurrentPage('list');
        }
        setError(null);
      } catch (err) {
        setError('Failed to delete facility');
        console.error('Error deleting facility:', err);
      }
    }
  };

  // Handle view details
  const handleViewDetails = (facility) => {
    setSelectedFacility(facility);
    setSelectedFacilityId(facility.id);
    setCurrentPage('details');
  };

  // Handle edit
  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setCurrentPage('form');
  };

  // Initialize data
  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        currentPage,
        searchQuery,
        filterType,
        filterStatus,
        selectedFacilityId,
      })
    );
  }, [currentPage, searchQuery, filterType, filterStatus, selectedFacilityId]);

  // Render pages
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            facilities={facilities} 
            onNavigate={(page) => setCurrentPage(page)}
          />
        );
      case 'list':
        return (
          <FacilitiesList
            facilities={facilities}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            filterType={filterType}
            filterStatus={filterStatus}
            onSearch={handleSearch}
            onFilter={handleFilter}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDeleteFacility}
            onCreateNew={() => setCurrentPage('form')}
          />
        );
      case 'form':
        return (
          <FacilityForm
            facility={editingFacility}
            onSubmit={editingFacility ? handleUpdateFacility : handleCreateFacility}
            onCancel={() => {
              setEditingFacility(null);
              setCurrentPage('list');
            }}
          />
        );
      case 'details':
        return selectedFacility ? (
          <FacilityDetails
            facility={selectedFacility}
            onEdit={handleEdit}
            onDelete={handleDeleteFacility}
            onBack={() => setCurrentPage('list')}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <motion.main
        className="app-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {renderPage()}
      </motion.main>
    </div>
  );
}

export default App;
