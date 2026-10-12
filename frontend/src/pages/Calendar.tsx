/**
 * Calendar Page — Full rewrite
 * - Full month grid with year/month navigation
 * - Weekends highlighted
 * - Schedule Meeting modal with member multi-select from active company
 * - Meetings stored in localStorage (`orbitra_shared_meetings`)
 * - Real-time meeting list on selected date
 */

import { useState, useEffect, useCallback } from 'react';
import { companyStore } from '../services/companyStore';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Users,
  Video,
  CalendarDays,
  AlignLeft,
} from 'lucide-react';

/* ─────────────────────────── types ─────────────────────────── */
interface Meeting {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  duration: number;   // minutes
  description: string;
  attendees: string[];// member ids
  createdBy: string;
  companyId: string;
}

/* ─────────────────────────── helpers ───────────────────────── */
const STORAGE_KEY = 'orbitra_shared_meetings';

function loadMeetings(): Meeting[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveMeetings(meetings: Meeting[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  window.dispatchEvent(new Event('orbitra_meetings_updated'));
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ─────────────────────────── component ─────────────────────── */
export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear]   = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(toYMD(today));
  const [meetings, setMeetings]         = useState<Meeting[]>(loadMeetings());
  const [showModal, setShowModal]       = useState(false);

  // Modal form state
  const [form, setForm] = useState({
    title: '',
    date: toYMD(today),
    time: '10:00',
    duration: 30,
    description: '',
    attendees: [] as string[],
  });

  const activeCompany = companyStore.getActiveCompany();
  const members = activeCompany?.members || [];
  const companyId = activeCompany?.id || '';

  // Listen for external updates
  useEffect(() => {
    const handler = () => setMeetings(loadMeetings());
    window.addEventListener('orbitra_meetings_updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('orbitra_meetings_updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  /* ── calendar grid ── */
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = useCallback(() => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }, [currentMonth]);

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(toYMD(today));
  };

  const meetingsForDay = (ymd: string) =>
    meetings.filter(m => m.date === ymd && m.companyId === companyId);

  const selectedMeetings = meetingsForDay(selectedDate);

  /* ── modal handlers ── */
  const openModal = () => {
    setForm({
      title: '',
      date: selectedDate,
      time: '10:00',
      duration: 30,
      description: '',
      attendees: [],
    });
    setShowModal(true);
  };

  const toggleAttendee = (id: string) => {
    setForm(f => ({
      ...f,
      attendees: f.attendees.includes(id)
        ? f.attendees.filter(a => a !== id)
        : [...f.attendees, id],
    }));
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const currentUser = (() => {
      try { return JSON.parse(localStorage.getItem('orbitra_current_user') || '{}'); }
      catch { return {}; }
    })();

    const meeting: Meeting = {
      id: `mtg-${Date.now()}`,
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      duration: Number(form.duration),
      description: form.description.trim(),
      attendees: form.attendees,
      createdBy: currentUser.name || 'Admin',
      companyId,
    };

    const updated = [...meetings, meeting];
    saveMeetings(updated);
    setMeetings(updated);
    setSelectedDate(form.date);
    setShowModal(false);
  };

  const deleteMeeting = (id: string) => {
    const updated = meetings.filter(m => m.id !== id);
    saveMeetings(updated);
    setMeetings(updated);
  };

  const getMemberName = (id: string) =>
    members.find(m => m.id === id)?.name || id;

  /* ── build grid cells ── */
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6 pb-10">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1b24] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-white" />
            Calendar
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Schedule and manage team meetings for <strong className="text-white">{activeCompany?.name || 'your company'}</strong>
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl text-sm transition-all shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ─── Calendar grid ─── */}
        <div className="lg:col-span-3 panel-card rounded-2xl overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <h2 className="text-base font-bold text-white min-w-[160px] text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors font-medium"
            >
              Today
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAY_NAMES.map((d, i) => (
              <div
                key={d}
                className={`py-2.5 text-center text-[11px] font-mono font-semibold uppercase tracking-wide ${
                  i === 0 || i === 6 ? 'text-rose-400/70' : 'text-muted-foreground'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-border/40 bg-[#0a0b10]" />;
              }

              const ymd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = ymd === toYMD(today);
              const isSelected = ymd === selectedDate;
              const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);
              const dayMeetings = meetingsForDay(ymd);

              return (
                <div
                  key={ymd}
                  onClick={() => setSelectedDate(ymd)}
                  className={`min-h-[80px] p-2 border-b border-r border-border/40 cursor-pointer transition-colors group ${
                    isWeekend ? 'bg-[#0d0e15]' : 'bg-transparent'
                  } ${isSelected ? 'ring-2 ring-inset ring-white/40' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-white text-black'
                          : isWeekend
                          ? 'text-rose-400/80'
                          : 'text-white/80'
                      }`}
                    >
                      {day}
                    </span>
                    {dayMeetings.length > 0 && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1 rounded">
                        {dayMeetings.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayMeetings.slice(0, 2).map(m => (
                      <div
                        key={m.id}
                        className="text-[9px] bg-cyan-500/15 text-cyan-300 px-1.5 py-0.5 rounded truncate border border-cyan-500/20"
                      >
                        {m.time} {m.title}
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <div className="text-[9px] text-muted-foreground pl-1">
                        +{dayMeetings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Sidebar: selected day ─── */}
        <div className="space-y-4">
          <div className="panel-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {selectedMeetings.length === 0
                ? 'No meetings scheduled'
                : `${selectedMeetings.length} meeting${selectedMeetings.length > 1 ? 's' : ''} scheduled`}
            </p>

            {selectedMeetings.length === 0 ? (
              <div className="text-center py-8">
                <Video className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No meetings for this day</p>
                <button
                  onClick={openModal}
                  className="mt-3 text-xs text-white/60 hover:text-white underline-offset-2 hover:underline transition-colors"
                >
                  + Schedule one
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedMeetings.map(m => (
                  <div key={m.id} className="p-3 rounded-xl bg-[#0f1017] border border-[#1d1f2c] group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                        <p className="text-[11px] text-cyan-400 font-mono mt-0.5">
                          {m.time} · {m.duration} min
                        </p>
                        {m.description && (
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
                        )}
                        {m.attendees.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            {m.attendees.slice(0, 3).map(id => (
                              <span key={id} className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded-md">
                                {getMemberName(id)}
                              </span>
                            ))}
                            {m.attendees.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{m.attendees.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteMeeting(m.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose-400 flex-shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                      By {m.createdBy}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming meetings across all days */}
          <div className="panel-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-white" />
              Upcoming Meetings
            </h3>
            {(() => {
              const todayYmd = toYMD(today);
              const upcoming = meetings
                .filter(m => m.companyId === companyId && m.date >= todayYmd)
                .sort((a, b) => `${a.date}T${a.time}` < `${b.date}T${b.time}` ? -1 : 1)
                .slice(0, 5);
              if (upcoming.length === 0) {
                return <p className="text-xs text-muted-foreground">No upcoming meetings</p>;
              }
              return (
                <div className="space-y-2">
                  {upcoming.map(m => (
                    <div
                      key={m.id}
                      className="flex items-start gap-2 cursor-pointer"
                      onClick={() => {
                        setSelectedDate(m.date);
                        const [y, mo] = m.date.split('-').map(Number);
                        setCurrentYear(y);
                        setCurrentMonth(mo - 1);
                      }}
                    >
                      <div className="w-1 h-full min-h-[32px] rounded-full bg-cyan-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs font-semibold text-white">{m.title}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {new Date(m.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' '}{m.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ─── Schedule Meeting Modal ─── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-[#111218] border border-[#1f212d] rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-7 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Video className="h-5 w-5 text-cyan-400" />
                  Schedule Meeting
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add a meeting to the team calendar
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8e92a4] mb-1.5">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Sprint Planning, Design Review"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white placeholder:text-[#555869] text-sm focus:outline-none focus:border-white/40 transition-all"
                />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#8e92a4] mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#8e92a4] mb-1.5">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8e92a4] mb-1.5">
                  Duration (minutes)
                </label>
                <select
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                >
                  {[15, 30, 45, 60, 90, 120].map(d => (
                    <option key={d} value={d}>{d} min</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8e92a4] mb-1.5 flex items-center gap-1">
                  <AlignLeft className="h-3 w-3" /> Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Agenda, goals, or notes…"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white placeholder:text-[#555869] text-sm focus:outline-none focus:border-white/40 transition-all resize-none"
                />
              </div>

              {/* Attendees */}
              {members.length > 0 && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#8e92a4] mb-2 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Attendees ({form.attendees.length} selected)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {members.map(member => {
                      const selected = form.attendees.includes(member.id);
                      return (
                        <button
                          type="button"
                          key={member.id}
                          onClick={() => toggleAttendee(member.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition-all border ${
                            selected
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                              : 'bg-[#14151e] border-[#1f212d] text-muted-foreground hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
                            selected ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-white'
                          }`}>
                            {member.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="truncate">{member.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1f212d] text-muted-foreground hover:text-white hover:border-white/20 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all shadow-lg"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
