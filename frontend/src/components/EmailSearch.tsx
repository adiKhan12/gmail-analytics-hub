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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

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

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFilters({ ...filters, [name]: value });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters({ ...filters, [name]: checked });
  };

  const handleSearch = () => {
    // Update active filters for display
    const newActiveFilters = [];
    if (filters.search) newActiveFilters.push(`Search: ${filters.search}`);
    if (filters.category) newActiveFilters.push(`Category: ${filters.category}`);
    if (filters.minPriority) newActiveFilters.push(`Min Priority: ${filters.minPriority}`);
    if (filters.sender) newActiveFilters.push(`Sender: ${filters.sender}`);
    if (filters.hasActionItems) newActiveFilters.push('Has Action Items');
    
    setActiveFilters(newActiveFilters);
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
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Search emails..."
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => setShowAdvanced(!showAdvanced)}
              startIcon={<FilterListIcon />}
            >
              {showAdvanced ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {activeFilters.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {activeFilters.map((filter, index) => (
            <Chip 
              key={index} 
              label={filter} 
              onDelete={() => {}} 
              color="primary" 
              variant="outlined" 
            />
          ))}
          <Chip 
            label="Clear All" 
            onDelete={handleClearFilters} 
            color="secondary" 
          />
        </Box>
      )}

      <Collapse in={showAdvanced}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleSelectChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Work">Work</MenuItem>
                <MenuItem value="Personal">Personal</MenuItem>
                <MenuItem value="Newsletter">Newsletter</MenuItem>
                <MenuItem value="Promotional">Promotional</MenuItem>
                <MenuItem value="Social">Social</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Min Priority</InputLabel>
              <Select
                name="minPriority"
                value={filters.minPriority}
                onChange={handleSelectChange}
                label="Min Priority"
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
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.hasActionItems}
                  onChange={handleSwitchChange}
                  name="hasActionItems"
                  color="primary"
                />
              }
              label="Has Action Items"
            />
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default EmailSearch; 