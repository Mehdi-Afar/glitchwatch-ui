import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
      light: '#4285f4',
      dark: '#1557b0',
    },
    secondary: {
      main: '#34a853',
      light: '#4caf50',
      dark: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000', // Ensure primary text color is black
      secondary: '#5f6368',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
      color: '#000000', // Ensure h1 text color is black
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.75rem',
      color: '#000000', // Ensure h4 text color is black
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#000000', // Ensure all typography text color is black
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          '& .MuiDataGrid-columnHeaderTitle': {
            color: '#000000', // Ensure DataGrid column header title color is black
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4285f4',
      light: '#5c9fff',
      dark: '#2b579a',
    },
    secondary: {
      main: '#34a853',
      light: '#4caf50',
      dark: '#2e7d32',
    },
    background: {
      default: '#0a0a0a',
      paper: '#161616',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#9e9e9e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
      color: '#e0e0e0', // Ensure h1 text color is light
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.75rem',
      color: '#e0e0e0', // Ensure h4 text color is light
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(255,255,255,0.05)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(255,255,255,0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-cell': {
            outline: 'none !important',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: '#e0e0e0', // Ensure DataGrid column header title color is light
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#e0e0e0', // Ensure all typography text color is light
        },
      },
    },
  },
});