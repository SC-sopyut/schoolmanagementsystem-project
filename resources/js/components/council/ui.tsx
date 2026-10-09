import type { ComponentType, ReactNode } from 'react';

/* Shared building blocks for the CouncilForge app screens (Figma: stat cards, pills, avatars, progress bars). */

export type Tone =
    | 'orange'
    | 'purple'
    | 'red'
    | 'gray'
    | 'green'
    | 'blue'
    | 'yellow';

const PILL: Record<Tone, string> = {
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
    green: 'bg-blue-50 text-emerald-600 border-blue-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-amber-50 text-amber-600 border-amber-200',
};

const ICON_BOX: Record<Tone, string> = {
    orange: 'bg-orange-50 text-orange-500',
    purple: 'bg-purple-50 text-purple-500',
    red: 'bg-red-50 text-red-500',
    gray: 'bg-slate-100 text-slate-500',
    green: 'bg-blue-50 text-emerald-500',
    blue: 'bg-blue-50 text-emerald-500',
    yellow: 'bg-amber-50 text-amber-500',
};

/** Same input -> same colour, so a committee/org keeps its tag colour everywhere. Mirrors App\Support\OrgScope::tone(). */
export function toneFor(name: string): Tone {
    const tones: Tone[] = ['orange', 'purple', 'red', 'gray', 'green', 'blue'];
    let h = 0;
    for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return tones[h % tones.length];
}

export function Pill({
    tone = 'gray',
    children,
    dot = false,
    className = '',
}: {
    tone?: Tone;
    children: ReactNode;
    dot?: boolean;
    className?: string;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${PILL[tone]} ${className}`}
        >
            {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {children}
        </span>
    );
}

export const priorityTone = (p: string): Tone =>
    p === 'high' ? 'red' : p === 'medium' ? 'orange' : 'gray';

export function Card({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-xl border border-[#E1E4EA] bg-white ${className}`}
        >
            {children}
        </div>
    );
}

export function StatCard({
    label,
    value,
    sub,
    subTone = 'muted',
    icon: Icon,
    tone = 'blue',
}: {
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    subTone?: 'muted' | 'green' | 'red';
    icon: ComponentType<{ className?: string }>;
    tone?: Tone;
}) {
    return (
        <Card className="p-4">
            <div className="flex items-start justify-between">
                <p className="text-[11px] font-medium tracking-wide text-[#5B6478] uppercase">
                    {label}
                </p>
                <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${ICON_BOX[tone]}`}
                >
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-[#101B33]">{value}</p>
            {sub && (
                <p
                    className={`mt-1 text-xs ${subTone === 'green' ? 'text-emerald-600' : subTone === 'red' ? 'text-red-500' : 'text-[#5B6478]'}`}
                >
                    {sub}
                </p>
            )}
        </Card>
    );
}

export function Avatar({
    name,
    size = 28,
    src,
}: {
    name?: string | null;
    size?: number;
    src?: string | null;
}) {
    const initials = (name ?? '?')
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (
        <span
            style={{ width: size, height: size, fontSize: size * 0.38 }}
            className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#101B33] font-semibold text-white"
        >
            {src ? <img src={src} alt={`${name ?? 'User'} profile photo`} className="h-full w-full rounded-full object-cover" /> : initials}
        </span>
    );
}

export function ProgressBar({
    value,
    tone = 'blue',
}: {
    value: number;
    tone?: 'blue' | 'green' | 'orange';
}) {
    const color =
        tone === 'green'
            ? 'bg-blue-500'
            : tone === 'orange'
              ? 'bg-orange-500'
              : 'bg-blue-600';
    return (
        <div className="h-1.5 w-full rounded-full bg-slate-100">
            <div
                className={`h-1.5 rounded-full ${color}`}
                style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
            />
        </div>
    );
}

export const money = (n: number) => '₱' + Math.round(n).toLocaleString();

export const shortDate = (d?: string | null) =>
    d
        ? new Date(d).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
          })
        : '—';

export function timeAgo(d: string): string {
    const s = Math.max(
        1,
        Math.floor((Date.now() - new Date(d).getTime()) / 1000),
    );
    if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} mins ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
    return `${Math.floor(s / 86400)} days ago`;
}

export function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#101B33]/50 p-4"
            onMouseDown={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#101B33]">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-xl leading-none text-[#5B6478]"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export const inputCls =
    'w-full rounded-lg border border-[#E1E4EA] bg-white px-3 py-2 text-sm text-[#101B33] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
export const btnPrimary =
    'inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50';
export const btnGhost =
    'inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E1E4EA] bg-white px-4 py-2 text-sm font-medium text-[#101B33] hover:bg-slate-50';

export function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#5B6478]">
                {label}
            </span>
            {children}
            {error && (
                <span className="mt-1 block text-xs text-red-500">{error}</span>
            )}
        </label>
    );
}
