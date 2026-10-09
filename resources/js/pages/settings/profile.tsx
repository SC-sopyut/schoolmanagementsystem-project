import { Form, Head, useForm, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { useState } from 'react';
import {
    BadgeCheck,
    Building2,
    CalendarDays,
    Camera,
    Mail,
    ShieldCheck,
    UserRound,
} from 'lucide-react';

type PageProps = {
    auth: Auth;
};

export default function Profile() {
    const { auth } = usePage<PageProps>().props;
    const photoForm = useForm<{ avatar: File | null }>({ avatar: null });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
                    <CardContent className="space-y-4 border-t pt-4">
                            <form
                                className="flex flex-wrap items-center gap-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    photoForm.post('/settings/profile/avatar', {
                                        forceFormData: true,
                                        preserveScroll: true,
                                    });
                                }}
                            >
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
                                        <AvatarImage
                                            src={photoPreview ?? auth.user.avatar}
                                            alt={`${auth.user.name} profile photo`}
                                            className="object-cover"
                                        />
                                        <AvatarFallback>
                                            <UserRound className="h-9 w-9" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <Label
                                        htmlFor="avatar"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                    >
                                        <Camera className="h-4 w-4" />
                                        <span className="sr-only">Choose a profile photo</span>
                                    </Label>
                                </div>
                                <div className="min-w-0 flex-1">
                            <CardTitle>{auth.user.name}</CardTitle>
                                    <p className="text-muted-foreground mt-1 truncate text-sm">
                                        {auth.user.email}
                                    </p>
                                </div>
                                <Badge className=""
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
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] ?? null;
                                        photoForm.setData('avatar', file);
                                        setPhotoPreview(
                                            file ? URL.createObjectURL(file) : null,
                                        );
                                    }}
                                />
                                <InputError message={photoForm.errors.avatar} />
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button type="submit" disabled={!photoForm.data.avatar || photoForm.processing}>
                                    {photoForm.processing ? 'Uploading…' : 'Save photo'}
                                </Button>
                                {auth.user.avatar && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={photoForm.processing}
                                        onClick={() => photoForm.delete('/settings/profile/avatar', { preserveScroll: true })}
                                    >
                                        Remove photo
                                    </Button>
                                )}
                            </div>
                        </form>
                        <div className="grid gap-4 sm:grid-cols-2">
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
