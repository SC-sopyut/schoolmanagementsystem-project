import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function AdminLogin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/admin/login', { onFinish: () => reset('password') });
    }

    return (
        <>
            <Head title="Administrator sign in" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
                {/* Blurred background */}
                <div
                    className="absolute inset-0 scale-110 bg-cover bg-center blur-md brightness-[0.55]"
                    style={{
                        backgroundImage: "url('/images/acc-campus-bg.png')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/60" />

                {/* Login card */}
                <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
                    <div className="mb-3 flex justify-center">
                        <img
                            src="/images/councilforge-logo.png"
                            alt="CouncilForge"
                            className="h-16 w-16 rounded-2xl object-contain"
                        />
                    </div>

                    <h1 className="mb-1 text-center text-xl font-semibold text-slate-900 dark:text-white">
                        ADMINISTRATOR LOGIN
                    </h1>
                    <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        CouncilForge Administration
                    </p>

                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label
                                htmlFor="admin-email"
                                className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                            >
                                Email address
                            </label>
                            <input
                                id="admin-email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoFocus
                                required
                                autoComplete="username"
                                placeholder="admin@acc.edu.ph"
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border-slate-300 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="admin-password"
                                className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                            >
                                Password
                            </label>
                            <input
                                id="admin-password"
                                type="password"
                                name="password"
                                value={data.password}
                                required
                                autoComplete="current-password"
                                placeholder="Enter password"
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border-slate-300 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mb-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {processing
                                ? 'Signing in...'
                                : 'Sign in as Administrator'}
                        </button>

                        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                            Not an administrator?{' '}
                            <Link
                                href="/login"
                                className="text-indigo-600 hover:underline"
                            >
                                Return to regular sign in
                            </Link>
                        </p>
                    </form>

                    <div className="mt-5 flex items-center justify-center gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-400 dark:border-slate-700">
                        <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        Secured connection
                    </div>
                </div>
            </div>
        </>
    );
}
