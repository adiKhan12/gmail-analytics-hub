import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Avatar,
    Menu,
    MenuItem,
    IconButton,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';

const Header: React.FC = () => {
    const { user, signIn, signOut } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const location = useLocation();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        signOut();
        handleClose();
    };

    const handleSignIn = () => {
        signIn();
    };

    return (
        <AppBar position="static" color="primary" elevation={0}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Email Planner
                </Typography>
                {user && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/"
                                sx={{ 
                                    fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                                    borderBottom: location.pathname === '/' ? '2px solid white' : 'none',
                                    borderRadius: 0,
                                    mx: 1
                                }}
                            >
                                Dashboard
                            </Button>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/emails"
                                sx={{ 
                                    fontWeight: location.pathname === '/emails' ? 'bold' : 'normal',
                                    borderBottom: location.pathname === '/emails' ? '2px solid white' : 'none',
                                    borderRadius: 0,
                                    mx: 1
                                }}
                            >
                                Emails
                            </Button>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar 
                                alt={user.name || 'User'} 
                                src={user.picture} 
                                sx={{ width: 32, height: 32 }}
                            />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem disabled>
                                {user.email}
                            </MenuItem>
                            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                        </Menu>
                    </>
                )}
                {!user && (
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={handleSignIn}
                        startIcon={<GoogleIcon />}
                        sx={{ 
                            fontWeight: 'bold',
                            px: 2
                        }}
                    >
                        Sign in with Google
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header; 