import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { login, register } from '@/routes';
import { AppearanceToggle } from '@/components/appearance-toggle';

const orgs = [
    {
        name: 'CRIM',
        tag: 'Criminology org',
        color: 'bg-[#C0392B]',
        text: 'text-white',
        logo: '/images/crim.png',
    },
    {
        name: 'LOTES',
        tag: 'Languages org',
        color: 'bg-[#2E5EAA]',
        text: 'text-white',
        logo: '/images/case.png',
    },
    {
        name: 'BYTE',
        tag: 'IT organization',
        color: 'bg-[#2E8B57]',
        text: 'text-white',
        logo: '/images/it.png',
    },
    {
        name: 'COHME',
        tag: 'Hospitality & mgmt.',
        color: 'bg-[#E0A628]',
        text: 'text-white',
        logo: '/images/cohme.png',
    },
    {
        name: 'Campus Ministry',
        tag: 'Faith & formation',
        color: 'bg-[#D9DCE3]',
        text: 'text-[#101B33]',
        logo: '/images/awaken.png',
    },
    {
        name: 'SSC',
        tag: 'SSC org',
        color: 'bg-[#C0392B]',
        text: 'text-white',
        logo: '/images/ssc.png',
    },
];

// const stats = [
//     { num: '18', label: 'Active tasks this week' },
//     { num: '9', label: 'Concerns awaiting review' },
//     { num: '5', label: 'Events coming up' },
//     { num: '142', label: 'Members across all orgs' },
// ];

const features = [
    {
        glyph: '◧',
        title: 'Committee task boards',
        body: 'Kanban boards per committee, with deadlines and assignees everyone can see.',
        detail: 'Give each committee a shared board for organizing work. Officers can break plans into tasks, assign owners, set deadlines, and follow progress in one place.',
    },
    {
        glyph: '▤',
        title: 'Document repository',
        body: "Version history and folder permissions per committee, so drafts don't get lost.",
        detail: 'Keep committee files organized in shared folders. Version history helps members follow changes, while permissions keep documents available to the right people.',
    },
    {
        glyph: '◔',
        title: 'Event planning',
        body: 'Budgets, checklists, and attendance tracking, from proposal to wrap-up.',
        detail: 'Plan an event from its initial proposal through completion. Keep the budget, preparation checklist, and attendance information together for the team.',
    },
    {
        glyph: '◈',
        title: 'Voting & polling',
        body: 'Run internal decisions and elections with results members can trust.',
        detail: 'Create polls for organization decisions and elections, collect member votes, and share the outcome with the community.',
    },
    {
        glyph: '◫',
        title: 'Concerns routing',
        body: 'Members raise concerns; officers review before anything reaches the board.',
        detail: 'Provide members with a clear channel to raise concerns. Officers can review each submission and route it to the appropriate board for follow-up.',
    },
    {
        glyph: '◱',
        title: 'Officer directory',
        body: 'Roles, terms, and contact info for every organization, always current.',
        detail: 'Help members find the right people by keeping officer roles, terms of service, and contact details together for each organization.',
    },
];

function useWordReveal<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;
        const words = Array.from(
            container.querySelectorAll<HTMLElement>('[data-reveal-word]'),
        );
        if (words.length === 0) return;

        let rafId: number;
        const update = () => {
            const rect = container.getBoundingClientRect();
            const vh = window.innerHeight;
            const start = vh * 0.85; // reveal begins when the top hits 85% down the viewport
            const end = vh * 0.35; // fully revealed by the time it hits 35% down
            const raw = (start - rect.top) / (start - end);
            const progress = Math.min(1, Math.max(0, raw));

            const n = words.length;
            words.forEach((word, i) => {
                // each word needs 1/n of extra progress after the previous one to fully brighten,
                // so words light up left-to-right as progress increases
                const wordProgress = Math.min(1, Math.max(0, progress * n - i));
                word.style.opacity = String(0.22 + wordProgress * 0.78);
            });

            rafId = requestAnimationFrame(update);
        };

        rafId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return ref;
}

