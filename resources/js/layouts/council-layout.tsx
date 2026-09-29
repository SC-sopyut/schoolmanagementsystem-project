import { Avatar } from '@/components/council/ui';
import { officerNav, presidentNav, studentNav } from '@/components/council/nav';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronDown,
    LogOut,
    Menu,
    Search,
    Settings,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Shared = {
    auth: {
        user: { name: string; email: string };
        officer: null | {
            label: string;
            organization: string;
            position: string | null;
            is_president: boolean;
            is_council: boolean;
        };
    };
    flash?: { success?: string };
    notifications: {
        announcements: NotificationItem[];
        upcoming_events: NotificationItem[];
        concern_updates: NotificationItem[];
    };
};

type NotificationItem = {
    id: number;
    title: string;
    body: string;
    organization?: string | null;
    audience?: string;
    tracking_code?: string;
    published_at: string | null;
    url: string;
};

type SearchResult = {
    type: string;
    title: string;
    subtitle: string;
    url: string;
};

/**
 * App shell for every Figma screen: navy sidebar (role-specific nav), header with search/bell/user,
 * and a profile card pinned to the sidebar bottom. Which nav renders is decided from `auth.officer`,
 * which the server computes from the `officers` table - the client never chooses its own role.
 * (Hiding a link is cosmetic; every route is still authorized server-side.)
 */
