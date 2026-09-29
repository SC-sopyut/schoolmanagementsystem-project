import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function AdminTwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/admin/two-factor-challenge');
    }

    return (
        <>
            <Head title="Verify administrator sign in" />
            <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-900">
                <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-xl">
                    <h1 className="text-lg font-semibold">
                        Two-factor verification
                    </h1>
                    <p className="mt-2 mb-6 text-sm text-slate-600">
                        Enter the six-digit code from your authenticator app.
                    </p>
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="admin-code"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Verification code
                            </label>
                            <input
                                id="admin-code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                required
                                autoFocus
                                value={data.code}
                                onChange={(event) =>
                                    setData(
                                        'code',
                                        event.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 6),
                                    )
                                }
                                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm tracking-widest outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                            />
                            {errors.code && (
                                <p className="mt-1.5 text-sm text-red-700">
                                    {errors.code}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-10 w-full rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {processing
                                ? 'Verifying...'
                                : 'Verify and continue'}
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}
