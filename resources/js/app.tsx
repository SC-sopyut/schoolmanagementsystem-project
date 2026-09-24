import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useEffect, useState, useRef } from 'react';
import { router } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function PageLoadingOverlay() {
    const [visible, setVisible] = useState(false);
    const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const removeStartListener = router.on('start', () => {
            showTimer.current = setTimeout(() => {
                setVisible(true);
            }, 150);
        });

        const removeFinishListener = router.on('finish', () => {
            if (showTimer.current) {
                clearTimeout(showTimer.current);
                showTimer.current = null;
            }

            setVisible(false);
        });

        return () => {
            if (showTimer.current) clearTimeout(showTimer.current);
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${
                visible
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0'
            }`}
            role="status"
            aria-live="polite"
            aria-hidden={!visible}
        >
            <div
                className={`flex flex-col items-center transition-transform duration-300 ease-out ${
                    visible ? 'scale-100' : 'scale-95'
                }`}
            >
                <img
                    src="/images/councilforge-logo.png"
                    alt=""
                    className="mb-4 h-16 w-16 object-contain"
                />
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-indigo-500" />
                <p className="mt-4 text-sm font-medium text-white">
                    Loading...
                </p>
            </div>
        </div>
    );
}

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'auth/login':
            case name === 'auth/register':
            case name === 'auth/forgot-password':
            case name === 'auth/reset-password':
                return null;

            case name.startsWith('auth/'):
                return AuthLayout;

            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];

            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <PageLoadingOverlay />
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
