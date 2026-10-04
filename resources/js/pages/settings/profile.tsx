import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import {
    BadgeCheck,
    Building2,
    CalendarDays,
    Mail,
    ShieldCheck,
    UserRound,
} from 'lucide-react';

type PageProps = {
    auth: Auth;
};

export default function Profile() {
    const { auth } = usePage<PageProps>().props;
    const roles = auth.roles ?? [];
    const memberSince = auth.user.created_at
        ? new Date(auth.user.created_at).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
          })
        : '—';

    return (
        <>
            <Head title="Profile settings" />
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Your contact details, organization memberships, and roles"
                />

                <Card>
                    <CardHeader className="flex-row items-center gap-4">
                        <span className="bg-primary/10 text-primary grid h-12 w-12 place-items-center rounded-full">
                            <UserRound className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <CardTitle>{auth.user.name}</CardTitle>
                            <p className="text-muted-foreground mt-1 truncate text-sm">
                                {auth.user.email}
                            </p>
                        </div>
                        <Badge
                            variant={
                                auth.user.email_verified_at
                                    ? 'default'
                                    : 'secondary'
                            }
                        >
                            {auth.user.email_verified_at
                                ? 'Verified'
                                : 'Email not verified'}
                        </Badge>
                    </CardHeader>
                    <CardContent className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 text-sm">
                            <CalendarDays className="text-muted-foreground h-4 w-4" />
                            <span className="text-muted-foreground">
                                Member since
                            </span>
                            <strong className="ml-auto">{memberSince}</strong>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="text-muted-foreground h-4 w-4" />
                            <span className="text-muted-foreground">
                                Contact email
                            </span>
                            <strong className="ml-auto max-w-[55%] truncate">
                                {auth.user.email}
                            </strong>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="text-primary h-5 w-5" />
                            Roles &amp; organizations
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                            All the roles and organization memberships linked to
                            this account.
                        </p>
                    </CardHeader>
                    <CardContent>
                        {roles.length ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {roles.map((role, index) => (
                                    <div
                                        key={`${role.label}-${role.organization ?? 'student'}-${index}`}
                                        className="bg-muted/40 flex items-center gap-3 rounded-lg border p-3"
                                    >
                                        <span className="bg-background text-primary grid h-9 w-9 shrink-0 place-items-center rounded-full">
                                            {role.organization ? (
                                                <Building2 className="h-4 w-4" />
                                            ) : (
                                                <UserRound className="h-4 w-4" />
                                            )}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-semibold">
                                                {role.label}
                                            </p>
                                            <p className="text-muted-foreground truncate text-sm">
                                                {role.organization ??
                                                    'Student account'}
                                            </p>
                                        </div>
                                        <BadgeCheck className="text-primary ml-auto h-4 w-4 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                No organization roles are linked to this account
                                yet.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit contact details</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Update the name and email address used for your
                            account.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...ProfileController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>

                                        <Input
                                            id="name"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Email address
                                        </Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.email}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button
                                            disabled={processing}
                                            data-test="update-profile-button"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
