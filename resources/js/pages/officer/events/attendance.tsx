import CouncilLayout from '@/layouts/council-layout';
import { Card } from '@/components/council/ui';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Camera, CheckCircle2, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';

type Student = {
    id: number;
    name: string;
    avatar: string | null;
    student_id_no: string | null;
    course: string | null;
    year_level: number | null;
    attendance_sessions: AttendanceSession[];
};

type AttendanceSession = {
    id: number;
    checked_in_at: string;
    checked_out_at: string | null;
};

export default function Attendance({
    event,
    student,
    matches,
    scanNotFound,
}: {
    event: { id: number; title: string };
    student: Student | null;
    matches: Student[];
    scanNotFound: boolean;
}) {
    const [scan, setScan] = useState('');
    const [search, setSearch] = useState('');
    const [checkingIn, setCheckingIn] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerControlsRef = useRef<IScannerControls | null>(null);
    const scannerActiveRef = useRef(false);

    function stopCamera() {
        scannerActiveRef.current = false;
        scannerControlsRef.current?.stop();
        scannerControlsRef.current = null;
    }

    useEffect(() => () => stopCamera(), []);

    useEffect(() => {
        setSelectedStudentId(student?.id ?? matches[0]?.id ?? null);
    }, [student?.id, matches]);

    async function startCamera() {
        setCameraError(null);
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError(
                'Camera access is not available in this browser. Use a current browser or paste the scanner value instead.',
            );
            return;
        }

        stopCamera();
        scannerActiveRef.current = true;
        setCameraOpen(true);

        window.setTimeout(() => {
            void (async () => {
                try {
                    const video = videoRef.current;
                    if (!video) return;
                    const reader = new BrowserQRCodeReader();
                    const controls = await reader.decodeFromConstraints(
                        {
                            audio: false,
                            video: { facingMode: { ideal: 'environment' } },
                        },
                        video,
                        (result, _error, activeControls) => {
                            if (!result || !scannerActiveRef.current) return;

                            const value = result.getText();
                            scannerActiveRef.current = false;
                            activeControls.stop();
                            scannerControlsRef.current = null;
                            setCameraOpen(false);
                            setScan(value);
                            router.get(
                                `/officer/events/${event.id}/attendance`,
                                { scan: value },
                                { preserveState: true },
                            );
                        },
                    );

                    if (!scannerActiveRef.current) {
                        controls.stop();
                        return;
                    }
                    scannerControlsRef.current = controls;
                } catch {
                    if (scannerActiveRef.current) {
                        setCameraError(
                            'Unable to open the camera. Allow camera access, then try again.',
                        );
                        stopCamera();
                        setCameraOpen(false);
                    }
                }
            })();
        }, 0);
    }

    function closeCamera() {
        stopCamera();
        setCameraOpen(false);
    }
    const lookup = (submitEvent: React.FormEvent) => {
        submitEvent.preventDefault();
        router.get(
            `/officer/events/${event.id}/attendance`,
            { scan },
            { preserveState: true },
        );
    };
    const find = (submitEvent: React.FormEvent) => {
        submitEvent.preventDefault();
        router.get(
            `/officer/events/${event.id}/attendance`,
            { search },
            { preserveState: true },
        );
    };
    const confirm = (user: Student) =>
        router.post(
            `/officer/events/${event.id}/attendance`,
            { user_id: user.id },
            {
                preserveScroll: true,
                onStart: () => setCheckingIn(true),
                onFinish: () => setCheckingIn(false),
            },
        );
    const selectedStudent = student ?? matches.find((match) => match.id === selectedStudentId) ?? null;

    return (
        <CouncilLayout title="Event check-in">
            <div className="mb-5 flex items-center gap-3">
                <Link
                    href="/officer/events"
                    className="rounded-lg border p-2"
                    aria-label="Back to events"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h2 className="text-lg font-bold">Event check-in</h2>
                    <p className="text-sm text-[#5B6478]">{event.title}</p>
                </div>
            </div>
            <div className="grid max-w-4xl gap-5 lg:grid-cols-2">
                <Card className="p-5">
                    <h3 className="font-semibold">Scan student QR</h3>
                    <p className="mb-3 text-sm text-[#5B6478]">
                        Open the camera to scan a student's QR code, or paste a
                        scanner value. Confirm the student before check-in.
                    </p>
                    {!cameraOpen && (
                        <button
                            type="button"
                            onClick={() => void startCamera()}
                            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#176b35] px-3 py-2 text-sm font-semibold text-[#176b35] hover:bg-[#e6f1e4]"
                        >
                            <Camera className="h-4 w-4" />
                            Open camera scanner
                        </button>
                    )}
                    {cameraOpen && (
                        <div className="relative mb-3 overflow-hidden rounded-xl border border-[#31563d] bg-black">
                            <video
                                ref={videoRef}
                                muted
                                playsInline
                                className="aspect-[4/3] w-full object-cover"
                            />
                            <div className="pointer-events-none absolute inset-[16%] rounded-xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,.28)]" />
                            <button
                                type="button"
                                onClick={closeCamera}
                                className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-black"
                            >
                                <X className="h-3.5 w-3.5" />
                                Close
                            </button>
                            <p className="absolute right-0 bottom-3 left-0 text-center text-xs font-medium text-white drop-shadow">
                                Point the camera at the student's QR code
                            </p>
                        </div>
                    )}
                    {cameraError && (
                        <p className="mb-3 text-sm text-red-600 dark:text-red-400">
                            {cameraError}
                        </p>
                    )}
                    <form onSubmit={lookup} className="flex gap-2">
                        <input
                            className="w-full rounded-lg border bg-transparent px-3 py-2"
                            value={scan}
                            onChange={(e) => setScan(e.target.value)}
                            placeholder="Scan code"
                            autoFocus
                        />
                        <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">
                            Find
                        </button>
                    </form>
                    {scanNotFound && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                            No student matched that check-in code. Use name
                            search if needed.
                        </p>
                    )}
                </Card>
                <Card className="p-5">
                    <h3 className="font-semibold">Search by name</h3>
                    <p className="mb-3 text-sm text-[#5B6478]">
                        Use this only when a student cannot present their QR
                        code.
                    </p>
                    <form onSubmit={find} className="flex gap-2">
                        <input
                            className="w-full rounded-lg border bg-transparent px-3 py-2"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Student name"
                        />
                        <button
                            className="rounded-lg border px-3 py-2"
                            aria-label="Search"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </form>
                    {matches.length > 1 && (
                        <label className="mt-3 grid gap-1 text-sm font-medium">
                            Matching students
                            <select
                                value={selectedStudentId ?? ''}
                                onChange={(event) => setSelectedStudentId(Number(event.target.value))}
                                className="rounded-lg border bg-transparent px-3 py-2"
                            >
                                {matches.map((match) => (
                                    <option key={match.id} value={match.id}>
                                        {match.name}{match.student_id_no ? ` · ${match.student_id_no}` : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                </Card>
            </div>
            <div className="mt-5 max-w-4xl">
                {selectedStudent && (
                    <StudentCard
                        student={selectedStudent}
                        onConfirm={confirm}
                        busy={checkingIn}
                    />
                )}
            </div>
        </CouncilLayout>
    );
}

function StudentCard({
    student,
    onConfirm,
    busy,
}: {
    student: Student;
    onConfirm: (student: Student) => void;
    busy: boolean;
}) {
    const openSession = student.attendance_sessions.find(
        (session) => !session.checked_out_at,
    );

    return (
        <Card className="p-5">
            <div className="flex items-center gap-3">
                {student.avatar ? (
                    <img
                        src={student.avatar}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#e6f1e4] font-bold">
                        {student.name.slice(0, 1)}
                    </div>
                )}
                <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-[#5B6478]">
                        {student.student_id_no
                            ? `${student.student_id_no} · ${student.course} · Year ${student.year_level}`
                            : 'Existing account — student profile not yet verified'}
                    </p>
                </div>
            </div>
            {openSession && (
                <p className="mt-4 flex items-start gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                        Currently checked in since{' '}
                        {formatAttendanceDate(openSession.checked_in_at)}
                    </span>
                </p>
            )}
            <button
                onClick={() => onConfirm(student)}
                disabled={busy}
                className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                    openSession
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {openSession ? 'Confirm check-out' : 'Confirm check-in'}
            </button>
            {student.attendance_sessions.length > 0 && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold">Attendance record</h4>
                    <ul className="mt-2 space-y-2 text-sm text-[#5B6478]">
                        {student.attendance_sessions.map((session) => (
                            <li key={session.id} className="rounded-md bg-black/5 px-3 py-2 dark:bg-white/5">
                                <span className="font-medium text-foreground">In:</span>{' '}
                                {formatAttendanceDate(session.checked_in_at)}
                                <br />
                                <span className="font-medium text-foreground">Out:</span>{' '}
                                {session.checked_out_at
                                    ? formatAttendanceDate(session.checked_out_at)
                                    : 'Still checked in'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
}

function formatAttendanceDate(value: string): string {
    return new Date(value).toLocaleString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
