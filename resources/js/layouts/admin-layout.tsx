import { Head, Link, router, usePage } from '@inertiajs/react';
import { ClipboardList, LayoutDashboard, LogOut, Menu, ShieldCheck, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export default function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
    const { url } = usePage();
    const [menuOpen, setMenuOpen] = useState(false);
    const nav = [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Organization members', href: '/admin/memberships', icon: Users },
        { label: 'Identity audit', href: '/admin/audit', icon: ClipboardList },
    ];

    return (
        <div className="min-h-screen bg-[#F5F6F8] text-[#101B33]">
            <Head title={title} />
            {menuOpen && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}
            <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#101B33] p-4 text-white transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center gap-3 border-b border-white/10 px-1 pb-5">
                    <img src="/images/councilforge-logo.png" alt="" className="h-10 w-10 object-contain" />
                    <div>
                        <p className="text-sm font-semibold">CouncilForge</p>
                        <p className="text-[10px] tracking-wider text-slate-400">ADMINISTRATION</p>
                    </div>
                </div>
                <nav className="mt-5 flex-1 space-y-1">
                    {nav.map(({ label, href, icon: Icon }) => {
                        const active = url.split('?')[0] === href;
                        return (
                            <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${active ? 'bg-white/10 font-semibold text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                                <Icon className="h-4 w-4" />{label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-white/10 pt-4">
                    <div className="mb-3 flex items-center gap-2 px-2 text-xs text-slate-300"><ShieldCheck className="h-4 w-4" />Separate admin account</div>
                    <button onClick={() => router.post('/admin/logout')} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                        <LogOut className="h-4 w-4" />Sign out
                    </button>
                </div>
            </aside>

            <div className="min-h-screen lg:pl-60">
                <header className="flex h-16 items-center gap-3 border-b border-[#E1E4EA] bg-white px-4 sm:px-6">
                    <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
                    <h1 className="text-sm font-semibold">{title}</h1>
                </header>
                <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
