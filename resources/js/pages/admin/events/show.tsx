import { Head, useForm, usePage } from '@inertiajs/react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
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
import { background } from '@/routes/events';

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
    const isSuperadmin = (
        usePage<{ auth: { user: { roles: string[] } | null } }>().props.auth
            .user?.roles ?? []
    ).includes('superadmin');
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
        background_color_secondary:
            event.background_color_secondary || '#2D3748',
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
            <Box component="main" sx={{ width: '100%', p: { xs: 2, md: 3 } }}>
                <Stack spacing={3}>
                    <Box
                        sx={{
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            pb: 3,
                        }}
                    >
                        <Typography
                            variant="overline"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 700,
                                letterSpacing: '.12em',
                            }}
                        >
                            Konfiguracja wydarzenia
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
                                    {event.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 0.75 }}
                                >
                                    Edytuj stronę gości, status i identyfikację
                                    wizualną eventu.
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    startIcon={<ContentCopyIcon />}
                                    onClick={() =>
                                        navigator.clipboard
                                            .writeText(eventUrl)
                                            .then(() =>
                                                enqueueSnackbar(
                                                    'Link do wydarzenia skopiowany.',
                                                    { variant: 'success' },
                                                ),
                                            )
                                    }
                                >
                                    Kopiuj link
                                </Button>
                                <Button
                                    href={photosIndex(event).url}
                                    variant="contained"
                                    startIcon={<PhotoLibraryOutlinedIcon />}
                                >
                                    Galeria
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    <Grid
                        container
                        spacing={2}
                        // direction={{ xs: 'column-reverse', md: 'row' }}
                        sx={{
                            flexDirection: { xs: 'column-reverse', md: 'row' },
                        }}
                    >
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Box
                                component="form"
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
                                                fileInputRef.current.value = '';
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
                                <Stack spacing={3}>
                                    <Stack
                                        direction={{
                                            xs: 'column',
                                            sm: 'row',
                                        }}
                                        spacing={2}
                                    >
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                boxShadow: 'none',
                                                borderRadius: 2,
                                                bgcolor: 'background.paper',
                                                color: 'text.primary',
                                                flex: 1,
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
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
                                                        value={
                                                            form.data
                                                                .description
                                                        }
                                                        onChange={(e) =>
                                                            form.setData(
                                                                'description',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </Stack>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            variant="outlined"
                                            sx={{
                                                boxShadow: 'none',
                                                borderRadius: 2,
                                                bgcolor: 'background.paper',
                                                color: 'text.primary',
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                {/* Status and dates */}
                                                <Stack
                                                    direction={'column'}
                                                    spacing={2}
                                                    sx={{
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <FormControl
                                                        sx={{ width: 1 }}
                                                    >
                                                        <InputLabel id="status-label">
                                                            Status
                                                        </InputLabel>
                                                        <Select
                                                            labelId="status-label"
                                                            value={
                                                                form.data.status
                                                            }
                                                            label="Status"
                                                            onChange={(e) =>
                                                                form.setData(
                                                                    'status',
                                                                    e.target
                                                                        .value,
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
                                                            {isSuperadmin && (
                                                                <MenuItem value="finished">
                                                                    Zakończone
                                                                </MenuItem>
                                                            )}
                                                        </Select>
                                                    </FormControl>

                                                    <DateTimePicker
                                                        label="Początek"
                                                        value={startsAtDay}
                                                        sx={{ width: 1 }}
                                                        onChange={
                                                            handleStartsAtChange
                                                        }
                                                    />
                                                    <DateTimePicker
                                                        label="Zakończenie"
                                                        value={endsAtDay}
                                                        sx={{ width: 1 }}
                                                        onChange={
                                                            handleEndsAtChange
                                                        }
                                                    />
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Stack>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            boxShadow: 'none',
                                            borderRadius: 2,
                                            bgcolor: 'background.paper',
                                            color: 'text.primary',
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            {/* Titles and texts */}
                                            <Stack spacing={2}>
                                                <TextField
                                                    label="Tytuł strony"
                                                    value={form.data.title}
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <TextField
                                                    label="Tekst strony"
                                                    value={form.data.text}
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'text',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <TextField
                                                    label="Tytuł powitania"
                                                    value={
                                                        form.data.welcome_title
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'welcome_title',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <TextField
                                                    label="Tekst powitania"
                                                    value={
                                                        form.data.welcome_text
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'welcome_text',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Stack>
                                        </CardContent>
                                    </Card>

                                    <Stack
                                        spacing={2}
                                        direction={{
                                            xs: 'column',
                                            sm: 'row',
                                        }}
                                    >
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                boxShadow: 'none',
                                                borderRadius: 2,
                                                bgcolor: 'background.paper',
                                                color: 'text.primary',
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
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
                                                                Aktualny
                                                                obrazek. Nie
                                                                trzeba przesyłać
                                                                nowego, żeby go
                                                                zachować.
                                                            </Typography>
                                                        </Box>
                                                    ) : null}
                                                    <Box
                                                        component="input"
                                                        ref={fileInputRef}
                                                        name="image"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            form.setData(
                                                                'image',
                                                                e.target.files
                                                                    ? e.target
                                                                          .files[0]
                                                                    : null,
                                                            )
                                                        }
                                                    />
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                boxShadow: 'none',
                                                borderRadius: 2,
                                                bgcolor: 'background.paper',
                                                color: 'text.primary',
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                {/* Colors */}
                                                <Stack
                                                    direction={'column'}
                                                    spacing={2}
                                                >
                                                    <MuiColorInput
                                                        format="hex"
                                                        value={
                                                            form.data
                                                                .primary_color
                                                        }
                                                        label="Kolor główny"
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
                                                            form.data
                                                                .secondary_color
                                                        }
                                                        label="Kolor dodatkowy"
                                                        onChange={(val) =>
                                                            form.setData(
                                                                'secondary_color',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <MuiColorInput
                                                        format="hex"
                                                        value={
                                                            form.data.text_color
                                                        }
                                                        label="Kolor tekstu"
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
                                                        label="Tło główne"
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
                                                        label="Tło modala"
                                                        onChange={(val) =>
                                                            form.setData(
                                                                'background_color_secondary',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Stack>

                                    <Card
                                        variant="outlined"
                                        sx={{
                                            boxShadow: 'none',
                                            borderRadius: 2,
                                            bgcolor: 'background.paper',
                                            color: 'text.primary',
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    Zapisz
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid
                            size={{ xs: 12, md: 4 }}
                            sx={{ mb: { xs: 8, md: 0 } }}
                        >
                            <Stack spacing={2}>
                                <Grid container size={12} spacing={2}>
                                    {[
                                        ['Goście', stats.guests],
                                        ['Zdjęcia', stats.photos],
                                        ['Usunięte', stats.deletedPhotos],
                                    ].map(([label, value]) => (
                                        <Grid
                                            key={String(label)}
                                            size={{ xs: 12, md: 4 }}
                                        >
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    boxShadow: 'none',
                                                    borderRadius: 2,
                                                    bgcolor: 'background.paper',
                                                    color: 'text.primary',
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography color="text.secondary">
                                                        {label}
                                                    </Typography>
                                                    <Typography
                                                        variant="h3"
                                                        sx={{ fontWeight: 700 }}
                                                    >
                                                        {value}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        boxShadow: 'none',
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        color: 'text.primary',
                                        position: { md: 'sticky' },
                                        top: { md: 24 },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={2}>
                                            <Stack
                                                direction="row"
                                                sx={{
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant="h6">
                                                    Podgląd strony gościa
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        refreshPreview()
                                                    }
                                                >
                                                    <RefreshIcon />
                                                </IconButton>
                                            </Stack>

                                            <Box
                                                sx={{
                                                    height: '70vh',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 1.5,
                                                    overflow: 'hidden',
                                                    bgcolor:
                                                        'background.default',
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
                            </Stack>
                        </Grid>
                    </Grid>
                </Stack>
            </Box>
        </>
    );
}
