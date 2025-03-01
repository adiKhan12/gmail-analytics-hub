import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import ReplyIcon from '@mui/icons-material/Reply';
import ForwardIcon from '@mui/icons-material/Forward';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CategoryIcon from '@mui/icons-material/Category';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import MoodIcon from '@mui/icons-material/Mood';
import { Email } from '../services/api';
import EmailDraftGenerator from './EmailDraftGenerator';

interface EmailDetailProps {
  email: Email | null;
  open: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onToggleImportant: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  open,
  onClose,
  onMarkAsRead,
  onToggleImportant,
  onDelete,
}) => {
  // Track if we've already marked this email as read
  const emailIdRef = React.useRef<string | null>(null);
  const [draftMode, setDraftMode] = React.useState<'reply' | 'forward' | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    // Only mark as read if the email exists, is not read, and we haven't marked this specific email as read yet
    if (email && !email.is_read && emailIdRef.current !== email.id) {
      emailIdRef.current = email.id;
      onMarkAsRead(email.id);
    }
  }, [email?.id, email?.is_read, onMarkAsRead]);

  if (!email) return null;

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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <SentimentSatisfiedAltIcon color="success" />;
      case 'negative':
        return <SentimentVeryDissatisfiedIcon color="error" />;
      default:
        return <SentimentNeutralIcon color="action" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleReply = () => {
    setDraftMode('reply');
  };

  const handleForward = () => {
    setDraftMode('forward');
  };

  const handleCloseDraft = () => {
    setDraftMode(null);
  };

  const handleDelete = () => {
    if (email) {
      onDelete(email.id);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: { 
            minHeight: '70vh',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'linear-gradient(to right, #1976d2, #2196f3)',
            color: 'white',
            py: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => onToggleImportant(email.id, !email.is_important)}
              size="small"
              sx={{ mr: 1, color: 'white' }}
            >
              {email.is_important ? (
                <StarIcon sx={{ color: 'gold' }} />
              ) : (
                <StarBorderIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
              )}
            </IconButton>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: isMobile ? '200px' : '500px'
              }}
            >
              {email.subject}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 0 } }}>
                <Avatar 
                  sx={{ 
                    bgcolor: getSenderAvatarColor(email.sender),
                    width: 40,
                    height: 40,
                    mr: 2
                  }}
                >
                  {getSenderInitials(email.sender)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {email.sender.split('<')[0].trim()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {email.sender.match(/<([^>]+)>/) ? email.sender.match(/<([^>]+)>/)?.[1] : ''}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(email.created_at)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              pl: { xs: 0, sm: 7 }
            }}>
              <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2">
                <span style={{ color: 'text.secondary' }}>To:</span> {email.recipient || 'me'}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              mb: 2,
              pl: { xs: 0, sm: 7 }
            }}>
              {email.category && (
                <Tooltip title="Category">
                  <Chip
                    icon={<CategoryIcon />}
                    label={email.category}
                    size="small"
                    color={getCategoryColor(email.category) as any}
                    sx={{ 
                      borderRadius: '4px',
                      '& .MuiChip-icon': { 
                        fontSize: '1rem',
                        ml: 0.5
                      }
                    }}
                  />
                </Tooltip>
              )}
              {email.priority_score && (
                <Tooltip title="Priority Score">
                  <Chip
                    icon={<PriorityHighIcon />}
                    label={`Priority: ${email.priority_score}`}
                    size="small"
                    sx={{
                      backgroundColor: email.priority_score >= 4 ? '#f44336' : 
                                      email.priority_score >= 3 ? '#ff9800' : '#4caf50',
                      color: 'white',
                      borderRadius: '4px',
                      '& .MuiChip-icon': { 
                        color: 'white',
                        fontSize: '1rem',
                        ml: 0.5
                      }
                    }}
                  />
                </Tooltip>
              )}
              {email.sentiment && (
                <Tooltip title="Email Sentiment">
                  <Chip
                    icon={<MoodIcon />}
                    label={`Sentiment: ${email.sentiment}`}
                    size="small"
                    sx={{
                      backgroundColor: email.sentiment.toLowerCase() === 'positive' ? '#4caf50' :
                                      email.sentiment.toLowerCase() === 'negative' ? '#f44336' : '#9e9e9e',
                      color: 'white',
                      borderRadius: '4px',
                      '& .MuiChip-icon': { 
                        color: 'white',
                        fontSize: '1rem',
                        ml: 0.5
                      }
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>

          {email.summary && (
            <Paper 
              elevation={0} 
              sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: 'rgba(25, 118, 210, 0.05)', 
                borderRadius: 2,
                border: '1px solid rgba(25, 118, 210, 0.1)'
              }}
            >
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'primary.main',
                  fontWeight: 'medium'
                }}
              >
                <SummarizeIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Summary
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {email.summary}
              </Typography>
            </Paper>
          )}

          {email.action_items && email.action_items.length > 0 && (
            <Paper 
              elevation={0} 
              sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: 'rgba(255, 152, 0, 0.05)', 
                borderRadius: 2,
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}
            >
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'warning.main',
                  fontWeight: 'medium'
                }}
              >
                <AssignmentIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Action Items
              </Typography>
              <List dense sx={{ pt: 0 }}>
                {email.action_items.map((item, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      px: 1, 
                      py: 0.5,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Badge 
                        color="warning" 
                        variant="dot"
                        sx={{ '& .MuiBadge-badge': { top: 4, right: 4 } }}
                      >
                        <AssignmentIcon color="action" fontSize="small" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontWeight: 'medium'
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <Typography 
                variant="body1" 
                component="div" 
                sx={{ 
                  lineHeight: 1.7,
                  '& a': { color: 'primary.main' }
                }}
              >
                {email.body_html ? (
                  <div dangerouslySetInnerHTML={{ __html: email.body_html }} />
                ) : (
                  email.body_text ? email.body_text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  )) : email.snippet
                )}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions 
          sx={{ 
            justifyContent: 'space-between', 
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <Box>
            <Button 
              startIcon={<ReplyIcon />} 
              variant="contained" 
              color="primary"
              sx={{ 
                mr: 1,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }
              }} 
              onClick={handleReply}
            >
              Reply
            </Button>
            <Button 
              startIcon={<ForwardIcon />} 
              variant="outlined" 
              color="primary"
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none'
              }}
              onClick={handleForward}
            >
              Forward
            </Button>
          </Box>
          <Box>
            <Tooltip title="Archive">
              <IconButton 
                color="default" 
                sx={{ 
                  mr: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                color="error" 
                onClick={handleDelete}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.08)'
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogActions>
      </Dialog>

      {draftMode && (
        <EmailDraftGenerator
          open={Boolean(draftMode)}
          onClose={handleCloseDraft}
          originalEmail={email}
          mode={draftMode}
        />
      )}
    </>
  );
};

export default EmailDetail; 