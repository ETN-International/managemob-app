import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalParticipant {
  id: string
  name: string | null
  surname: string | null
  arrival_date: string | null
  departure_date: string | null
  mobility_typology: string | null
  indiv_group: string | null
  group_name: string | null
}

interface CalEvent {
  participantId: string
  label: string
  kind: 'arrival' | 'departure'
  typology: string | null
  indivGroup: string | null
  groupName: string | null
  date: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]
const DAY_NAMES_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

const COLOR_ARRIVAL = '#10B981'
const COLOR_DEPARTURE = '#F59E0B'
const COLOR_ARRIVAL_BG = '#d1fae5'
const COLOR_DEPARTURE_BG = '#fef3c7'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns the Monday-aligned calendar grid for the given year/month (6 rows × 7 cols = 42 cells). */
function buildCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  // getDay(): 0=Sun, 1=Mon … 6=Sat → convert to Mon-first index
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0 … Sun=6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  // Pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function buildEventMap(participants: CalParticipant[]): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>()
  const push = (dateStr: string, ev: CalEvent) => {
    if (!map.has(dateStr)) map.set(dateStr, [])
    map.get(dateStr)!.push(ev)
  }
  for (const p of participants) {
    const label = [p.name, p.surname].filter(Boolean).join(' ') || '—'
    if (p.arrival_date) {
      push(p.arrival_date, {
        participantId: p.id,
        label,
        kind: 'arrival',
        typology: p.mobility_typology,
        indivGroup: p.indiv_group,
        groupName: p.group_name,
        date: p.arrival_date,
      })
    }
    if (p.departure_date) {
      push(p.departure_date, {
        participantId: p.id,
        label,
        kind: 'departure',
        typology: p.mobility_typology,
        indivGroup: p.indiv_group,
        groupName: p.group_name,
        date: p.departure_date,
      })
    }
  }
  return map
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EventPill({ kind, label }: { kind: 'arrival' | 'departure'; label: string }) {
  const bg = kind === 'arrival' ? COLOR_ARRIVAL_BG : COLOR_DEPARTURE_BG
  const color = kind === 'arrival' ? COLOR_ARRIVAL : '#D97706'
  return (
    <div
      className="cal-event-pill"
      style={{ background: bg, color, borderLeft: `3px solid ${color}` }}
      title={label}
    >
      {label}
    </div>
  )
}

interface SidePanelProps {
  date: Date
  events: CalEvent[]
  onClose: () => void
  onNavigate: (typology: string | null) => void
  arrivalLabel: string
  departureLabel: string
  noEventsLabel: string
}

