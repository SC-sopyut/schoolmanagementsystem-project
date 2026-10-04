import type { HTMLAttributes, ReactNode } from 'react';

export function FadeIn({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
    return <div className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${className}`} {...props}>{children}</div>;
}
