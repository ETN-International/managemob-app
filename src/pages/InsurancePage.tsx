import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { InsuranceProvider } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'
import { useT } from '../lib/i18n'

const STATUS_OPTIONS = ['Active', 'Inactive', 'Pending']

function FR({ label, name, value, editing, type = 'text', onChange, options }: { label: string; name: string; value: string | null; editing: boolean; type?: string; onChange: (n: string, v: string) => void; options?: string[] }) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing
        ? options
          ? <select className="form-input form-input-sm" value={value ?? ''} onChange={e => onChange(name, e.target.value)}><option value="">—</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
          : <input className="form-input form-input-sm" type={type} value={value ?? ''} onChange={e => onChange(name, e.target.value)} />
        : <div className="field-value">{value || '—'}</div>}
    </div>
  )
}

const statusColor: Record<string, string> = { Active: '#10B981', Inactive: '#EF4444', Pending: '#F59E0B' }

const EMPTY: Partial<InsuranceProvider> = { name: '', contact_person: '', phone: '', email: '', address: '', city: '', notes: '', status: '' }

export default function InsurancePage() {
  const { t } = useT()
  const [items, setItems] = useState<InsuranceProvider[]>([])
  const [selected, setSelected] = useState<InsuranceProvider | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<InsuranceProvider>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => { setLoading(true); const { data } = await supabase.from('insurance_providers').select('*').order('name'); setItems(data || []); setLoading(false) }
  useEffect(() => { load() }, [])

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.city || '').toLowerCase().includes(search.toLowerCase()))
  const select = (i: InsuranceProvider) => { setSelected(i); setEditing(false); setIsNew(false); setSaveError('') }
  const startNew = () => { setEditData({ ...EMPTY }); setSelected(null); setIsNew(true); setEditing(true); setSaveError('') }
  const startEdit = () => { setEditData({ ...selected }); setEditing(true); setSaveError('') }
  const cancel = () => { setEditing(false); setIsNew(false); setSaveError('') }
  const handleChange = (n: string, v: string) => setEditData(p => ({ ...p, [n]: v === '' ? null : v }))

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    if (isNew) {
      const { error } = await supabase.from('insurance_providers').insert({ ...editData, id: `rec${Date.now()}` })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('insurance_providers').update(editData).eq('id', selected!.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    await load(); setEditing(false); setIsNew(false); setSaving(false)
  }

  const handleDelete = async () => { if (!selected) return; await supabase.from('insurance_providers').delete().eq('id', selected.id); setSelected(null); setShowConfirm(false); await load() }
  const v = (f: keyof InsuranceProvider) => editing ? (editData[f] as string ?? '') : (selected?.[f] as string ?? '')

  return (
    <div className="split-layout">
      {showConfirm && <ConfirmDialog message={`${t('confirm_delete_item')} "${selected?.name}"?`} onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />}
      <div className="split-left">
        <div className="split-header"><h2 className="split-title">{t('page_insurance')}</h2><span className="badge-count">{filtered.length}</span></div>
        <div className="search-bar" style={{ display: 'flex', gap: 6 }}>
          <input type="text" className="form-input" placeholder={t('list_search')} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-accent btn-sm" onClick={startNew}>{t('btn_new')}</button>
        </div>
        {loading ? <div className="list-loading"><div className="spinner-sm"></div></div> : (
          <div className="participant-list">
            {filtered.map(i => (
              <div key={i.id} className={`participant-item ${selected?.id === i.id ? 'selected' : ''}`} onClick={() => select(i)}>
                <div className="participant-avatar" style={{ background: '#F59E0B22', color: '#B45309' }}>{i.name.charAt(0)}</div>
                <div className="participant-info">
                  <div className="participant-name">{i.name}</div>
                  <div className="participant-meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {i.city || '—'}
                    {i.status && <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[i.status] || '#6B7280', background: `${statusColor[i.status] || '#6B7280'}18`, borderRadius: 4, padding: '1px 5px' }}>{i.status}</span>}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">{t('list_empty')}</div>}
          </div>
        )}
      </div>
      <div className="split-right">
        {(selected || isNew) ? (
          <div className="detail-panel">
            <div className="detail-action-bar">
              {editing
                ? <><span style={{ fontWeight: 600, color: '#2D7A6F' }}>{isNew ? t('ins_new') : t('detail_mode_edit')}</span><div className="action-bar-right">{saveError && <span className="save-error">{saveError}</span>}<button className="btn btn-secondary btn-sm" onClick={cancel}>{t('btn_cancel')}</button><button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>{saving ? t('btn_saving') : t('btn_save')}</button></div></>
                : <><span /><div className="action-bar-right"><button className="btn btn-edit btn-sm" onClick={startEdit}>{t('btn_edit')}</button><button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>{t('btn_delete')}</button></div></>}
            </div>
            {!isNew && selected && (
              <div className="detail-name-header">
                <div className="detail-avatar" style={{ background: '#F59E0B22', color: '#B45309' }}>{selected.name.charAt(0)}</div>
                <div>
                  <h2 className="detail-name">{selected.name}</h2>
                  <p className="detail-id">
                    {t('page_insurance')}
                    {selected.status && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: statusColor[selected.status] || '#6B7280' }}>{selected.status}</span>}
                  </p>
                </div>
              </div>
            )}
            {isNew && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#F59E0B' }}>+</div><div><h2 className="detail-name">{t('ins_new')}</h2></div></div>}
            <div className="detail-sections">
              <div className="detail-section-header">{t('sec_ins_details')}</div>
              <div className="fields-grid">
                <FR label={t('fld_name')} name="name" value={v('name')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_status')} name="status" value={v('status')} editing={editing} onChange={handleChange} options={STATUS_OPTIONS} />
                <FR label={t('fld_contact')} name="contact_person" value={v('contact_person')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_phone')} name="phone" value={v('phone')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_email')} name="email" value={v('email')} editing={editing} type="email" onChange={handleChange} />
              </div>
              <div className="detail-section-header">{t('sec_address')}</div>
              <div className="fields-grid">
                <FR label={t('fld_address')} name="address" value={v('address')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_city')} name="city" value={v('city')} editing={editing} onChange={handleChange} />
              </div>
              {(editing || selected?.notes) && (
                <>
                  <div className="detail-section-header">{t('sec_notes')}</div>
                  <div className="field-row">
                    {editing
                      ? <textarea className="form-input" rows={3} value={v('notes')} onChange={e => handleChange('notes', e.target.value)} style={{ resize: 'vertical' }} />
                      : <div className="field-value" style={{ whiteSpace: 'pre-wrap' }}>{selected?.notes}</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="detail-empty"><div className="detail-empty-icon">🛡️</div><p>{t('ins_hint')}</p><button className="btn btn-accent" onClick={startNew} style={{ marginTop: 12 }}>+ {t('ins_new')}</button></div>
        )}
      </div>
    </div>
  )
}
