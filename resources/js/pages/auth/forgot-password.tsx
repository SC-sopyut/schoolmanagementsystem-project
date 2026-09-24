import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 scale-110 bg-cover bg-center blur-md brightness-[0.55]"
                    style={{
                        backgroundImage: "url('/images/acc-campus-bg.png')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/60" />

                <div className="relative z-10 mx-4 my-8 w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
                    <div className="mb-3 flex justify-center">
                        <img
                            src="/images/councilforge-logo.png"
                            alt="CouncilForge"
                            className="h-16 w-16 rounded-2xl object-contain"
                        />
                    </div>

                    <h1 className="mb-1 text-center text-xl font-semibold text-slate-900 dark:text-white">
                        FORGOT PASSWORD?
                    </h1>
                    <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        Enter your school email and we’ll send you a reset link.
                    </p>

                    {status && (
                        <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            {status}
                        </div>
                    )}

                    <Form {...email.form()} className="flex flex-col gap-4">
                        {({ processing, errors }) => (
                            <>
                                <div>
                                    <Label
                                        htmlFor="email"
                                        className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                    >
                                        School email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        required
                                        placeholder="you@acc.edu.ph"
                                        className="h-10 rounded-lg px-3 text-sm"
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1 text-xs"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                    className="mt-2 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Email password reset link
                                </Button>

                                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                                    Remember your password?{' '}
                                    <TextLink
                                        href={login()}
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Log in
                                    </TextLink>
                                </p>
                            </>
                        )}
                    </Form>

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