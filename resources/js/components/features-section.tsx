import { FadeIn } from '@/components/fade-in';
import { RevealWords } from '@/components/reveal-words';
import { Link } from '@inertiajs/react';
import {
    CalendarCheck,
    ClipboardList,
    Megaphone,
    MessageSquareWarning,
    ShieldCheck,
    Vote,
    Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';

// Wayfinder-generated typed route helpers (adjust import paths to match your
// generated routes/ folder — these mirror the names registered in routes/features.php)
import { index as electionsIndex } from '@/routes/student/elections';
import { index as announcementsIndex } from '@/routes/student/announcements';
import { index as concernsIndex } from '@/routes/student/concerns';
import { index as studentEventsIndex } from '@/routes/student/events';
import { board } from '@/routes/officer';
import { index as officerEventsIndex } from '@/routes/officer/events';
import { index as officerConcernsIndex } from '@/routes/officer/concerns';
import { index as activityLogsIndex } from '@/routes/officer/activity-logs';

type FeatureCard = {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
    href: string;
};

// Student-facing capabilities. Each href points at a route guarded server-side
// by the 'auth' + 'verified' middleware group (see routes/features.php) — this
// component only controls what's *shown*, never what's *reachable*.
const studentFeatures: FeatureCard[] = [
    {
        icon: Vote,
        title: 'Vote in Elections',
        description:
            'Cast your ballot in council-wide and organization elections during the open voting window. One vote per position, every time.',
        href: electionsIndex().url,
    },
    {
        icon: Megaphone,
        title: 'Read Announcements',
        description:
            'Stay current on council and org updates. Opening an announcement records your read receipt automatically.',
        href: announcementsIndex().url,
    },
    {
        icon: MessageSquareWarning,
        title: 'Raise a Concern',
        description:
            'Send a concern straight to your organization\u2019s officers for review \u2014 no anonymity, no guesswork about who sees it.',
        href: concernsIndex().url,
    },
    {
        icon: CalendarCheck,
        title: 'Join Org Events',
        description:
            'Browse school-wide and organization events and reserve your spot with one tap.',
        href: studentEventsIndex().url,
    },
];

// Officer-facing capabilities. All require an `officers` row, enforced by the
// 'is_officer' middleware alias — students without an officer position never
// see functioning links, only the marketing/preview state of this section.
const officerFeatures: FeatureCard[] = [
    {
        icon: ClipboardList,
        title: 'Assign & Track Tasks',
        description:
            'Run your committee\u2019s Kanban board \u2014 assign tasks, set due dates, and move cards from backlog to done.',
        href: board().url,
    },
    {
        icon: Wallet,
        title: 'Plan Events & Budgets',
        description:
            'Build an event with a line-item budget and a prep checklist in one step, then track it through to completion.',
        href: officerEventsIndex().url,
    },
    {
        icon: ShieldCheck,
        title: 'Review & Forward Concerns',
        description:
            'Review concerns raised against your organization, add your notes, then forward the ones that need the board\u2019s attention.',
        href: officerConcernsIndex().url,
    },
    {
        icon: ClipboardList,
        title: 'Log Activities',
        description:
            'Keep a running record of meetings, events, and trainings for your organization\u2019s accreditation report.',
        href: activityLogsIndex().url,
    },
];

function FeatureCardGrid({ features }: { features: FeatureCard[] }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((feature) => (
                <FadeIn key={feature.title}>
                    <Link
                        href={feature.href}
                        className="group block h-full rounded-2xl border border-[#E1E4EA] bg-white p-6 transition hover:border-[#C1571F]/40 hover:shadow-sm"
                    >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#C1571F]/10 text-[#C1571F]">
                            <feature.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mb-2 text-base font-semibold text-[#101B33]">
                            {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-[#5B6478]">
                            {feature.description}
                        </p>
                    </Link>
                </FadeIn>
            ))}
        </div>
    );
}

/**
 * Features section for the CouncilForge landing/dashboard shell, split into
 * a Students column and an Officers column. Follows welcome.tsx conventions:
 * max-w-5xl content column, scroll-anchored section, word-reveal heading,
 * fade-in cards, and the shared navy/orange/muted palette.
 */
export function FeaturesSection() {
    return (
        <section id="features" className="scroll-mt-24 bg-[#F5F6F8] py-24">
            <div className="mx-auto max-w-5xl px-7">
                <FadeIn>
                    <p className="mb-3 text-sm font-medium tracking-wide text-[#C1571F] uppercase">
                        What you can do
                    </p>
                </FadeIn>
                <h2 className="mb-14 max-w-2xl text-3xl font-semibold text-[#101B33] sm:text-4xl">
                    <RevealWords text="One platform, built around what students and officers actually do." />
                </h2>

                <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
                    <div>
                        <FadeIn>
                            <h3 className="mb-6 text-lg font-semibold text-[#101B33]">
                                For Students
                            </h3>
                        </FadeIn>
                        <FeatureCardGrid features={studentFeatures} />
                    </div>

                    <div>
                        <FadeIn>
                            <h3 className="mb-6 text-lg font-semibold text-[#101B33]">
                                For Officers
                            </h3>
                        </FadeIn>
                        <FeatureCardGrid features={officerFeatures} />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FeaturesSection;
