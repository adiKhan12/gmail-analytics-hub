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
    Divider,
    Snackbar,
    Alert,
    LinearProgress,
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
import { getDashboardStats, syncEmails, analyzeEmails, EmailStats } from '../services/api';
import { Link } from 'react-router-dom';

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
        setSyncProgress({ current: 0, total: 50 });
        setAnalysisProgress({ current: 0, total: 0 });
        
        try {
            // First phase: Sync
            console.log('Starting email sync...');
            const syncResult = await syncEmails(50);
            console.log('Sync result:', syncResult);
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
            console.error('Error during sync process:', error);
            setError('Failed to sync or analyze emails. Please try again.');
        } finally {
            setSyncing(false);
            setAnalyzing(false);
            setSyncProgress({ current: 0, total: 0 });
            setAnalysisProgress({ current: 0, total: 0 });
        }
    };

    useEffect(() => {
        fetchData();
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

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

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Email Dashboard
                </Typography>
                <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                    {loading && <CircularProgress size={24} />}
                    <Box display="flex" flexDirection="column" gap={1} minWidth={200}>
                        <Button
                            variant="contained"
                            onClick={handleSync}
                            disabled={syncing || analyzing}
                            startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {syncing ? 'Syncing...' : analyzing ? 'Analyzing...' : 'Sync Emails'}
                        </Button>
                        <Button
                            variant="outlined"
                            component={Link}
                            to="/emails"
                            sx={{ mt: 1 }}
                        >
                            Search & View Emails
                        </Button>
                        {(syncing || analyzing) && (
                            <Box sx={{ width: '100%' }}>
                                {syncing && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">
                                            Syncing: {syncProgress.current}/{syncProgress.total} emails
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={(syncProgress.current / syncProgress.total) * 100} 
                                        />
                                    </>
                                )}
                                {analyzing && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">
                                            Analyzing: {analysisProgress.current}/{analysisProgress.total} emails
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={(analysisProgress.current / analysisProgress.total) * 100} 
                                        />
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Overview Stats */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>
                            Overview
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Total Emails"
                                    secondary={stats?.overview.total_emails}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Unread Emails"
                                    secondary={stats?.overview.unread_emails}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Analyzed Emails"
                                    secondary={stats?.overview.analyzed_emails}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Last Sync"
                                    secondary={stats?.overview.last_sync ? new Date(stats.overview.last_sync).toLocaleString() : 'Never'}
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* Category Distribution */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>
                            Category Distribution
                        </Typography>
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
                            <Box height={300} width={{ xs: '100%', md: '70%' }}>
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
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
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
                            >
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                    Category Legend
                                </Typography>
                                {categoryData.map((category, index) => (
                                    <Box 
                                        key={`legend-${index}`} 
                                        display="flex" 
                                        alignItems="center" 
                                        mb={1}
                                    >
                                        <Box 
                                            width={16} 
                                            height={16} 
                                            bgcolor={COLORS[index % COLORS.length]} 
                                            mr={1} 
                                            borderRadius="50%" 
                                        />
                                        <Typography variant="body2">
                                            {category.name} ({category.value})
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Priority Distribution */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Priority Distribution
                        </Typography>
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
                            <Box height={300} width={{ xs: '100%', md: '70%' }}>
                                <ResponsiveContainer>
                                    <BarChart data={priorityData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value">
                                            {priorityData.map((entry, index) => {
                                                const priorityLevel = entry.name.split(' ')[1];
                                                const color = PRIORITY_COLORS[priorityLevel]?.color || '#8884d8';
                                                return <Cell key={`cell-${index}`} fill={color} />;
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
                            >
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                    Priority Legend
                                </Typography>
                                {Object.entries(PRIORITY_COLORS).map(([level, { color, description }]) => (
                                    <Box 
                                        key={`priority-legend-${level}`} 
                                        display="flex" 
                                        alignItems="flex-start" 
                                        mb={1}
                                    >
                                        <Box 
                                            width={16} 
                                            height={16} 
                                            bgcolor={color} 
                                            mr={1} 
                                            mt={0.5}
                                        />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
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
                    </Paper>
                </Grid>

                {/* High Priority Emails */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>
                            High Priority Emails
                        </Typography>
                        <List>
                            {stats?.high_priority.map((email) => (
                                <React.Fragment key={email.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={email.subject}
                                            secondary={`From: ${email.sender} | Priority: ${email.priority_score}`}
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Pending Actions */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>
                            Pending Actions
                        </Typography>
                        <List>
                            {stats?.pending_actions.map((email) => (
                                <React.Fragment key={email.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={email.subject}
                                            secondary={`Actions: ${JSON.parse(email.action_items).join(', ')}`}
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
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
        </Container>
    );
} 