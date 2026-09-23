import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { login, register } from '@/routes';

const orgs = [
    { name: 'CRIM', tag: 'Criminology org', color: 'bg-[#C0392B]', text: 'text-white', logo: '/images/crim.png' },
    { name: 'LOTES', tag: 'Languages org', color: 'bg-[#2E5EAA]', text: 'text-white', logo: '/images/case.png' },
    { name: 'BYTE', tag: 'IT organization', color: 'bg-[#2E8B57]', text: 'text-white', logo: '/images/it.png' },
    { name: 'COHME', tag: 'Hospitality & mgmt.', color: 'bg-[#E0A628]', text: 'text-white', logo: '/images/cohme.png' },
    { name: 'Campus Ministry', tag: 'Faith & formation', color: 'bg-[#D9DCE3]', text: 'text-[#161F33]', logo: '/images/awaken.png' },
    { name: 'SSC', tag: 'SSC org', color: 'bg-[#C0392B]', text: 'text-white', logo: '/images/ssc.png' },
];

const stats = [
    { num: '18', label: 'Active tasks this week' },
    { num: '9', label: 'Concerns awaiting review' },
    { num: '5', label: 'Events coming up' },
    { num: '142', label: 'Members across all orgs' },
];

const galleryImages = Array.from({ length: 9 }, (_, i) => `/images/${i + 1}.jpg`);

const features = [
    { glyph: '◧', title: 'Committee task boards', body: 'Kanban boards per committee, with deadlines and assignees everyone can see.' },
    { glyph: '▤', title: 'Document repository', body: "Version history and folder permissions per committee, so drafts don't get lost." },
    { glyph: '◔', title: 'Event planning', body: 'Budgets, checklists, and attendance tracking, from proposal to wrap-up.' },
    { glyph: '◈', title: 'Voting & polling', body: 'Run internal decisions and elections with results members can trust.' },
    { glyph: '◫', title: 'Concerns routing', body: "Members raise concerns; officers review before anything reaches the board." },
    { glyph: '◱', title: 'Officer directory', body: 'Roles, terms, and contact info for every organization, always current.' },
];

