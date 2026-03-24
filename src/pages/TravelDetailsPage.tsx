import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import type { TravelDetail } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

interface Props { typology: 'Incoming' | 'Outgoing' }

interface TDRow extends TravelDetail {
  participants?: { name: string; surname: string; mobility_typology: string } | null
}

interface TDForm {
  participant_id: string
  transport_type: string
  flight_train_number: string
  departure_datetime: string
  arrival_datetime: string
  ticket_price: string
}

const emptyForm = (): TDForm => ({
  participant_id: '',
  transport_type: 'Airplane',
  flight_train_number: '',
  departure_datetime: '',
  arrival_datetime: '',
  ticket_price: '',
})

interface PartOption { id: string; name: string | null; surname: string | null }

export default function TravelDetailsPage({ typology }: Props) {
  const { t } = useT()
  const location = useLocation()

  const [details, setDetails] = useState<TDRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Participants for dropdown
  const [participants, setParticipants] = useState<PartOption[]>([])

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TDForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    loadParticipants()
  }, [typology])

  // Auto-open modal for a specific participant from calendar navigation
  useEffect(() => {
    const navState = location.state as { forParticipantId?: string } | null
    if (navState?.forParticipantId && participants.length > 0) {
      const p = participants.find(x => x.id === navState.forParticipantId)
      if (p) {
        setForm({ ...emptyForm(), participant_id: p.id })
        setEditingId(null)
        setShowModal(true)
        window.history.replaceState({}, '')
      }
    }
  }, [participants, location.state])

  const loadData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('travel_details')
      .select('*, participants(name, surname, mobility_typology)')
      .order('departure_datetime', { ascending: true })
    const rows = ((data as TDRow[]) || []).filter(d => d.participants?.mobility_typology === typology)
    setDetails(rows)
    setLoading(false)
  }

  const loadParticipants = async () => {
    const { data } = await supabase
      .from('participants')
      .select('id, name, surname')
      .eq('mobility_typology', typology)
      .order('surname')
    setParticipants((data as PartOption[]) || [])
  }

  const filtered = details.filter(d => {
    const q = search.toLowerCase()
    return `${d.participants?.name} ${d.participants?.surname}`.toLowerCase().includes(q) ||
      (d.transport_type || '').toLowerCase().includes(q) ||
      (d.flight_train_number || '').toLowerCase().includes(q)
  })

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const openNew = () => {
    setForm(emptyForm())
    setEditingId(null)
    setSaveError('')
    setShowModal(true)
  }

  const openEdit = (td: TDRow) => {
    setForm({
      participant_id: td.participant_id || '',
      transport_type: td.transport_type || 'Airplane',
      flight_train_number: td.flight_train_number || '',
      departure_datetime: td.departure_datetime || '',
      arrival_datetime: td.arrival_datetime || '',
      ticket_price: td.ticket_price != null ? String(td.ticket_price) : '',
    })
    setEditingId(td.id)
    setSaveError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setSaveError('')
  }

  const handleSave = async () => {
    if (!form.participant_id) { setSaveError('Select a participant'); return }
    setSaving(true)
    setSaveError('')

    const payload = {
      participant_id: form.participant_id,
      transport_type: form.transport_type || null,
      flight_train_number: form.flight_train_number || null,
      departure_datetime: form.departure_datetime || null,
      arrival_datetime: form.arrival_datetime || null,
      ticket_price: form.ticket_price ? parseFloat(form.ticket_price) : null,
    }

    if (editingId) {
      const { error } = await supabase.from('travel_details').update(payload).eq('id', editingId)
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('travel_details').insert(payload)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }

    setSaving(false)
    closeModal()
    await loadData()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from('travel_details').delete().eq('id', deleteId)
    setDeleteId(null)
    await loadData()
  }

  const fmtDT = (d: string | null) => d ? new Date(d).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '\u2014'
  const fmtCur = (v: number | null) => v != null ? `\u20AC${v.toLocaleString()}` : '\u2014'

  return (
    <div className="page-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {deleteId && (
        <ConfirmDialog
          message={`${t('confirm_delete')}? ${t('confirm_irrev')}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 className="page-title">{t('page_travel')} {'\u2014'} {typology}</h1>
          <p className="page-subtitle">{filtered.length} {t('home_stats_total').toLowerCase()}</p>
        </div>
        <input
          type="text"
          className="form-input"
          placeholder={t('td_search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <button className="btn btn-accent btn-sm" onClick={openNew}>+ {t('td_new')}</button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : (
        <div className="table-container" style={{ flex: 1, overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('td_participant')}</th>
                <th>{t('td_transport')}</th>
                <th>{t('td_number')}</th>
                <th>{t('td_departure')}</th>
                <th>{t('td_arrival')}</th>
                <th>{t('td_price')}</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty-cell">{t('td_empty')}</td></tr>
              )}
              {filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>
                    {d.participants ? `${d.participants.surname} ${d.participants.name}` : '\u2014'}
                  </td>
                  <td>
                    <span className="transport-badge">
                      {d.transport_type === 'Airplane' ? '\u2708\uFE0F' : d.transport_type === 'Train' ? '\u{1F686}' : d.transport_type === 'Bus' ? '\u{1F68C}' : '\u{1F697}'} {d.transport_type || '\u2014'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{d.flight_train_number || '\u2014'}</td>
                  <td>{fmtDT(d.departure_datetime)}</td>
                  <td>{fmtDT(d.arrival_datetime)}</td>
                  <td className="num">{fmtCur(d.ticket_price)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-edit btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => openEdit(d)}>{t('btn_edit')}</button>
                      <button className="btn btn-danger btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setDeleteId(d.id)}>{t('btn_delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="hm-modal-overlay" onClick={closeModal}>
          <div className="hm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="hm-modal-header" style={{ borderColor: '#1D72B8' }}>
              <div className="hm-modal-header-icon" style={{ background: '#dbeafe', color: '#1D72B8' }}>
                {'\u2708\uFE0F'}
              </div>
              <h2 className="hm-modal-title">{editingId ? t('td_edit') : t('td_new')}</h2>
              <button className="hm-modal-close" onClick={closeModal}>&times;</button>
            </div>

            <div className="hm-modal-body">
              <div className="hw-form-section">
                <div className="hw-section-title">{t('td_participant')}</div>
                <select
                  className="form-input"
                  value={form.participant_id}
                  onChange={e => setForm(f => ({ ...f, participant_id: e.target.value }))}
                  style={{ marginBottom: 16 }}
                >
                  <option value="">\u2014 {t('td_participant')} \u2014</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>{p.surname} {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="hw-form-section">
                <div className="hw-section-title">{t('page_travel')}</div>
                <div className="hm-form-grid">
                  <div className="hm-field">
                    <label>{t('td_transport')}</label>
                    <select
                      className="form-input"
                      value={form.transport_type}
                      onChange={e => setForm(f => ({ ...f, transport_type: e.target.value }))}
                    >
                      <option value="Airplane">{`Airplane \u2708\uFE0F`}</option>
                      <option value="Train">{`Train \u{1F686}`}</option>
                      <option value="Bus">{`Bus \u{1F68C}`}</option>
                      <option value="Car">{`Car \u{1F697}`}</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="hm-field">
                    <label>{t('td_number')}</label>
                    <input
                      className="form-input"
                      type="text"
                      value={form.flight_train_number}
                      onChange={e => setForm(f => ({ ...f, flight_train_number: e.target.value }))}
                      placeholder="FR1234, RJ456..."
                    />
                  </div>
                  <div className="hm-field">
                    <label>{t('td_departure')}</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={form.departure_datetime}
                      onChange={e => setForm(f => ({ ...f, departure_datetime: e.target.value }))}
                    />
                  </div>
                  <div className="hm-field">
                    <label>{t('td_arrival')}</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={form.arrival_datetime}
                      onChange={e => setForm(f => ({ ...f, arrival_datetime: e.target.value }))}
                    />
                  </div>
                  <div className="hm-field">
                    <label>{t('td_price')} (\u20AC)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={form.ticket_price}
                      onChange={e => setForm(f => ({ ...f, ticket_price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="hm-modal-footer">
              {saveError && <span style={{ color: '#dc2626', fontSize: 12, marginRight: 'auto' }}>{saveError}</span>}
              <button className="hw-btn-secondary" onClick={closeModal}>{t('btn_cancel')}</button>
              <button
                className="hw-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.participant_id}
              >
                {saving ? t('btn_saving') : t('btn_save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