export default function CouncilLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    const { auth, flash, notifications } = usePage<Shared>().props;
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const officer = auth.officer;

    useEffect(() => {
        function closeOnOutsideClick(event: PointerEvent) {
            if (
                notificationsRef.current &&
                !notificationsRef.current.contains(event.target as Node)
            ) {
                setNotificationsOpen(false);
            }
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setSearchOpen(false);
            }
        }
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setNotificationsOpen(false);
        }
        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

    useEffect(() => {
        const term = searchQuery.trim();
        if (term.length < 2) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        setSearchResults([]);
        setSearching(true);
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            fetch(`/search?q=${encodeURIComponent(term)}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
                signal: controller.signal,
            })
                .then((response) =>
                    response.ok
                        ? response.json()
                        : Promise.reject(new Error('Search failed')),
                )
                .then((data: { results: SearchResult[] }) =>
                    setSearchResults(data.results),
                )
                .catch((error: unknown) => {
                    if (
                        error instanceof DOMException &&
                        error.name === 'AbortError'
                    )
                        return;
                    setSearchResults([]);
                })
                .finally(() => {
                    if (!controller.signal.aborted) setSearching(false);
                });
        }, 250);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery]);

    const nav = !officer
        ? studentNav()
        : officer.is_president
          ? presidentNav()
          : officerNav();
    const chip = !officer
        ? 'Student Portal'
        : officer.is_president
          ? officer.label
          : officer.organization;
    const subtitle = officer ? officer.label : 'Student';
    const notificationCount =
        notifications.announcements.length +
        notifications.upcoming_events.length +
        notifications.concern_updates.length;

    return (
        <div className="flex min-h-screen bg-[#F5F6F8] text-[#101B33]">
            <Head title={title} />

            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col bg-[#101B33] p-3 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center gap-2 px-2 py-3">
                    <img
                        src="/images/councilforge-logo.png"
                        alt=""
                        className="h-9 w-9 rounded-lg object-contain"
                    />
                    <div>
                        <p className="text-sm leading-tight font-bold text-white">
                            CouncilForge
                        </p>
                        <p className="text-[9px] tracking-widest text-slate-400">
                            CIVIC TECH SUITE
                        </p>
                    </div>
                </div>

                <nav className="mt-4 flex-1 space-y-0.5">
                    {nav.map((item) => {
                        const active =
                            item.href !== null &&
                            url.split('?')[0] === item.href.split('?')[0] &&
                            (!item.href.includes('?') ||
                                url.includes(item.href.split('?')[1]));
                        const base =
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm';
                        return item.href ? (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`${base} ${active ? 'bg-white/10 font-semibold text-white' : 'text-slate-300 hover:bg-white/5'}`}
                            >
                                <item.icon className="h-4 w-4" /> {item.label}
                            </Link>
                        ) : (
                            <span
                                key={item.label}
                                title="Coming soon"
                                className={`${base} cursor-not-allowed text-slate-500`}
                            >
                                <item.icon className="h-4 w-4" /> {item.label}
                            </span>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2 border-t border-white/10 px-2 pt-3">
                    <Avatar name={auth.user.name} size={32} />
                    <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white">
                            {auth.user.name}
                        </p>
                        <p className="truncate text-[10px] text-slate-400">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center gap-3 border-b border-[#E1E4EA] bg-white px-4 py-3 sm:px-6">
                    <button
                        className="lg:hidden"
                        onClick={() => setOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <h1 className="text-sm font-semibold sm:text-base">
                        {title}
                    </h1>
                    <span className="hidden items-center gap-1 rounded-md border border-[#E1E4EA] px-2 py-1 text-xs text-[#5B6478] sm:inline-flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{' '}
                        {chip}{' '}
                        {!officer?.is_president && officer && (
                            <ChevronDown className="h-3 w-3" />
                        )}
                    </span>
                    <div className="ml-auto flex items-center gap-3">
                        {/* Search isn't wired to anything yet - shown for design fidelity only. */}
                        <div
                            ref={searchRef}
                            className="relative hidden items-center gap-2 rounded-lg bg-[#F5F6F8] px-3 py-1.5 md:flex"
                        >
                            <Search className="h-4 w-4 text-[#5B6478]" />
                            <input
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.target.value);
                                    setSearchOpen(true);
                                }}
                                onFocus={() => setSearchOpen(true)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Escape')
                                        setSearchOpen(false);
                                }}
                                placeholder="Search everything..."
                                aria-label="Search everything"
                                aria-expanded={searchOpen}
                                aria-controls="global-search-results"
                                role="combobox"
                                aria-autocomplete="list"
                                className="w-52 bg-transparent text-sm outline-none"
                            />
                            {searchOpen && searchQuery.trim().length >= 2 && (
                                <div
                                    id="global-search-results"
                                    role="listbox"
                                    className="absolute top-12 right-0 z-50 w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#E1E4EA] bg-white shadow-xl"
                                >
                                    <div className="border-b border-[#E1E4EA] px-4 py-2 text-xs text-[#7B8496]">
                                        {searching
                                            ? 'Searching…'
                                            : `${searchResults.length} result${searchResults.length === 1 ? '' : 's'}`}
                                    </div>
                                    {searchResults.length === 0 ? (
                                        <p className="px-4 py-7 text-center text-sm text-[#5B6478]">
                                            {searching
                                                ? 'Searching…'
                                                : 'No results found.'}
                                        </p>
                                    ) : (
                                        <ul className="max-h-[min(28rem,70vh)] overflow-y-auto">
                                            {searchResults.map(
                                                (result, index) => (
                                                    <li
                                                        key={`${result.type}-${result.title}-${index}`}
                                                    >
                                                        <Link
                                                            href={result.url}
                                                            role="option"
                                                            onClick={() => {
                                                                setSearchOpen(
                                                                    false,
                                                                );
                                                                setSearchQuery(
                                                                    '',
                                                                );
                                                            }}
                                                            className="block border-b border-[#F0F1F4] px-4 py-3 last:border-0 hover:bg-[#F8F9FB]"
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <span className="truncate text-sm font-medium text-[#101B33]">
                                                                    {
                                                                        result.title
                                                                    }
                                                                </span>
                                                                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                                                    {
                                                                        result.type
                                                                    }
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 truncate text-xs text-[#5B6478]">
                                                                {
                                                                    result.subtitle
                                                                }
                                                            </p>
                                                        </Link>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={notificationsRef}>
                            <button
                                type="button"
                                onClick={() =>
                                    setNotificationsOpen((value) => !value)
                                }
                                aria-label="Notifications"
                                aria-expanded={notificationsOpen}
                                className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5B6478] transition-colors hover:bg-[#F5F6F8] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                            >
                                <Bell className="h-5 w-5" />
                                {notificationCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                                )}
                            </button>
                            <section
                                aria-label="Recent notifications"
                                aria-hidden={!notificationsOpen}
                                inert={!notificationsOpen}
                                className={`absolute top-12 right-0 z-50 w-[min(22rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-[#E1E4EA] bg-white shadow-xl transition-all duration-200 ease-out ${notificationsOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-1 scale-[0.98] opacity-0'}`}
                            >
                                <div className="flex items-center justify-between border-b border-[#E1E4EA] px-4 py-3">
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Notifications
                                        </h2>
                                        <p className="text-xs text-[#5B6478]">
                                            Updates for your account
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setNotificationsOpen(false)
                                        }
                                        aria-label="Close notifications"
                                        className="rounded-md p-1 text-[#5B6478] hover:bg-[#F5F6F8]"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                {notificationCount === 0 ? (
                                    <p className="px-4 py-8 text-center text-sm text-[#5B6478]">
                                        You’re all caught up.
                                    </p>
                                ) : (
                                    <div className="max-h-[min(32rem,75vh)] divide-y divide-[#E1E4EA] overflow-y-auto">
                                        <NotificationSection
                                            title="Upcoming events"
                                            items={
                                                notifications.upcoming_events
                                            }
                                            metadata={(item) =>
                                                item.organization ?? 'Event'
                                            }
                                        />
                                        <NotificationSection
                                            title="Concern progress"
                                            items={
                                                notifications.concern_updates
                                            }
                                            metadata={(item) =>
                                                [
                                                    item.tracking_code,
                                                    item.organization,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')
                                            }
                                        />
                                        <NotificationSection
                                            title="Announcements"
                                            items={notifications.announcements}
                                            metadata={(item) =>
                                                item.audience === 'organization'
                                                    ? (item.organization ??
                                                      'Organization members')
                                                    : item.audience ===
                                                        'all_students'
                                                      ? 'Students in every organization'
                                                      : item.audience ===
                                                          'all_officers'
                                                        ? 'All officers'
                                                        : 'Everyone'
                                            }
                                        />
                                    </div>
                                )}
                            </section>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                    aria-label="Open user menu"
                                >
                                    <span className="hidden text-sm font-medium sm:inline">
                                        {auth.user.name}
                                    </span>
                                    <Avatar name={auth.user.name} size={30} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel className="font-normal">
                                    <p className="text-sm font-semibold text-[#101B33]">
                                        {auth.user.name}
                                    </p>
                                    <p className="text-xs text-[#5B6478]">
                                        {auth.user.email}
                                    </p>
                                    {officer && (
                                        <p className="mt-2 text-xs font-medium text-[#101B33]">
                                            {officer.position || 'Officer'} ·{' '}
                                            {officer.organization}
                                        </p>
                                    )}
                                    {!officer && (
                                        <p className="mt-2 text-xs text-[#5B6478]">
                                            Student
                                        </p>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Account settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={() => router.post('/logout')}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                            {flash.success}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}

function NotificationSection({
    title,
    items,
    metadata,
}: {
    title: string;
    items: NotificationItem[];
    metadata: (item: NotificationItem) => string;
}) {
    if (items.length === 0) return null;

    return (
        <section aria-label={title}>
            <h3 className="sticky top-0 bg-[#F8F9FB] px-4 py-2 text-[10px] font-bold tracking-wide text-[#5B6478] uppercase">
                {title}
            </h3>
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <Link
                            href={item.url}
                            className="block px-4 py-3 transition-colors hover:bg-[#F8F9FB]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold">
                                    {item.title}
                                </p>
                                {item.published_at && (
                                    <span className="shrink-0 text-[10px] text-[#7B8496]">
                                        {item.published_at}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5B6478]">
                                {item.body}
                            </p>
                            <p className="mt-2 text-[10px] font-medium text-blue-700">
                                {metadata(item)}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
