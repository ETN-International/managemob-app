import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import type { Participant } from '../types'

interface Props { typology: 'Incoming' | 'Outgoing' }

const fmt = (v: number | null) => v != null ? new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) : '\u2014'

const FINANCIAL_FIELDS = [
  'grant_amount',
  'international_transport_cost',
  'local_transport_cost',
  'food_allowance_cost',
  'insurance_cost',
  'accommodation_1_cost',
  'accommodation_2_cost',
  'transfer_cost',
  'language_course_cost',
  'cultural_activities_cost',
  'other_expenses',
] as const

type FinField = typeof FINANCIAL_FIELDS[number]

function calcMargin(values: Record<FinField, number | null>): number {
  const g = values.grant_amount || 0
  const costs = (values.international_transport_cost || 0) + (values.local_transport_cost || 0) +
    (values.food_allowance_cost || 0) + (values.insurance_cost || 0) +
    (values.accommodation_1_cost || 0) + (values.accommodation_2_cost || 0) +
    (values.transfer_cost || 0) + (values.language_course_cost || 0) +
    (values.cultural_activities_cost || 0) + (values.other_expenses || 0)
  return g - costs
}

function calcMarginFromParticipant(p: Participant): number {
  return calcMargin({
    grant_amount: p.grant_amount,
    international_transport_cost: p.international_transport_cost,
    local_transport_cost: p.local_transport_cost,
    food_allowance_cost: p.food_allowance_cost,
    insurance_cost: p.insurance_cost,
    accommodation_1_cost: p.accommodation_1_cost,
    accommodation_2_cost: p.accommodation_2_cost,
    transfer_cost: p.transfer_cost,
    language_course_cost: p.language_course_cost,
    cultural_activities_cost: p.cultural_activities_cost,
    other_expenses: p.other_expenses,
  })
}

export default function FinancialInfoPage({ typology }: Props) {
  const { t } = useT()
  const [records, setRecords] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<FinField, string>>({} as any)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [typology])

  const loadData = async () => {
    setLoading(true)
    const { data } = await supabase.from('participants')
      .select('*')
      .eq('mobility_typology', typology)
      .order('surname')
    setRecords((data || []) as Participant[])
    setLoading(false)
  }

  const filtered = records.filter(r =>
    `${r.name} ${r.surname}`.toLowerCase().includes(search.toLowerCase())
  )

  const totalGrant = filtered.reduce((s, r) => s + (r.grant_amount || 0), 0)
  const totalMargin = filtered.reduce((s, r) => s + calcMarginFromParticipant(r), 0)

  // ── Inline edit handlers ────────────────────────────────────────────────────
  const startEdit = (p: Participant) => {
    const vals: Record<string, string> = {}
    for (const f of FINANCIAL_FIELDS) {
      vals[f] = p[f] != null ? String(p[f]) : ''
    }
    setEditValues(vals as Record<FinField, string>)
    setEditingId(p.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleFieldChange = (field: FinField, val: string) => {
    setEditValues(prev => ({ ...prev, [field]: val }))
  }

  const handleSave = async () => {
    if (!editingId) return
    setSaving(true)
    const payload: Record<string, number | null> = {}
    for (const f of FINANCIAL_FIELDS) {
      payload[f] = editValues[f] ? parseFloat(editValues[f]) : null
    }
    await supabase.from('participants').update(payload).eq('id', editingId)
    setSaving(false)
    setEditingId(null)
    await loadData()
  }

  // Column label mapping
  const colKeys: { key: FinField; label: string }[] = [
    { key: 'grant_amount', label: t('fi_col_grant') },
    { key: 'international_transport_cost', label: t('fi_col_intl') },
    { key: 'local_transport_cost', label: t('fi_col_local') },
    { key: 'food_allowance_cost', label: t('fi_col_food') },
    { key: 'insurance_cost', label: t('fi_col_ins') },
    { key: 'accommodation_1_cost', label: t('fi_col_acc') },
    { key: 'accommodation_2_cost', label: t('fi_col_acc2') },
    { key: 'transfer_cost', label: t('fi_col_tr') },
    { key: 'language_course_cost', label: t('fi_col_lc') },
    { key: 'cultural_activities_cost', label: t('fi_col_cultural') },
    { key: 'other_expenses', label: t('fi_col_other') },
  ]

  // Compute live margin for editing row
  const editMargin = editingId ? calcMargin(
    Object.fromEntries(FINANCIAL_FIELDS.map(f => [f, editValues[f] ? parseFloat(editValues[f]) : null])) as Record<FinField, number | null>
  ) : 0

  return (
    <div className="page-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 className="page-title">{t('page_financial')} {'\u2014'} {typology}</h1>
          <p className="page-subtitle">{filtered.length} {t('home_stats_total').toLowerCase()}</p>
        </div>
        <input
          type="text"
          className="form-input"
          placeholder={t('fi_search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      {/* KPI */}
      <div className="kpi-grid kpi-mini" style={{ marginBottom: 16, flexShrink: 0 }}>
        <div className="kpi-card">
          <div>
            <div className="kpi-value" style={{ color: '#2D7A6F' }}>{fmt(totalGrant)}</div>
            <div className="kpi-label">{t('fi_total_grant')}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div>
            <div className="kpi-value" style={{ color: totalMargin >= 0 ? '#10B981' : '#EF4444' }}>{fmt(totalMargin)}</div>
            <div className="kpi-label">{t('fi_total_margin')}</div>
          </div>
        </div>
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
                {colKeys.map(c => <th key={c.key}>{c.label}</th>)}
                <th>{t('fi_col_margin')}</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={14} className="empty-cell">{t('fi_empty')}</td></tr>
              )}
              {filtered.map(r => {
                const isEditing = editingId === r.id

                if (isEditing) {
                  return (
                    <tr key={r.id} style={{ background: '#f0fdf4' }}>
                      <td style={{ fontWeight: 600 }}>{r.surname} {r.name}</td>
                      {colKeys.map(c => (
                        <td key={c.key}>
                          <input
                            className="form-input-sm"
                            type="number"
                            step="1"
                            value={editValues[c.key]}
                            onChange={e => handleFieldChange(c.key, e.target.value)}
                            style={{ width: 75, textAlign: 'right' }}
                          />
                        </td>
                      ))}
                      <td className="num" style={{ fontWeight: 700, color: editMargin >= 0 ? '#10B981' : '#EF4444' }}>
                        {fmt(editMargin)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-accent btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={handleSave} disabled={saving}>
                            {saving ? '...' : t('btn_save')}
                          </button>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={cancelEdit}>
                            {'\u2715'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                const margin = calcMarginFromParticipant(r)
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.surname} {r.name}</td>
                    {colKeys.map(c => (
                      <td key={c.key} className="num">{fmt(r[c.key] as number | null)}</td>
                    ))}
                    <td className="num" style={{ fontWeight: 700, color: margin >= 0 ? '#10B981' : '#EF4444' }}>
                      {fmt(margin)}
                    </td>
                    <td>
                      <button className="btn btn-edit btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => startEdit(r)}>
                        {t('btn_edit')}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
