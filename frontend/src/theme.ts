import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Color palette definition
const lightPalette = {
  primary: {
    main: '#3a7bd5',
    light: '#6fa7ff',
    dark: '#0053a3',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#00bcd4',
    light: '#62efff',
    dark: '#008ba3',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
  },
  text: {
    primary: '#2d3748',
    secondary: '#718096',
  },
  error: {
    main: '#e53e3e',
    light: '#ff6b6b',
    dark: '#c53030',
  },
  warning: {
    main: '#ed8936',
    light: '#f6ad55',
    dark: '#dd6b20',
  },
  info: {
    main: '#4299e1',
    light: '#63b3ed',
    dark: '#3182ce',
  },
  success: {
    main: '#48bb78',
    light: '#68d391',
    dark: '#38a169',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
};

const darkPalette = {
  primary: {
    main: '#4a9fff',
    light: '#81d4fa',
    dark: '#0077c2',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#00e5ff',
    light: '#6effff',
    dark: '#00b2cc',
    contrastText: '#000000',
  },
  background: {
    default: '#1a202c',
    paper: '#2d3748',
  },
  text: {
    primary: '#f7fafc',
    secondary: '#a0aec0',
  },
  error: {
    main: '#ff5252',
    light: '#ff8a80',
    dark: '#c62828',
  },
  warning: {
    main: '#ffab40',
    light: '#ffd180',
    dark: '#ff6d00',
  },
  info: {
    main: '#40c4ff',
    light: '#80d8ff',
    dark: '#00b0ff',
  },
  success: {
    main: '#69f0ae',
    light: '#b9f6ca',
    dark: '#00c853',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};

// Create theme function that handles both light and dark modes
export const createAppTheme = (mode: PaletteMode) => {
  const palette = mode === 'light' ? lightPalette : darkPalette;
  
  let theme = createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },
    shape: {
      borderRadius: 10,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 4px 8px rgba(0, 0, 0, 0.05)',
      '0px 8px 16px rgba(0, 0, 0, 0.05)',
      '0px 12px 24px rgba(0, 0, 0, 0.05)',
      '0px 16px 32px rgba(0, 0, 0, 0.05)',
      ...Array(19).fill('none'),
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light' 
              ? '0px 4px 20px rgba(0, 0, 0, 0.05)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: mode === 'light' 
              ? '0px 4px 20px rgba(0, 0, 0, 0.05)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'light' 
                ? '0px 12px 24px rgba(0, 0, 0, 0.1)' 
                : '0px 12px 24px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' 
              ? '0px 2px 10px rgba(0, 0, 0, 0.05)' 
              : '0px 2px 10px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.05)' 
              : '1px solid rgba(255, 255, 255, 0.05)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: mode === 'light' 
                ? 'rgba(58, 123, 213, 0.08)' 
                : 'rgba(74, 159, 255, 0.15)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
  
  // Make typography responsive
  theme = responsiveFontSizes(theme);
  
  return theme;
};

// Default export for the light theme
export default createAppTheme('light'); 