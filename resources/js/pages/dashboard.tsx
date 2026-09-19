import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowForward,
    CalendarMonth,
    ChevronRight,
    Groups,
    InfoOutlined,
    PhotoCamera,
    PhotoLibrary,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

type DashboardStats = {
    events: number;
    activeEvents: number;
    photos: number;
    guests: number;
    guestDeletedPhotos: number;
};

const statusLabels: Record<string, string> = {
    draft: 'Szkic',
    active: 'Aktywne',
    inactive: 'Nieaktywne',
    finished: 'Zakończone',
};

const statusColorMap: Record<
    string,
    'default' | 'success' | 'warning' | 'info'
> = {
    draft: 'default',
    active: 'success',
    inactive: 'warning',
    finished: 'info',
};

export default function Dashboard({ stats }: { stats: DashboardStats }) {
    const events =
        usePage<{
            navigationEvents: { uuid: string; name: string; status: string }[];
        }>().props.navigationEvents;

    const summary = [
        {
            label: 'Wydarzenia',
            value: stats.events,
            icon: CalendarMonth,
            detail: `${stats.activeEvents} aktywnych`,
        },
        {
            label: 'Zdjęcia',
            value: stats.photos,
            icon: PhotoLibrary,
            detail: `${stats.guestDeletedPhotos} usuniętych przez gości`,
        },
        {
            label: 'Goście',
            value: stats.guests,
            icon: Groups,
            detail: 'anonimowe sesje uczestników',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <Box
                component="main"
                sx={{
                    width: '100%',
                    p: { xs: 2, md: 3 },
                }}
            >
                <Box
                    sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        pb: 3,
                        mb: 3,
                    }}
                >
                    <Typography
                        variant="overline"
                        sx={{
                            display: 'block',
                            color: 'primary.main',
                            fontWeight: 700,
                            letterSpacing: '.12em',
                        }}
                    >
                        Panel administracyjny
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { md: 'flex-end' },
                            justifyContent: 'space-between',
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontSize: '1.875rem',
                                    lineHeight: 1.2,
                                    fontWeight: 750,
                                    letterSpacing: '-.03em',
                                }}
                            >
                                Przegląd wydarzeń
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.75 }}
                            >
                                Dane dotyczą wyłącznie eventów, do których masz
                                przydzielony dostęp.
                            </Typography>
                        </Box>
                        <Link href="/admin" style={{ textDecoration: 'none' }}>
                            <Button
                                variant="outlined"
                                endIcon={<ArrowForward />}
                            >
                                Zobacz wszystkie eventy
                            </Button>
                        </Link>
                    </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {summary.map(({ label, value, icon: Icon, detail }) => (
                        <Grid key={label} size={{ xs: 12, sm: 4 }}>
                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    color: 'text.primary',
                                }}
                            >
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {label}
                                        </Typography>
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 1.5,
                                                bgcolor: 'action.hover',
                                                color: 'primary.main',
                                                display: 'flex',
                                            }}
                                        >
                                            <Icon fontSize="small" />
                                        </Box>
                                    </Box>
                                    <Typography
                                        variant="h3"
                                        sx={{ fontWeight: 700, mt: 1.5, mb: 0.5 }}
                                    >
                                        {value}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {detail}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                color: 'text.primary',
                            }}
                        >
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 700 }}
                                    >
                                        Twoje wydarzenia
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Szybki dostęp do konfiguracji i galerii
                                    </Typography>
                                </Box>
                                <PhotoCamera
                                    fontSize="small"
                                    sx={{ color: 'text.secondary' }}
                                />
                            </Box>
                            <Stack
                                sx={{
                                    '& > *:not(:last-child)': {
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    },
                                }}
                            >
                                {events.slice(0, 6).map((event) => (
                                    <Link
                                        key={event.uuid}
                                        href={`/admin/events/${event.uuid}`}
                                        style={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent:
                                                    'space-between',
                                                px: 2.5,
                                                py: 1.75,
                                                transition:
                                                    'background-color 0.15s ease',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <Box>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {event.name}
                                                </Typography>
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        color={
                                                            statusColorMap[
                                                                event.status
                                                            ] ?? 'default'
                                                        }
                                                        label={
                                                            statusLabels[
                                                                event.status
                                                            ] ?? event.status
                                                        }
                                                    />
                                                </Box>
                                            </Box>
                                            <ChevronRight
                                                fontSize="small"
                                                sx={{ color: 'text.secondary' }}
                                            />
                                        </Box>
                                    </Link>
                                ))}
                                {events.length === 0 && (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Brak przypisanych wydarzeń.
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                color: 'text.primary',
                                height: '100%',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    color: 'primary.main',
                                    mb: 1.5,
                                }}
                            >
                                <InfoOutlined fontSize="small" />
                                <Typography
                                    variant="overline"
                                    sx={{
                                        fontWeight: 700,
                                        letterSpacing: '.12em',
                                    }}
                                >
                                    Wskazówka
                                </Typography>
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, mb: 1 }}
                            >
                                Galeria pod kontrolą
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ lineHeight: 1.6 }}
                            >
                                W edytorze eventu otwórz galerię, aby pobrać
                                zdjęcia, oznaczyć zestaw do archiwum ZIP lub
                                trwale usunąć niechciane pliki.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
