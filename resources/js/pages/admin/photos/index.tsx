import { Head, router } from '@inertiajs/react';
import {
    Check,
    Close,
    DeleteOutlined,
    Download,
    PlayArrow,
    Stop,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    ImageList,
    ImageListItem,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { motion } from 'motion/react';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import {
    A11y,
    Autoplay,
    Keyboard,
    Navigation,
    Pagination,
    Zoom,
} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

type Photo = {
    uuid: string;
    thumbnail: string;
    preview: string;
    deletedAt?: string | null;
    createdAt: string;
    guest: string;
};
type Event = { uuid: string; name: string };
type Paginated = { data: Photo[] };

export default function PhotosIndex({
    event,
    photos,
}: {
    event: Event;
    photos: Paginated;
}) {
    const { enqueueSnackbar } = useSnackbar();
    const wide = useMediaQuery('(min-width:1536px)');
    const desktop = useMediaQuery('(min-width:1200px)');
    const tablet = useMediaQuery('(min-width:900px)');
    const columns = wide ? 7 : desktop ? 6 : tablet ? 5 : 3;
    const [selected, setSelected] = useState<string[]>([]);
    const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
    const [grouped, setGrouped] = useState(false);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [slideshow, setSlideshow] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [allDialog, setAllDialog] = useState(false);
    const ordered = useMemo(
        () =>
            [...photos.data].sort((a, b) =>
                sort === 'newest'
                    ? b.createdAt.localeCompare(a.createdAt)
                    : a.createdAt.localeCompare(b.createdAt),
            ),
        [photos.data, sort],
    );
    const groups = useMemo(
        () =>
            grouped
                ? Object.values(
                      ordered.reduce<Record<string, Photo[]>>((all, photo) => {
                          (all[photo.guest] ??= []).push(photo);
                          return all;
                      }, {}),
                  )
                : [ordered],
        [grouped, ordered],
    );
    const closeViewer = () => {
        setViewerIndex(null);
        setSlideshow(false);
    };
    const toggle = (uuid: string) =>
        setSelected((ids) =>
            ids.includes(uuid)
                ? ids.filter((id) => id !== uuid)
                : [...ids, uuid],
        );
    const downloadZip = async (body: Record<string, unknown>) => {
        try {
            const response = await fetch(
                `/admin/events/${event.uuid}/photos/zip`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/zip',
                        'X-CSRF-TOKEN':
                            document.querySelector<HTMLMetaElement>(
                                'meta[name="csrf-token"]',
                            )?.content ?? '',
                    },
                    body: JSON.stringify(body),
                },
            );
            if (!response.ok) throw new Error();
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement('a');
            link.href = url;
            link.download = `${event.name}.zip`;
            link.click();
            URL.revokeObjectURL(url);
            enqueueSnackbar('Archiwum jest gotowe do pobrania.', {
                variant: 'success',
            });
        } catch {
            enqueueSnackbar('Nie udało się przygotować archiwum.', {
                variant: 'error',
            });
        }
    };
    const remove = () =>
        router.delete(`/admin/events/${event.uuid}/photos`, {
            data: { photos: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                setDeleteDialog(false);
                enqueueSnackbar('Zdjęcia usunięto trwale.', {
                    variant: 'success',
                });
            },
            onError: () =>
                enqueueSnackbar('Nie udało się usunąć zdjęć.', {
                    variant: 'error',
                }),
        });

    return (
        <>
            <Head title={`Galeria — ${event.name}`} />
            <Box component="main" sx={{ width: '100%', p: { xs: 2, md: 3 } }}>
                <Box
                    component="header"
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { md: 'flex-end' },
                        gap: 2,
                        mb: 2.5,
                        pb: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box>
                        <Typography variant="overline" sx={{ display: 'block', color: 'primary.main', fontWeight: 700, letterSpacing: '.12em' }}>Galeria eventu</Typography>
                        <Typography variant="h4" sx={{ mt: .25, fontSize: '1.875rem', lineHeight: 1.2, fontWeight: 750, letterSpacing: '-.03em' }}>{event.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: .75 }}>{photos.data.length} zdjęć na bieżącej stronie</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                        <Button
                            variant="outlined"
                            href={`/admin/events/${event.uuid}`}
                        >
                            Ustawienia
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setAllDialog(true)}
                        >
                            Pobierz wszystkie
                        </Button>
                        {selected.length > 0 && (
                            <>
                                <Button
                                    variant="contained"
                                    startIcon={<Download />}
                                    onClick={() =>
                                        downloadZip({ photos: selected })
                                    }
                                >
                                    Pobierz ({selected.length})
                                </Button>
                                <Button
                                    color="error"
                                    variant="contained"
                                    startIcon={<DeleteOutlined />}
                                    onClick={() => setDeleteDialog(true)}
                                >
                                    Usuń zaznaczone
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
                <Paper
                    variant="outlined"
                    className="mb-5"
                    sx={{
                        p: 1.25,
                        borderRadius: 2,
                        boxShadow: 'none',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 1.5 }}>
                        <Select
                            size="small"
                            value={sort}
                            sx={{
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'divider',
                                },
                                '& .MuiSvgIcon-root': { color: 'text.secondary' },
                            }}
                            onChange={(change) => {
                                const value = change.target.value as
                                    'newest' | 'oldest';
                                setSort(value);
                                router.get(
                                    `/admin/events/${event.uuid}/photos`,
                                    { sort: value },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            <MenuItem value="newest">
                                Najnowsze najpierw
                            </MenuItem>
                            <MenuItem value="oldest">
                                Najstarsze najpierw
                            </MenuItem>
                        </Select>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={grouped}
                                    onChange={(_, value) => setGrouped(value)}
                                />
                            }
                            label="Grupuj według użytkownika"
                        />
                    </Box>
                </Paper>
                {groups.map((group, number) => (
                    <Box
                        component="section"
                        key={grouped ? group[0]?.guest : 'all'}
                        sx={{ mb: 3.5 }}
                    >
                        {grouped && (
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Użytkownik {number + 1}</Typography>
                        )}
                        <ImageList
                            variant="masonry"
                            cols={columns}
                            gap={10}
                            sx={{ m: 0 }}
                        >
                            {group.map((photo) => {
                                const index = ordered.findIndex(
                                    ({ uuid }) => uuid === photo.uuid,
                                );
                                const isSelected = selected.includes(
                                    photo.uuid,
                                );
                                return (
                                    <ImageListItem
                                        key={photo.uuid}
                                        component={motion.div}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        sx={{
                                            position: 'relative',
                                            overflow: 'hidden',
                                            borderRadius: 1.5,
                                            cursor: isSelected
                                                ? 'default'
                                                : 'zoom-in',
                                            border: isSelected
                                                ? '3px solid'
                                                : '3px solid',
                                            borderColor: isSelected
                                                ? 'primary.main'
                                                : 'transparent',
                                            '&:hover .photo-actions': {
                                                opacity: isSelected ? 0 : 1,
                                            },
                                        }}
                                        onClick={() =>
                                            !isSelected && setViewerIndex(index)
                                        }
                                    >
                                        <img
                                            src={photo.thumbnail}
                                            alt="Zdjęcie z wydarzenia"
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                display: 'block',
                                                filter: photo.deletedAt
                                                    ? 'brightness(.65)'
                                                    : undefined,
                                            }}
                                        />
                                        {photo.deletedAt && (
                                            <Chip
                                                label="USUNIĘTE PRZEZ UŻYTKOWNIKA"
                                                size="small"
                                                color="warning"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    left: 8,
                                                    zIndex: 2,
                                                    fontSize: 10,
                                                }}
                                            />
                                        )}
                                        {isSelected ? (
                                            <Tooltip title="Odznacz">
                                                <Checkbox
                                                    checked={true}
                                                    onClick={(click) => {
                                                        click.stopPropagation();
                                                        toggle(photo.uuid);
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 5,
                                                        right: 5,
                                                        zIndex: 20,
                                                        opacity: 1,
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            </Tooltip>
                                        ) : (
                                            <Box
                                                className="photo-actions"
                                                onClick={(click) =>
                                                    click.stopPropagation()
                                                }
                                                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 20, display: 'flex', gap: .5, p: .5, opacity: 0, borderRadius: 1, bgcolor: 'rgba(15, 23, 42, .88)', boxShadow: 3, transition: 'opacity .15s' }}
                                            >
                                                <Tooltip title="Pobierz">
                                                    <IconButton
                                                        size="small"
                                                        component="a"
                                                        href={`/admin/events/${event.uuid}/photos/${photo.uuid}/download`}
                                                        sx={{
                                                            color: 'inherit',
                                                        }}
                                                    >
                                                        <Download fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Zaznacz">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            toggle(photo.uuid)
                                                        }
                                                        sx={{
                                                            color: 'inherit',
                                                        }}
                                                    >
                                                        <Checkbox
                                                            size="small"
                                                            sx={{
                                                                p: 0,
                                                                color: 'inherit',
                                                            }}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Usuń trwale">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            setSelected([
                                                                photo.uuid,
                                                            ]);
                                                            setDeleteDialog(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <DeleteOutlined fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        )}
                                        {!isSelected && (
                                            <Checkbox
                                                checked={false}
                                                onClick={(click) => {
                                                    click.stopPropagation();
                                                    toggle(photo.uuid);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 5,
                                                    right: 5,
                                                    zIndex: 20,
                                                    opacity: 0.9,
                                                    // bgcolor:
                                                    //     'rgba(255,255,255,.84)',
                                                    borderRadius: 1,
                                                }}
                                            />
                                        )}
                                    </ImageListItem>
                                );
                            })}
                        </ImageList>
                    </Box>
                ))}
            </Box>
            <Dialog
                open={viewerIndex !== null}
                onClose={closeViewer}
                fullScreen
            >
                <Box
                    sx={{
                        bgcolor: '#101827',
                        height: '100%',
                        color: 'common.white',
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 20, height: 64, px: { xs: 1.5, sm: 2.5 }, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {viewerIndex === null ? 0 : viewerIndex + 1} /{' '}
                                {ordered.length}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.62)' }}>Podgląd zdjęcia</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                            <Button
                                color="inherit"
                                size="small"
                                startIcon={slideshow ? <Stop /> : <PlayArrow />}
                                onClick={() => setSlideshow(!slideshow)}
                                sx={{ alignSelf: 'center' }}
                            >
                                {slideshow ? 'Zatrzymaj' : 'Pokaz slajdów'}
                            </Button>
                            <IconButton
                                aria-label="Zamknij podgląd"
                                onClick={closeViewer}
                                sx={{ color: 'inherit', ml: 1 }}
                            >
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>
                    <Swiper
                        key={slideshow ? 'slideshow' : 'manual'}
                        modules={[
                            Navigation,
                            Pagination,
                            Zoom,
                            Keyboard,
                            A11y,
                            Autoplay,
                        ]}
                        initialSlide={viewerIndex ?? 0}
                        navigation
                        pagination={{ type: 'fraction' }}
                        zoom
                        keyboard
                        autoplay={
                            slideshow
                                ? {
                                      delay: 3500,
                                      disableOnInteraction: false,
                                      pauseOnMouseEnter: true,
                                  }
                                : false
                        }
                        style={{ height: 'calc(100% - 64px)' }}
                    >
                        {ordered.map((photo) => (
                            <SwiperSlide key={photo.uuid}>
                                <Box className="swiper-zoom-container">
                                    <img
                                        src={photo.preview}
                                        alt="Podgląd zdjęcia"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </Box>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>
            </Dialog>
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Usunąć zdjęcia permanentnie?</DialogTitle>
                <DialogContent>
                    Ta operacja jest nieodwracalna i usuwa pliki ze Storage.
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setDeleteDialog(false)}>
                        Anuluj
                    </Button>
                    <Button color="error" variant="contained" onClick={remove}>
                        Usuń trwale
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={allDialog} onClose={() => setAllDialog(false)}>
                <DialogTitle>Pobierz wszystkie zdjęcia</DialogTitle>
                <DialogContent>
                    Czy dołączyć zdjęcia usunięte przez gości imprezy?
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setAllDialog(false)}>
                        Anuluj
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setAllDialog(false);
                            downloadZip({
                                all: true,
                                include_guest_deleted: false,
                            });
                        }}
                    >
                        Nie, pomiń
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setAllDialog(false);
                            downloadZip({
                                all: true,
                                include_guest_deleted: true,
                            });
                        }}
                    >
                        Tak, dołącz
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
