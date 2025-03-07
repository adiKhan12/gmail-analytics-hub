import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import Dashboard from './components/Dashboard';
import EmailsPage from './components/EmailsPage';
import Header from './components/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="80vh"
        textAlign="center"
        p={3}
      >
        <h1>Welcome to Email Planner</h1>
        <p>Please sign in with your Google account to access your emails.</p>
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/emails" element={<EmailsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box>
            <Header />
            <AppContent />
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
