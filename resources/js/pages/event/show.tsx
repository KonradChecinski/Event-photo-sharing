import { Head, InfiniteScroll, router, useForm } from '@inertiajs/react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import {
    Alert,
    Box,
    Button,
    CardMedia,
    Container,
    CssBaseline,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    LinearProgress,
    Stack,
    ThemeProvider,
    Typography,
    createTheme,
    ImageList,
    ImageListItem,
} from '@mui/material';
import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { Keyboard, Navigation, Pagination, Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import { destroy, store } from '@/routes/guest/photos';

type Photo = { uuid: string; thumbnail: string; preview: string; createdAt: string };
type PageProps = {
    event: {
        uuid: string;
        name: string;
        status: string;
        title: string;
        text: string;
        welcomeTitle: string;
        welcomeText: string;
        colors: {
            primary: string;
            secondary: string;
            text: string;
            background_primary: string;
            background_secondary: string;
        };
        image:  string;
    };
    photos: { data: Photo[] };
};

export default function EventShow({ event, photos }: PageProps) {
    const picker = useRef<HTMLInputElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [fullScreen, setFullScreen] = useState(false);
    const reducedMotion = useReducedMotion();
    const form = useForm<{ photos: File[] }>({ photos: [] });
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
    const theme = createTheme({
        palette: {
            primary: { main: event.colors.primary },
            secondary: { main: event.colors.secondary },
            background: { default: event.colors.background_primary, paper: event.colors.background_secondary },
            text: { primary: event.colors.text },
        },
        typography: { fontFamily: 'CaveatBrush ,Inter, system-ui, sans-serif' },
    });

    const splitTitle = (title: string) => {
        return title.split('&').map(name => name.trim());
    };


    function upload(files: FileList | null): void {
        if (! files?.length) {
            return;
        }

        const maxFiles = 20;
        const perFileMaxBytes = 20 * 1024 * 1024; // 20 MB
        const maxTotalBytes = 50 * 1024 * 1024; // 50 MB

        if (files.length > maxFiles) {
            setUploadError(`Wybrano ${files.length} plików — maksymalnie ${maxFiles} jest dozwolone. Zmniejsz ilość zdjęć i spróbuj ponownie.`);

            return;
        }

        const tooLarge = Array.from(files).find(f => f.size > perFileMaxBytes);

        if (tooLarge) {
            setUploadError(`Plik "${tooLarge.name}" ma rozmiar ${(tooLarge.size / 1024 / 1024).toFixed(2)} MB — maksymalnie ${perFileMaxBytes / 1024 / 1024} MB na plik. Zmniejsz rozmiar zdjęcia i spróbuj ponownie.`);

            return;
        }

        const total = Array.from(files).reduce((sum, f) => sum + f.size, 0);

        if (total > maxTotalBytes) {
            setUploadError(`Łączny rozmiar plików (${(total / 1024 / 1024).toFixed(2)} MB) przekracza limit ${maxTotalBytes / 1024 / 1024} MB.`);

            return;
        }

        setUploadError(null);
        form.setData('photos', Array.from(files));
        form.post(store({ event }).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();

                if (picker.current) {
                    picker.current.value = '';
                }
            },
            onError: () => {
                setUploadError('Wystąpił błąd podczas wysyłania.');
            },
        });
    }

    function closeLightbox(): void {
        setActiveIndex(null);
        setFullScreen(false);
    }

    function confirmDelete(): void {
        if (!photoToDelete) {
            return;
        }

        router.delete(
            destroy({
                event,
                photo: photoToDelete,
            }).url,
            {
                preserveScroll: true,
                onSuccess: () => setPhotoToDelete(null),
                onError: () => setUploadError('Usuwanie nie powiodło się.'),
            },
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Head title={event.name} />
            <Box
                component={motion.div}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0, display: 'none' }}
                transition={{ duration: 0.9, delay: 5, ease: 'easeInOut' }}
                sx={{
                    position: 'fixed',
                    width: '100vw',
                    height: '100vh',
                    inset: 0,
                    zIndex: 1500,
                    pointerEvents: 'none',
                    backgroundColor: event.colors.background_primary,
                    backgroundImage: `url(${event.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <Box
                    sx={{
                        position: 'fixed',
                        width: '100vw',
                        height: '100vh',
                        inset: 0,
                        zIndex: 1500,
                        pointerEvents: 'none',
                        background: `radial-gradient(circle at center, #00000000 0%, ${event.colors.background_primary} 100%)`,
                    }}
                ></Box>
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        textAlign: 'center',
                        px: 3,
                        color: event.colors.text,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 28, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                letterSpacing: 1.6,
                                textTransform: 'uppercase',
                                lineHeight: 1.05,
                                fontSize: { xs: '2.3rem', md: '5rem' },
                            }}
                        >
                            {splitTitle(event.welcomeTitle)[0]}
                        </Typography>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: 0.55,
                                duration: 0.9,
                                ease: 'easeOut',
                            }}
                            style={{ margin: '12px 0 18px' }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    opacity: 0.9,
                                    letterSpacing: 6,
                                    textTransform: 'uppercase',
                                    fontWeight: 500,
                                    fontSize: { xs: '0.75rem', md: '1rem' },
                                }}
                            >
                                &amp;
                            </Typography>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.95,
                                duration: 0.9,
                                ease: 'easeOut',
                            }}
                        >
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: 1.6,
                                    textTransform: 'uppercase',
                                    lineHeight: 1.05,
                                    fontSize: { xs: '2.3rem', md: '5rem' },
                                }}
                            >
                                {splitTitle(event.welcomeTitle)[1]}
                            </Typography>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 1.4,
                            duration: 0.9,
                            ease: 'easeOut',
                        }}
                        style={{ marginTop: 30 }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                opacity: 0.85,
                                letterSpacing: 4,
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', md: '1rem' },
                            }}
                        >
                            {event.welcomeText ||
                                'Dziękujemy, że jesteście z nami'}
                        </Typography>
                    </motion.div>
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    minHeight: '100vh',
                    backgroundColor: `${event.colors.background_primary}dd`, // Główny, jasny kolor tła (pobrany ze serwera)
                    backgroundImage: `url(${event.image})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center top',
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                    // overflow: 'hidden',
                    backgroundBlendMode: 'multiply',
                }}
            >
                <Box
                    sx={{
                        // position: 'absolute',
                        // top: 0,
                        // left: 0,
                        height: '100%',
                        minHeight: '100vh',
                        width: '100%',
                        backgroundColor: `${event.colors.background_primary}80`, // Główny, ciemny kolor tła (pobrany ze serwera)
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            minHeight: '100vh',
                            background: `linear-gradient(180deg, ${event.colors.background_primary}00 0%, ${event.colors.background_primary} 360px, ${event.colors.background_primary} 100%)`,
                            opacity: 1,
                        }}
                    >
                        <Box
                            sx={{
                                position: 'relative',
                                zIndex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 3,
                            }}
                        >
                            {/* Twoja treść */}
                            <Container maxWidth="lg">
                                <Stack
                                    spacing={4}
                                    sx={{ alignItems: 'center' }}
                                >
                                    <Box>
                                        <Typography
                                            variant="h4"
                                            align={'center'}
                                            sx={{ fontWeight: 800 }}
                                        >
                                            {event.title}
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            align={'center'}
                                            sx={{
                                                opacity: 0.85,
                                                maxWidth: 520,
                                            }}
                                        >
                                            {event.text}
                                        </Typography>
                                    </Box>

                                    {event.status === 'active' ? (
                                        <>
                                            <input
                                                ref={picker}
                                                hidden
                                                multiple
                                                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                                                type="file"
                                                onChange={(input) =>
                                                    upload(input.target.files)
                                                }
                                            />
                                            <Button
                                                size="large"
                                                variant="contained"
                                                startIcon={
                                                    <AddPhotoAlternateIcon />
                                                }
                                                onClick={() =>
                                                    picker.current?.click()
                                                }
                                                sx={{
                                                    alignSelf: 'center',
                                                    borderRadius: 8,
                                                    px: 3,
                                                    py: 1.5,
                                                }}
                                            >
                                                Dodaj zdjęcia
                                            </Button>
                                            {uploadError && (
                                                <Alert severity="error" sx={{ mt: 2 }}>
                                                    {uploadError}
                                                </Alert>
                                            )}
                                            {form.progress && (
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={
                                                        form.progress.percentage
                                                    }
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <Alert severity="info">
                                            To wydarzenie nie przyjmuje już
                                            nowych zdjęć.
                                        </Alert>
                                    )}

                                    <Typography
                                        variant="h5"
                                        sx={{ fontWeight: 700 }}
                                    >
                                        Twoje zdjęcia
                                    </Typography>
                                    <InfiniteScroll
                                        data="photos"
                                        buffer={300}
                                        loading={<LinearProgress />}
                                        style={{ marginTop: '0px' }}
                                    >
                                        <ImageList
                                            variant="masonry"
                                            cols={2}
                                            gap={8}
                                            sx={{ marginTop: '0px' }}
                                        >
                                            {photos.data.map((photo, index) => (
                                                <ImageListItem
                                                    key={photo.uuid}
                                                    component={motion.div}
                                                    whileHover={
                                                        reducedMotion
                                                            ? undefined
                                                            : { y: -4 }
                                                    }
                                                    sx={{
                                                        position: 'relative',
                                                        borderRadius: 3,
                                                    }}
                                                >
                                                    <Box
                                                        component={'img'}
                                                        src={photo.thumbnail}
                                                        alt="Zdjęcie z wydarzenia"
                                                        loading="lazy"
                                                        onClick={() =>
                                                            setActiveIndex(
                                                                index,
                                                            )
                                                        }
                                                        sx={{
                                                            cursor: 'zoom-in',
                                                            borderRadius: 3,
                                                        }}
                                                    />
                                                    <IconButton
                                                        aria-label="Usuń zdjęcie"
                                                        onClick={() => setPhotoToDelete(photo)}
                                                        sx={{
                                                            position:
                                                                'absolute',
                                                            right: 4,
                                                            bottom: 4,
                                                            bgcolor:
                                                                'rgba(0,0,0,.55)',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </ImageListItem>
                                            ))}
                                        </ImageList>
                                    </InfiniteScroll>
                                    {!photos.data.length && (
                                        <Typography sx={{ opacity: 0.8 }}>
                                            Nie masz jeszcze żadnych zdjęć.
                                        </Typography>
                                    )}
                                </Stack>
                            </Container>
                        </Box>
                    </Box>
                </Box>
            </Box>


            <Dialog
                open={activeIndex !== null}
                onClose={closeLightbox}
                fullScreen={fullScreen}
                maxWidth="xl"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            // bgcolor: '#050505',
                            overflow: 'hidden',
                            borderRadius: 3,
                        }
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        zIndex: 2,
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1,
                    }}
                >
                    <IconButton
                        aria-label="Tryb pełnoekranowy"
                        onClick={() => setFullScreen((value) => !value)}
                        sx={{ color: 'white', bgcolor: 'rgba(0,0,0,.55)' }}
                    >
                        {fullScreen ? (
                            <FullscreenExitIcon />
                        ) : (
                            <FullscreenIcon />
                        )}
                    </IconButton>
                    <IconButton
                        aria-label="Zamknij galerię"
                        onClick={closeLightbox}
                        sx={{ color: 'white', bgcolor: 'rgba(0,0,0,.55)' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                {activeIndex !== null && (
                    <Swiper
                        key={`${activeIndex}-${photos.data.length}`}
                        initialSlide={activeIndex}
                        modules={[Keyboard, Navigation, Pagination, Zoom]}
                        // loop={true}
                        navigation
                        pagination={{ type: 'fraction' }}
                        keyboard={{ enabled: true }}
                        zoom={{ maxRatio: 4, minRatio: 1 }}
                        onSlideChange={(swiper: SwiperInstance) =>
                            setActiveIndex(swiper.activeIndex)
                        }
                        style={{
                            width: '100%',
                            height: fullScreen ? '100vh' : 'min(85vh, 900px)',
                        }}
                    >
                        {photos.data.map((photo) => (
                            <SwiperSlide key={photo.uuid}>
                                <div className="swiper-zoom-container">
                                    <img
                                        src={photo.preview}
                                        alt="Zdjęcie z wydarzenia"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </Dialog>

            <Dialog open={!!photoToDelete} onClose={() => setPhotoToDelete(null)} maxWidth="sm" fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                // bgcolor: '#050505',
                                overflow: 'hidden',
                                borderRadius: 3,
                            }
                        }
                    }}>
                <DialogTitle>Czy na pewno chcesz usunąć zdjęcie?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Zdjęcie zostanie ukryte i nie będzie go już widać.
                    </Typography>
                    {photoToDelete && (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <CardMedia component="img" src={photoToDelete.thumbnail} alt="Wybrane zdjęcie" sx={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} />
                        </Box>
                    )}
                    <Typography sx={{ mt: 2, fontWeight: 700 }}>
                        Czy chcesz usunąć powyższe zdjęcie?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPhotoToDelete(null)}>Nie</Button>
                    <Button color="error" onClick={confirmDelete}>Tak</Button>
                </DialogActions>
            </Dialog>

        </ThemeProvider>
    );
}
