import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Add, ArrowForward, Groups, Image } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardActionArea,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { show, store } from '@/routes/admin/events';

type Event = {
    uuid: string;
    name: string;
    status: string;
    description?: string;
    photos_count: number;
    guests_count: number;
    deleted_photos_count: number;
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

export default function EventsIndex({ events }: { events: Event[] }) {
    const isSuperadmin = (
        usePage<{ auth: { user: { roles: string[] } | null } }>().props.auth
            .user?.roles ?? []
    ).includes('superadmin');
    const { enqueueSnackbar } = useSnackbar();
    const [dialog, setDialog] = useState(false);
    const form = useForm<{
        name: string;
        description: string;
        status: string;
        image: File | null;
    }>({ name: '', description: '', status: 'draft', image: null });

    const createEvent = () =>
        form.post(store().url, {
            forceFormData: true,
            onSuccess: () => {
                setDialog(false);
                form.reset();
                enqueueSnackbar('Wydarzenie utworzone.', {
                    variant: 'success',
                });
            },
            onError: () =>
                enqueueSnackbar('Sprawdź dane wydarzenia.', {
                    variant: 'error',
                }),
        });

    return (
        <>
            <Head title="Wydarzenia" />
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
                        Biblioteka eventów
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
                                Wydarzenia
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.75 }}
                            >
                                Wybierz wydarzenie, aby przejść do konfiguracji
                                oraz galerii.
                            </Typography>
                        </Box>
                        {isSuperadmin && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setDialog(true)}
                            >
                                Nowe wydarzenie
                            </Button>
                        )}
                    </Box>
                </Box>

                {events.length ? (
                    <Grid container spacing={2}>
                        {events.map((event) => (
                            <Grid key={event.uuid} size={{ xs: 12, md: 6, xl: 4 }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        color: 'text.primary',
                                        transition:
                                            'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            borderColor: 'primary.main',
                                            boxShadow: 2,
                                        },
                                    }}
                                >
                                    <Link
                                        href={show(event).url}
                                        style={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            flexGrow: 1,
                                            height: '100%',
                                        }}
                                    >
                                        <CardActionArea
                                            sx={{
                                                flexGrow: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'stretch',
                                                p: 2.5,
                                                height: '100%',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: 1,
                                                    mb: 1.5,
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '1.125rem',
                                                        lineHeight: 1.3,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {event.name}
                                                </Typography>
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
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2.5,
                                                    flexGrow: 1,
                                                    minHeight: 40,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {event.description ||
                                                    'Brak opisu wydarzenia.'}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    pt: 1.5,
                                                    borderTop: '1px solid',
                                                    borderColor: 'divider',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    <Image fontSize="small" />
                                                    <Typography variant="body2">
                                                        {event.photos_count}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    <Groups fontSize="small" />
                                                    <Typography variant="body2">
                                                        {event.guests_count}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        ml: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        color: 'primary.main',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mr: 0.5,
                                                        }}
                                                    >
                                                        Otwórz
                                                    </Typography>
                                                    <ArrowForward fontSize="small" />
                                                </Box>
                                            </Box>
                                        </CardActionArea>
                                    </Link>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            borderStyle: 'dashed',
                            borderRadius: 2,
                        }}
                    >
                        <Typography sx={{ fontWeight: 700 }}>
                            Brak wydarzeń
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            {isSuperadmin
                                ? 'Utwórz pierwsze wydarzenie, aby skonfigurować galerię dla gości.'
                                : 'Nie masz obecnie przypisanego wydarzenia.'}
                        </Typography>
                    </Paper>
                )}
            </Box>

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Nowe wydarzenie</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <TextField
                            label="Nazwa wydarzenia"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            error={!!form.errors.name}
                            helperText={form.errors.name}
                            autoFocus
                            fullWidth
                        />
                        <TextField
                            label="Opis"
                            multiline
                            minRows={3}
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            error={!!form.errors.description}
                            helperText={form.errors.description}
                            fullWidth
                        />
                        <Button component="label" variant="outlined">
                            Dodaj obrazek
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    form.setData(
                                        'image',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setDialog(false)}>
                        Anuluj
                    </Button>
                    <Button
                        variant="contained"
                        onClick={createEvent}
                        disabled={form.processing}
                    >
                        Utwórz wydarzenie
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
