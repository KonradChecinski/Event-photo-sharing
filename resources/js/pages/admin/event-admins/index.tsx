import { Head, router, useForm } from '@inertiajs/react';
import { Add, AdminPanelSettingsOutlined, Edit, EventAvailable, EmailOutlined } from '@mui/icons-material';
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
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

type Event = { id: number; uuid: string; name: string };
type Admin = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    managed_events: Event[];
    roles: { id: number; name: 'event_admin' | 'superadmin' }[];
};

export default function EventAdmins({
    admins,
    events,
}: {
    admins: Admin[];
    events: Event[];
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [editing, setEditing] = useState<Admin | null>(null);
    const [open, setOpen] = useState(false);
    const form = useForm<{
        name: string;
        email: string;
        is_active: boolean;
        event_ids: number[];
        role: 'event_admin' | 'superadmin';
    }>({ name: '', email: '', is_active: true, event_ids: [], role: 'event_admin' });
    const start = (admin?: Admin) => {
        setEditing(admin ?? null);
        form.setData({
            name: admin?.name ?? '',
            email: admin?.email ?? '',
            is_active: admin?.is_active ?? true,
            event_ids: admin?.managed_events.map((event) => event.id) ?? [],
            role: admin?.roles[0]?.name ?? 'event_admin',
        });
        setOpen(true);
    };
    const save = () => {
        const options = {
            onSuccess: () => {
                setOpen(false);
                enqueueSnackbar(
                    editing
                        ? 'Administrator zaktualizowany.'
                        : 'Administrator utworzony.',
                    { variant: 'success' },
                );
            },
            onError: () =>
                enqueueSnackbar('Sprawdź poprawność formularza.', {
                    variant: 'error',
                }),
        };
        if (editing)
            router.patch(
                `/admin/event-admins/${editing.id}`,
                form.data,
                options,
            );
        else router.post('/admin/event-admins', form.data, options);
    };

    return (
        <>
            <Head title="Administratorzy eventów" />
            <Box
                component="main"
                sx={{
                    width: '100%',
                    p: { xs: 2, md: 3 },
                }}
            >
                <Box
                    component="header"
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { md: 'flex-end' },
                        justifyContent: 'space-between',
                        gap: 2,
                        mb: 3,
                        pb: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box>
                        <Typography
                            variant="overline"
                            sx={{
                                display: 'block',
                                color: 'primary.main',
                                fontWeight: 700,
                                letterSpacing: '.12em',
                            }}
                        >
                            Administracja
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                mt: 0.25,
                                fontSize: '1.875rem',
                                lineHeight: 1.2,
                                fontWeight: 750,
                                letterSpacing: '-.03em',
                            }}
                        >
                            Administratorzy eventów
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.75 }}
                        >
                            Twórz konta, przypisuj eventy i zarządzaj ich
                            dostępem.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => start()}
                    >
                        Dodaj administratora
                    </Button>
                </Box>
                <Stack spacing={1.5}>
                    {admins.map((admin) => (
                        <Paper
                            key={admin.id}
                            variant="outlined"
                            sx={{
                                p: { xs: 2, md: 2.25 },
                                bgcolor: 'background.paper',
                                boxShadow: 'none',
                                borderRadius: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { sm: 'center' },
                                    justifyContent: 'space-between',
                                    gap: 2,
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 700 }}
                                        >
                                            {admin.name}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={
                                                admin.is_active
                                                    ? 'Aktywne'
                                                    : 'Nieaktywne'
                                            }
                                            color={
                                                admin.is_active
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            variant="outlined"
                                        />
                                        <Chip
                                            size="small"
                                            icon={<AdminPanelSettingsOutlined />}
                                            label={admin.roles[0]?.name === 'superadmin' ? 'Superadmin' : 'Event Admin'}
                                            color={admin.roles[0]?.name === 'superadmin' ? 'primary' : 'default'}
                                            variant="outlined"
                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 0.75,
                                            mt: 0.75,
                                            color: 'text.secondary',
                                        }}
                                    >
                                        <EmailOutlined fontSize="small" />
                                        <Typography variant="body2">
                                            {admin.email}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 0.75,
                                            flexWrap: 'wrap',
                                            mt: 1.25,
                                        }}
                                    >
                                        <EventAvailable
                                            fontSize="small"
                                            color="action"
                                        />
                                        {admin.managed_events.length ? (
                                            admin.managed_events.map(
                                                (event) => (
                                                    <Chip
                                                        key={event.id}
                                                        label={event.name}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ),
                                            )
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Brak przypisanych eventów
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<Edit />}
                                    onClick={() => start(admin)}
                                >
                                    Edytuj
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
                {admins.length === 0 && (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            borderStyle: 'dashed',
                        }}
                    >
                        <Typography sx={{ fontWeight: 700 }}>
                            Brak administratorów eventów
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Dodaj konto administratora i przypisz mu co najmniej
                            jeden event.
                        </Typography>
                    </Paper>
                )}
            </Box>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editing
                        ? 'Edytuj administratora'
                        : 'Nowy administrator eventów'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Imię i nazwisko"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            error={!!form.errors.name}
                            helperText={form.errors.name}
                            autoFocus
                        />
                        <TextField
                            label="E-mail"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            error={!!form.errors.email}
                            helperText={form.errors.email}
                        />
                        <Select
                            value={form.data.role}
                            onChange={(event) => form.setData('role', event.target.value as 'event_admin' | 'superadmin')}
                        >
                            <MenuItem value="event_admin">Event Admin</MenuItem>
                            <MenuItem value="superadmin">Superadmin</MenuItem>
                        </Select>
                        {form.data.role === 'event_admin' && <Select
                            multiple
                            value={form.data.event_ids}
                            displayEmpty
                            onChange={(event) =>
                                form.setData(
                                    'event_ids',
                                    event.target.value as number[],
                                )
                            }
                            renderValue={(ids) =>
                                ids.length
                                    ? events
                                          .filter((event) =>
                                              ids.includes(event.id),
                                          )
                                          .map((event) => event.name)
                                          .join(', ')
                                    : 'Wybierz eventy'
                            }
                        >
                            {events.map((event) => (
                                <MenuItem key={event.id} value={event.id}>
                                    <Checkbox
                                        checked={form.data.event_ids.includes(
                                            event.id,
                                        )}
                                    />
                                    <ListItemText primary={event.name} />
                                </MenuItem>
                            ))}
                        </Select>}
                        {editing && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.data.is_active}
                                        onChange={(_, checked) =>
                                            form.setData('is_active', checked)
                                        }
                                    />
                                }
                                label="Konto aktywne"
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setOpen(false)}>
                        Anuluj
                    </Button>
                    <Button
                        variant="contained"
                        onClick={save}
                        disabled={form.processing}
                    >
                        Zapisz
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