export default function Welcome() {
    const galleryRef = useRef<HTMLDivElement>(null);
    const [isGalleryPaused, setIsGalleryPaused] = useState(false);

    const scrollGallery = (direction: 1 | -1) => {
        const el = galleryRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
    };

    useEffect(() => {
        const el = galleryRef.current;
        if (!el) return;

        const pixelsPerSecond = 40;
        let rafId: number;
        let lastTime: number | null = null;

        const step = (time: number) => {
            if (lastTime !== null && !isGalleryPaused) {
                const deltaSeconds = (time - lastTime) / 1000;
                const maxScroll = el.scrollWidth - el.clientWidth;
                const next = el.scrollLeft + pixelsPerSecond * deltaSeconds;
                el.scrollLeft = next >= maxScroll ? 0 : next;
            }
            lastTime = time;
            rafId = requestAnimationFrame(step);
        };

        rafId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafId);
    }, [isGalleryPaused]);

    return (
        <>
            <Head title="CouncilForge" />

            <style>{`
                @keyframes org-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .org-marquee-track {
                    animation: org-marquee 20s linear infinite;
                }
                .org-marquee-mask {
                    -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
                    mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
                }
            `}</style>

            <div className="min-h-screen bg-[#F5F6F8] text-[#161F33]">
                {/* Nav */}
                <header className="sticky top-0 z-10 bg-[#101B33]/97 backdrop-blur">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-7 py-4">
                        <div className="flex items-center gap-2.5 font-semibold text-white">
                            <img src="/images/councilforge-logo.png" alt="CouncilForge logo" className="h-12 w-12" />
                            CouncilForge
                        </div>
                        <nav className="hidden gap-7 text-sm text-[#B9C2D6] sm:flex">
                            <a href="#modules">Modules</a>
                            <a href="#orgs">Organizations</a>
                            <a href="#roles">For students &amp; officers</a>
                        </nav>
                        <div className="flex items-center gap-4">
                            <Link href={login()} className="text-sm font-medium text-[#B9C2D6] hover:text-white">
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="rounded-lg bg-[#C1571F] px-4 py-2 text-sm font-semibold text-white"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative w-full overflow-hidden bg-[#101B33] text-white">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/acc-campus-bg.png')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B1226]/95 via-[#0B1226]/70 to-[#0B1226]/20" />

                    <div className="relative ml-48 px-8 py-16 sm:ml-48 sm:px-12 sm:py-20">
                        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                            Where the whole student council actually gets its work done.
                        </h1>
                        <p className="mt-6 max-w-[52ch] text-[#D3D9E8]">
                            Task boards, documents, events, voting, and concerns for every campus
                            organization — in one place, instead of multiple chat groups and a shared
                            drive nobody can find.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3.5">
                            <a
                                href="#modules"
                                className="rounded-lg border border-white/25 bg-[#101B33]/60 px-5.5 py-3 text-sm font-semibold text-white backdrop-blur"
                            >
                                See what's inside
                            </a>
                            <Link
                                href={register()}
                                className="rounded-lg bg-[#C1571F] px-5.5 py-3 text-sm font-semibold text-white"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>

                    {/* Org logo slideshow — same vertical span as the headline + paragraph */}
                    <div className="org-marquee-mask absolute right-48 top-16 hidden h-72 w-64 items-center overflow-hidden sm:top-20 md:flex lg:h-80 lg:w-80">
                        <div className="org-marquee-track flex w-max items-center gap-5">
                            {[...orgs, ...orgs].map((org, i) => (
                                <div
                                    key={`${org.name}-${i}`}
                                    className="flex items-center gap-4 rounded-xl px-6 py-5 backdrop-blur"
                                >
                                    <img src={org.logo} alt={org.name} className="h-40 w-40 shrink-0 rounded object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Orgs */}
                <section id="orgs" className="mx-auto max-w-5xl px-7 py-18">
                    <div className="mb-10 max-w-[56ch]">
                        <h2 className="text-3xl font-semibold">Different organizations, different needs, one system.</h2>
                        <p className="mt-3 text-[#5B6478]">
                            Every org keeps its own identity and its own committee boards — CouncilForge just
                            gives them a shared foundation to coordinate on.
                        </p>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => scrollGallery(-1)}
                            aria-label="Previous photos"
                            className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E1E4EA] bg-white text-lg shadow-md hover:bg-[#F5F6F8]"
                        >
                            ‹
                        </button>

                        <div
                            ref={galleryRef}
                            onMouseEnter={() => setIsGalleryPaused(true)}
                            onMouseLeave={() => setIsGalleryPaused(false)}
                            onTouchStart={() => setIsGalleryPaused(true)}
                            onTouchEnd={() => setIsGalleryPaused(false)}
                            className="flex snap-x snap-mandatory gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {galleryImages.map((src, i) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt={`Council activity ${i + 1}`}
                                    className="h-56 w-80 shrink-0 snap-start rounded-2xl object-cover sm:h-64 sm:w-96"
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => scrollGallery(1)}
                            aria-label="Next photos"
                            className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[#E1E4EA] bg-white text-lg shadow-md hover:bg-[#F5F6F8]"
                        >
                            ›
                        </button>
                    </div>

                    <p className="mt-4 text-sm text-[#5B6478]">
                        Council-wide events assign tasks down to each org; any org can also raise its own
                        events and concerns.
                    </p>
                </section>

                {/* Modules */}
                <section id="modules" className="border-y border-[#E1E4EA] bg-white py-18">
                    <div className="mx-auto max-w-5xl px-7">
                        <div className="mb-10 max-w-[56ch]">
                            <h2 className="text-3xl font-semibold">Everything a council does, built as one workspace.</h2>
                            <p className="mt-3 text-[#5B6478]">
                                No more chasing files across Messenger threads and personal drives.
                            </p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((f) => (
                                <div key={f.title} className="rounded-xl border border-[#E1E4EA] p-6">
                                    <div className="mb-3.5 flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-[#F4E3D6] font-semibold text-[#C1571F]">
                                        {f.glyph}
                                    </div>
                                    <h3 className="font-semibold">{f.title}</h3>
                                    <p className="mt-2 text-sm text-[#5B6478]">{f.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Roles */}
                <section id="roles" className="mx-auto max-w-5xl px-7 py-18">
                    <div className="mb-10 max-w-[56ch]">
                        <h2 className="text-3xl font-semibold">One login. A dashboard built for your role.</h2>
                    </div>
                    <div className="grid rounded-2xl border border-[#E1E4EA] bg-white sm:grid-cols-2">
                        <div className="border-b border-[#E1E4EA] p-7 sm:border-b-0 sm:border-r">
                            <span className="rounded bg-[#F5F6F8] px-2.5 py-1 text-xs font-semibold text-[#5B6478]">
                                Students
                            </span>
                            <h3 className="mt-3.5 font-semibold">Show up, vote, stay informed</h3>
                            <ul className="mt-3.5 list-disc space-y-1.5 pl-4.5 text-sm text-[#5B6478]">
                                <li>Vote in council and org elections</li>
                                <li>Read announcements with a receipt when you've seen them</li>
                                <li>Raise a concern to your org's officers</li>
                                <li>Join events run by your organization</li>
                            </ul>
                        </div>
                        <div className="p-7">
                            <span className="rounded bg-[#F5F6F8] px-2.5 py-1 text-xs font-semibold text-[#5B6478]">
                                Officers
                            </span>
                            <h3 className="mt-3.5 font-semibold">Run committees without the chaos</h3>
                            <ul className="mt-3.5 list-disc space-y-1.5 pl-4.5 text-sm text-[#5B6478]">
                                <li>Assign and track tasks on committee boards</li>
                                <li>Plan events with budgets and checklists</li>
                                <li>Review concerns before forwarding to the board</li>
                                <li>Log activities for accreditation reports</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#101B33] py-10 text-[#B9C2D6]">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-7">
                        <div className="font-semibold text-white">CouncilForge</div>
                        <div className="text-sm">Built for student councils and their member organizations.</div>
                    </div>
                </footer>
            </div>
        </>
    );
}
