import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography,
  IconButton,
  Collapse,
  FormControlLabel,
  Switch,
  Chip,
  InputAdornment,
  Fade,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import CategoryIcon from '@mui/icons-material/Category';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchFilters {
  search: string;
  category: string;
  minPriority: string;
  sender: string;
  hasActionItems: boolean;
}

interface EmailSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

const EmailSearch: React.FC<EmailSearchProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    minPriority: '',
    sender: '',
    hasActionItems: false,
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFilters({ ...filters, [name]: value });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, hasActionItems: e.target.checked });
  };

  const handleSearch = () => {
    // Update active filters
    const active = [];
    if (filters.search) active.push('Search');
    if (filters.category) active.push('Category');
    if (filters.minPriority) active.push('Priority');
    if (filters.sender) active.push('Sender');
    if (filters.hasActionItems) active.push('Action Items');
    
    setActiveFilters(active);
    onSearch(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPriority: '',
      sender: '',
      hasActionItems: false,
    });
    setActiveFilters([]);
    onSearch({
      search: '',
      category: '',
      minPriority: '',
      sender: '',
      hasActionItems: false,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #f8f9ff)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <SearchIcon sx={{ mr: 1, color: '#1976d2' }} />
          Email Search
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<TuneIcon />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          color="primary"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'medium',
          }}
        >
          {showAdvanced ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          name="search"
          value={filters.search}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Search emails by subject, content, or sender..."
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setFilters({ ...filters, search: '' });
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: { 
              borderRadius: 2,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: 'white',
              },
              '&.Mui-focused': {
                backgroundColor: 'white',
              }
            }
          }}
        />
      </Box>

      <Collapse in={showAdvanced}>
        <Fade in={showAdvanced}>
          <Box sx={{ mt: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 2, 
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FilterListIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
              Advanced Filters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="category-label" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CategoryIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} /> Category
                  </InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={filters.category}
                    onChange={handleSelectChange}
                    label="Category"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Work">Work</MenuItem>
                    <MenuItem value="Personal">Personal</MenuItem>
                    <MenuItem value="Social">Social</MenuItem>
                    <MenuItem value="Promotions">Promotions</MenuItem>
                    <MenuItem value="Updates">Updates</MenuItem>
                    <MenuItem value="Forums">Forums</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="priority-label" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PriorityHighIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} /> Min Priority
                  </InputLabel>
                  <Select
                    labelId="priority-label"
                    name="minPriority"
                    value={filters.minPriority}
                    onChange={handleSelectChange}
                    label="Min Priority"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Any Priority</MenuItem>
                    <MenuItem value="1">1 - Low</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3 - Medium</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                    <MenuItem value="5">5 - High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  name="sender"
                  label="Sender"
                  value={filters.sender}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.hasActionItems}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2">Has Action Items</Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ 
                  mr: 1, 
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': {
                    borderColor: '#b71c1c',
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                  }
                }}
                startIcon={<CloseIcon />}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'medium',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                }}
                startIcon={<SearchIcon />}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Fade>
      </Collapse>

      {activeFilters.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {activeFilters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ borderRadius: 1 }}
            />
          ))}
          <Chip
            label="Clear All"
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            sx={{ 
              borderRadius: 1,
              borderColor: '#d32f2f',
              color: '#d32f2f',
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default EmailSearch; 