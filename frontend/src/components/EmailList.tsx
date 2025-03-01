import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  Badge,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import DraftsIcon from '@mui/icons-material/Drafts';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Email } from '../services/api';

interface EmailListProps {
  emails: Email[];
  total: number;
  loading: boolean;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onViewEmail: (email: Email) => void;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  total,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onViewEmail,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Work':
        return 'primary';
      case 'Personal':
        return 'secondary';
      case 'Newsletter':
        return 'info';
      case 'Promotional':
        return 'warning';
      case 'Social':
        return 'success';
      case 'Updates':
        return 'info';
      case 'Forums':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 4) return '#f44336'; // High - Red
    if (score >= 3) return '#ff9800'; // Medium - Orange
    return '#4caf50'; // Low - Green
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // If it's today, show time instead of date
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's this year, show month and day
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString();
  };
  
  const getSenderInitials = (sender: string) => {
    if (!sender) return '?';
    
    // Try to extract name from email format "Name <email@example.com>"
    const nameMatch = sender.match(/^([^<]+)/);
    const name = nameMatch ? nameMatch[1].trim() : sender;
    
    // Get first letter of first and last name
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    
    // If only one name, get first letter
    return name[0].toUpperCase();
  };
  
  const getSenderAvatarColor = (sender: string) => {
    if (!sender) return '#757575';
    
    // Generate a consistent color based on the sender string
    const hash = sender.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colors = [
      '#1976d2', // Blue
      '#9c27b0', // Purple
      '#e91e63', // Pink
      '#f44336', // Red
      '#ff9800', // Orange
      '#4caf50', // Green
      '#009688', // Teal
      '#673ab7', // Deep Purple
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #f8f9ff)'
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <EmailIcon sx={{ mr: 1, color: '#1976d2' }} />
          Email List
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Showing {emails.length} of {total} emails
        </Typography>
      </Box>
      
      <Divider />
      
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="email list">
          <TableHead>
            <TableRow>
              <TableCell width="40%" sx={{ fontWeight: 'bold', backgroundColor: '#f5f8ff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Subject
                </Box>
              </TableCell>
              <TableCell width="20%" sx={{ fontWeight: 'bold', backgroundColor: '#f5f8ff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Sender
                </Box>
              </TableCell>
              <TableCell width="15%" sx={{ fontWeight: 'bold', backgroundColor: '#f5f8ff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                  Category
                </Box>
              </TableCell>
              <TableCell width="10%" sx={{ fontWeight: 'bold', backgroundColor: '#f5f8ff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PriorityHighIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                  Priority
                </Box>
              </TableCell>
              <TableCell width="10%" sx={{ fontWeight: 'bold', backgroundColor: '#f5f8ff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                  Date
                </Box>
              </TableCell>
              <TableCell width="5%" sx={{ fontWeight: 'bold', backgroundColor: '#f5f8ff' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No emails found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <TableRow
                  key={email.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: email.is_read ? 'inherit' : 'rgba(25, 118, 210, 0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => onViewEmail(email)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {email.is_important ? (
                        <StarIcon sx={{ color: 'gold', mr: 1.5 }} fontSize="small" />
                      ) : (
                        <StarBorderIcon sx={{ mr: 1.5, color: 'text.secondary', opacity: 0.7 }} fontSize="small" />
                      )}
                      <Badge
                        color="primary"
                        variant="dot"
                        invisible={email.is_read}
                        sx={{ mr: 1 }}
                      >
                        {email.is_read ? (
                          <DraftsIcon fontSize="small" color="disabled" />
                        ) : (
                          <EmailIcon fontSize="small" color="primary" />
                        )}
                      </Badge>
                      <Box>
                        <Typography 
                          variant="body1" 
                          fontWeight={email.is_read ? 'normal' : 'bold'}
                          sx={{ 
                            color: email.is_read ? 'text.primary' : 'text.primary',
                            mb: 0.5
                          }}
                        >
                          {email.subject}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          noWrap
                          sx={{ 
                            maxWidth: '400px',
                            opacity: email.is_read ? 0.7 : 0.9
                          }}
                        >
                          {email.snippet}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          mr: 1.5, 
                          bgcolor: getSenderAvatarColor(email.sender),
                          fontSize: '0.8rem'
                        }}
                      >
                        {getSenderInitials(email.sender)}
                      </Avatar>
                      <Typography 
                        variant="body2" 
                        fontWeight={email.is_read ? 'normal' : 'medium'}
                      >
                        {email.sender.split('<')[0].trim()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {email.category ? (
                      <Chip
                        label={email.category}
                        size="small"
                        color={getCategoryColor(email.category) as any}
                        variant="outlined"
                        sx={{ 
                          borderRadius: '4px',
                          fontWeight: 'medium',
                          fontSize: '0.75rem'
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {email.priority_score ? (
                      <Chip
                        label={email.priority_score}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(email.priority_score),
                          color: 'white',
                          fontWeight: 'bold',
                          minWidth: '28px',
                          height: '24px',
                          borderRadius: '4px',
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      fontWeight={email.is_read ? 'normal' : 'medium'}
                    >
                      {formatDate(email.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      {email.action_items && email.action_items.length > 0 && (
                        <Tooltip title="Has action items">
                          <AssignmentIcon 
                            color="primary" 
                            fontSize="small" 
                            sx={{ mr: 0.5 }}
                          />
                        </Tooltip>
                      )}
                      <Tooltip title="View email">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewEmail(email);
                          }}
                          sx={{ 
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{
          borderTop: '1px solid #eaeaea',
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.875rem',
          }
        }}
      />
    </Paper>
  );
};

export default EmailList; 