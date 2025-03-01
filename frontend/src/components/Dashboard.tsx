import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Divider,
    Snackbar,
    Alert,
    LinearProgress,
    Avatar,
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { getDashboardStats, syncEmails, analyzeEmails, EmailStats, Email, listEmails } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import EmailDetail from './EmailDetail';
import EmailDraftGenerator from './EmailDraftGenerator';
import { useAuth } from '../context/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SyncIcon from '@mui/icons-material/Sync';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PieChartIcon from '@mui/icons-material/PieChart';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Category color mapping for the legend
const CATEGORY_COLORS = {
    'Work': '#0088FE',
    'Personal': '#00C49F',
    'Newsletter': '#FFBB28',
    'Promotional': '#FF8042',
    'Social': '#8884D8',
    'Other': '#A9A9A9'  // Default for other categories
};

// Priority color mapping and descriptions
interface PriorityInfo {
    color: string;
    description: string;
}

const PRIORITY_COLORS: Record<string, PriorityInfo> = {
    '1': { color: '#4caf50', description: 'Low - Can be handled later' },
    '2': { color: '#8bc34a', description: 'Low-Medium - Handle when convenient' },
    '3': { color: '#ff9800', description: 'Medium - Should be addressed soon' },
    '4': { color: '#f44336', description: 'High - Requires prompt attention' },
    '5': { color: '#d32f2f', description: 'Critical - Urgent action needed' },
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EmailStats | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
    const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [draftMode, setDraftMode] = useState<'reply' | 'forward' | null>(null);
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [tokenExpired, setTokenExpired] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats();
            setStats(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const analyzeBatch = async (total: number, batchSize: number = 5) => {
        let processed = 0;
        
        while (processed < total) {
            console.log(`Analyzing batch: ${processed + 1}-${Math.min(processed + batchSize, total)} of ${total}`);
            const analysisResult = await analyzeEmails(batchSize);
            
            processed += analysisResult.total_processed;
            setAnalysisProgress({ 
                current: processed,
                total: total
            });
            
            // If we processed less than the batch size, we're done
            if (analysisResult.total_processed < batchSize) {
                break;
            }
        }
        
        return processed;
    };

    const handleSync = async () => {
        setSyncing(true);
        setAnalyzing(false);
        setError(null);
        setTokenExpired(false);
        setSyncProgress({ current: 0, total: 50 });
        setAnalysisProgress({ current: 0, total: 0 });
        
        try {
            // First phase: Sync
            console.log('Starting email sync...');
            const syncResult = await syncEmails(50);
            console.log('Sync result:', syncResult);
            
            // Check for token expiration error
            if (!syncResult.success && syncResult.error && 
                (syncResult.error.includes('invalid_grant') || 
                 syncResult.error.includes('Token has been expired or revoked'))) {
                setTokenExpired(true);
                setSyncing(false);
                return;
            }
            
            setSyncProgress({ current: syncResult.emails_synced, total: syncResult.total_messages });
            
            // Get current stats to know how many unanalyzed emails we have
            const currentStats = await getDashboardStats();
            const totalEmails = currentStats.overview.total_emails;
            const analyzedEmails = currentStats.overview.analyzed_emails;
            const unanalyzedCount = totalEmails - analyzedEmails;
            
            if (unanalyzedCount > 0) {
                // Second phase: Analysis
                setAnalyzing(true);
                setSyncing(false);
                console.log(`Starting analysis of ${unanalyzedCount} unanalyzed emails...`);
                setAnalysisProgress({ current: 0, total: unanalyzedCount });
                
                const processedCount = await analyzeBatch(unanalyzedCount, 5);
                console.log(`Completed analysis of ${processedCount} emails`);
            } else {
                console.log('No emails to analyze');
            }
            
            await fetchData();
            setSuccess(
                unanalyzedCount > 0 
                    ? `Successfully synced ${syncResult.emails_synced} emails and analyzed ${unanalyzedCount} emails`
                    : `Successfully synced ${syncResult.emails_synced} emails. No new emails to analyze.`
            );
        } catch (error) {
            console.error('Error during sync/analysis:', error);
            setError('Failed to sync or analyze emails. Please try again.');
        } finally {
            setSyncing(false);
            setAnalyzing(false);
        }
    };

    const handleReauthenticate = () => {
        signIn();
    };

    useEffect(() => {
        fetchData();
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleViewEmail = async (emailId: string) => {
        try {
            // Fetch the full email details - using a simple filter approach
            const response = await listEmails({});
            
            // Find the email with the matching ID
            const foundEmail = response.emails.find(email => email.id === emailId);
            
            if (foundEmail) {
                setSelectedEmail(foundEmail);
                setDetailOpen(true);
            } else {
                setError('Email not found');
            }
        } catch (error) {
            console.error('Error fetching email details:', error);
            setError('Failed to fetch email details');
        }
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
    };

    const handleMarkAsRead = async (id: string) => {
        // In a real implementation, this would call the API
        // For now, we'll just update the UI
        if (selectedEmail && selectedEmail.id === id) {
            setSelectedEmail({
                ...selectedEmail,
                is_read: true
            });
        }
    };

    const handleToggleImportant = async (id: string, value: boolean) => {
        // In a real implementation, this would call the API
        // For now, we'll just update the UI
        if (selectedEmail && selectedEmail.id === id) {
            setSelectedEmail({
                ...selectedEmail,
                is_important: value
            });
        }
    };

    const handleDeleteEmail = async (id: string) => {
        // In a real implementation, this would call the API
        // For now, we'll just close the detail view
        setDetailOpen(false);
        setSelectedEmail(null);
        // Refresh dashboard data
        fetchData();
    };

    const handleReply = () => {
        if (selectedEmail) {
            setDraftMode('reply');
        }
    };

    const handleCloseDraft = () => {
        setDraftMode(null);
    };

    const handleCloseError = () => setError(null);
    const handleCloseSuccess = () => setSuccess(null);

    if (loading && !stats) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    const categoryData = stats ? Object.entries(stats.categories).map(([name, value]) => ({
        name,
        value,
    })) : [];

    const priorityData = stats ? Object.entries(stats.priorities).map(([score, count]) => ({
        name: `Priority ${score}`,
        value: count,
    })) : [];

    const getPriorityColor = (score: number) => {
        if (score >= 8) return '#f44336'; // High priority - red
        if (score >= 5) return '#ff9800'; // Medium priority - orange
        return '#4caf50'; // Low priority - green
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={4}
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={2}
            >
                <Box>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Email Dashboard
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        {stats?.overview.last_sync 
                            ? `Last updated: ${new Date(stats.overview.last_sync).toLocaleString()}` 
                            : 'No sync data available'}
                    </Typography>
                </Box>
                
                <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems={{ xs: 'stretch', sm: 'flex-end' }} 
                    gap={1.5}
                    width={{ xs: '100%', sm: 'auto' }}
                >
                    {loading && (
                        <Box display="flex" justifyContent="center" mb={1}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    
                    <Button
                        variant="contained"
                        onClick={handleSync}
                        disabled={syncing || analyzing}
                        startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <CloudSyncIcon />}
                        sx={{ 
                            borderRadius: 2,
                            py: 1,
                            boxShadow: 2,
                            background: syncing || analyzing 
                                ? 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)'
                                : 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0 30%, #0ca8cd 90%)',
                                boxShadow: 3,
                            }
                        }}
                        fullWidth
                    >
                        {syncing ? 'Syncing Emails...' : analyzing ? 'Analyzing Emails...' : 'Sync & Analyze Emails'}
                    </Button>
                    
                    <Button
                        variant="outlined"
                        component={Link}
                        to="/emails"
                        startIcon={<SearchIcon />}
                        sx={{ 
                            borderRadius: 2,
                            py: 1,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                                borderColor: '#1565c0',
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            }
                        }}
                        fullWidth
                    >
                        Search & View Emails
                    </Button>
                    
                    {(syncing || analyzing) && (
                        <Paper 
                            elevation={1} 
                            sx={{ 
                                p: 1.5, 
                                width: '100%', 
                                borderRadius: 2,
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            {syncing && (
                                <>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                        <Typography variant="body2" fontWeight="medium">
                                            Syncing Emails
                                        </Typography>
                                        <Typography variant="body2" color="primary">
                                            {syncProgress.current}/{syncProgress.total}
                                        </Typography>
                                    </Box>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={(syncProgress.current / syncProgress.total) * 100}
                                        sx={{ 
                                            height: 8, 
                                            borderRadius: 4,
                                            mb: 1,
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: '#1976d2',
                                            }
                                        }}
                                    />
                                </>
                            )}
                            {analyzing && (
                                <>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                        <Typography variant="body2" fontWeight="medium">
                                            Analyzing Emails
                                        </Typography>
                                        <Typography variant="body2" color="primary">
                                            {analysisProgress.current}/{analysisProgress.total}
                                        </Typography>
                                    </Box>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={(analysisProgress.current / analysisProgress.total) * 100}
                                        sx={{ 
                                            height: 8, 
                                            borderRadius: 4,
                                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: '#4caf50',
                                            }
                                        }}
                                    />
                                </>
                            )}
                        </Paper>
                    )}
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Overview Stats */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={2}
                        sx={{ 
                            p: 3, 
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%',
                            borderRadius: 2,
                            background: 'linear-gradient(to bottom, #ffffff, #f5f8ff)'
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 'bold',
                                pb: 1,
                                borderBottom: '1px solid #eaeaea'
                            }}
                        >
                            Overview
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    sx={{ 
                                        bgcolor: 'primary.main', 
                                        width: 40, 
                                        height: 40,
                                        mr: 2
                                    }}
                                >
                                    <EmailIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Emails
                                    </Typography>
                                    <Typography variant="h5" fontWeight="medium">
                                        {stats?.overview.total_emails || 0}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    sx={{ 
                                        bgcolor: '#ff9800', 
                                        width: 40, 
                                        height: 40,
                                        mr: 2
                                    }}
                                >
                                    <MarkEmailUnreadIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Unread Emails
                                    </Typography>
                                    <Typography variant="h5" fontWeight="medium">
                                        {stats?.overview.unread_emails || 0}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    sx={{ 
                                        bgcolor: '#4caf50', 
                                        width: 40, 
                                        height: 40,
                                        mr: 2
                                    }}
                                >
                                    <AnalyticsIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Analyzed Emails
                                    </Typography>
                                    <Typography variant="h5" fontWeight="medium">
                                        {stats?.overview.analyzed_emails || 0}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    sx={{ 
                                        bgcolor: '#9c27b0', 
                                        width: 40, 
                                        height: 40,
                                        mr: 2
                                    }}
                                >
                                    <SyncIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Last Sync
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {stats?.overview.last_sync ? new Date(stats.overview.last_sync).toLocaleString() : 'Never'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Category Distribution */}
                <Grid item xs={12} md={8}>
                    <Paper 
                        elevation={2}
                        sx={{ 
                            p: 2.5, 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: 2,
                            background: 'linear-gradient(to bottom, #ffffff, #f8f9ff)'
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 'bold',
                                pb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #eaeaea'
                            }}
                        >
                            <PieChartIcon sx={{ mr: 1, color: '#673ab7' }} />
                            Category Distribution
                        </Typography>
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
                            <Box 
                                height={300} 
                                width={{ xs: '100%', md: '70%' }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                            labelLine={false}
                                            animationDuration={800}
                                            animationBegin={0}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={COLORS[index % COLORS.length]} 
                                                    stroke="#ffffff"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: 8, 
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                border: 'none'
                                            }} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                            <Box 
                                width={{ xs: '100%', md: '30%' }} 
                                display="flex" 
                                flexDirection="column" 
                                justifyContent="center"
                                pl={{ xs: 0, md: 2 }}
                                mt={{ xs: 2, md: 0 }}
                                sx={{
                                    borderLeft: { xs: 'none', md: '1px solid #eaeaea' },
                                    paddingLeft: { xs: 0, md: 3 }
                                }}
                            >
                                <Typography 
                                    variant="subtitle1" 
                                    gutterBottom 
                                    fontWeight="bold"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <CategoryIcon sx={{ mr: 1, fontSize: '0.9rem', color: 'text.secondary' }} />
                                    Category Legend
                                </Typography>
                                <Box sx={{ maxHeight: 220, overflow: 'auto', pr: 1 }}>
                                    {categoryData.map((category, index) => (
                                        <Box 
                                            key={`legend-${index}`} 
                                            display="flex" 
                                            alignItems="center" 
                                            mb={1.5}
                                            sx={{
                                                transition: 'transform 0.2s',
                                                '&:hover': {
                                                    transform: 'translateX(5px)'
                                                }
                                            }}
                                        >
                                            <Box 
                                                width={16} 
                                                height={16} 
                                                bgcolor={COLORS[index % COLORS.length]} 
                                                mr={1.5} 
                                                borderRadius="50%" 
                                                sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                            />
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {category.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {category.value} emails
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Priority Distribution */}
                <Grid item xs={12}>
                    <Paper 
                        elevation={2}
                        sx={{ 
                            p: 2.5, 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: 2,
                            background: 'linear-gradient(to bottom, #ffffff, #fff8f5)'
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 'bold',
                                pb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #eaeaea'
                            }}
                        >
                            <BarChartIcon sx={{ mr: 1, color: '#ff5722' }} />
                            Priority Distribution
                        </Typography>
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
                            <Box 
                                height={300} 
                                width={{ xs: '100%', md: '70%' }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ResponsiveContainer>
                                    <BarChart 
                                        data={priorityData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{ fill: '#666', fontSize: 12 }}
                                            axisLine={{ stroke: '#e0e0e0' }}
                                        />
                                        <YAxis 
                                            tick={{ fill: '#666', fontSize: 12 }}
                                            axisLine={{ stroke: '#e0e0e0' }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: 8, 
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                border: 'none'
                                            }}
                                        />
                                        <Bar 
                                            dataKey="value" 
                                            radius={[4, 4, 0, 0]}
                                            animationDuration={1500}
                                        >
                                            {priorityData.map((entry, index) => {
                                                const priorityLevel = entry.name.split(' ')[1];
                                                const color = PRIORITY_COLORS[priorityLevel]?.color || '#8884d8';
                                                return (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={color} 
                                                        stroke="white"
                                                        strokeWidth={1}
                                                    />
                                                );
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                            <Box 
                                width={{ xs: '100%', md: '30%' }} 
                                display="flex" 
                                flexDirection="column" 
                                justifyContent="center"
                                pl={{ xs: 0, md: 2 }}
                                mt={{ xs: 2, md: 0 }}
                                sx={{
                                    borderLeft: { xs: 'none', md: '1px solid #eaeaea' },
                                    paddingLeft: { xs: 0, md: 3 }
                                }}
                            >
                                <Typography 
                                    variant="subtitle1" 
                                    gutterBottom 
                                    fontWeight="bold"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <FlagCircleIcon sx={{ mr: 1, fontSize: '0.9rem', color: 'text.secondary' }} />
                                    Priority Legend
                                </Typography>
                                <Box sx={{ maxHeight: 220, overflow: 'auto', pr: 1 }}>
                                    {Object.entries(PRIORITY_COLORS).map(([level, { color, description }]) => (
                                        <Box 
                                            key={`priority-legend-${level}`} 
                                            display="flex" 
                                            alignItems="flex-start" 
                                            mb={1.5}
                                            sx={{
                                                transition: 'transform 0.2s',
                                                '&:hover': {
                                                    transform: 'translateX(5px)'
                                                }
                                            }}
                                        >
                                            <Box 
                                                width={16} 
                                                height={16} 
                                                bgcolor={color} 
                                                mr={1.5} 
                                                mt={0.5}
                                                borderRadius="2px"
                                                sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                            />
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    Priority {level}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* High Priority Emails */}
                <Grid item xs={12} md={6}>
                    <Paper 
                        elevation={2}
                        sx={{ 
                            p: 2.5, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '300px',
                            borderRadius: 2,
                            background: 'linear-gradient(to bottom, #ffffff, #fff5f5)'
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 'bold',
                                pb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #eaeaea'
                            }}
                        >
                            <PriorityHighIcon sx={{ mr: 1, color: '#f44336' }} />
                            High Priority Emails
                        </Typography>
                        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                            <List sx={{ py: 0 }}>
                                {stats?.high_priority && stats.high_priority.length > 0 ? (
                                    stats.high_priority.map((email) => (
                                        <React.Fragment key={email.id}>
                                            <ListItemButton 
                                                onClick={() => handleViewEmail(email.id)}
                                                sx={{
                                                    borderRadius: 1,
                                                    my: 0.5,
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(244, 67, 54, 0.08)',
                                                    }
                                                }}
                                            >
                                                <Box 
                                                    sx={{ 
                                                        minWidth: 40, 
                                                        display: 'flex', 
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Avatar 
                                                        sx={{ 
                                                            width: 32, 
                                                            height: 32, 
                                                            bgcolor: getPriorityColor(email.priority_score)
                                                        }}
                                                    >
                                                        <FlagIcon fontSize="small" />
                                                    </Avatar>
                                                </Box>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <SubjectIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', opacity: 0.7 }} />
                                                            <Typography noWrap variant="body1" fontWeight="medium">
                                                                {email.subject}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', opacity: 0.7 }} />
                                                            <Typography noWrap variant="body2" color="text.secondary">
                                                                {email.sender} | Score: {email.priority_score}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{ ml: 1 }}
                                                />
                                            </ListItemButton>
                                            <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <ListItem sx={{ borderRadius: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                        <ListItemText 
                                            primary={
                                                <Typography align="center" color="text.secondary">
                                                    No high priority emails
                                                </Typography>
                                            } 
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Box>
                    </Paper>
                </Grid>

                {/* Pending Actions */}
                <Grid item xs={12} md={6}>
                    <Paper 
                        elevation={2}
                        sx={{ 
                            p: 2.5, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '300px',
                            borderRadius: 2,
                            background: 'linear-gradient(to bottom, #ffffff, #f5f8ff)'
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 'bold',
                                pb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #eaeaea'
                            }}
                        >
                            <AssignmentIcon sx={{ mr: 1, color: '#1976d2' }} />
                            Pending Actions
                        </Typography>
                        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                            <List sx={{ py: 0 }}>
                                {stats?.pending_actions && stats.pending_actions.length > 0 ? (
                                    stats.pending_actions.map((email) => (
                                        <React.Fragment key={email.id}>
                                            <ListItemButton 
                                                onClick={() => handleViewEmail(email.id)}
                                                sx={{
                                                    borderRadius: 1,
                                                    my: 0.5,
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                    }
                                                }}
                                            >
                                                <Box 
                                                    sx={{ 
                                                        minWidth: 40, 
                                                        display: 'flex', 
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Avatar 
                                                        sx={{ 
                                                            width: 32, 
                                                            height: 32, 
                                                            bgcolor: '#1976d2'
                                                        }}
                                                    >
                                                        <CheckCircleOutlineIcon fontSize="small" />
                                                    </Avatar>
                                                </Box>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <SubjectIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', opacity: 0.7 }} />
                                                            <Typography noWrap variant="body1" fontWeight="medium">
                                                                {email.subject}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <FormatListBulletedIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', opacity: 0.7 }} />
                                                            <Typography noWrap variant="body2" color="text.secondary">
                                                                Actions: {JSON.parse(email.action_items).join(', ')}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{ ml: 1 }}
                                                />
                                            </ListItemButton>
                                            <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <ListItem sx={{ borderRadius: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                        <ListItemText 
                                            primary={
                                                <Typography align="center" color="text.secondary">
                                                    No pending actions
                                                </Typography>
                                            } 
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Error Snackbar */}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            {/* Success Snackbar */}
            <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSuccess}>
                <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>

            {/* Token Expired Alert */}
            {tokenExpired && (
                <Alert 
                    severity="warning" 
                    sx={{ mt: 2, mb: 2 }}
                    action={
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={handleReauthenticate}
                        >
                            Re-authenticate
                        </Button>
                    }
                >
                    Your Google authentication has expired or been revoked. Please re-authenticate to continue using the application.
                </Alert>
            )}

            {/* Email Detail Dialog */}
            {selectedEmail && (
                <EmailDetail
                    email={selectedEmail}
                    open={detailOpen}
                    onClose={handleCloseDetail}
                    onMarkAsRead={handleMarkAsRead}
                    onToggleImportant={handleToggleImportant}
                    onDelete={handleDeleteEmail}
                />
            )}

            {/* Email Draft Generator */}
            {selectedEmail && draftMode && (
                <EmailDraftGenerator
                    open={!!draftMode}
                    onClose={handleCloseDraft}
                    originalEmail={selectedEmail}
                    mode={draftMode}
                />
            )}
        </Container>
    );
} 