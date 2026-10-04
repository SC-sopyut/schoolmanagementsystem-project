import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export function AppearanceToggle({ className = '' }: { className?: string }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

    return (
        <button
            type="button"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            aria-label={label}
            title={label}
            aria-pressed={isDark}
            style={{
                backgroundColor: isDark ? '#f4f8f1' : '#0c351d',
                color: isDark ? '#0c351d' : '#f4f8f1',
                borderColor: isDark ? '#d6e6d1' : '#285037',
            }}
            className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${className}`}
        >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
    );
}
