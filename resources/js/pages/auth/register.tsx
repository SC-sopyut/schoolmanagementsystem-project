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
    courses: string[];
};

export default function Register({ passwordRules, courses }: Props) {
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

                <div className="relative z-10 mx-4 my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
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
                        Submit your school details for account verification.
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
                                        htmlFor="student_id_no"
                                        className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                    >
                                        School ID no.
                                    </Label>
                                    <Input
                                        id="student_id_no"
                                        type="text"
                                        required
                                        autoFocus
                                        name="student_id_no"
                                        placeholder="2024-01-00001"
                                        pattern="[0-9]{4}-[0-9]{2}-[0-9]{5}"
                                        className="h-10 rounded-lg px-3 text-sm"
                                    />
                                    <InputError
                                        message={errors.student_id_no}
                                        className="mt-1 text-xs"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label
                                            htmlFor="first_name"
                                            className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                        >
                                            First name
                                        </Label>
                                        <Input
                                            id="first_name"
                                            type="text"
                                            required
                                            autoComplete="given-name"
                                            name="first_name"
                                            pattern="[^0-9]+"
                                            title="Names cannot contain numbers."
                                            onInput={(event) => {
                                                event.currentTarget.value = event.currentTarget.value.replace(/\d/g, '');
                                            }}
                                            className="h-10 rounded-lg px-3 text-sm"
                                        />
                                        <InputError
                                            message={errors.first_name}
                                            className="mt-1 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="middle_name"
                                            className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                        >
                                            Middle name{' '}
                                            <span className="normal-case">
                                                (optional)
                                            </span>
                                        </Label>
                                        <Input
                                            id="middle_name"
                                            type="text"
                                            autoComplete="additional-name"
                                            name="middle_name"
                                            pattern="[^0-9]+"
                                            title="Names cannot contain numbers."
                                            onInput={(event) => {
                                                event.currentTarget.value = event.currentTarget.value.replace(/\d/g, '');
                                            }}
                                            className="h-10 rounded-lg px-3 text-sm"
                                        />
                                        <InputError
                                            message={errors.middle_name}
                                            className="mt-1 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="last_name"
                                            className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                        >
                                            Last name
                                        </Label>
                                        <Input
                                            id="last_name"
                                            type="text"
                                            required
                                            autoComplete="family-name"
                                            name="last_name"
                                            pattern="[^0-9]+"
                                            title="Names cannot contain numbers."
                                            onInput={(event) => {
                                                event.currentTarget.value = event.currentTarget.value.replace(/\d/g, '');
                                            }}
                                            className="h-10 rounded-lg px-3 text-sm"
                                        />
                                        <InputError
                                            message={errors.last_name}
                                            className="mt-1 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="suffix"
                                            className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                        >
                                            Suffix{' '}
                                            <span className="normal-case">
                                                (optional)
                                            </span>
                                        </Label>
                                        <Input
                                            id="suffix"
                                            type="text"
                                            name="suffix"
                                            placeholder="Jr., III"
                                            pattern="[^0-9]+"
                                            title="Names cannot contain numbers."
                                            onInput={(event) => {
                                                event.currentTarget.value = event.currentTarget.value.replace(/\d/g, '');
                                            }}
                                            className="h-10 rounded-lg px-3 text-sm"
                                        />
                                        <InputError
                                            message={errors.suffix}
                                            className="mt-1 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label
                                            htmlFor="course"
                                            className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                        >
                                            Course
                                        </Label>
                                        <select
                                            id="course"
                                            name="course"
                                            required
                                            defaultValue=""
                                            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                        >
                                            <option value="" disabled>
                                                Select your course
                                            </option>
                                            {courses.map((course) => (
                                                <option
                                                    key={course}
                                                    value={course}
                                                >
                                                    {course}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.course}
                                            className="mt-1 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="year_level"
                                            className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                                        >
                                            Year level
                                        </Label>
                                        <select
                                            id="year_level"
                                            name="year_level"
                                            required
                                            defaultValue=""
                                            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                        >
                                            <option value="" disabled>
                                                Select year level
                                            </option>
                                            {[1, 2, 3, 4].map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                    {year === 1
                                                        ? 'st'
                                                        : year === 2
                                                          ? 'nd'
                                                          : year === 3
                                                            ? 'rd'
                                                            : 'th'}{' '}
                                                    year
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.year_level}
                                            className="mt-1 text-xs"
                                        />
                                    </div>
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
                                        inputMode="email"
                                        pattern="[A-Za-z0-9._%+-]+@acc\\.edu\\.ph"
                                        title="Enter a valid ACC school email, for example you@acc.edu.ph."
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
                                    Create account for review
                                </Button>

                                <p className="-mt-2 text-center text-xs text-slate-500">
                                    You can sign in while your registration is
                                    pending, but event joins, voting, and
                                    concerns are enabled only after approval.
                                </p>

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