function SidePanel({ date, events, onClose, onNavigate, arrivalLabel, departureLabel, noEventsLabel }: SidePanelProps) {
  const day = date.getDate()
  const monthName = MONTH_NAMES_IT[date.getMonth()]
  const year = date.getFullYear()

  return (
    <div className="cal-side-panel">
      <div className="cal-side-header">
        <span className="cal-side-title">
          {day} {monthName} {year}
        </span>
        <button className="cal-close-btn" onClick={onClose} title="Chiudi">✕</button>
      </div>
      <div className="cal-side-body">
        {events.length === 0 ? (
          <div className="cal-no-events">{noEventsLabel}</div>
        ) : (
          events.map((ev, i) => {
            const isArrival = ev.kind === 'arrival'
            const kindColor = isArrival ? COLOR_ARRIVAL : '#D97706'
            const kindBg = isArrival ? COLOR_ARRIVAL_BG : COLOR_DEPARTURE_BG
            const typoColor = ev.typology === 'Incoming' ? '#1D72B8' : '#8B5CF6'
            const typoBg = ev.typology === 'Incoming' ? '#dbeafe' : '#ede9fe'
            return (
              <div
                key={`${ev.participantId}-${ev.kind}-${i}`}
                className="cal-event-card"
                onClick={() => onNavigate(ev.typology)}
                title="Vai al partecipante"
              >
                <div className="cal-event-name">{ev.label}</div>
                <div className="cal-event-badges">
                  <span
                    className="cal-badge"
                    style={{ background: kindBg, color: kindColor }}
                  >
                    {isArrival ? arrivalLabel : departureLabel}
                  </span>
                  {ev.typology && (
                    <span
                      className="cal-badge"
                      style={{ background: typoBg, color: typoColor }}
                    >
                      {ev.typology}
                    </span>
                  )}
                  {ev.indivGroup && (
                    <span className="cal-badge cal-badge-neutral">
                      {ev.indivGroup}
                    </span>
                  )}
                  {ev.groupName && (
                    <span className="cal-badge cal-badge-neutral" style={{ opacity: 0.75 }}>
                      {ev.groupName}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { t } = useT()
  const navigate = useNavigate()

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [participants, setParticipants] = useState<CalParticipant[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterTypology, setFilterTypology] = useState<'all' | 'Incoming' | 'Outgoing'>('all')
  const [filterIndivGroup, setFilterIndivGroup] = useState<'all' | 'Individual' | 'Group'>('all')
  const [filterGroupName, setFilterGroupName] = useState<string>('all')

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data } = await supabase
        .from('participants')
        .select('id, name, surname, arrival_date, departure_date, mobility_typology, indiv_group, group_name')
      if (!cancelled) {
        setParticipants((data as CalParticipant[]) || [])
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ── Derived data ───────────────────────────────────────────────────────────

  const groupNames = Array.from(
    new Set(participants.map(p => p.group_name).filter((g): g is string => !!g))
  ).sort()

  const filteredParticipants = participants.filter(p => {
    if (filterTypology !== 'all' && p.mobility_typology !== filterTypology) return false
    if (filterIndivGroup !== 'all' && p.indiv_group !== filterIndivGroup) return false
    if (filterGroupName !== 'all' && p.group_name !== filterGroupName) return false
    return true
  })

  const eventMap = buildEventMap(filteredParticipants)
  const grid = buildCalendarGrid(viewYear, viewMonth)
  const todayStr = toDateString(today)
  const selectedStr = selectedDate ? toDateString(selectedDate) : null
  const selectedEvents = selectedStr ? (eventMap.get(selectedStr) || []) : []

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }
  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  const handleDayClick = (d: Date) => {
    if (selectedDate && toDateString(d) === toDateString(selectedDate)) {
      setSelectedDate(null)
    } else {
      setSelectedDate(d)
    }
  }

  const handleEventNavigate = (typology: string | null) => {
    if (typology === 'Incoming') navigate('/incoming/individuals')
    else if (typology === 'Outgoing') navigate('/outgoing/individuals')
    else navigate('/incoming/individuals')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="cal-page">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="cal-page-header">
        <div>
          <h1 className="cal-page-title">{t('cal_title')}</h1>
          <p className="cal-page-subtitle">{t('cal_subtitle')}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
          {t('nav_home')}
        </button>
      </div>

      {/* ── Filters bar ───────────────────────────────────────────────────── */}
      <div className="cal-filters-bar">
        {/* Month/year navigation */}
        <div className="cal-nav-group">
          <button className="cal-nav-btn" onClick={goPrev} title="Mese precedente">‹</button>
          <span className="cal-month-label">
            {MONTH_NAMES_IT[viewMonth]} {viewYear}
          </span>
          <button className="cal-nav-btn" onClick={goNext} title="Mese successivo">›</button>
          <button className="cal-today-btn" onClick={goToday}>{t('cal_today')}</button>
        </div>

        <div className="cal-filter-group">
          {/* Typology filter */}
          <select
            className="cal-filter-select"
            value={filterTypology}
            onChange={e => setFilterTypology(e.target.value as typeof filterTypology)}
          >
            <option value="all">{t('cal_filter_all')} — Tipologia</option>
            <option value="Incoming">Incoming</option>
            <option value="Outgoing">Outgoing</option>
          </select>

          {/* Individual/Group filter */}
          <select
            className="cal-filter-select"
            value={filterIndivGroup}
            onChange={e => setFilterIndivGroup(e.target.value as typeof filterIndivGroup)}
          >
            <option value="all">{t('cal_filter_all')} — Tipo</option>
            <option value="Individual">Individual</option>
            <option value="Group">Group</option>
          </select>

          {/* Group name filter */}
          <select
            className="cal-filter-select"
            value={filterGroupName}
            onChange={e => setFilterGroupName(e.target.value)}
          >
            <option value="all">{t('cal_filter_all')} — Gruppo</option>
            {groupNames.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="cal-legend">
          <span className="cal-legend-item">
            <span className="cal-legend-dot" style={{ background: COLOR_ARRIVAL }} />
            {t('cal_event_arrival')}
          </span>
          <span className="cal-legend-item">
            <span className="cal-legend-dot" style={{ background: COLOR_DEPARTURE }} />
            {t('cal_event_departure')}
          </span>
        </div>
      </div>

      {/* ── Main area: calendar + side panel ─────────────────────────────── */}
      <div className="cal-main-area">
        {/* Calendar grid */}
        <div className={`cal-grid-wrapper${selectedDate ? ' cal-grid-wrapper--narrow' : ''}`}>
          {loading ? (
            <div className="cal-loading">
              <div className="spinner" />
              <span style={{ marginLeft: 12, color: 'var(--text-muted)' }}>{t('list_loading')}</span>
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="cal-grid">
                {DAY_NAMES_IT.map(day => (
                  <div key={day} className="cal-day-header">{day}</div>
                ))}

                {/* Day cells */}
                {grid.map((cell, idx) => {
                  if (!cell) {
                    return <div key={`empty-${idx}`} className="cal-cell cal-cell--empty" />
                  }

                  const dateStr = toDateString(cell)
                  const isToday = dateStr === todayStr
                  const isSelected = dateStr === selectedStr
                  const events = eventMap.get(dateStr) || []
                  const visibleEvents = events.slice(0, 3)
                  const overflowCount = events.length - 3

                  return (
                    <div
                      key={dateStr}
                      className={[
                        'cal-cell',
                        isToday ? 'cal-cell--today' : '',
                        isSelected ? 'cal-cell--selected' : '',
                        events.length > 0 ? 'cal-cell--has-events' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleDayClick(cell)}
                    >
                      <span className="cal-day-number">{cell.getDate()}</span>
                      <div className="cal-pills">
                        {visibleEvents.map((ev, i) => (
                          <EventPill key={`${ev.participantId}-${ev.kind}-${i}`} kind={ev.kind} label={ev.label} />
                        ))}
                        {overflowCount > 0 && (
                          <div className="cal-overflow">+{overflowCount} altri</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Side panel */}
        {selectedDate && (
          <SidePanel
            date={selectedDate}
            events={selectedEvents}
            onClose={() => setSelectedDate(null)}
            onNavigate={handleEventNavigate}
            arrivalLabel={t('cal_event_arrival')}
            departureLabel={t('cal_event_departure')}
            noEventsLabel={t('cal_no_events')}
          />
        )}
      </div>
    </div>
  )
}
