import { Head, useForm } from '@inertiajs/react';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Stack,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import { MuiColorInput } from 'mui-color-input';
import { useSnackbar } from 'notistack';
import { useState, useRef } from 'react';
import { update } from '@/routes/admin/events';
import { index as photosIndex } from '@/routes/admin/photos';
import {background} from '@/routes/events'

type Event = {
    uuid: string;
    name: string;
    description?: string | null;
    status: string;
    starts_at?: string | null;
    ends_at?: string | null;
    title?: string | null;
    text?: string | null;
    welcome_title?: string;
    welcome_text?: string;
    image?: string | File | null;
    primary_color: string;
    secondary_color: string;
    text_color: string;
    background_color_primary: string;
    background_color_secondary: string;
};

export default function EventShow({
    event,
    stats,
    eventUrl,
}: {
    event: Event;
    stats: { photos: number; guests: number; deletedPhotos: number };
    eventUrl: string;
    backgroundUrl: string;
}) {
    const form = useForm({
        name: event.name || '',
        description: event.description ?? '',
        status: event.status || 'draft',
        starts_at: event.starts_at ?? null,
        ends_at: event.ends_at ?? null,
        title: event.title ?? '',
        text: event.text ?? '',
        welcome_title: event.welcome_title ?? '',
        welcome_text: event.welcome_text ?? '',
        image: event.image ?? null,
        primary_color: event.primary_color || '#6D28D9',
        secondary_color: event.secondary_color || '#EC4899',
        text_color: event.text_color || '#FFFFFF',
        background_color_primary: event.background_color_primary || '#1E1B4B',
        background_color_secondary: event.background_color_secondary || '#2D3748',
    });

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const refreshPreview = () => {
        if (!iframeRef.current) {
            return;
        }

        // force reload by appending timestamp
        const base = eventUrl.split('?')[0];
        iframeRef.current.src = base + '?t=' + Date.now();
    };

    // local dayjs states for pickers
    const [startsAtDay, setStartsAtDay] = useState<Dayjs | null>(
        event.starts_at ? dayjs(event.starts_at) : null,
    );
    const [endsAtDay, setEndsAtDay] = useState<Dayjs | null>(
        event.ends_at ? dayjs(event.ends_at) : null,
    );

    // update form data when pickers change
    const handleStartsAtChange = (value: Dayjs | null) => {
        setStartsAtDay(value);
        form.setData('starts_at', value ? value.toISOString() : null);
    };

    const handleEndsAtChange = (value: Dayjs | null) => {
        setEndsAtDay(value);
        form.setData('ends_at', value ? value.toISOString() : null);
    };

    dayjs.locale('pl');


    return (
        <>
            <Head title={event.name} />
            <Box sx={{ p: 3, maxWidth: 2000, mx: 'auto' }}>
                <Stack spacing={3}>
                    <Stack direction="row">
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Edit: {event.name}
                        </Typography>
                        <Stack direction="row">
                            <Button
                                onClick={() =>
                                    navigator.clipboard.writeText(eventUrl)
                                }
                            >
                                Copy link
                            </Button>
                            <Button
                                href={photosIndex(event).url}
                                variant="contained"
                            >
                                Gallery
                            </Button>
                        </Stack>
                    </Stack>

                    <Grid container spacing={2}>
                        {[
                            ['Zdjęcia', stats.photos],
                            ['Goście', stats.guests],
                            ['Usunięte', stats.deletedPhotos],
                        ].map(([label, value]) => (
                            <Grid key={String(label)} size={{ xs: 12, md: 4 }}>
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

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Card>
                                <CardContent>
                                    <Stack
                                        component="form"
                                        spacing={3}
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            form.patch(update(event).url, {
                                                forceFormData: true,
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    enqueueSnackbar(
                                                        'Zapisano konfigurację wydarzenia.',
                                                        { variant: 'success' },
                                                    );

                                                    // clear file input
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value =
                                                            '';
                                                    }

                                                    form.setData('image', null);

                                                    // refresh preview iframe
                                                    refreshPreview();
                                                },
                                                onError: (errors) => {
                                                    console.error(
                                                        'errors',
                                                        errors,
                                                        form,
                                                    );
                                                    enqueueSnackbar(
                                                        'Wystąpił błąd przy zapisywaniu.',
                                                        { variant: 'error' },
                                                    );
                                                },
                                            });
                                        }}
                                    >
                                        {/* Top: name + description */}
                                        <Stack spacing={2}>
                                            <TextField
                                                label="Nazwa"
                                                value={form.data.name}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <TextField
                                                label="Opis"
                                                multiline
                                                minRows={3}
                                                value={form.data.description}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Stack>

                                        {/* Status and dates */}
                                        <Stack
                                            direction={{
                                                xs: 'column',
                                                sm: 'row',
                                            }}
                                            spacing={2}
                                            sx={{ alignItems: 'center' }}
                                        >
                                            <FormControl sx={{ minWidth: 200 }}>
                                                <InputLabel id="status-label">
                                                    Status
                                                </InputLabel>
                                                <Select
                                                    labelId="status-label"
                                                    value={form.data.status}
                                                    label="Status"
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'status',
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <MenuItem value="draft">
                                                        Szkic
                                                    </MenuItem>
                                                    <MenuItem value="active">
                                                        Aktywne
                                                    </MenuItem>
                                                    <MenuItem value="inactive">
                                                        Nieaktywne
                                                    </MenuItem>
                                                    <MenuItem value="finished">
                                                        Zakończone
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>

                                            <DateTimePicker
                                                label="Start"
                                                value={startsAtDay}
                                                onChange={handleStartsAtChange}
                                            />
                                            <DateTimePicker
                                                label="End"
                                                value={endsAtDay}
                                                onChange={handleEndsAtChange}
                                            />
                                        </Stack>

                                        {/* Titles and texts */}
                                        <Stack spacing={2}>
                                            <TextField
                                                label="Tytuł (title)"
                                                value={form.data.title}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'title',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <TextField
                                                label="Text (text)"
                                                value={form.data.text}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'text',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <TextField
                                                label="Welcome title"
                                                value={form.data.welcome_title}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'welcome_title',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <TextField
                                                label="Welcome text"
                                                value={form.data.welcome_text}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'welcome_text',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Stack>

                                        {/* Image section */}
                                        <Stack spacing={2}>
                                            <Typography variant="h6">
                                                Obrazek powitalny
                                            </Typography>
                                            {event.image ? (
                                                <Box>
                                                    <CardMedia
                                                        component="img"
                                                        src={
                                                            background(
                                                                event.uuid,
                                                            ).url ?? ''
                                                        }
                                                        alt="Obrazek powitalny"
                                                        sx={{
                                                            maxHeight: 300,
                                                            objectFit:
                                                                'contain',
                                                        }}
                                                    />
                                                    <Typography variant="caption">
                                                        Aktualny obrazek. Nie
                                                        trzeba przesyłać nowego,
                                                        żeby go zachować.
                                                    </Typography>
                                                </Box>
                                            ) : null}
                                            <input
                                                ref={fileInputRef}
                                                name="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    form.setData(
                                                        'image',
                                                        e.target.files
                                                            ? e.target.files[0]
                                                            : null,
                                                    )
                                                }
                                            />
                                        </Stack>

                                        {/* Colors */}
                                        <Stack
                                            direction={{
                                                xs: 'column',
                                                sm: 'row',
                                            }}
                                            spacing={2}
                                        >
                                            <MuiColorInput
                                                format="hex"
                                                value={form.data.primary_color}
                                                label="Primary color"
                                                onChange={(val) =>
                                                    form.setData(
                                                        'primary_color',
                                                        val,
                                                    )
                                                }
                                            />
                                            <MuiColorInput
                                                format="hex"
                                                value={
                                                    form.data.secondary_color
                                                }
                                                label="Secondary color"
                                                onChange={(val) =>
                                                    form.setData(
                                                        'secondary_color',
                                                        val,
                                                    )
                                                }
                                            />
                                            <MuiColorInput
                                                format="hex"
                                                value={form.data.text_color}
                                                label="Text color"
                                                onChange={(val) =>
                                                    form.setData(
                                                        'text_color',
                                                        val,
                                                    )
                                                }
                                            />
                                            <MuiColorInput
                                                format="hex"
                                                value={
                                                    form.data
                                                        .background_color_primary
                                                }
                                                label="Background primary"
                                                onChange={(val) =>
                                                    form.setData(
                                                        'background_color_primary',
                                                        val,
                                                    )
                                                }
                                            />
                                            <MuiColorInput
                                                format="hex"
                                                value={
                                                    form.data
                                                        .background_color_secondary
                                                }
                                                label="Background secondary"
                                                onChange={(val) =>
                                                    form.setData(
                                                        'background_color_secondary',
                                                        val,
                                                    )
                                                }
                                            />
                                        </Stack>

                                        <Box>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                            >
                                                Zapisz
                                            </Button>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card>
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Stack
                                            direction="row"
                                            sx={{
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography variant="h6">
                                                Podgląd
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => refreshPreview()}
                                            >
                                                <RefreshIcon />
                                            </IconButton>
                                        </Stack>

                                        <Box
                                            sx={{
                                                height: '70vh',
                                                border: '1px solid rgba(0,0,0,0.08)',
                                            }}
                                        >
                                            <iframe
                                                ref={iframeRef}
                                                src={eventUrl}
                                                title="Podgląd wydarzenia"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 0,
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Stack>
            </Box>
        </>
    );
}
