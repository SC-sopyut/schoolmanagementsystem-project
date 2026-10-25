import { Link } from '@inertiajs/react';
import { CalendarDays, Vote } from 'lucide-react';
import CouncilLayout from '@/layouts/council-layout';
import { Card, Pill, shortDate, toneFor } from '@/components/council/ui';

type Election = {
    id: number;
    title: string;
    description: string | null;
    status: 'open' | 'closed';
    starts_at: string;
    ends_at: string;
    organization: { name: string } | null;
    candidates: unknown[];
    positions: string[] | null;
    voted_positions: string[];
};

export default function Elections({ elections }: { elections: Election[] }) {
    return (
        <CouncilLayout title="Elections">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <Vote className="h-5 w-5 text-emerald-700" />
                        <h2 className="text-2xl font-bold">Elections</h2>
                    </div>
                    <p className="mt-1 text-sm text-[#5B6478]">
                        Cast one private ballot for each position while an
                        election is open.
                    </p>
                </div>

                {elections.length === 0 ? (
                    <Card className="p-10 text-center">
                        <Vote className="mx-auto h-8 w-8 text-[#7B8496]" />
                        <h3 className="mt-3 font-semibold">
                            No elections are available
                        </h3>
                        <p className="mt-1 text-sm text-[#5B6478]">
                            Open elections for your organizations will appear
                            here.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {elections.map((election) => {
                            const organization =
                                election.organization?.name ?? 'School-wide';
                            const complete = (election.positions ?? []).every(
                                (position) =>
                                    election.voted_positions.includes(position),
                            );
                            return (
                                <Card
                                    key={election.id}
                                    className="flex flex-col p-5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <Pill tone={toneFor(organization)} dot>
                                            {organization}
                                        </Pill>
                                        <Pill
                                            tone={
                                                election.status === 'open'
                                                    ? 'green'
                                                    : 'gray'
                                            }
                                        >
                                            {election.status === 'open'
                                                ? 'Open'
                                                : 'Closed'}
                                        </Pill>
                                    </div>
                                    <h3 className="mt-4 font-semibold">
                                        {election.title}
                                    </h3>
                                    {election.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-[#5B6478]">
                                            {election.description}
                                        </p>
                                    )}
                                    <p className="mt-3 flex items-center gap-1 text-xs text-[#5B6478]">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Ends {shortDate(election.ends_at)}
                                    </p>
                                    <p className="mt-2 text-xs text-[#5B6478]">
                                        {election.candidates.length} candidates
                                        · {(election.positions ?? []).length}{' '}
                                        positions
                                    </p>
                                    <Link
                                        href={`/student/elections/${election.id}`}
                                        className="mt-5 inline-flex justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                                    >
                                        {election.status === 'open'
                                            ? complete
                                                ? 'View ballot'
                                                : 'Cast ballot'
                                            : 'View election'}
                                    </Link>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </CouncilLayout>
    );
}
