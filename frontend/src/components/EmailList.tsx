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
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AssignmentIcon from '@mui/icons-material/Assignment';
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
    return date.toLocaleDateString();
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="email list">
          <TableHead>
            <TableRow>
              <TableCell width="40%">Subject</TableCell>
              <TableCell width="20%">Sender</TableCell>
              <TableCell width="15%">Category</TableCell>
              <TableCell width="10%">Priority</TableCell>
              <TableCell width="10%">Date</TableCell>
              <TableCell width="5%">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">No emails found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <TableRow
                  key={email.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: email.is_read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  onClick={() => onViewEmail(email)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {email.is_important ? (
                        <StarIcon sx={{ color: 'gold', mr: 1 }} fontSize="small" />
                      ) : (
                        <StarBorderIcon sx={{ mr: 1 }} fontSize="small" color="action" />
                      )}
                      <Box>
                        <Typography variant="body1" fontWeight={email.is_read ? 'normal' : 'bold'}>
                          {email.subject}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {email.snippet}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{email.sender}</TableCell>
                  <TableCell>
                    {email.category && (
                      <Chip
                        label={email.category}
                        size="small"
                        color={getCategoryColor(email.category) as any}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {email.priority_score && (
                      <Chip
                        label={email.priority_score}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(email.priority_score),
                          color: 'white',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(email.created_at)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      {email.action_items && email.action_items.length > 0 && (
                        <Tooltip title="Has action items">
                          <AssignmentIcon color="action" fontSize="small" />
                        </Tooltip>
                      )}
                      <Tooltip title="View email">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewEmail(email);
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
      />
    </Paper>
  );
};

export default EmailList; 