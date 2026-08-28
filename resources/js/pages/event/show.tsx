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
    Card,
    CardMedia,
    Container,
    CssBaseline,
    Dialog,
    Grid,
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
        welcomeTitle: string;
        welcomeText: string;
        colors: {
            primary: string;
            secondary: string;
            text: string;
            background: string
        };
        images: {
            welcome: string;
        }
    };
    photos: { data: Photo[] };
};

export default function EventShow({ event, photos }: PageProps) {
    const picker = useRef<HTMLInputElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [fullScreen, setFullScreen] = useState(false);
    const reducedMotion = useReducedMotion();
    const form = useForm<{ photos: File[] }>({ photos: [] });
    const theme = createTheme({
        palette: {
            primary: { main: event.colors.primary },
            secondary: { main: event.colors.secondary },
            background: { default: event.colors.background },
            text: { primary: event.colors.text },
        },
        typography: { fontFamily: 'CaveatBrush ,Inter, system-ui, sans-serif' },
    });

    function upload(files: FileList | null): void {
        if (! files?.length) {
            return;
        }

        form.setData('photos', Array.from(files));
        form.post(store({ event }).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    function closeLightbox(): void {
        setActiveIndex(null);
        setFullScreen(false);
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Head title={event.name} />
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    minHeight: '100vh',
                    backgroundColor: `${event.colors.background}dd`, // Główny, jasny kolor tła (pobrany ze serwera)
                    backgroundImage: `url(${event.images.welcome})`,
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
                        backgroundColor: `${event.colors.background}80`, // Główny, ciemny kolor tła (pobrany ze serwera)
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            minHeight: '100vh',
                            background: `linear-gradient(180deg, ${event.colors.background}00 0%, ${event.colors.background} 360px, ${event.colors.background} 100%)`,
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
                                            {event.welcomeTitle}
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            align={'center'}
                                            sx={{
                                                opacity: 0.85,
                                                maxWidth: 520,
                                            }}
                                        >
                                            {event.welcomeText}
                                        </Typography>
                                    </Box>

                                    {event.status === 'active' ? (
                                        <>
                                            <input
                                                ref={picker}
                                                hidden
                                                multiple
                                                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
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
                                                        onClick={() => {
                                                            // if (
                                                            //     confirm(
                                                            //         'Usunąć zdjęcie z Twojej galerii?',
                                                            //     )
                                                            // )
                                                            router.delete(
                                                                destroy({
                                                                    event,
                                                                    photo,
                                                                }).url,
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }}
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

            {/*to koniec*/}
            {/*<Box*/}
            {/*    sx={{*/}
            {/*        minHeight: '100vh',*/}
            {/*        py: { xs: 5, md: 8 },*/}
            {/*        background: `radial-gradient(circle at 15% 15%, ${event.colors.secondary}55, transparent 35%), ${event.colors.background}`,*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Container maxWidth="md">*/}
            {/*        <Stack spacing={4}>*/}
            {/*            <Box*/}
            {/*                component={motion.div}*/}
            {/*                initial={*/}
            {/*                    reducedMotion ? false : { opacity: 0, y: 20 }*/}
            {/*                }*/}
            {/*                animate={{ opacity: 1, y: 0 }}*/}
            {/*            >*/}
            {/*                <Typography*/}
            {/*                    variant="h2"*/}
            {/*                    align={'center'}*/}
            {/*                    sx={{ fontWeight: 800 }}*/}
            {/*                >*/}
            {/*                    {event.welcomeTitle}*/}
            {/*                </Typography>*/}
            {/*                <Typography*/}
            {/*                    variant="h6"*/}
            {/*                    align={'center'}*/}
            {/*                    sx={{ opacity: 0.85, maxWidth: 520 }}*/}
            {/*                >*/}
            {/*                    {event.welcomeText}*/}
            {/*                </Typography>*/}
            {/*            </Box>*/}

            {/*            {event.status === 'active' ? (*/}
            {/*                <>*/}
            {/*                    <input*/}
            {/*                        ref={picker}*/}
            {/*                        hidden*/}
            {/*                        multiple*/}
            {/*                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"*/}
            {/*                        type="file"*/}
            {/*                        onChange={(input) =>*/}
            {/*                            upload(input.target.files)*/}
            {/*                        }*/}
            {/*                    />*/}
            {/*                    <Button*/}
            {/*                        size="large"*/}
            {/*                        variant="contained"*/}
            {/*                        startIcon={<AddPhotoAlternateIcon />}*/}
            {/*                        onClick={() => picker.current?.click()}*/}
            {/*                        sx={{*/}
            {/*                            alignSelf: 'start',*/}
            {/*                            borderRadius: 8,*/}
            {/*                            px: 3,*/}
            {/*                            py: 1.5,*/}
            {/*                        }}*/}
            {/*                    >*/}
            {/*                        Dodaj zdjęcia*/}
            {/*                    </Button>*/}
            {/*                    {form.progress && (*/}
            {/*                        <LinearProgress*/}
            {/*                            variant="determinate"*/}
            {/*                            value={form.progress.percentage}*/}
            {/*                        />*/}
            {/*                    )}*/}
            {/*                </>*/}
            {/*            ) : (*/}
            {/*                <Alert severity="info">*/}
            {/*                    To wydarzenie nie przyjmuje już nowych zdjęć.*/}
            {/*                </Alert>*/}
            {/*            )}*/}

            {/*            <Typography variant="h5" fontWeight={700}>*/}
            {/*                Twoje zdjęcia*/}
            {/*            </Typography>*/}
            {/*            <InfiniteScroll*/}
            {/*                data="photos"*/}
            {/*                buffer={300}*/}
            {/*                loading={<LinearProgress />}*/}
            {/*            >*/}
            {/*                <ImageList variant="masonry" cols={2} gap={8}>*/}
            {/*                    {photos.data.map((photo, index) => (*/}
            {/*                        <ImageListItem*/}
            {/*                            key={photo.uuid}*/}
            {/*                            component={motion.div}*/}
            {/*                            whileHover={*/}
            {/*                                reducedMotion*/}
            {/*                                    ? undefined*/}
            {/*                                    : { y: -4 }*/}
            {/*                            }*/}
            {/*                            sx={{*/}
            {/*                                position: 'relative',*/}
            {/*                                borderRadius: 3,*/}
            {/*                            }}*/}
            {/*                        >*/}
            {/*                            <Box*/}
            {/*                                component={'img'}*/}
            {/*                                src={photo.thumbnail}*/}
            {/*                                alt="Zdjęcie z wydarzenia"*/}
            {/*                                loading="lazy"*/}
            {/*                                onClick={() =>*/}
            {/*                                    setActiveIndex(index)*/}
            {/*                                }*/}
            {/*                                sx={{*/}
            {/*                                    cursor: 'zoom-in',*/}
            {/*                                    borderRadius: 3,*/}
            {/*                                }}*/}
            {/*                            />*/}
            {/*                            <IconButton*/}
            {/*                                aria-label="Usuń zdjęcie"*/}
            {/*                                onClick={() => {*/}
            {/*                                    // if (*/}
            {/*                                    //     confirm(*/}
            {/*                                    //         'Usunąć zdjęcie z Twojej galerii?',*/}
            {/*                                    //     )*/}
            {/*                                    // )*/}
            {/*                                    router.delete(*/}
            {/*                                        destroy({*/}
            {/*                                            event,*/}
            {/*                                            photo,*/}
            {/*                                        }).url,*/}
            {/*                                        {*/}
            {/*                                            preserveScroll: true,*/}
            {/*                                        },*/}
            {/*                                    );*/}
            {/*                                }}*/}
            {/*                                sx={{*/}
            {/*                                    position: 'absolute',*/}
            {/*                                    right: 4,*/}
            {/*                                    bottom: 4,*/}
            {/*                                    bgcolor: 'rgba(0,0,0,.55)',*/}
            {/*                                    color: 'white',*/}
            {/*                                }}*/}
            {/*                            >*/}
            {/*                                <DeleteOutlineIcon />*/}
            {/*                            </IconButton>*/}
            {/*                        </ImageListItem>*/}
            {/*                    ))}*/}
            {/*                </ImageList>*/}
            {/*                /!*<Grid container spacing={1.5}>*!/*/}
            {/*                /!*    {photos.data.map((photo, index) => (*!/*/}
            {/*                /!*        <Grid*!/*/}
            {/*                /!*            key={photo.uuid}*!/*/}
            {/*                /!*            size={{ xs: 6, sm: 4, md: 3 }}*!/*/}
            {/*                /!*        >*!/*/}
            {/*                /!*            <Card*!/*/}
            {/*                /!*                component={motion.div}*!/*/}
            {/*                /!*                whileHover={*!/*/}
            {/*                /!*                    reducedMotion*!/*/}
            {/*                /!*                        ? undefined*!/*/}
            {/*                /!*                        : { y: -4 }*!/*/}
            {/*                /!*                }*!/*/}
            {/*                /!*                sx={{*!/*/}
            {/*                /!*                    position: 'relative',*!/*/}
            {/*                /!*                    borderRadius: 3,*!/*/}
            {/*                /!*                }}*!/*/}
            {/*                /!*            >*!/*/}
            {/*                /!*                <CardMedia*!/*/}
            {/*                /!*                    component="img"*!/*/}
            {/*                /!*                    image={photo.thumbnail}*!/*/}
            {/*                /!*                    loading="lazy"*!/*/}
            {/*                /!*                    onClick={() =>*!/*/}
            {/*                /!*                        setActiveIndex(index)*!/*/}
            {/*                /!*                    }*!/*/}
            {/*                /!*                    sx={{*!/*/}
            {/*                /!*                        aspectRatio: 1,*!/*/}
            {/*                /!*                        cursor: 'zoom-in',*!/*/}
            {/*                /!*                        objectFit: 'cover',*!/*/}
            {/*                /!*                    }}*!/*/}
            {/*                /!*                />*!/*/}
            {/*                /!*                <IconButton*!/*/}
            {/*                /!*                    aria-label="Usuń zdjęcie"*!/*/}
            {/*                /!*                    onClick={() => {*!/*/}
            {/*                /!*                        if (*!/*/}
            {/*                /!*                            confirm(*!/*/}
            {/*                /!*                                'Usunąć zdjęcie z Twojej galerii?',*!/*/}
            {/*                /!*                            )*!/*/}
            {/*                /!*                        )*!/*/}
            {/*                /!*                            router.delete(*!/*/}
            {/*                /!*                                destroy({*!/*/}
            {/*                /!*                                    event,*!/*/}
            {/*                /!*                                    photo,*!/*/}
            {/*                /!*                                }).url,*!/*/}
            {/*                /!*                                {*!/*/}
            {/*                /!*                                    preserveScroll: true,*!/*/}
            {/*                /!*                                },*!/*/}
            {/*                /!*                            );*!/*/}
            {/*                /!*                    }}*!/*/}
            {/*                /!*                    sx={{*!/*/}
            {/*                /!*                        position: 'absolute',*!/*/}
            {/*                /!*                        right: 4,*!/*/}
            {/*                /!*                        bottom: 4,*!/*/}
            {/*                /!*                        bgcolor: 'rgba(0,0,0,.55)',*!/*/}
            {/*                /!*                        color: 'white',*!/*/}
            {/*                /!*                    }}*!/*/}
            {/*                /!*                >*!/*/}
            {/*                /!*                    <DeleteOutlineIcon />*!/*/}
            {/*                /!*                </IconButton>*!/*/}
            {/*                /!*            </Card>*!/*/}
            {/*                /!*        </Grid>*!/*/}
            {/*                /!*    ))}*!/*/}
            {/*                /!*</Grid>*!/*/}
            {/*            </InfiniteScroll>*/}
            {/*            {!photos.data.length && (*/}
            {/*                <Typography sx={{ opacity: 0.8 }}>*/}
            {/*                    Nie masz jeszcze żadnych zdjęć.*/}
            {/*                </Typography>*/}
            {/*            )}*/}
            {/*        </Stack>*/}
            {/*    </Container>*/}
            {/*</Box>*/}

            <Dialog
                open={activeIndex !== null}
                onClose={closeLightbox}
                fullScreen={fullScreen}
                maxWidth="xl"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#050505', overflow: 'hidden' } }}
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
        </ThemeProvider>
    );
}