function FadeIn({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setVisible(entry.isIntersecting);
            },
            { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? undefined : 'translateY(20px)',
                transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

function RevealWords({ text }: { text: string }) {
    return (
        <>
            {text.split(' ').map((word, i, arr) => (
                <span
                    key={i}
                    data-reveal-word
                    style={{ opacity: 0.22, display: 'inline-block' }}
                >
                    {word}
                    {i < arr.length - 1 ? ' ' : ''}
                </span>
            ))}
        </>
    );
}

export default function Welcome() {
    const [selectedOrg, setSelectedOrg] = useState<
        (typeof orgs)[number] | null
    >(null);
    const [selectedFeature, setSelectedFeature] = useState<
        (typeof features)[number] | null
    >(null);
    const heroHeadingRef = useWordReveal<HTMLHeadingElement>();
    const orgsHeadingRef = useWordReveal<HTMLHeadingElement>();
    const modulesHeadingRef = useWordReveal<HTMLHeadingElement>();
    const rolesHeadingRef = useWordReveal<HTMLHeadingElement>();

    useEffect(() => {
        if (!selectedOrg && !selectedFeature) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedOrg(null);
                setSelectedFeature(null);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedOrg, selectedFeature]);

    return (
        <>
            <Head title="CouncilForge" />

            <style>{`
                html {
                    scroll-behavior: smooth;
                }
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

            <div className="min-h-screen bg-[#F5F6F8] text-[#101B33]">
                {/* Nav */}
                <header className="sticky top-0 z-10 bg-[#0c351d]/97 backdrop-blur">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-7 py-4">
                        <div className="flex items-center gap-2.5 font-semibold text-white">
                            <img
                                src="/images/councilforge-logo.png"
                                alt="CouncilForge logo"
                                className="h-12 w-12"
                            />
                            CouncilForge
                        </div>
                        <nav className="hidden gap-7 text-sm text-[#D8DED9] sm:flex">
                            <a
                                href="#modules"
                                className="transition-colors hover:text-white"
                            >
                                Modules
                            </a>
                            <a
                                href="#orgs"
                                className="transition-colors hover:text-white"
                            >
                                Organizations
                            </a>
                            <a
                                href="#roles"
                                className="transition-colors hover:text-white"
                            >
                                For students &amp; officers
                            </a>
                            <a
                                href="#acc-osa"
                                className="transition-colors hover:text-white"
                            >
                                ACC &amp; OSA
                            </a>
                        </nav>
                        <div className="flex items-center gap-4">
                            <AppearanceToggle />
                            <Link
                                href={login()}
                                className="text-sm font-medium text-[#D8DED9] hover:text-white"
                            >
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
                        style={{
                            backgroundImage: "url('/images/acc-campus-bg.png')",
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                'linear-gradient(90deg, rgba(8, 42, 22, 0.84) 0%, rgba(8, 42, 22, 0.77) 42%, rgba(8, 42, 22, 0.45) 68%, rgba(8, 42, 22, 0) 100%)',
                        }}
                    />

                    <div className="relative ml-48 px-8 py-16 sm:ml-48 sm:px-12 sm:py-20">
                        <h1
                            ref={heroHeadingRef}
                            className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl"
                        >
                            <RevealWords text="Where the whole student council actually gets its work done." />
                        </h1>
                        <p className="mt-6 max-w-[52ch] text-[#F0F1E8]">
                            Task boards, documents, events, voting, and concerns
                            for every campus organization — in one place,
                            instead of multiple chat groups and a shared drive
                            nobody can find.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3.5">
                            <a
                                href="#modules"
                                className="rounded-lg border border-white/25 bg-[#0c351d]/60 px-5.5 py-3 text-sm font-semibold text-white backdrop-blur"
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
                    <div className="org-marquee-mask absolute top-16 right-48 hidden h-72 w-64 items-center overflow-hidden sm:top-20 md:flex lg:h-80 lg:w-80">
                        <div className="org-marquee-track flex w-max items-center gap-5">
                            {[...orgs, ...orgs].map((org, i) => (
                                <div
                                    key={`${org.name}-${i}`}
                                    className="flex items-center gap-4 rounded-xl px-6 py-5 backdrop-blur"
                                >
                                    <img
                                        src={org.logo}
                                        alt={org.name}
                                        className="h-40 w-40 shrink-0 rounded object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Orgs */}
                <section
                    id="orgs"
                    className="mx-auto max-w-5xl scroll-mt-24 px-7 py-18"
                >
                    <div className="mb-10 max-w-[56ch]">
                        <h2
                            ref={orgsHeadingRef}
                            className="text-3xl font-semibold"
                        >
                            <RevealWords text="Different organizations, different needs, one system." />
                        </h2>
                        <p className="mt-3 text-[#5B6478]">
                            Every org keeps its own identity and its own
                            committee boards — CouncilForge just gives them a
                            shared foundation to coordinate on.
                        </p>
                    </div>

                    <FadeIn>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {orgs.map((org) => (
                                <button
                                    key={org.name}
                                    type="button"
                                    onClick={() => setSelectedOrg(org)}
                                    className="group flex min-h-40 items-center gap-5 rounded-2xl border border-[#E1E4EA] bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#1E56C5]/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E56C5]"
                                    aria-haspopup="dialog"
                                >
                                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#F5F6F8] p-3">
                                        <img
                                            src={org.logo}
                                            alt=""
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-lg font-semibold text-[#101B33]">
                                            {org.name}
                                        </span>
                                        <span className="mt-1 block text-sm text-[#5B6478]">
                                            {org.tag}
                                        </span>
                                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1E56C5]">
                                            View organization{' '}
                                            <span aria-hidden="true">→</span>
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </FadeIn>

                    <p className="mt-5 text-sm text-[#5B6478]">
                        Choose an organization to see how its own workspace fits
                        into the shared council.
                    </p>
                </section>

                {selectedOrg && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c351d]/35 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget)
                                setSelectedOrg(null);
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="org-dialog-title"
                            className="relative w-full max-w-lg rounded-2xl border border-[#72a77a]/40 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-9"
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedOrg(null)}
                                aria-label="Close organization details"
                                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-[#5B6478] hover:bg-[#F5F6F8]"
                            >
                                ×
                            </button>
                            <div className="mb-6 flex items-center gap-4">
                                <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#F5F6F8] p-3">
                                    <img
                                        src={selectedOrg.logo}
                                        alt=""
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </span>
                                <div>
                                    <h3
                                        id="org-dialog-title"
                                        className="text-2xl font-semibold text-[#101B33]"
                                    >
                                        {selectedOrg.name}
                                    </h3>
                                    <p className="mt-1 text-[#5B6478]">
                                        {selectedOrg.tag}
                                    </p>
                                </div>
                            </div>
                            <p className="leading-7 text-[#5B6478]">
                                {selectedOrg.name} has its own space in
                                CouncilForge, with a distinct identity and
                                committee boards while staying connected to
                                council-wide coordination.
                            </p>
                            <div className="mt-6 rounded-xl bg-[#F5F7FB] p-5">
                                <h4 className="font-semibold text-[#101B33]">
                                    Inside this organization’s workspace
                                </h4>
                                <ul className="mt-3 space-y-2 text-sm text-[#5B6478]">
                                    <li>
                                        Committee task boards and shared
                                        documents
                                    </li>
                                    <li>
                                        Organization events, concerns, and
                                        updates
                                    </li>
                                    <li>
                                        Coordination with council-wide
                                        activities
                                    </li>
                                </ul>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedOrg(null)}
                                className="mt-7 w-full rounded-lg bg-[#1E56C5] px-5 py-3 font-semibold text-white hover:bg-[#1747A5]"
                            >
                                Back to organizations
                            </button>
                        </section>
                    </div>
                )}

                {/* Modules */}
                <section
                    id="modules"
                    className="scroll-mt-24 border-y border-[#E1E4EA] bg-white py-18"
                >
                    <div className="mx-auto max-w-5xl px-7">
                        <div className="mb-10 max-w-[56ch]">
                            <h2
                                ref={modulesHeadingRef}
                                className="text-3xl font-semibold"
                            >
                                <RevealWords text="Everything a council does, built as one workspace." />
                            </h2>
                            <p className="mt-3 text-[#5B6478]">
                                No more chasing files across Messenger threads
                                and personal drives.
                            </p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((f, i) => (
                                <FadeIn
                                    key={f.title}
                                    delay={i * 0.08}
                                    className="h-full"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFeature(f)}
                                        aria-haspopup="dialog"
                                        className="group h-full w-full rounded-xl border border-[#E1E4EA] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#1E56C5]/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E56C5]"
                                    >
                                        <span className="mb-3.5 flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-[#EAF1FA] font-semibold text-[#1E56C5] transition-colors duration-300 group-hover:bg-[#1E56C5] group-hover:text-white">
                                            {f.glyph}
                                        </span>
                                        <span className="block font-semibold">
                                            {f.title}
                                        </span>
                                        <span className="mt-2 block text-sm text-[#5B6478]">
                                            {f.body}
                                        </span>
                                        <span className="mt-4 block text-sm font-semibold text-[#1E56C5]">
                                            Learn more →
                                        </span>
                                    </button>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {selectedFeature && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c351d]/35 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget)
                                setSelectedFeature(null);
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="feature-dialog-title"
                            className="relative w-full max-w-lg rounded-2xl border border-[#72a77a]/40 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-9"
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedFeature(null)}
                                aria-label="Close feature details"
                                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-[#5B6478] hover:bg-[#F5F6F8]"
                            >
                                ×
                            </button>
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF1FA] text-xl font-semibold text-[#1E56C5]">
                                {selectedFeature.glyph}
                            </div>
                            <h3
                                id="feature-dialog-title"
                                className="text-2xl font-semibold text-[#101B33]"
                            >
                                {selectedFeature.title}
                            </h3>
                            <p className="mt-4 leading-7 text-[#5B6478]">
                                {selectedFeature.detail}
                            </p>
                            <div className="mt-6 rounded-xl bg-[#F5F7FB] p-5">
                                <h4 className="font-semibold text-[#101B33]">
                                    What it helps with
                                </h4>
                                <p className="mt-2 text-sm leading-6 text-[#5B6478]">
                                    {selectedFeature.body}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedFeature(null)}
                                className="mt-7 w-full rounded-lg bg-[#1E56C5] px-5 py-3 font-semibold text-white hover:bg-[#1747A5]"
                            >
                                Done
                            </button>
                        </section>
                    </div>
                )}

                {/* Roles */}
                <section
                    id="roles"
                    className="mx-auto max-w-5xl scroll-mt-24 px-7 py-18"
                >
                    <div className="mb-10 max-w-[56ch]">
                        <h2
                            ref={rolesHeadingRef}
                            className="text-3xl font-semibold"
                        >
                            <RevealWords text="One login. A dashboard built for your role." />
                        </h2>
                    </div>
                    <div className="grid rounded-2xl border border-[#E1E4EA] bg-white sm:grid-cols-2">
                        <FadeIn className="border-b border-[#E1E4EA] p-7 sm:border-r sm:border-b-0">
                            <span className="rounded bg-[#F5F6F8] px-2.5 py-1 text-xs font-semibold text-[#5B6478]">
                                Students
                            </span>
                            <h3 className="mt-3.5 font-semibold">
                                Show up, vote, stay informed
                            </h3>
                            <ul className="mt-3.5 list-disc space-y-1.5 pl-4.5 text-sm text-[#5B6478]">
                                <li>Vote in council and org elections</li>
                                <li>
                                    Read announcements with a receipt when
                                    you've seen them
                                </li>
                                <li>Raise a concern to your org's officers</li>
                                <li>Join events run by your organization</li>
                            </ul>
                        </FadeIn>
                        <FadeIn delay={0.1} className="p-7">
                            <span className="rounded bg-[#F5F6F8] px-2.5 py-1 text-xs font-semibold text-[#5B6478]">
                                Officers
                            </span>
                            <h3 className="mt-3.5 font-semibold">
                                Run committees without the chaos
                            </h3>
                            <ul className="mt-3.5 list-disc space-y-1.5 pl-4.5 text-sm text-[#5B6478]">
                                <li>
                                    Assign and track tasks on committee boards
                                </li>
                                <li>Plan events with budgets and checklists</li>
                                <li>
                                    Review concerns before forwarding to the
                                    board
                                </li>
                                <li>
                                    Log activities for accreditation reports
                                </li>
                            </ul>
                        </FadeIn>
                    </div>
                </section>

                {/* ACC & OSA information */}
                <section
                    id="acc-osa"
                    className="scroll-mt-24 border-y border-[#E1E4EA] bg-[#F5F6F8] py-18"
                >
                    <div className="mx-auto max-w-5xl px-7">
                        <div className="mb-10 max-w-[60ch]">
                            <h2 className="text-3xl font-semibold text-[#101B33]">
                                Built for the ACC student community.
                            </h2>
                            <p className="mt-3 leading-7 text-[#5B6478]">
                                CouncilForge supports student organizations
                                within Abuyog Community College and complements
                                the work of the Office of Student Affairs (OSA).
                            </p>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-3">
                            <FadeIn className="h-full rounded-2xl border border-[#E1E4EA] bg-white p-6">
                                <span className="text-xs font-semibold tracking-wide text-[#1E56C5]">
                                    THE SCHOOL
                                </span>
                                <h3 className="mt-3 text-xl font-semibold text-[#101B33]">
                                    Abuyog Community College
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-[#5B6478]">
                                    ACC’s mission is to develop capable,
                                    service-oriented graduates through inclusive
                                    and innovative programs. The college was
                                    founded in 1979 and is based in Abuyog,
                                    Leyte.
                                </p>
                                <a
                                    href="https://accabuyog.com/vision-mission-core-values.php"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-5 inline-flex font-semibold text-[#1E56C5] hover:underline"
                                >
                                    School vision &amp; mission{' '}
                                    <span aria-hidden="true" className="ml-1">
                                        ↗
                                    </span>
                                </a>
                            </FadeIn>

                            <FadeIn
                                delay={0.08}
                                className="h-full rounded-2xl border border-[#E1E4EA] bg-white p-6"
                            >
                                <span className="text-xs font-semibold tracking-wide text-[#1E56C5]">
                                    STUDENT SUPPORT
                                </span>
                                <h3 className="mt-3 text-xl font-semibold text-[#101B33]">
                                    Office of Student Affairs
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-[#5B6478]">
                                    OSA supports student welfare and
                                    development, guides student life and
                                    activities, and connects students with the
                                    college administration. Its work also
                                    includes student organizations and
                                    discipline.
                                </p>
                                <a
                                    href="https://accabuyog.com/home/about-osa/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-5 inline-flex font-semibold text-[#1E56C5] hover:underline"
                                >
                                    About OSA{' '}
                                    <span aria-hidden="true" className="ml-1">
                                        ↗
                                    </span>
                                </a>
                            </FadeIn>

                            <FadeIn
                                delay={0.16}
                                className="h-full rounded-2xl border border-[#E1E4EA] bg-white p-6"
                            >
                                <span className="text-xs font-semibold tracking-wide text-[#1E56C5]">
                                    POLICIES &amp; GUIDANCE
                                </span>
                                <h3 className="mt-3 text-xl font-semibold text-[#101B33]">
                                    Know the official policies
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-[#5B6478]">
                                    Refer to ACC’s Student Manual for the
                                    current rules and guidance for students.
                                    CouncilForge helps organizations coordinate
                                    their work; it does not replace college
                                    policies or OSA guidance.
                                </p>
                                <a
                                    href="https://accabuyog.com/home/student-manual/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-5 inline-flex font-semibold text-[#1E56C5] hover:underline"
                                >
                                    View the Student Manual{' '}
                                    <span aria-hidden="true" className="ml-1">
                                        ↗
                                    </span>
                                </a>
                            </FadeIn>
                        </div>

                        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#101B33] px-6 py-5 text-white">
                            <p className="text-sm text-[#D8DED9]">
                                For official announcements, services, and school
                                information, visit ACC’s website.
                            </p>
                            <a
                                href="https://accabuyog.com/home/"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                            >
                                Visit ACC website{' '}
                                <span aria-hidden="true">↗</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#101B33] py-10 text-[#B9C2D6]">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-7">
                        <div className="font-semibold text-white">
                            CouncilForge
                        </div>
                        <div className="text-sm">
                            Built for student councils and their member
                            organizations.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
