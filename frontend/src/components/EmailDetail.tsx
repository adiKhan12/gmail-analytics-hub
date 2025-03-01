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
    return date.toLocaleString();
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
        PaperProps={{
          sx: { minHeight: '70vh' },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => onToggleImportant(email.id, !email.is_important)}
              size="small"
              sx={{ mr: 1 }}
            >
              {email.is_important ? (
                <StarIcon sx={{ color: 'gold' }} />
              ) : (
                <StarBorderIcon color="action" />
              )}
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {email.subject}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">
                <strong>From:</strong> {email.sender}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(email.created_at)}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>To:</strong> {email.recipient || 'me'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {email.category && (
                <Chip
                  label={email.category}
                  size="small"
                  color={getCategoryColor(email.category) as any}
                />
              )}
              {email.priority_score && (
                <Chip
                  label={`Priority: ${email.priority_score}`}
                  size="small"
                  color={email.priority_score >= 4 ? 'error' : email.priority_score >= 3 ? 'warning' : 'success'}
                />
              )}
              {email.sentiment && (
                <Chip
                  icon={getSentimentIcon(email.sentiment)}
                  label={`Sentiment: ${email.sentiment}`}
                  size="small"
                  color={
                    email.sentiment.toLowerCase() === 'positive'
                      ? 'success'
                      : email.sentiment.toLowerCase() === 'negative'
                      ? 'error'
                      : 'default'
                  }
                />
              )}
            </Box>
          </Box>

          {email.summary && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Summary</strong>
              </Typography>
              <Typography variant="body2">{email.summary}</Typography>
            </Box>
          )}

          {email.action_items && email.action_items.length > 0 && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Action Items</strong>
              </Typography>
              <List dense>
                {email.action_items.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AssignmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" component="div">
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
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Box>
            <Button startIcon={<ReplyIcon />} variant="outlined" sx={{ mr: 1 }} onClick={handleReply}>
              Reply
            </Button>
            <Button startIcon={<ForwardIcon />} variant="outlined" onClick={handleForward}>
              Forward
            </Button>
          </Box>
          <Box>
            <IconButton color="default" sx={{ mr: 1 }}>
              <ArchiveIcon />
            </IconButton>
            <IconButton color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
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