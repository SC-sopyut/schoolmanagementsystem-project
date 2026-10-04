import { Card } from '@/components/council/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export type CalendarEvent = { id: number; title: string; starts_at: string; organization: string };

export default function EventCalendar({ events }: { events: CalendarEvent[] }) {
    const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [selectedDay, setSelectedDay] = useState(() => new Date().toDateString());
    const today = new Date();
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const eventsByDay = new Map<number, CalendarEvent[]>();
    events.forEach((event) => {
        const date = new Date(event.starts_at);
        if (date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()) {
            eventsByDay.set(date.getDate(), [...(eventsByDay.get(date.getDate()) ?? []), event]);
        }
    });
    const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)];
    const selectedDate = new Date(selectedDay);
    const selectedEvents = selectedDate.getMonth() === month.getMonth() && selectedDate.getFullYear() === month.getFullYear() ? eventsByDay.get(selectedDate.getDate()) ?? [] : [];
    const changeMonth = (offset: number) => {
        const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
        setMonth(next);
        setSelectedDay(next.toDateString());
    };

    return <Card className="p-5">
        <div className="mb-3 flex items-center justify-between text-sm"><b>Calendar</b><div className="flex items-center gap-2"><button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="rounded p-1 hover:bg-slate-100"><ChevronLeft className="h-4 w-4"/></button><span className="min-w-24 text-center text-blue-600">{month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</span><button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="rounded p-1 hover:bg-slate-100"><ChevronRight className="h-4 w-4"/></button></div></div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={index} className="font-semibold text-[#5B6478]">{day}</span>)}{cells.map((day, index) => day ? <button key={index} type="button" aria-label={`${month.toLocaleString(undefined, { month: 'long' })} ${day}${eventsByDay.has(day) ? `, ${eventsByDay.get(day)?.length} events` : ''}`} onClick={() => setSelectedDay(new Date(month.getFullYear(), month.getMonth(), day).toDateString())} className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full hover:bg-emerald-100 ${selectedDate.getDate() === day && selectedDate.getMonth() === month.getMonth() && selectedDate.getFullYear() === month.getFullYear() ? 'bg-blue-600 font-bold text-white hover:bg-blue-700' : day === today.getDate() && month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear() ? 'font-bold text-blue-700' : ''}`}>{day}{eventsByDay.has(day) && <i className={`absolute bottom-0 h-1 w-1 rounded-full ${selectedDate.getDate() === day && selectedDate.getMonth() === month.getMonth() ? 'bg-white' : 'bg-orange-500'}`}/>}</button> : <span key={index}/>)}</div>
        <div className="mt-4 border-t border-[#E1E4EA] pt-3"><p className="mb-2 text-xs font-semibold text-[#5B6478]">{selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>{selectedEvents.length ? <ul className="space-y-2">{selectedEvents.map((event) => <li key={event.id} className="text-xs"><p className="font-medium">{event.title}</p><p className="text-[#5B6478]">{new Date(event.starts_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} · {event.organization}</p></li>)}</ul> : <p className="text-xs text-[#5B6478]">No events on this day.</p>}</div>
    </Card>;
}
