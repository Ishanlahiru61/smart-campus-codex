import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import Navigation from './components/TicketNavigation';
import Dashboard from './components/TicketDashboard';
import TicketsList from './components/TicketsList';
import TicketForm from './components/TicketForm';
import TicketDetails from './components/TicketDetails';
import { incidentsAPI } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Fetch all tickets
  const fetchTickets = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await incidentsAPI.getAllTickets(filters);
      if (response.success) {
        setTickets(response.data);
      }
    } catch (err) {
      setError('Failed to fetch tickets');
      console.error('Error fetching tickets:', err);
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
        const response = await incidentsAPI.searchTickets(query);
        if (response.success) {
          setTickets(response.data);
        }
      } catch (err) {
        setError('Failed to search tickets');
      } finally {
        setLoading(false);
      }
    } else {
      fetchTickets({ status: filterStatus, priority: filterPriority });
    }
  };

  // Handle filter
  const handleFilter = (status, priority) => {
    setFilterStatus(status);
    setFilterPriority(priority);
    fetchTickets({ status: status || undefined, priority: priority || undefined });
  };

  // Handle create ticket
  const handleCreateTicket = async (ticketData) => {
    try {
      const response = await incidentsAPI.createTicket(ticketData);
      if (response.success) {
        setTickets([...tickets, response.data]);
        setCurrentPage('list');
        setError(null);
      }
    } catch (err) {
      setError('Failed to create ticket');
    }
  };

  // Handle update ticket
  const handleUpdateTicket = async (id, ticketData) => {
    try {
      const response = await incidentsAPI.updateTicket(id, ticketData);
      if (response.success) {
        setTickets(tickets.map(t => t.id === id ? response.data : t));
        setEditingTicket(null);
        setCurrentPage('list');
        setError(null);
      }
    } catch (err) {
      setError('Failed to update ticket');
    }
  };

  // Handle delete ticket
  const handleDeleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await incidentsAPI.deleteTicket(id);
        setTickets(tickets.filter(t => t.id !== id));
        if (selectedTicket?.id === id) {
          setSelectedTicket(null);
          setCurrentPage('list');
        }
      } catch (err) {
        setError('Failed to delete ticket');
      }
    }
  };

  // Handle view details
  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setCurrentPage('details');
  };

  // Handle edit
  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setCurrentPage('form');
  };

  // Initialize data
  useEffect(() => {
    fetchTickets();
  }, []);

  // Render pages
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            tickets={tickets}
            onNavigate={(page) => setCurrentPage(page)}
          />
        );
      case 'list':
        return (
          <TicketsList
            tickets={tickets}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            filterPriority={filterPriority}
            onSearch={handleSearch}
            onFilter={handleFilter}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDeleteTicket}
            onCreateNew={() => setCurrentPage('form')}
            onRefresh={() => fetchTickets()}
          />
        );
      case 'form':
        return (
          <TicketForm
            ticket={editingTicket}
            onSubmit={editingTicket ? handleUpdateTicket : handleCreateTicket}
            onCancel={() => {
              setEditingTicket(null);
              setCurrentPage('list');
            }}
          />
        );
      case 'details':
        return selectedTicket ? (
          <TicketDetails
            ticket={selectedTicket}
            onEdit={handleEdit}
            onDelete={handleDeleteTicket}
            onBack={() => setCurrentPage('list')}
            onUpdateTicket={(updatedTicket) => {
              setSelectedTicket(updatedTicket);
              setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            }}
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
