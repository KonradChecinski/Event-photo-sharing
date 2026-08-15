import { Head, useForm } from '@inertiajs/react';
import { Add } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
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
export default function EventsIndex({ events }: { events: Event[] }) {
    const [dialog, setDialog] = useState(false);
    const form = useForm({ name: '', description: '', status: 'draft' });

    return (
        <>
            <Head title="Wydarzenia" />
            <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                <Stack direction="row" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" fontWeight={800}>
                        Wydarzenia
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setDialog(true)}
                    >
                        Nowe wydarzenie
                    </Button>
                </Stack>
                <Grid container spacing={2}>
                    {events.map((event) => (
                        <Grid key={event.uuid} size={{ xs: 12, md: 6 }}>
                            <Card
                                onClick={() =>
                                    window.location.assign(show(event).url)
                                }
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 6 },
                                }}
                            >
                                <CardContent>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Typography variant="h6">
                                            {event.name}
                                        </Typography>
                                        <Chip label={event.status} />
                                    </Stack>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ my: 2 }}
                                    >
                                        {event.description || 'Bez opisu'}
                                    </Typography>
                                    <Typography variant="body2">
                                        {event.photos_count} zdjęć ·{' '}
                                        {event.guests_count} gości ·{' '}
                                        {event.deleted_photos_count} usuniętych
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle>Nowe wydarzenie</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1, minWidth: 320 }}>
                        <TextField
                            label="Nazwa"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                        />
                        <TextField
                            label="Opis"
                            multiline
                            minRows={3}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(false)}>Anuluj</Button>
                    <Button
                        variant="contained"
                        onClick={() =>
                            form.post(store().url, {
                                onSuccess: () => setDialog(false),
                            })
                        }
                    >
                        Utwórz
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
