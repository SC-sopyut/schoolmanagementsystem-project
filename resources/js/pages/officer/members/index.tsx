import CouncilLayout from '@/layouts/council-layout';
import {
    Field,
    Modal,
    btnGhost,
    btnPrimary,
    inputCls,
} from '@/components/council/ui';
import { useForm } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    Mail,
    Network,
    Plus,
    Search,
    ShieldCheck,
    Users,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_officer: boolean;
    is_executive: boolean;
    organizations: string[];
    teams: string[];
    profile_complete: boolean;
};
type Organization = { id: number; name: string };
type Props = {
    members: Member[];
    executives: Member[];
    organizations: Organization[];
    available_users: { id: number; name: string; email: string }[];
    analytics: {
        member_count: number;
        officer_count: number;
        executive_count: number;
        committee_count: number;
        profile_complete_percent: number;
        profile_complete_count: number;
        membership_by_type: { name: string; count: number }[];
        by_organization: { name: string; count: number }[];
    };
};
type AddMemberForm = { user_id: string; organization_id: string };
const PAGE_SIZE = 6;
const DONUT_COLORS = ['#176b35', '#2ba66b'];

export default function Members({
    members,
    executives,
    organizations,
    available_users,
    analytics,
}: Props) {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('All roles');
    const [organization, setOrganization] = useState('All organizations');
    const [profileStatus, setProfileStatus] = useState('All profiles');
    const [page, setPage] = useState(0);
    const [addOpen, setAddOpen] = useState(false);
    const form = useForm<AddMemberForm>({
        user_id: '',
        organization_id: organizations[0] ? String(organizations[0].id) : '',
    });
    const roles = useMemo(
        () => [...new Set(members.map((member) => member.role))].sort(),
        [members],
    );
    const filtered = useMemo(
        () =>
            members.filter((member) => {
                const q = search.toLowerCase().trim();
                const matchesSearch =
                    !q ||
                    `${member.name} ${member.email} ${member.role} ${member.organizations.join(' ')} ${member.teams.join(' ')}`
                        .toLowerCase()
                        .includes(q);
                const matchesRole =
                    role === 'All roles' || member.role === role;
                const matchesOrg =
                    organization === 'All organizations' ||
                    member.organizations.includes(organization);
                const matchesProfile =
                    profileStatus === 'All profiles' ||
                    (profileStatus === 'Complete'
                        ? member.profile_complete
                        : !member.profile_complete);
                return (
                    matchesSearch && matchesRole && matchesOrg && matchesProfile
                );
            }),
        [members, search, role, organization, profileStatus],
    );
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount - 1);
    const visible = filtered.slice(
        currentPage * PAGE_SIZE,
        (currentPage + 1) * PAGE_SIZE,
    );
    const memberCount = analytics.membership_by_type.reduce(
        (total, item) => total + item.count,
        0,
    );
    const officerPercent = memberCount
        ? (analytics.officer_count / memberCount) * 100
        : 0;
    const memberPercent = memberCount ? 100 - officerPercent : 0;

    function exportDirectory() {
        const csv = [
            ['Name', 'Email', 'Role', 'Organizations', 'Teams', 'Profile'],
            ...filtered.map((member) => [
                member.name,
                member.email,
                member.role,
                member.organizations.join('; '),
                member.teams.join('; '),
                member.profile_complete ? 'Complete' : 'Incomplete',
            ]),
        ]
            .map((row) =>
                row
                    .map((value) => `"${value.replaceAll('"', '""')}"`)
                    .join(','),
            )
            .join('\r\n');
        const url = URL.createObjectURL(
            new Blob([csv], { type: 'text/csv;charset=utf-8' }),
        );
        const link = document.createElement('a');
        link.href = url;
        link.download = 'council-members.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    function addMember(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/officer/members', {
            preserveScroll: true,
            onSuccess: () => {
                setAddOpen(false);
                form.reset('user_id');
            },
        });
    }

    return (
        <CouncilLayout title="Members">
            <div className="members-dashboard mx-auto max-w-7xl space-y-5 pb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[.16em] text-emerald-700 uppercase">
                            Council directory
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-[#12351f]">
                            Members
                        </h1>
                        <p className="mt-1 text-sm text-[#64806a]">
                            One council, one shared purpose. Meet your officer
                            team.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={exportDirectory}
                            className={btnGhost}
                        >
                            <Download className="h-4 w-4" /> Export directory
                        </button>
                        <button
                            type="button"
                            onClick={() => setAddOpen(true)}
                            className={btnPrimary}
                        >
                            <Plus className="h-4 w-4" /> Add member
                        </button>
                    </div>
                </div>

                <section
                    className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                    aria-label="Membership analytics"
                >
                    <Metric
                        label="Active members"
                        value={`${analytics.member_count} people`}
                        caption={`${analytics.profile_complete_percent}% profile details complete`}
                        icon={Users}
                        tone="green"
                    />
                    <Metric
                        label="Executive officers"
                        value={`${analytics.executive_count} officers`}
                        caption="Council leadership team"
                        icon={ShieldCheck}
                        tone="blue"
                    />
                    <Metric
                        label="Committees"
                        value={`${analytics.committee_count} teams`}
                        caption="Working teams in your organization scope"
                        icon={Network}
                        tone="purple"
                    />
                    <Metric
                        label="Profiles complete"
                        value={`${analytics.profile_complete_percent}%`}
                        caption={`${analytics.profile_complete_count} of ${analytics.member_count} profiles have name and email`}
                        icon={CheckCircle2}
                        tone="gold"
                    />
                </section>

                <section>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 font-bold text-[#173a22]">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            Executive officers
                        </h2>
                        <span className="text-xs text-[#718574]">
                            {organizations.map((item) => item.name).join(' · ')}
                        </span>
                    </div>
                    {executives.length ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {executives.map((member, index) => (
                                <ExecutiveCard
                                    key={member.id}
                                    member={member}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-[#dce9d8] bg-white px-5 py-6 text-sm text-[#718574]">
                            No executive officer titles are set in this
                            organization scope yet.
                        </div>
                    )}
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
                    <div className="rounded-2xl border border-[#dce9d8] bg-white p-5 shadow-sm">
                        <div className="mb-4">
                            <h2 className="font-bold text-[#173a22]">
                                Membership by organization
                            </h2>
                            <p className="mt-1 text-xs text-[#718574]">
                                People with an officer profile or membership
                                record.
                            </p>
                        </div>
                        {analytics.by_organization.length ? (
                            <div className="space-y-4">
                                {analytics.by_organization
                                    .slice(0, 6)
                                    .map((item) => (
                                        <div key={item.name}>
                                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                                <span className="font-medium text-[#35543b]">
                                                    {item.name}
                                                </span>
                                                <strong className="text-[#27412d]">
                                                    {item.count}
                                                </strong>
                                            </div>
                                            <div className="h-2.5 overflow-hidden rounded-full bg-[#f0f4ed]">
                                                <div
                                                    className="h-full rounded-full bg-[#27884c]"
                                                    style={{
                                                        width: `${Math.max(4, (item.count / Math.max(1, analytics.member_count)) * 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <EmptyAnalytics
                                title="No membership data yet"
                                body="Add members to your organization to see the directory breakdown."
                            />
                        )}
                    </div>
                    <div className="rounded-2xl border border-[#dce9d8] bg-white p-5 shadow-sm">
                        <div className="mb-4">
                            <h2 className="font-bold text-[#173a22]">
                                Council composition
                            </h2>
                            <p className="mt-1 text-xs text-[#718574]">
                                Officer and member account mix.
                            </p>
                        </div>
                        {memberCount ? (
                            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
                                <div
                                    className="grid h-40 w-40 shrink-0 place-items-center rounded-full"
                                    style={{
                                        background: `conic-gradient(${DONUT_COLORS[0]} 0% ${officerPercent}%, ${DONUT_COLORS[1]} ${officerPercent}% 100%)`,
                                    }}
                                    role="img"
                                    aria-label={`${analytics.officer_count} officers and ${analytics.member_count - analytics.officer_count} members`}
                                >
                                    <div className="grid h-28 w-28 place-content-center rounded-full bg-white text-center">
                                        <strong className="text-2xl text-[#173a22]">
                                            {memberCount}
                                        </strong>
                                        <span className="text-[10px] text-[#718574]">
                                            people
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <CompositionRow
                                        color={DONUT_COLORS[0]}
                                        label="Officers"
                                        value={analytics.officer_count}
                                        percent={Math.round(officerPercent)}
                                    />
                                    <CompositionRow
                                        color={DONUT_COLORS[1]}
                                        label="Members"
                                        value={
                                            analytics.member_count -
                                            analytics.officer_count
                                        }
                                        percent={Math.round(memberPercent)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <EmptyAnalytics
                                title="No members to summarize"
                                body="Organization membership analytics will appear here."
                            />
                        )}
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-[#dce9d8] bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div>
                            <h2 className="flex items-center gap-2 font-bold text-[#173a22]">
                                <span className="h-2 w-2 rounded-full bg-amber-400" />
                                Officer directory
                            </h2>
                            <p className="mt-1 text-xs text-[#718574]">
                                Roles, teams, and contact details — all in one
                                place.
                            </p>
                        </div>
                        <span className="text-xs text-[#718574]">
                            {filtered.length}{' '}
                            {filtered.length === 1 ? 'person' : 'people'}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
                        <label className="relative min-w-[220px] flex-1">
                            <span className="sr-only">Search members</span>
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-[#718574]" />
                            <input
                                className="w-full rounded-lg border border-[#dce9d8] bg-[#fbfdf9] py-2 pr-3 pl-9 text-sm outline-none focus:border-emerald-600"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Search name or email…"
                            />
                        </label>
                        <select
                            aria-label="Filter by role"
                            className="rounded-lg border border-[#dce9d8] bg-[#fbfdf9] px-3 py-2 text-sm"
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value);
                                setPage(0);
                            }}
                        >
                            <option>All roles</option>
                            {roles.map((item) => (
                                <option key={item}>{item}</option>
                            ))}
                        </select>
                        <select
                            aria-label="Filter by organization"
                            className="rounded-lg border border-[#dce9d8] bg-[#fbfdf9] px-3 py-2 text-sm"
                            value={organization}
                            onChange={(e) => {
                                setOrganization(e.target.value);
                                setPage(0);
                            }}
                        >
                            <option>All organizations</option>
                            {organizations.map((item) => (
                                <option key={item.name}>{item.name}</option>
                            ))}
                        </select>
                        <select
                            aria-label="Filter by profile completeness"
                            className="rounded-lg border border-[#dce9d8] bg-[#fbfdf9] px-3 py-2 text-sm"
                            value={profileStatus}
                            onChange={(e) => {
                                setProfileStatus(e.target.value);
                                setPage(0);
                            }}
                        >
                            <option>All profiles</option>
                            <option>Complete</option>
                            <option>Needs update</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto px-5">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="bg-[#f7faf4] text-[10px] font-bold tracking-wide text-[#718574] uppercase">
                                <tr>
                                    <th className="px-3 py-3">Member</th>
                                    <th className="px-3 py-3">Role</th>
                                    <th className="px-3 py-3">
                                        Organization / team
                                    </th>
                                    <th className="px-3 py-3">Status</th>
                                    <th className="px-3 py-3">Profile</th>
                                    <th className="px-3 py-3 text-right">
                                        Contact
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf2ea]">
                                {visible.map((member, index) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-[#fbfdf9]"
                                    >
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                <Initials
                                                    name={member.name}
                                                    index={index}
                                                />
                                                <div>
                                                    <p className="font-semibold text-[#27412d]">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-[#718574]">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-[#35543b]">
                                            {member.role}
                                        </td>
                                        <td className="max-w-[260px] px-3 py-3">
                                            <p
                                                className="truncate text-[#64806a]"
                                                title={member.organizations.join(
                                                    ', ',
                                                )}
                                            >
                                                {member.organizations.join(
                                                    ', ',
                                                ) || '—'}
                                            </p>
                                            <p
                                                className="truncate text-[10px] text-[#718574]"
                                                title={member.teams.join(', ')}
                                            >
                                                {member.teams.length
                                                    ? `Teams: ${member.teams.join(', ')}`
                                                    : 'No assigned team tasks'}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs ${member.profile_complete ? 'text-emerald-800' : 'text-amber-700'}`}
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {member.profile_complete
                                                    ? 'Complete'
                                                    : 'Needs update'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <a
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline"
                                                href={`mailto:${encodeURIComponent(member.email)}`}
                                            >
                                                <Mail className="h-3.5 w-3.5" />
                                                Email
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {visible.length === 0 && (
                            <div className="py-12 text-center">
                                <Users className="mx-auto h-8 w-8 text-[#8baa8a]" />
                                <p className="mt-2 font-semibold text-[#27412d]">
                                    No members match those filters
                                </p>
                                <p className="mt-1 text-sm text-[#718574]">
                                    Clear a filter or change your search.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-xs text-[#718574]">
                        <span>
                            Showing{' '}
                            {filtered.length ? currentPage * PAGE_SIZE + 1 : 0}–
                            {Math.min(
                                (currentPage + 1) * PAGE_SIZE,
                                filtered.length,
                            )}{' '}
                            of {filtered.length} people
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage === 0}
                                onClick={() =>
                                    setPage((value) => Math.max(0, value - 1))
                                }
                                className="rounded-md border border-[#dce9d8] p-1.5 disabled:opacity-40"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: pageCount }, (_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setPage(index)}
                                    className={`h-8 min-w-8 rounded-md px-2 text-xs ${currentPage === index ? 'bg-[#176b35] font-bold text-white' : 'hover:bg-emerald-50'}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={currentPage >= pageCount - 1}
                                onClick={() =>
                                    setPage((value) =>
                                        Math.min(pageCount - 1, value + 1),
                                    )
                                }
                                className="rounded-md border border-[#dce9d8] p-1.5 disabled:opacity-40"
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <Modal
                open={addOpen}
                onClose={() => {
                    setAddOpen(false);
                    form.clearErrors();
                }}
                title="Add member to organization"
            >
                <form className="space-y-4" onSubmit={addMember}>
                    <p className="text-sm text-[#718574]">
                        Add an existing account to one of the organizations in
                        your scope.
                    </p>
                    <Field
                        label="Organization"
                        error={form.errors.organization_id}
                    >
                        <select
                            className={inputCls}
                            value={form.data.organization_id}
                            onChange={(e) =>
                                form.setData('organization_id', e.target.value)
                            }
                            required
                        >
                            {organizations.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Account" error={form.errors.user_id}>
                        <select
                            className={inputCls}
                            value={form.data.user_id}
                            onChange={(e) =>
                                form.setData('user_id', e.target.value)
                            }
                            required
                        >
                            <option value="">Choose a person</option>
                            {available_users.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name} · {item.email}
                                </option>
                            ))}
                        </select>
                    </Field>
                    {!available_users.length && (
                        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
                            There are no eligible existing accounts to add right
                            now. New people can register first, then be added
                            here.
                        </p>
                    )}
                    <div className="flex justify-end gap-2 border-t border-[#edf2ea] pt-4">
                        <button
                            type="button"
                            onClick={() => setAddOpen(false)}
                            className={btnGhost}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={btnPrimary}
                            disabled={
                                form.processing || !available_users.length
                            }
                        >
                            <Plus className="h-4 w-4" />
                            {form.processing ? 'Adding…' : 'Add member'}
                        </button>
                    </div>
                </form>
            </Modal>
        </CouncilLayout>
    );
}

function Metric({
    label,
    value,
    caption,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    caption: string;
    icon: typeof Users;
    tone: 'green' | 'blue' | 'purple' | 'gold';
}) {
    const styles = {
        green: 'bg-[#e9f5e7] text-[#155b2d]',
        blue: 'bg-[#e7f2ec] text-[#176b35]',
        purple: 'bg-[#efe8f7] text-[#674296]',
        gold: 'bg-[#fcf1d6] text-[#8f6c13]',
    };
    return (
        <div className="rounded-2xl border border-[#dce9d8] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wide text-[#52705a] uppercase">
                    {label}
                </span>
                <span
                    className={`grid h-8 w-8 place-items-center rounded-lg ${styles[tone]}`}
                >
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#173a22]">{value}</p>
            <p className="mt-1 min-h-4 text-xs text-[#718574]">{caption}</p>
            <div className="mt-3 h-0.5 w-8 rounded-full bg-amber-400" />
        </div>
    );
}
function Initials({ name, index }: { name: string; index: number }) {
    const colors = [
        'bg-[#e8f3e7] text-[#1c6936]',
        'bg-[#e8f0fa] text-[#315e91]',
        'bg-[#f2eafa] text-[#7043a1]',
        'bg-[#fff2d8] text-[#936b13]',
    ];
    return (
        <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ${colors[index % colors.length]}`}
        >
            {name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase()}
        </span>
    );
}
function ExecutiveCard({ member, index }: { member: Member; index: number }) {
    return (
        <div className="rounded-2xl border border-[#dce9d8] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <Initials name={member.name} index={index} />
                <a
                    href={`mailto:${encodeURIComponent(member.email)}`}
                    aria-label={`Email ${member.name}`}
                    className="grid h-8 w-8 place-items-center rounded-full bg-[#f7faf3] text-emerald-800 hover:bg-emerald-100"
                >
                    <Mail className="h-4 w-4" />
                </a>
            </div>
            <p className="mt-3 font-bold text-[#27412d]">{member.name}</p>
            <p className="mt-1 text-xs text-[#64806a]">{member.role}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
                <span className="max-w-[60%] truncate rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
                    {member.is_executive ? 'Executive' : 'Officer'}
                </span>
                <span className="text-[10px] text-[#718574]">
                    {member.profile_complete
                        ? 'Profile complete ✓'
                        : 'Needs update'}
                </span>
            </div>
        </div>
    );
}
function CompositionRow({
    color,
    label,
    value,
    percent,
}: {
    color: string;
    label: string;
    value: number;
    percent: number;
}) {
    return (
        <div className="flex items-center gap-2">
            <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
            />
            <span className="text-[#64806a]">{label}</span>
            <strong className="text-[#27412d]">{value}</strong>
            <span className="text-xs text-[#718574]">{percent}%</span>
        </div>
    );
}
function EmptyAnalytics({ title, body }: { title: string; body: string }) {
    return (
        <div className="grid min-h-48 content-center justify-items-center rounded-xl bg-[#f7faf3] px-5 py-8 text-center">
            <Building2 className="mb-2 h-7 w-7 text-emerald-700" />
            <p className="font-semibold text-[#27412d]">{title}</p>
            <p className="mt-1 max-w-xs text-sm text-[#718574]">{body}</p>
        </div>
    );
}
