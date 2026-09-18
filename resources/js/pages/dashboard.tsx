import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, Camera, ChevronRight, Image, Users } from 'lucide-react';

type DashboardStats = { events: number; activeEvents: number; photos: number; guests: number; guestDeletedPhotos: number };

export default function Dashboard({ stats }: { stats: DashboardStats }) {
    const events = usePage<{ navigationEvents: { uuid: string; name: string; status: string }[] }>().props.navigationEvents;
    const summary = [
        { label: 'Wydarzenia', value: stats.events, icon: CalendarDays, detail: `${stats.activeEvents} aktywnych` },
        { label: 'Zdjęcia', value: stats.photos, icon: Image, detail: `${stats.guestDeletedPhotos} usuniętych przez gości` },
        { label: 'Goście', value: stats.guests, icon: Users, detail: 'anonimowe sesje uczestników' },
    ];

    return <><Head title="Dashboard" /><main className="mx-auto w-full max-w-7xl px-5 py-7 md:px-8 md:py-9">
        <section className="mb-7 flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 dark:border-slate-700/80 md:flex-row md:items-end">
            <div><p className="mb-2 text-xs font-semibold tracking-[0.16em] text-blue-600 uppercase dark:text-blue-300">Panel administracyjny</p><h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Przegląd wydarzeń</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">Dane dotyczą wyłącznie eventów, do których masz przydzielony dostęp.</p></div>
            <Link href="/admin" className="inline-flex items-center gap-1 self-start text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200 md:self-auto">Zobacz wszystkie eventy <ChevronRight size={16} /></Link>
        </section>
        <section className="grid gap-3 sm:grid-cols-3">{summary.map(({ label, value, icon: Icon, detail }) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30 dark:border-slate-700/80 dark:bg-slate-800/70 dark:shadow-none"><div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p><span className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><Icon size={18} /></span></div><p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{detail}</p></article>)}</section>
        <section className="mt-7 grid gap-5 lg:grid-cols-[1.45fr_.85fr]"><article className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700/80 dark:bg-slate-800/70"><header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700/70"><div><h2 className="font-semibold text-slate-900 dark:text-slate-100">Twoje wydarzenia</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Szybki dostęp do konfiguracji i galerii</p></div><Camera size={19} className="text-slate-400" /></header><div className="divide-y divide-slate-100 dark:divide-slate-700/70">{events.slice(0, 6).map((event) => <Link key={event.uuid} href={`/admin/events/${event.uuid}`} className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"><div><p className="font-medium text-slate-800 dark:text-slate-200">{event.name}</p><p className="mt-0.5 text-xs capitalize text-slate-500 dark:text-slate-400">{event.status}</p></div><ChevronRight size={18} className="text-slate-400 transition-transform group-hover:translate-x-0.5" /></Link>)}{events.length === 0 && <p className="px-5 py-8 text-sm text-slate-500 dark:text-slate-400">Brak przypisanych wydarzeń.</p>}</div></article><aside className="rounded-xl border border-blue-100 bg-blue-50/65 p-5 dark:border-blue-400/20 dark:bg-blue-400/8"><p className="text-xs font-semibold tracking-[0.14em] text-blue-700 uppercase dark:text-blue-300">Wskazówka</p><h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Galeria pod kontrolą</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">W edytorze eventu otwórz galerię, aby pobrać zdjęcia, oznaczyć zestaw do ZIP-a lub trwale usunąć pliki.</p></aside></section>
    </main></>;
}
