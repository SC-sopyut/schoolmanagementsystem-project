import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { login, register } from '@/routes';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } =
        useForm<LoginForm>({
            email: '',
            password: '',
            remember: false,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(login.url(), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

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
                        LOGIN TO COUNCIL
                    </h1>
                    <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        Student Council Management Platform
                    </p>

                    {status && (
                        <div className="mb-4 text-center text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                            >
                                School email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoFocus
                                autoComplete="username"
                                placeholder="you@acc.edu.ph"
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="w-full h-10 rounded-lg px-3 border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="mb-2">
                            <label
                                htmlFor="password"
                                className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                placeholder="Enter password"
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="w-full h-10 rounded-lg px-3 border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="mb-6 flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                    className="rounded border-slate-300 text-indigo-600 shadow-sm"
                                />
                                Remember this device
                            </label>

                            <Link
                                href="/forgot-password"
                                className="text-indigo-600 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mb-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                            Sign in to Council
                        </button>

                        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                            Need to register your team?{' '}
                            <Link
                                href={register.url()}
                                className="text-indigo-600 hover:underline"
                            >
                                Create account
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
