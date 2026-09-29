import {
    CircleAlert,
    Columns3,
    CalendarDays,
    FolderOpen,
    LayoutDashboard,
    Megaphone,
    Send,
    Settings,
    Users,
    Vote,
    Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';

// Wayfinder route helpers (run `php artisan wayfinder:generate`; names come from routes/features.php).
import { dashboard as officerDashboard, board } from '@/routes/officer';
import { index as officerConcerns } from '@/routes/officer/concerns';
import { index as officerEvents } from '@/routes/officer/events';
import { index as documents } from '@/routes/documents';
import { dashboard as studentDashboard } from '@/routes/student';
import {
    create as submitConcern,
    index as myConcerns,
} from '@/routes/student/concerns';
import { index as studentEvents } from '@/routes/student/events';
import { index as studentAnnouncements } from '@/routes/student/announcements';

export type NavItem = {
    label: string;
    href: string | null;
    icon: ComponentType<{ className?: string }>;
};

// href === null  ->  screen exists in the Figma but isn't built yet: rendered muted, not clickable.
const settings: NavItem = {
    label: 'Settings',
    href: '/settings/profile',
    icon: Settings,
};

/** Figma: "Council Officer" sidebar. */
export const officerNav = (): NavItem[] => [
    { label: 'Dashboard', href: officerDashboard().url, icon: LayoutDashboard },
    { label: 'Announcements', href: '/officer/announcements', icon: Megaphone },
    { label: 'Kanban Board', href: board().url, icon: Columns3 },
    { label: 'Documents', href: documents().url, icon: FolderOpen },
    { label: 'Concerns', href: officerConcerns().url, icon: CircleAlert },
    { label: 'Events', href: officerEvents().url, icon: CalendarDays },
    { label: 'Voting', href: officerEvents().url + '?tab=voting', icon: Vote },
    { label: 'Directory', href: null, icon: Users },
    settings,
];

/** Figma: "President" sidebar (no Kanban/Voting/Directory; adds Budget + Members). */
export const presidentNav = (): NavItem[] => [
    { label: 'Dashboard', href: officerDashboard().url, icon: LayoutDashboard },
    { label: 'Announcements', href: '/officer/announcements', icon: Megaphone },
    { label: 'Concerns', href: officerConcerns().url, icon: CircleAlert },
    { label: 'Events', href: officerEvents().url, icon: CalendarDays },
    { label: 'Budget', href: null, icon: Wallet },
    { label: 'Members', href: null, icon: Users },
    { label: 'Documents', href: documents().url, icon: FolderOpen },
    settings,
];

/** Figma: "Student Portal" sidebar. */
export const studentNav = (): NavItem[] => [
    { label: 'Dashboard', href: studentDashboard().url, icon: LayoutDashboard },
    { label: 'Submit a Concern', href: submitConcern().url, icon: Send },
    { label: 'My Concerns', href: myConcerns().url, icon: CircleAlert },
    { label: 'Events', href: studentEvents().url, icon: CalendarDays },
    {
        label: 'Announcements',
        href: studentAnnouncements().url,
        icon: Megaphone,
    },
    settings,
];
