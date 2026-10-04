import { Card } from '@/components/council/ui';
import { useMemo, useState } from 'react';

type Metric = { status: string; count: number };
type Month = { month: string; key: string; tasks: number; concerns: number };
type Props = { tasks_by_status: Metric[]; concerns_by_status: Metric[]; monthly_activity: Month[]; scope?: 'organization' | 'platform' };

const statusLabels: Record<string, string> = {
    backlog: 'Backlog', todo: 'To do', in_progress: 'In progress', review: 'In review', done: 'Completed',
    submitted: 'Submitted', reviewed: 'Reviewed', forwarded: 'Forwarded', resolved: 'Resolved',
};
const statusColors: Record<string, string> = {
    backlog: '#94a3b8', todo: '#08aeea', in_progress: '#ff8500', review: '#8b5cf6', done: '#10b981',
    submitted: '#ff8500', reviewed: '#8b5cf6', forwarded: '#08aeea', resolved: '#10b981',
};
const rangeOptions = [3, 6, 12] as const;

function TrendChart({ activity }: { activity: Month[] }) {
    const width = 640;
    const height = 230;
    const left = 42;
    const right = 18;
    const top = 18;
    const bottom = 36;
    const max = Math.max(1, ...activity.flatMap((month) => [month.tasks, month.concerns]));
    const x = (index: number) => left + (activity.length < 2 ? 0 : (index * (width - left - right)) / (activity.length - 1));
    const y = (value: number) => height - bottom - ((value / max) * (height - top - bottom));
    const pointsFor = (key: 'tasks' | 'concerns') => activity.map((month, index) => `${x(index)},${y(month[key])}`).join(' ');
    const gridValues = [max, Math.round(max / 2), 0];

    return <div className="w-full overflow-hidden"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly task and concern trend" className="h-56 w-full overflow-visible">
        {gridValues.map((value, index) => <g key={`${value}-${index}`}><line x1={left} y1={y(value)} x2={width - right} y2={y(value)} stroke="#e8edf3" strokeDasharray="4 5"/><text x={left - 9} y={y(value) + 4} textAnchor="end" fill="#8792a2" fontSize="10">{value}</text></g>)}
        <polyline points={pointsFor('tasks')} fill="none" stroke="#08aeea" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points={pointsFor('concerns')} fill="none" stroke="#ff8500" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        {activity.map((month, index) => <g key={month.key}><circle cx={x(index)} cy={y(month.tasks)} r="4.5" fill="white" stroke="#08aeea" strokeWidth="3"><title>{month.month}: {month.tasks} tasks created</title></circle><circle cx={x(index)} cy={y(month.concerns)} r="4.5" fill="white" stroke="#ff8500" strokeWidth="3"><title>{month.month}: {month.concerns} concerns submitted</title></circle>{(activity.length <= 6 || index % 2 === 0 || index === activity.length - 1) && <text x={x(index)} y={height - 9} textAnchor="middle" fill="#8792a2" fontSize="10">{month.month}</text>}</g>)}
    </svg></div>;
}

