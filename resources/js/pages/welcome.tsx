import { Head, Link } from '@inertiajs/react';
import { CameraAlt, Collections, Shield } from '@mui/icons-material';
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
export default function Welcome() {
    return (
        <>
            <Head title="Event Photo Sharing" />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    py: 4,
                }}
            >
                <Container maxWidth="md">
                    <Stack spacing={4}>
                        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                            <CameraAlt color="primary" />
                            <Typography sx={{ fontWeight: 800 }}>
                                Event Photo Sharing
                            </Typography>
                        </Stack>
                        <Box>
                            <Typography
                                variant="h2"
                                sx={{ maxWidth: 700, fontWeight: 800 }}
                            >
                                Zdjęcia z wydarzenia. W jednym, bezpiecznym
                                miejscu.
                            </Typography>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ mt: 2, maxWidth: 630, fontWeight: 400 }}
                            >
                                Udostępnij gościom prosty link, a ich kadry
                                trafią do uporządkowanej galerii eventu.
                                Administratorzy zarządzają zdjęciami i dostępem
                                bez publicznej rejestracji.
                            </Typography>
                        </Box>
                        <Button
                            component={Link as any}
                            href="/login"
                            variant="contained"
                            size="large"
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            Logowanie dla administratorów
                        </Button>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                        >
                            {[
                                [
                                    <Collections key="c" />,
                                    'Wspólna galeria',
                                    'Goście dodają zdjęcia anonimowo przez link eventu.',
                                ],
                                [
                                    <Shield key="s" />,
                                    'Kontrola dostępu',
                                    'Administratorzy widzą wyłącznie przypisane im eventy.',
                                ],
                            ].map(([icon, title, text]) => (
                                <Paper
                                    key={String(title)}
                                    variant="outlined"
                                    sx={{ p: 2.5, flex: 1 }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ alignItems: 'center' }}
                                    >
                                        <>{icon}</>
                                        <Typography sx={{ fontWeight: 700 }}>
                                            {title}
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ mt: 1 }}
                                    >
                                        {text}
                                    </Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Stack>
                </Container>
            </Box>
        </>
    );
}
