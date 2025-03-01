import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Email } from '../services/api';
import { generateEmailDraft } from '../services/api';

interface EmailDraftGeneratorProps {
  open: boolean;
  onClose: () => void;
  originalEmail: Email | null;
  mode: 'reply' | 'forward';
}

const EmailDraftGenerator: React.FC<EmailDraftGeneratorProps> = ({
  open,
  onClose,
  originalEmail,
  mode,
}) => {
  const [prompt, setPrompt] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const generateDraft = async () => {
    if (!originalEmail) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the backend API to generate a draft
      const response = await generateEmailDraft({
        email_id: String(originalEmail.id),
        mode: mode,
        instructions: prompt || undefined
      });
      
      if (response.success && response.draft) {
        setGeneratedDraft(response.draft);
      } else {
        setError(response.error || 'Failed to generate draft');
        // Fallback to client-side generation if API fails
        generateFallbackDraft();
      }
    } catch (err) {
      console.error('Error generating draft:', err);
      setError('Failed to generate draft. Using fallback method.');
      // Fallback to client-side generation
      generateFallbackDraft();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackDraft = () => {
    if (!originalEmail) return;
    
    // Extract recipient name
    const recipientName = extractNameFromEmail(originalEmail.sender);
    
    // Simple fallback draft generation
    let draftText = '';
    
    if (mode === 'reply') {
      draftText = `Dear ${recipientName},\n\n`;
      
      if (prompt) {
        // Use prompt as guidance but don't insert directly
        if (prompt.toLowerCase().includes('decline')) {
          draftText += `Thank you for your message. I appreciate your reaching out, but I won't be able to accommodate this request at this time.\n\n`;
        } else if (prompt.toLowerCase().includes('accept')) {
          draftText += `Thank you for your message. I'm pleased to accept and look forward to moving ahead with this.\n\n`;
        } else {
          draftText += `Thank you for your message. I've reviewed the information you provided.\n\n`;
        }
      } else {
        draftText += `Thank you for your message. I've reviewed the information you provided.\n\n`;
      }
      
      // Add action items if available
      if (originalEmail.action_items && originalEmail.action_items.length > 0) {
        draftText += `I'll address the following items:\n`;
        originalEmail.action_items.forEach(item => {
          draftText += `- ${item}\n`;
        });
        draftText += "\n";
      }
      
      draftText += "Best regards,\n[Your Name]";
    } else {
      // Forward
      draftText = `I'm forwarding this email regarding "${originalEmail.subject}".\n\n`;
      
      if (prompt) {
        if (prompt.toLowerCase().includes('review')) {
          draftText += `Could you please review this and provide your thoughts?\n\n`;
        } else {
          draftText += `I thought you might find this information relevant.\n\n`;
        }
      } else {
        draftText += `I thought you might find this information relevant.\n\n`;
      }
      
      draftText += "---------- Forwarded message ---------\n";
      draftText += `From: ${originalEmail.sender}\n`;
      draftText += `Date: ${new Date(originalEmail.created_at).toLocaleString()}\n`;
      draftText += `Subject: ${originalEmail.subject}\n\n`;
      draftText += originalEmail.body_text || originalEmail.snippet;
      
      draftText += "\n\nBest regards,\n[Your Name]";
    }
    
    setGeneratedDraft(draftText);
  };

  const extractNameFromEmail = (emailStr: string): string => {
    // Try to extract name from format "Name <email@example.com>"
    const nameMatch = emailStr.match(/^([^<]+)</);
    if (nameMatch && nameMatch[1]) {
      return nameMatch[1].trim();
    }
    
    // If no name found, use the part before @ in the email
    const emailMatch = emailStr.match(/([^@<\s]+)@/);
    if (emailMatch && emailMatch[1]) {
      return emailMatch[1];
    }
    
    // Fallback to the original string
    return emailStr;
  };

  useEffect(() => {
    if (open && originalEmail) {
      // Reset state when dialog opens
      setPrompt('');
      setGeneratedDraft('');
      setError(null);
      generateDraft();
    }
  }, [open, originalEmail, mode]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              {mode === 'reply' ? 'Reply with AI' : 'Forward with AI'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {originalEmail && (
          <>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                {mode === 'reply' ? 'Replying to:' : 'Forwarding:'}
              </Typography>
              <Box display="flex" flexDirection="column" bgcolor="background.paper" p={2} borderRadius={1}>
                <Typography variant="body2"><strong>Subject:</strong> {originalEmail.subject}</Typography>
                <Typography variant="body2"><strong>From:</strong> {originalEmail.sender}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {originalEmail.snippet}
                </Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Instructions for AI (optional)"
              placeholder="E.g., 'Politely decline the invitation' or 'Ask for more details about the project'"
              value={prompt}
              onChange={handlePromptChange}
              margin="normal"
              variant="outlined"
              helperText="Provide specific instructions to customize the generated draft"
            />

            <Box mt={2} mb={1} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Generated Draft</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={generateDraft}
                disabled={loading}
                startIcon={<RefreshIcon />}
              >
                Regenerate
              </Button>
            </Box>

            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={12}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary"
          disabled={!generatedDraft || loading}
        >
          Send
        </Button>
        <Button 
          variant="outlined" 
          color="primary"
          disabled={!generatedDraft || loading}
        >
          Save as Draft
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailDraftGenerator; 