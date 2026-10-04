import { Head, Link, router, usePage } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';
import { AppearanceToggle } from '@/components/appearance-toggle';
import {
    ClipboardList,
    LayoutDashboard,
    LogOut,
    ShieldCheck,
    Users,
    UserRoundCog,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import type { CSSProperties, ReactNode } from 'react';

export default function AdminLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    const { url } = usePage();
    const nav = [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        {
            label: 'Organization members',
            href: '/admin/memberships',
            icon: Users,
        },
        { label: 'All users', href: '/admin/users', icon: UserRoundCog },
        { label: 'Identity audit', href: '/admin/audit', icon: ClipboardList },
    ];

    return (
        <div
            className="min-h-svh bg-[#F5F6F8] text-[#101B33]"
            style={{
                '--sidebar': '#0c351d',
                '--sidebar-foreground': '#d8e9d2',
                '--sidebar-accent': '#155a2b',
                '--sidebar-accent-foreground': '#FFFFFF',
                '--sidebar-border': '#285037',
                '--sidebar-primary': '#FFFFFF',
                '--sidebar-primary-foreground': '#0c351d',
                '--sidebar-ring': '#72bd79',
            } as CSSProperties}
        >
            <Head title={title} />
            <AppShell variant="sidebar">
                <Sidebar collapsible="icon" variant="sidebar">
                    <SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild size="lg" tooltip="CouncilForge administration">
                                    <Link href="/admin/dashboard">
                                        <img src="/images/councilforge-logo.png" alt="" className="size-8 object-contain"/>
                                        <span className="grid text-left leading-tight">
                                            <span className="font-semibold text-white">CouncilForge</span>
                                            <span className="text-[10px] tracking-wider text-slate-400">ADMINISTRATION</span>
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-slate-400">Administration</SidebarGroupLabel>
                            <SidebarMenu>
                                {nav.map(({ label, href, icon: Icon }) => <SidebarMenuItem key={href}>
                                    <SidebarMenuButton asChild isActive={url.split('?')[0] === href} tooltip={{ children: label }}>
                                        <Link href={href}><Icon/><span>{label}</span></Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>)}
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter>
                        <div className="border-t border-white/10 pt-3">
                            <div className="mb-2 flex items-center gap-2 px-2 text-xs text-slate-300 group-data-[collapsible=icon]:hidden">
                                <ShieldCheck className="h-4 w-4"/>Separate admin account
                            </div>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => router.post('/admin/logout')} tooltip="Sign out">
                                        <LogOut/><span>Sign out</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </div>
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset className="min-w-0 bg-[#F5F6F8]">
                <header className="flex h-16 items-center gap-3 border-b border-[#E1E4EA] bg-white px-4 sm:px-6">
                    <SidebarTrigger className="-ml-1" />
                    <h1 className="text-sm font-semibold">{title}</h1>
                    <AppearanceToggle className="ml-auto" />
                </header>
                <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
                    {children}
                </main>
                </SidebarInset>
            </AppShell>
        </div>
    );
}
