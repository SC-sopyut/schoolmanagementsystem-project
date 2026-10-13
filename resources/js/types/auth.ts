export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    student_profile?: {
        student_id_no: string;
        status: 'pending' | 'approved';
        verified_at: string | null;
    } | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    roles?: { label: string; organization: string | null }[];
};
