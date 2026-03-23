import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import type { Participant } from '../types'

interface Props { typology: 'Incoming' | 'Outgoing' }
const fmt = (v: number | null) => v != null ? new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) : '—'

function calcMargin(p: Participant): number {
  const g = p.grant_amount || 0
  const costs = (p.international_transport_cost || 0) + (p.local_transport_cost || 0) + (p.food_allowance_cost || 0) +
    (p.insurance_cost || 0) + (p.accommodation_1_cost || 0) + (p.accommodation_2_cost || 0) +
    (p.transfer_cost || 0) + (p.language_course_cost || 0) + (p.cultural_activities_cost || 0) +
    (p.other_expenses || 0)
  return g - costs
}

export default function FinancialInfoPage({ typology }: Props) {
  const { t } = useT()
  const [records, setRecords] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('participants')
      .select('*')
      .eq('mobility_typology', typology)
      .order('surname')
      .then(({ data }) => {
        setRecords((data || []) as Participant[])
        setLoading(false)
      })
  }, [typology])

  const filtered = records.filter(r =>
    `${r.name} ${r.surname}`.toLowerCase().includes(search.toLowerCase())
  )

  const totalGrant = filtered.reduce((s, r) => s + (r.grant_amount || 0), 0)
  const totalMargin = filtered.reduce((s, r) => s + calcMargin(r), 0)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t('page_financial')} — {typology}</h1>
        <span className="badge-count">{filtered.length}</span>
      </div>
      <div className="kpi-grid kpi-mini">
        <div className="kpi-card"><div className="kpi-body"><div className="kpi-value">{fmt(totalGrant)}</div><div className="kpi-label">{t('fi_total_grant')}</div></div></div>
        <div className="kpi-card"><div className="kpi-body"><div className="kpi-value">{fmt(totalMargin)}</div><div className="kpi-label">{t('fi_total_margin')}</div></div></div>
      </div>
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <input type="text" className="form-input" placeholder={t('fi_search')} value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
      </div>
      {loading ? <div className="page-loading"><div className="spinner"></div></div> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('td_participant')}</th>
                <th>{t('fi_col_grant')}</th>
                <th>{t('fi_col_intl')}</th>
                <th>{t('fi_col_local')}</th>
                <th>{t('fi_col_food')}</th>
                <th>{t('fi_col_ins')}</th>
                <th>{t('fi_col_acc')}</th>
                <th>{t('fi_col_acc2')}</th>
                <th>{t('fi_col_tr')}</th>
                <th>{t('fi_col_lc')}</th>
                <th>{t('fi_col_cultural')}</th>
                <th>{t('fi_col_other')}</th>
                <th>{t('fi_col_margin')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const margin = calcMargin(r)
                return (
                  <tr key={r.id}>
                    <td>{r.name} {r.surname}</td>
                    <td className="num">{fmt(r.grant_amount)}</td>
                    <td className="num">{fmt(r.international_transport_cost)}</td>
                    <td className="num">{fmt(r.local_transport_cost)}</td>
                    <td className="num">{fmt(r.food_allowance_cost)}</td>
                    <td className="num">{fmt(r.insurance_cost)}</td>
                    <td className="num">{fmt(r.accommodation_1_cost)}</td>
                    <td className="num">{fmt(r.accommodation_2_cost)}</td>
                    <td className="num">{fmt(r.transfer_cost)}</td>
                    <td className="num">{fmt(r.language_course_cost)}</td>
                    <td className="num">{fmt(r.cultural_activities_cost)}</td>
                    <td className="num">{fmt(r.other_expenses)}</td>
                    <td className="num" style={{ fontWeight: 600, color: margin > 0 ? '#10B981' : '#EF4444' }}>{fmt(margin)}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={13} className="empty-cell">{t('fi_empty')}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
