import { createInertiaApp } from '@inertiajs/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme, useAppearance } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import EventsLayout from '@/layouts/events/layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function MuiAppTheme({ children }: { children: React.ReactNode }) {
    const { resolvedAppearance } = useAppearance();
    const dark = resolvedAppearance === 'dark';
    const theme = createTheme({
        palette: dark
            ? {
                  mode: 'dark',
                  background: { default: '#1d2634', paper: '#263246' },
                  primary: { main: '#8ab4f8' },
                  text: { primary: '#e3eaf5', secondary: '#aab8cc' },
                  divider: '#3a4a61',
              }
            : {
                  mode: 'light',
                  background: { default: '#f3f6fb', paper: '#fafcff' },
                  primary: { main: '#315fa8' },
                  text: { primary: '#263448', secondary: '#637187' },
                  divider: '#d9e1ec',
              },
        shape: { borderRadius: 10 },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: dark ? '#263246' : '#fafcff',
                    },
                },
            },
            MuiCard: { styleOverrides: { root: { boxShadow: 'none' } } },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: dark ? '#1d2634' : '#f3f6fb',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 8,
                    },
                },
            },
        },
    });
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}

// This will set light / dark mode on load...
initializeTheme();

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name.startsWith('event/'):
                return EventsLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <MuiAppTheme>
                <TooltipProvider delayDuration={0}>
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale={'pl'}
                    >
                        <SnackbarProvider>
                            {app}
                            <Toaster />
                        </SnackbarProvider>
                    </LocalizationProvider>
                </TooltipProvider>
            </MuiAppTheme>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
