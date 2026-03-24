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
  nationality: string | null
  destination_city: string | null
  destination_country: string | null
  phone: string | null
  email: string | null
  program: string | null
  sending_organisations?: { name: string } | null
  host_companies?: { name: string; city: string | null } | null
  transfer_providers?: { name: string; phone: string | null } | null
  accommodation_1?: { name: string; city: string | null; typology: string | null } | null
  insurance_providers?: { name: string } | null
}

interface CalTravelDetail {
  id: string
  transport_type: string | null
  flight_train_number: string | null
  departure_datetime: string | null
  arrival_datetime: string | null
  ticket_price: number | null
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
  onEventClick: (ev: CalEvent) => void
  arrivalLabel: string
  departureLabel: string
  noEventsLabel: string
}

function SidePanel({ date, events, onClose, onEventClick, arrivalLabel, departureLabel, noEventsLabel }: SidePanelProps) {
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
                onClick={() => onEventClick(ev)}
                title="Dettagli viaggio"
              >
                <div className="cal-event-name">{ev.label}</div>
                <div className="cal-event-badges">
                  <span className="cal-badge" style={{ background: kindBg, color: kindColor }}>
                    {isArrival ? arrivalLabel : departureLabel}
                  </span>
                  {ev.typology && (
                    <span className="cal-badge" style={{ background: typoBg, color: typoColor }}>
                      {ev.typology}
                    </span>
                  )}
                  {ev.groupName && (
                    <span className="cal-badge" style={{ background: '#ede9fe', color: '#8B5CF6' }}>
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

  // Detail modal
  const [detailParticipant, setDetailParticipant] = useState<CalParticipant | null>(null)
  const [detailTravel, setDetailTravel] = useState<CalTravelDetail[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailKind, setDetailKind] = useState<'arrival' | 'departure'>('arrival')

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data } = await supabase
        .from('participants')
        .select('id, name, surname, arrival_date, departure_date, mobility_typology, indiv_group, group_name, nationality, destination_city, destination_country, phone, email, program, sending_organisations(name), host_companies(name, city), transfer_providers(name, phone), accommodation_1:accommodation!participants_accommodation_1_id_fkey(name, city, typology), insurance_providers(name)')
      if (!cancelled) {
        setParticipants((data as unknown as CalParticipant[]) || [])
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

  const handleEventClick = async (ev: CalEvent) => {
    const p = participants.find(p => p.id === ev.participantId)
    if (!p) return
    setDetailParticipant(p)
    setDetailKind(ev.kind)
    setDetailLoading(true)
    setDetailTravel([])
    const { data } = await supabase
      .from('travel_details')
      .select('id, transport_type, flight_train_number, departure_datetime, arrival_datetime, ticket_price')
      .eq('participant_id', p.id)
      .order('departure_datetime', { ascending: true })
    setDetailTravel((data as CalTravelDetail[]) || [])
    setDetailLoading(false)
  }

  const closeDetail = () => {
    setDetailParticipant(null)
    setDetailTravel([])
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
            onEventClick={handleEventClick}
            arrivalLabel={t('cal_event_arrival')}
            departureLabel={t('cal_event_departure')}
            noEventsLabel={t('cal_no_events')}
          />
        )}
      </div>

      {/* ── Detail modal ─────────────────────────────────────────────────── */}
      {detailParticipant && (
        <div className="hm-modal-overlay" onClick={closeDetail}>
          <div className="hm-modal hm-modal--wide" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="hm-modal-header" style={{ borderColor: detailKind === 'arrival' ? COLOR_ARRIVAL : '#D97706' }}>
              <div className="hm-modal-header-icon" style={{
                background: detailKind === 'arrival' ? COLOR_ARRIVAL_BG : COLOR_DEPARTURE_BG,
                color: detailKind === 'arrival' ? COLOR_ARRIVAL : '#D97706',
              }}>
                {detailKind === 'arrival' ? '\u2708\uFE0F' : '\u{1F3E0}'}
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="hm-modal-title">{detailParticipant.name} {detailParticipant.surname}</h2>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <span className="cal-badge" style={{
                    background: detailKind === 'arrival' ? COLOR_ARRIVAL_BG : COLOR_DEPARTURE_BG,
                    color: detailKind === 'arrival' ? COLOR_ARRIVAL : '#D97706',
                  }}>
                    {detailKind === 'arrival' ? t('cal_event_arrival') : t('cal_event_departure')}
                  </span>
                  {detailParticipant.mobility_typology && (
                    <span className="cal-badge" style={{
                      background: detailParticipant.mobility_typology === 'Incoming' ? '#dbeafe' : '#ede9fe',
                      color: detailParticipant.mobility_typology === 'Incoming' ? '#1D72B8' : '#8B5CF6',
                    }}>
                      {detailParticipant.mobility_typology}
                    </span>
                  )}
                  {detailParticipant.group_name && (
                    <span className="cal-badge" style={{ background: '#ede9fe', color: '#8B5CF6' }}>
                      {detailParticipant.group_name}
                    </span>
                  )}
                </div>
              </div>
              <button className="hm-modal-close" onClick={closeDetail}>&times;</button>
            </div>

            <div className="hm-modal-body">

              {/* Key dates — always visible, prominent */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 16,
              }}>
                <div style={{
                  background: COLOR_ARRIVAL_BG,
                  border: `1.5px solid ${COLOR_ARRIVAL}44`,
                  borderRadius: 10,
                  padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_ARRIVAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('cal_event_arrival')}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#065f46', marginTop: 2 }}>{detailParticipant.arrival_date || '\u2014'}</div>
                </div>
                <div style={{
                  background: COLOR_DEPARTURE_BG,
                  border: '1.5px solid #D9770644',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('cal_event_departure')}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#92400e', marginTop: 2 }}>{detailParticipant.departure_date || '\u2014'}</div>
                </div>
              </div>

              {/* Providers — most useful info */}
              <div className="hw-form-section">
                <div className="hw-section-title">{t('sec_providers')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                  {([
                    [t('fld_sending_org'), detailParticipant.sending_organisations?.name],
                    [t('fld_host_company'), detailParticipant.host_companies ? `${detailParticipant.host_companies.name}${detailParticipant.host_companies.city ? ' \u2014 ' + detailParticipant.host_companies.city : ''}` : null],
                    [t('fld_transfer_prov'), detailParticipant.transfer_providers ? `${detailParticipant.transfer_providers.name}${detailParticipant.transfer_providers.phone ? ' \u00B7 ' + detailParticipant.transfer_providers.phone : ''}` : null],
                    [t('fld_acc1'), detailParticipant.accommodation_1 ? `${detailParticipant.accommodation_1.name}${detailParticipant.accommodation_1.city ? ' \u2014 ' + detailParticipant.accommodation_1.city : ''}${detailParticipant.accommodation_1.typology ? ' (' + detailParticipant.accommodation_1.typology + ')' : ''}` : null],
                    [t('fld_insurance_prov'), detailParticipant.insurance_providers?.name],
                  ] as [string, string | null | undefined][]).map(([label, value], i) => (
                    <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: value ? '#111827' : '#d1d5db' }}>{value || '\u2014'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Travel details */}
              <div className="hw-form-section">
                <div className="hw-section-title">{t('page_travel')}</div>
                {detailLoading ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>
                    <div className="spinner-sm" style={{ margin: '0 auto 8px' }} />
                    {t('list_loading')}
                  </div>
                ) : detailTravel.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {detailTravel.map(td => (
                      <div key={td.id} style={{
                        background: '#f9fafb',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: '12px 16px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px 16px',
                      }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('td_transport')}</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>
                            {td.transport_type === 'Airplane' ? '\u2708\uFE0F' : td.transport_type === 'Train' ? '\u{1F686}' : td.transport_type === 'Car' ? '\u{1F697}' : ''} {td.transport_type || '\u2014'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('td_number')}</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{td.flight_train_number || '\u2014'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('td_departure')}</div>
                          <div style={{ fontSize: 13 }}>{td.departure_datetime ? new Date(td.departure_datetime).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '\u2014'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('td_arrival')}</div>
                          <div style={{ fontSize: 13 }}>{td.arrival_datetime ? new Date(td.arrival_datetime).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '\u2014'}</div>
                        </div>
                        {td.ticket_price != null && (
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('td_price')}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#2D7A6F' }}>\u20AC {td.ticket_price.toFixed(2)}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '16px 20px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 8,
                    color: '#92400e',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>{'\u{26A0}\uFE0F'}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t('td_empty')}</div>
                      <div style={{ fontSize: 12, marginTop: 2, opacity: 0.8 }}>{t('cal_add_travel_hint')}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Participant info */}
              <div className="hw-form-section">
                <div className="hw-section-title">{t('sec_mobility')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                  {([
                    [t('fld_dest_city'), [detailParticipant.destination_city, detailParticipant.destination_country].filter(Boolean).join(', ')],
                    [t('fld_nationality'), detailParticipant.nationality],
                    [t('fld_program'), detailParticipant.program],
                    [t('fld_phone'), detailParticipant.phone],
                    [t('fld_email'), detailParticipant.email],
                  ] as [string, string | null | undefined][]).map(([label, value], i) => (
                    <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: value ? '#111827' : '#d1d5db' }}>{value || '\u2014'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hm-modal-footer">
              <button className="hw-btn-secondary" onClick={closeDetail}>{t('btn_cancel')}</button>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                const pid = detailParticipant.id
                closeDetail()
                if (detailParticipant.mobility_typology === 'Outgoing') navigate('/outgoing/travel', { state: { forParticipantId: pid } })
                else navigate('/incoming/travel', { state: { forParticipantId: pid } })
              }}>
                + {t('page_travel')}
              </button>
              <button className="btn btn-accent btn-sm" onClick={() => {
                const pid = detailParticipant.id
                closeDetail()
                if (detailParticipant.mobility_typology === 'Outgoing') navigate('/outgoing/individuals', { state: { selectParticipantId: pid } })
                else navigate('/incoming/individuals', { state: { selectParticipantId: pid } })
              }}>
                {t('cal_open_profile')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
