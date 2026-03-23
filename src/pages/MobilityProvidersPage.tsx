import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { MobilityServiceProvider } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'
import { useT } from '../lib/i18n'

function FR({ label, name, value, editing, type = 'text', onChange }: { label: string; name: string; value: string | number | null; editing: boolean; type?: string; onChange: (n: string, v: string) => void }) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing ? <input className="form-input form-input-sm" type={type} value={value ?? ''} onChange={e => onChange(name, e.target.value)} /> : <div className="field-value">{value !== null && value !== '' ? String(value) : '—'}</div>}
    </div>
  )
}

const EMPTY: Partial<MobilityServiceProvider> = {
  name: '', pic_number: '', address: '', postcode: '', city: '', country: '', website: '',
  email: '', phone: '', contact_person: '', contact_email: '', contact_phone: '',
  contact_comments: '', geographic_area: '', specialty_1: '', specialty_2: '', specialty_3: '',
  notes: '', placement_fees: ''
}

export default function MobilityProvidersPage() {
  const { t } = useT()
  const [items, setItems] = useState<MobilityServiceProvider[]>([])
  const [selected, setSelected] = useState<MobilityServiceProvider | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<MobilityServiceProvider>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => { setLoading(true); const { data } = await supabase.from('mobility_service_providers').select('*').order('name'); setItems(data || []); setLoading(false) }
  useEffect(() => { load() }, [])

  const filtered = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.city || '').toLowerCase().includes(search.toLowerCase()) || (p.country || '').toLowerCase().includes(search.toLowerCase()))
  const select = (p: MobilityServiceProvider) => { setSelected(p); setEditing(false); setIsNew(false); setSaveError('') }
  const startNew = () => { setEditData({ ...EMPTY }); setSelected(null); setIsNew(true); setEditing(true); setSaveError('') }
  const startEdit = () => { setEditData({ ...selected }); setEditing(true); setSaveError('') }
  const cancel = () => { setEditing(false); setIsNew(false); setSaveError('') }
  const handleChange = (n: string, v: string) => setEditData(p => ({ ...p, [n]: v === '' ? null : v }))
  const handleNumChange = (n: string, v: string) => setEditData(p => ({ ...p, [n]: v === '' ? null : Number(v) }))

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    if (isNew) {
      const { error } = await supabase.from('mobility_service_providers').insert({ ...editData, id: `rec${Date.now()}` })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('mobility_service_providers').update(editData).eq('id', selected!.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    await load(); setEditing(false); setIsNew(false); setSaving(false)
  }

  const handleDelete = async () => { if (!selected) return; await supabase.from('mobility_service_providers').delete().eq('id', selected.id); setSelected(null); setShowConfirm(false); await load() }
  const v = (f: keyof MobilityServiceProvider) => editing ? (editData[f] as string ?? '') : (selected?.[f] as string ?? '')

  return (
    <div className="split-layout">
<<<<<<< HEAD
      {showConfirm && <ConfirmDialog message={`${t('confirm_delete')} "${selected?.name}"? ${t('confirm_irrev')}`} onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />}
=======
      {showConfirm && <ConfirmDialog message={`${t('confirm_delete_item')} "${selected?.name}"?`} onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />}
>>>>>>> cac1eb36d15fad1a4788a4c6bef53d679a14536a
      <div className="split-left">
        <div className="split-header"><h2 className="split-title">{t('page_mobility_providers')}</h2><span className="badge-count">{filtered.length}</span></div>
        <div className="search-bar" style={{ display: 'flex', gap: 6 }}>
          <input type="text" className="form-input" placeholder={t('list_search')} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-accent btn-sm" onClick={startNew}>{t('btn_new')}</button>
        </div>
        {loading ? <div className="list-loading"><div className="spinner-sm"></div></div> : (
          <div className="participant-list">
            {filtered.map(p => (
              <div key={p.id} className={`participant-item ${selected?.id === p.id ? 'selected' : ''}`} onClick={() => select(p)}>
                <div className="participant-avatar" style={{ background: '#38BDF822', color: '#0284C7' }}>{p.name.charAt(0)}</div>
                <div className="participant-info"><div className="participant-name">{p.name}</div><div className="participant-meta">{p.city}{p.country ? ` · ${p.country}` : ''}</div></div>
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
                ? <><span style={{ fontWeight: 600, color: '#2D7A6F' }}>{isNew ? t('msp_new') : t('detail_mode_edit')}</span><div className="action-bar-right">{saveError && <span className="save-error">{saveError}</span>}<button className="btn btn-secondary btn-sm" onClick={cancel}>{t('btn_cancel')}</button><button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>{saving ? t('btn_saving') : t('btn_save')}</button></div></>
                : <><span /><div className="action-bar-right"><button className="btn btn-edit btn-sm" onClick={startEdit}>{t('btn_edit')}</button><button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>{t('btn_delete')}</button></div></>}
            </div>
            {!isNew && selected && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#38BDF822', color: '#0284C7' }}>{selected.name.charAt(0)}</div><div><h2 className="detail-name">{selected.name}</h2><p className="detail-id">{t('page_mobility_providers')}</p></div></div>}
            {isNew && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#0284C7' }}>+</div><div><h2 className="detail-name">{t('msp_new')}</h2></div></div>}
            <div className="detail-sections">
<<<<<<< HEAD
              <div className="detail-section-header">{t('sec_so_details')}</div>
=======
              <div className="detail-section-header">{t('sec_msp_org')}</div>
>>>>>>> cac1eb36d15fad1a4788a4c6bef53d679a14536a
              <div className="fields-grid">
                <FR label={t('fld_name')} name="name" value={v('name')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_pic')} name="pic_number" value={v('pic_number')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_geographic_area')} name="geographic_area" value={v('geographic_area')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_website')} name="website" value={v('website')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_email')} name="email" value={v('email')} editing={editing} type="email" onChange={handleChange} />
                <FR label={t('fld_phone')} name="phone" value={v('phone')} editing={editing} onChange={handleChange} />
              </div>
              <div className="detail-section-header">{t('sec_address')}</div>
              <div className="fields-grid">
                <FR label={t('fld_address')} name="address" value={v('address')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_postcode')} name="postcode" value={v('postcode')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_city')} name="city" value={v('city')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_country')} name="country" value={v('country')} editing={editing} onChange={handleChange} />
              </div>
              <div className="detail-section-header">{t('sec_msp_contact')}</div>
              <div className="fields-grid">
<<<<<<< HEAD
                <FR label={t('fld_contact_person')} name="contact_person" value={v('contact_person')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_contact_email')} name="contact_email" value={v('contact_email')} editing={editing} type="email" onChange={handleChange} />
                <FR label={t('fld_contact_phone')} name="contact_phone" value={v('contact_phone')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_contact_notes')} name="contact_comments" value={v('contact_comments')} editing={editing} onChange={handleChange} />
=======
                <FR label={t('fld_contact')} name="contact_person" value={v('contact_person')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_contact_email')} name="contact_email" value={v('contact_email')} editing={editing} type="email" onChange={handleChange} />
                <FR label={t('fld_contact_phone')} name="contact_phone" value={v('contact_phone')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_contact_comments')} name="contact_comments" value={v('contact_comments')} editing={editing} onChange={handleChange} />
>>>>>>> cac1eb36d15fad1a4788a4c6bef53d679a14536a
              </div>
              <div className="detail-section-header">{t('sec_msp_capacity')}</div>
              <div className="fields-grid">
                <FR label={t('fld_num_offices')} name="num_offices" value={v('num_offices')} editing={editing} type="number" onChange={handleNumChange} />
                <FR label={t('fld_num_employees')} name="num_employees" value={v('num_employees')} editing={editing} type="number" onChange={handleNumChange} />
                <FR label={t('fld_placement_capacity')} name="placement_capacity" value={v('placement_capacity')} editing={editing} type="number" onChange={handleNumChange} />
                <FR label={t('fld_placement_fees')} name="placement_fees" value={v('placement_fees')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_specialty_1')} name="specialty_1" value={v('specialty_1')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_specialty_2')} name="specialty_2" value={v('specialty_2')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_specialty_3')} name="specialty_3" value={v('specialty_3')} editing={editing} onChange={handleChange} />
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
          <div className="detail-empty"><div className="detail-empty-icon">🌐</div><p>{t('msp_hint')}</p><button className="btn btn-accent" onClick={startNew} style={{ marginTop: 12 }}>+ {t('msp_new')}</button></div>
        )}
      </div>
    </div>
  )
}
