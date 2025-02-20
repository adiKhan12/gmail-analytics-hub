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

export default function Header() {
    const { user, signIn, signOut } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        handleClose();
        signOut();
    };

    return (
        <AppBar position="static" color="primary" elevation={0}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Email Planner
                </Typography>
                {user ? (
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2">
                            {user.email}
                        </Typography>
                        <IconButton
                            onClick={handleMenu}
                            size="small"
                            sx={{ ml: 2 }}
                            aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                        >
                            <Avatar sx={{ width: 32, height: 32 }}>
                                {user.email[0].toUpperCase()}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="account-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleSignOut}>
                                Sign Out
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Button color="inherit" onClick={signIn}>
                        Sign In with Google
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
} 