import CouncilLayout from '@/layouts/council-layout';
import EventCalendar from '@/components/council/event-calendar';
import {
    Card,
    Pill,
    btnGhost,
    btnPrimary,
    toneFor,
} from '@/components/council/ui';
import { join } from '@/routes/student/events';
import { router } from '@inertiajs/react';
import { MapPin, Users } from 'lucide-react';

type Ev = {
    id: number;
    title: string;
    starts_at: string;
    location: string | null;
    attendees_count: number;
    is_joined: boolean;
    organization: { name: string } | null;
};

/** Not in the Figma: student event list built from the officer event-card pattern; RSVP = POST student.events.join. */
export default function StudentEvents({ events }: { events: Ev[] }) {
    return (
        <CouncilLayout title="Events">
            <h2 className="text-lg font-bold">Upcoming Events</h2>
            <p className="mb-4 text-sm text-[#5B6478]">
                School-wide events and events from your organizations.
            </p>
            {events.length === 0 && (
                <Card className="p-8 text-center text-sm text-[#5B6478]">
                    No upcoming events.
                </Card>
            )}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {events.map((e) => {
                    const org = e.organization?.name ?? 'School-wide';
                    return (
                        <Card key={e.id} className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <Pill tone={toneFor(org)} dot>
                                    {org}
                                </Pill>
                                <span className="flex items-center gap-1 text-xs text-[#5B6478]">
                                    <Users className="h-3.5 w-3.5" />
                                    {e.attendees_count}
                                </span>
                            </div>
                            <p className="font-semibold">{e.title}</p>
                            <p className="mb-3 text-xs text-[#5B6478]">
                                {new Date(e.starts_at).toLocaleString(
                                    undefined,
                                    {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    },
                                )}
                                {e.location && (
                                    <>
                                        {' '}
                                        · <MapPin className="inline h-3 w-3" />{' '}
                                        {e.location}
                                    </>
                                )}
                            </p>
                            {e.is_joined ? (
                                <button
                                    disabled
                                    className={btnGhost + ' w-full'}
                                >
                                    You're going
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        router.post(
                                            join(e.id).url,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                    className={btnPrimary + ' w-full'}
                                >
                                    Join event
                                </button>
                            )}
                        </Card>
                    );
                })}
            </div>
            <div><EventCalendar events={events.map((event) => ({ id: event.id, title: event.title, starts_at: event.starts_at, organization: event.organization?.name ?? 'School-wide' }))}/></div>
            </div>
        </CouncilLayout>
    );
}
