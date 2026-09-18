import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, LayoutGrid, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

type Shared = { auth: { user: { roles: string[] } | null }; navigationEvents: { uuid: string; name: string; status: string }[] };

export function AppSidebar() {
    const { auth, navigationEvents } = usePage<Shared>().props;
    const superadmin = auth.user?.roles.includes('superadmin') ?? false;

    return <Sidebar collapsible="icon" className="border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <SidebarHeader className="h-16 border-b border-slate-200 px-2 dark:border-slate-800">
            <SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" asChild><Link href="/dashboard"><AppLogo /></Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup><SidebarGroupLabel>Panel</SidebarGroupLabel><SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard"><LayoutGrid />Dashboard</Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroup>
            <SidebarGroup><SidebarGroupLabel>Wydarzenia</SidebarGroupLabel><SidebarMenu>{navigationEvents.map((event) => <SidebarMenuItem key={event.uuid}><SidebarMenuButton asChild tooltip={event.name}><Link href={`/admin/events/${event.uuid}`}><CalendarDays /><span>{event.name}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroup>
            {superadmin && <SidebarGroup><SidebarGroupLabel>Administracja</SidebarGroupLabel><SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild><Link href="/admin/event-admins"><Users />Administratorzy eventów</Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroup>}
        </SidebarContent>
        <SidebarFooter><NavUser /></SidebarFooter>
    </Sidebar>;
}
