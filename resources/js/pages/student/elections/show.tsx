import { router } from '@inertiajs/react';
import { useState } from 'react';
import CouncilLayout from '@/layouts/council-layout';
import { Card, Pill, shortDate, toneFor } from '@/components/council/ui';

type Candidate = {
    id: number;
    position: string;
    party_name: string | null;
    platform: string | null;
    user: { id: number; name: string };
};
type Election = {
    id: number;
    title: string;
    description: string | null;
    status: 'open' | 'closed';
    starts_at: string;
    ends_at: string;
    organization: { name: string } | null;
    positions: string[] | null;
    candidates: Candidate[];
    voted_positions: string[];
};

export default function ElectionBallot({ election }: { election: Election }) {
    const [choice, setChoice] = useState<Record<string, number>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const positions = election.positions ?? [];
    const organization = election.organization?.name ?? 'School-wide';
    const canVote =
        election.status === 'open' && new Date(election.ends_at) > new Date();

    function vote(position: string) {
        const candidateId = choice[position];
        if (!candidateId) {
            setErrors((current) => ({
                ...current,
                [position]: 'Choose a candidate first.',
            }));
            return;
        }
        router.post(
            `/student/elections/${election.id}/vote`,
            { candidate_id: candidateId, position },
            {
                preserveScroll: true,
                onError: (responseErrors) =>
                    setErrors((current) => ({
                        ...current,
                        [position]:
                            Object.values(responseErrors)[0] ??
                            'Your ballot could not be recorded.',
                    })),
            },
        );
    }

    return (
        <CouncilLayout title="Election ballot">
            <div className="mx-auto max-w-3xl">
                <Card className="mb-5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Pill tone={toneFor(organization)} dot>
                            {organization}
                        </Pill>
                        <Pill
                            tone={election.status === 'open' ? 'green' : 'gray'}
                        >
                            {election.status}
                        </Pill>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold">
                        {election.title}
                    </h2>
                    {election.description && (
                        <p className="mt-2 text-sm text-[#5B6478]">
                            {election.description}
                        </p>
                    )}
                    <p className="mt-3 text-xs text-[#5B6478]">
                        Voting window: {shortDate(election.starts_at)} –{' '}
                        {shortDate(election.ends_at)}
                    </p>
                </Card>

                <div className="space-y-4">
                    {positions.map((position) => {
                        const hasVoted =
                            election.voted_positions.includes(position);
                        const candidates = election.candidates.filter(
                            (candidate) => candidate.position === position,
                        );
                        return (
                            <Card key={position} className="p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-semibold">
                                        {position}
                                    </h3>
                                    {hasVoted && (
                                        <Pill tone="green">
                                            Ballot recorded
                                        </Pill>
                                    )}
                                </div>
                                {candidates.length === 0 ? (
                                    <p className="mt-3 text-sm text-[#5B6478]">
                                        No candidates are listed for this
                                        position.
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-2">
                                        {candidates.map((candidate) => (
                                            <label
                                                key={candidate.id}
                                                className={`block rounded-lg border p-3 ${hasVoted ? 'opacity-60' : 'cursor-pointer hover:border-emerald-600'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`position-${position}`}
                                                    disabled={
                                                        !canVote || hasVoted
                                                    }
                                                    checked={
                                                        choice[position] ===
                                                        candidate.id
                                                    }
                                                    onChange={() => {
                                                        setChoice(
                                                            (current) => ({
                                                                ...current,
                                                                [position]:
                                                                    candidate.id,
                                                            }),
                                                        );
                                                        setErrors(
                                                            (current) => ({
                                                                ...current,
                                                                [position]: '',
                                                            }),
                                                        );
                                                    }}
                                                    className="mr-3 accent-emerald-700"
                                                />
                                                <span className="font-medium">
                                                    {candidate.user.name}
                                                </span>
                                                <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                                    {candidate.party_name ||
                                                        'Independent'}
                                                </span>
                                                {candidate.platform && (
                                                    <span className="mt-1 block pl-6 text-sm text-[#5B6478]">
                                                        {candidate.platform}
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {!hasVoted &&
                                    canVote &&
                                    candidates.length > 0 && (
                                        <button
                                            onClick={() => vote(position)}
                                            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                                        >
                                            Submit vote for {position}
                                        </button>
                                    )}
                                {errors[position] && (
                                    <p
                                        className="mt-2 text-sm text-red-600"
                                        role="alert"
                                    >
                                        {errors[position]}
                                    </p>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </CouncilLayout>
    );
}
