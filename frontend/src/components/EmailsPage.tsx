import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import EmailSearch from './EmailSearch';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import { 
  listEmails, 
  Email, 
  SearchFilters, 
  markEmailAsRead, 
  toggleEmailImportance, 
  deleteEmail 
} from '../services/api';

const EmailsPage: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [totalEmails, setTotalEmails] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    min_priority: undefined,
    sender: '',
    has_action_items: undefined,
    skip: 0,
    limit: 10,
  });

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await listEmails({
        ...filters,
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      });
      setEmails(response.emails);
      setTotalEmails(response.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to load emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [page, rowsPerPage, filters]);

  const handleSearch = (searchFilters: {
    search: string;
    category: string;
    minPriority: string;
    sender: string;
    hasActionItems: boolean;
  }) => {
    // Reset to first page when search changes
    setPage(0);
    
    // Convert search filters to API format
    setFilters({
      search: searchFilters.search,
      category: searchFilters.category,
      min_priority: searchFilters.minPriority ? parseInt(searchFilters.minPriority) : undefined,
      sender: searchFilters.sender,
      has_action_items: searchFilters.hasActionItems ? true : undefined,
    });
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewEmail = (email: Email) => {
    setSelectedEmail(email);
    setDetailOpen(true);
  };

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
  }, []);

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      const response = await markEmailAsRead(id);
      
      if (response.success) {
        // Update the local state
        setEmails(prevEmails => 
          prevEmails.map(email => 
            email.id === id ? { ...email, is_read: true } : email
          )
        );
        
        // Also update the selected email if it's the one being marked as read
        if (selectedEmail && selectedEmail.id === id) {
          setSelectedEmail({
            ...selectedEmail,
            is_read: true
          });
        }
      } else {
        setError(response.error || 'Failed to mark email as read');
      }
    } catch (err) {
      console.error('Error marking email as read:', err);
      setError('Failed to mark email as read. Please try again.');
    }
  }, [selectedEmail]);

  const handleToggleImportant = useCallback(async (id: string, value: boolean) => {
    try {
      const response = await toggleEmailImportance(id, value);
      
      if (response.success) {
        // Update the local state
        setEmails(prevEmails => 
          prevEmails.map(email => 
            email.id === id ? { ...email, is_important: value } : email
          )
        );
        
        // Also update the selected email if it's the one being toggled
        if (selectedEmail && selectedEmail.id === id) {
          setSelectedEmail({
            ...selectedEmail,
            is_important: value
          });
        }
      } else {
        setError(response.error || 'Failed to update importance');
      }
    } catch (err) {
      console.error('Error toggling email importance:', err);
      setError('Failed to update importance. Please try again.');
    }
  }, [selectedEmail]);
  
  const handleDeleteEmail = useCallback(async (id: string) => {
    try {
      const response = await deleteEmail(id);
      
      if (response.success) {
        // Update the local state
        setEmails(prevEmails => 
          prevEmails.filter(email => email.id !== id)
        );
        
        // Close the detail view if the deleted email is currently selected
        if (selectedEmail && selectedEmail.id === id) {
          setDetailOpen(false);
          setSelectedEmail(null);
        }
      } else {
        setError(response.error || 'Failed to delete email');
      }
    } catch (err) {
      console.error('Error deleting email:', err);
      setError('Failed to delete email. Please try again.');
    }
  }, [selectedEmail]);

  const handleCloseError = () => setError(null);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Emails
        </Typography>
      </Box>

      <EmailSearch onSearch={handleSearch} />

      <EmailList
        emails={emails}
        total={totalEmails}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onViewEmail={handleViewEmail}
      />

      <EmailDetail
        email={selectedEmail}
        open={detailOpen}
        onClose={handleCloseDetail}
        onMarkAsRead={handleMarkAsRead}
        onToggleImportant={handleToggleImportant}
        onDelete={handleDeleteEmail}
      />

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmailsPage; 