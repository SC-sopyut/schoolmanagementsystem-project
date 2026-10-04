import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />

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
                        CREATE YOUR ACCOUNT
                    </h1>
                    <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        Student Council Management Platform
                    </p>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password', 'password_confirmation']}
                        disableWhileProcessing
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div>
                                    <Label
                                        htmlFor="name"
                                        className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                    >
                                        Full name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Your full name"
                                        className="h-10 rounded-lg px-3 text-sm"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-1 text-xs"
                                    />
                                </div>

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
                                        required
                                        autoComplete="email"
                                        name="email"
                                        placeholder="you@acc.edu.ph"
                                        className="h-10 rounded-lg px-3 text-sm"
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1 text-xs"
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="password"
                                        className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                    >
                                        Password
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        required
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-1 text-xs"
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                    >
                                        Confirm password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm your password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="mt-1 text-xs"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-2 mb-1 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                    data-test="register-user-button"
                                >
                                    {processing && <Spinner />}
                                    Create account
                                </Button>

                                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                                    Already have an account?{' '}
                                    <TextLink
                                        href={login()}
                                        className="text-emerald-600 hover:underline"
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
