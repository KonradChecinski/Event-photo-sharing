import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { index as photosIndex } from '@/routes/admin/photos';
import { update } from '@/routes/admin/events';
type Event = {
    uuid: string;
    name: string;
    status: string;
    welcome_title?: string;
    welcome_text?: string;
    primary_color: string;
    secondary_color: string;
    text_color: string;
    background_color: string;
};
export default function EventShow({
    event,
    stats,
    eventUrl,
}: {
    event: Event;
    stats: { photos: number; guests: number; deletedPhotos: number };
    eventUrl: string;
}) {
    const form = useForm({
        name: event.name,
        welcome_title: event.welcome_title ?? '',
        welcome_text: event.welcome_text ?? '',
        primary_color: event.primary_color,
        secondary_color: event.secondary_color,
        text_color: event.text_color,
        background_color: event.background_color,
        status: event.status,
    });

    return (
        <>
            <Head title={event.name} />
            <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
                <Stack spacing={3}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h4" fontWeight={800}>
                            {event.name}
                        </Typography>
                        <Stack direction="row">
                            <Button
                                onClick={() =>
                                    navigator.clipboard.writeText(eventUrl)
                                }
                            >
                                Kopiuj link
                            </Button>
                            <Button
                                href={photosIndex(event).url}
                                variant="contained"
                            >
                                Galeria
                            </Button>
                        </Stack>
                    </Stack>
                    <Grid container spacing={2}>
                        {[
                            ['Zdjęcia', stats.photos],
                            ['Goście', stats.guests],
                            ['Usunięte', stats.deletedPhotos],
                        ].map(([label, value]) => (
                            <Grid key={String(label)} size={{ xs: 4 }}>
                                <Card>
                                    <CardContent>
                                        <Typography color="text.secondary">
                                            {label}
                                        </Typography>
                                        <Typography variant="h3">
                                            {value}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Card>
                        <CardContent>
                            <Stack
                                component="form"
                                spacing={2}
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.patch(update(event).url);
                                }}
                            >
                                <TextField
                                    label="Nazwa"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                />
                                <TextField
                                    label="Tytuł powitalny"
                                    value={form.data.welcome_title}
                                    onChange={(e) =>
                                        form.setData(
                                            'welcome_title',
                                            e.target.value,
                                        )
                                    }
                                />
                                <TextField
                                    label="Tekst powitalny"
                                    multiline
                                    value={form.data.welcome_text}
                                    onChange={(e) =>
                                        form.setData(
                                            'welcome_text',
                                            e.target.value,
                                        )
                                    }
                                />
                                <Stack direction="row" spacing={2}>
                                    {(
                                        [
                                            'primary_color',
                                            'secondary_color',
                                            'text_color',
                                            'background_color',
                                        ] as const
                                    ).map((field) => (
                                        <TextField
                                            key={field}
                                            label={field}
                                            type="color"
                                            value={form.data[field]}
                                            onChange={(e) =>
                                                form.setData(
                                                    field,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    ))}
                                </Stack>
                                <Button type="submit" variant="contained">
                                    Zapisz
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>
        </>
    );
}