function TaskPie({ metrics }: { metrics: Metric[] }) {
    const total = metrics.reduce((sum, metric) => sum + metric.count, 0);
    let degree = 0;
    const segments = metrics.map((metric) => {
        const start = degree;
        degree += total ? (metric.count / total) * 360 : 0;
        return `${statusColors[metric.status] ?? '#cbd5e1'} ${start}deg ${degree}deg`;
    });
    const background = total ? `conic-gradient(${segments.join(', ')})` : 'conic-gradient(#e2e8f0 0deg 360deg)';

    return <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center"><div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background }} role="img" aria-label={`Task breakdown, ${total} total tasks`}><div className="absolute inset-[25%] flex flex-col items-center justify-center rounded-full bg-white"><b className="text-2xl text-[#08aeea]">{total}</b><span className="text-[10px] text-[#5B6478]">tasks</span></div></div><ul className="w-full space-y-2">{metrics.map((metric) => <li key={metric.status} className="flex items-center justify-between gap-2 text-xs"><span className="flex items-center gap-2 text-[#5B6478]"><i className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: statusColors[metric.status] ?? '#cbd5e1' }}/>{statusLabels[metric.status] ?? metric.status}</span><b>{metric.count}</b></li>)}</ul></div>;
}

function ActivityBars({ activity }: { activity: Month[] }) {
    const max = Math.max(1, ...activity.flatMap((month) => [month.tasks, month.concerns]));
    return <div className="flex h-48 items-end gap-1.5 border-b border-slate-200 px-1 sm:gap-3">{activity.map((month) => <div key={month.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className="flex h-[82%] w-full items-end justify-center gap-1 sm:gap-2"><div title={`${month.tasks} tasks created`} aria-label={`${month.month}: ${month.tasks} tasks created`} className="w-1/3 max-w-7 rounded-t-md bg-[#08aeea] transition-[height] duration-300" style={{ height: `${Math.max(month.tasks ? 5 : 0, (month.tasks / max) * 100)}%` }}/><div title={`${month.concerns} concerns submitted`} aria-label={`${month.month}: ${month.concerns} concerns submitted`} className="w-1/3 max-w-7 rounded-t-md bg-[#ff8500] transition-[height] duration-300" style={{ height: `${Math.max(month.concerns ? 5 : 0, (month.concerns / max) * 100)}%` }}/></div><span className="text-[10px] text-[#8792a2]">{activity.length <= 6 || activity.indexOf(month) % 2 === 0 ? month.month : ''}</span></div>)}</div>;
}

export default function OfficerAnalytics({ tasks_by_status, concerns_by_status, monthly_activity, scope = 'organization' }: Props) {
    const [range, setRange] = useState<(typeof rangeOptions)[number]>(6);
    const activity = useMemo(() => monthly_activity.slice(-range), [monthly_activity, range]);
    const summary = activity.reduce((totals, month) => ({ tasks: totals.tasks + month.tasks, concerns: totals.concerns + month.concerns }), { tasks: 0, concerns: 0 });

    const heading = scope === 'platform' ? 'Platform analytics' : 'Organization analytics';
    const description = scope === 'platform' ? 'Task and concern activity across every organization' : 'Task and concern activity across your organization scope';

    return <section aria-label={heading} className="mt-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold">{heading}</h2><p className="text-xs text-[#5B6478]">{description}</p></div><div className="flex rounded-lg border border-[#E1E4EA] bg-white p-1" aria-label="Chart date range">{rangeOptions.map((option) => <button key={option} type="button" aria-pressed={range === option} onClick={() => setRange(option)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${range === option ? 'bg-[#08aeea] text-white' : 'text-[#5B6478] hover:bg-slate-50'}`}>{option} mo</button>)}</div></div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
            <Card className="p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">Activity trend</h3><p className="mt-1 text-xs text-[#5B6478]">New tasks and concerns by month</p></div><div className="flex gap-4 text-xs"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#08aeea]"/>Tasks</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ff8500]"/>Concerns</span></div></div><TrendChart activity={activity}/></Card>
            <Card className="p-5"><div className="mb-5"><h3 className="font-semibold">Task status mix</h3><p className="mt-1 text-xs text-[#5B6478]">Current work across all task boards in scope</p></div><TaskPie metrics={tasks_by_status}/></Card>
        </div>
        <Card className="p-5"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h3 className="font-semibold">Monthly volume</h3><p className="mt-1 text-xs text-[#5B6478]">{activity.length}-month comparison</p></div><div className="flex gap-4 text-xs"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#08aeea]"/>Tasks <b>{summary.tasks}</b></span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#ff8500]"/>Concerns <b>{summary.concerns}</b></span></div></div><ActivityBars activity={activity}/></Card>
        <details className="group"><summary className="cursor-pointer text-xs font-medium text-[#5B6478]">View status counts</summary><div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2"><Card className="p-4"><h3 className="mb-3 text-sm font-semibold">Tasks by status</h3><ul className="grid grid-cols-2 gap-2 text-xs">{tasks_by_status.map((metric) => <li key={metric.status} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span>{statusLabels[metric.status] ?? metric.status}</span><b>{metric.count}</b></li>)}</ul></Card><Card className="p-4"><h3 className="mb-3 text-sm font-semibold">Concerns by status</h3><ul className="grid grid-cols-2 gap-2 text-xs">{concerns_by_status.map((metric) => <li key={metric.status} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span>{statusLabels[metric.status] ?? metric.status}</span><b>{metric.count}</b></li>)}</ul></Card></div></details>
    </section>;
}
