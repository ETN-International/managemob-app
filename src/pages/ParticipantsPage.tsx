import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Participant, SendingOrganisation, HostCompany, InsuranceProvider, TransferProvider, LanguageCourseProvider, Accommodation, MobilityServiceProvider } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'
import { useT } from '../lib/i18n'

interface ParticipantsPageProps {
  typology: 'Incoming' | 'Outgoing'
  groupView?: boolean
}

function Badge({ text, color }: { text: string; color: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: `${color}22`, color, border: `1px solid ${color}44` }}>{text}</span>
}

interface FRProps { label: string; name: string; value: string | number | null; editing: boolean; type?: string; onChange: (name: string, val: string) => void; options?: string[] }
function FR({ label, name, value, editing, type = 'text', onChange, options }: FRProps) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing ? (
        options ? (
          <select className="form-input form-input-sm" value={value ?? ''} onChange={e => onChange(name, e.target.value)}>
            <option value="">—</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input className="form-input form-input-sm" type={type} value={value ?? ''} onChange={e => onChange(name, e.target.value)} />
        )
      ) : (
        <div className="field-value">{value || '—'}</div>
      )}
    </div>
  )
}

interface FRRefProps { label: string; name: string; valueId: string | null; valueName: string | null; editing: boolean; onChange: (name: string, val: string) => void; options: { id: string; name: string }[] }
function FRRef({ label, name, valueId, valueName, editing, onChange, options }: FRRefProps) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing ? (
        <select className="form-input form-input-sm" value={valueId ?? ''} onChange={e => onChange(name, e.target.value)}>
          <option value="">—</option>
          {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      ) : (
        <div className="field-value">{valueName || '—'}</div>
      )}
    </div>
  )
}

function calcWeeks(start: string | null | undefined, end: string | null | undefined): number | null {
  if (!start || !end) return null
  const s = new Date(start), e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return null
  return Math.ceil((e.getTime() - s.getTime()) / (7 * 24 * 60 * 60 * 1000))
}

const EMPTY_PARTICIPANT: Partial<Participant> = {
  name: '', surname: '', sex: '', status: '', nationality: '', marital_status: '',
  mobility_typology: '', indiv_group: 'Individual', email: '', phone: '', mobile_phone: '',
  address: '', postcode: '', city: '', country: '',
  destination_country: '', destination_city: '', program: '', group_name: '', project_name: '',
  grant_amount: null, lang_english: '', lang_spanish: '', lang_french: '', lang_german: '', lang_italian: '',
}

export default function ParticipantsPage({ typology, groupView = false }: ParticipantsPageProps) {
  const { t } = useT()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selected, setSelected] = useState<Participant | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Participant>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [sendingOrgs, setSendingOrgs] = useState<SendingOrganisation[]>([])
  const [hostCompanies, setHostCompanies] = useState<HostCompany[]>([])
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([])
  const [transferProviders, setTransferProviders] = useState<TransferProvider[]>([])
  const [langCourseProviders, setLangCourseProviders] = useState<LanguageCourseProvider[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [mobilityProviders, setMobilityProviders] = useState<MobilityServiceProvider[]>([])

  useEffect(() => {
    loadParticipants()
    loadRefs()
  }, [typology])

  const loadRefs = async () => {
    const [so, hc, ins, tr, lcp, acc, msp] = await Promise.all([
      supabase.from('sending_organisations').select('*').order('name'),
      supabase.from('host_companies').select('*').order('name'),
      supabase.from('insurance_providers').select('*').order('name'),
      supabase.from('transfer_providers').select('*').order('name'),
      supabase.from('language_course_providers').select('*').order('name'),
      supabase.from('accommodation').select('*').order('name'),
      supabase.from('mobility_service_providers').select('*').order('name'),
    ])
    setSendingOrgs(so.data || [])
    setHostCompanies(hc.data || [])
    setInsuranceProviders(ins.data || [])
    setTransferProviders(tr.data || [])
    setLangCourseProviders(lcp.data || [])
    setAccommodations(acc.data || [])
    setMobilityProviders(msp.data || [])
  }

  const loadParticipants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('participants')
      .select(`*, sending_organisations(id,name), host_companies(id,name,address,city,sector,tutor,tutor_phone,tutor_email), insurance_providers(id,name), transfer_providers(id,name), language_course_providers(id,name), mobility_service_providers(id,name), accommodation_1:accommodation!participants_accommodation_1_id_fkey(id,name,typology,address,city,country), accommodation_2:accommodation!participants_accommodation_2_id_fkey(id,name,typology,address,city,country)`)
      .eq('mobility_typology', typology)
      .order('surname', { ascending: true })
    if (error) console.error(error)
    else setParticipants((data as unknown as Participant[]) || [])
    setLoading(false)
  }

  const filtered = participants.filter(p => {
    const q = search.toLowerCase()
    return `${p.name} ${p.surname}`.toLowerCase().includes(q) ||
      (p.sending_organisations?.name || '').toLowerCase().includes(q) ||
      (p.nationality || '').toLowerCase().includes(q)
  })

  const grouped: Record<string, Participant[]> = {}
  filtered.forEach(p => {
    const org = p.sending_organisations?.name || t('list_no_org')
    if (!grouped[org]) grouped[org] = []
    grouped[org].push(p)
  })

  const selectParticipant = (p: Participant) => { setSelected(p); setEditing(false); setIsNew(false); setSaveError('') }
  const startEdit = () => { setEditData({ ...selected }); setEditing(true); setSaveError('') }
  const startNew = () => {
    setEditData({ ...EMPTY_PARTICIPANT, mobility_typology: typology })
    setSelected(null); setIsNew(true); setEditing(true); setSaveError('')
  }
  const cancelEdit = () => { setEditing(false); setIsNew(false); setSaveError('') }

  const handleChange = (name: string, val: string) => {
    setEditData(prev => {
      const updated = { ...prev, [name]: val === '' ? null : val }
      // Auto-calculate weeks
      if (name === 'language_course_start_date' || name === 'language_course_end_date') {
        const weeks = calcWeeks(
          name === 'language_course_start_date' ? val : prev.language_course_start_date,
          name === 'language_course_end_date' ? val : prev.language_course_end_date
        )
        if (weeks !== null) updated.language_course_weeks = weeks
      }
      if (name === 'internship_start_date' || name === 'internship_end_date') {
        const weeks = calcWeeks(
          name === 'internship_start_date' ? val : prev.internship_start_date,
          name === 'internship_end_date' ? val : prev.internship_end_date
        )
        if (weeks !== null) updated.internship_weeks = weeks
      }
      if (name === 'accommodation_1_start_date' || name === 'accommodation_1_end_date') {
        const weeks = calcWeeks(
          name === 'accommodation_1_start_date' ? val : prev.accommodation_1_start_date,
          name === 'accommodation_1_end_date' ? val : prev.accommodation_1_end_date
        )
        if (weeks !== null) updated.accommodation_1_weeks = weeks
      }
      if (name === 'accommodation_2_start_date' || name === 'accommodation_2_end_date') {
        const weeks = calcWeeks(
          name === 'accommodation_2_start_date' ? val : prev.accommodation_2_start_date,
          name === 'accommodation_2_end_date' ? val : prev.accommodation_2_end_date
        )
        if (weeks !== null) updated.accommodation_2_weeks = weeks
      }
      return updated
    })
  }

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    const payload = { ...editData }
    delete (payload as any).sending_organisations
    delete (payload as any).host_companies
    delete (payload as any).insurance_providers
    delete (payload as any).transfer_providers
    delete (payload as any).language_course_providers
    delete (payload as any).mobility_service_providers
    delete (payload as any).accommodation_1
    delete (payload as any).accommodation_2

    if (isNew) {
      const { error } = await supabase.from('participants').insert({ ...payload, id: `rec${Date.now()}` })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('participants').update(payload).eq('id', selected!.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    await loadParticipants(); setEditing(false); setIsNew(false); setSaving(false)
  }

  const handleDelete = async () => {
    if (!selected) return
    await supabase.from('participants').delete().eq('id', selected.id)
    setSelected(null); setShowConfirm(false); await loadParticipants()
  }

  const pdfBase = 'https://pdf.managemob.app/pdf-viewer'
  const profLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const ed = editData
  const sel = selected
  const fv = (f: keyof Participant) => editing ? (ed[f] as any ?? '') : (sel?.[f] as any ?? '')

  return (
    <div className="split-layout">
      {showConfirm && (
        <ConfirmDialog
          message={`${t('confirm_delete')} ${sel?.name} ${sel?.surname}? ${t('confirm_irrev')}`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Left panel */}
      <div className="split-left">
        <div className="split-header">
          <h2 className="split-title">{groupView ? t('page_groups') : t('page_individuals')} — {typology}</h2>
          <span className="badge-count">{filtered.length}</span>
        </div>
        <div className="search-bar" style={{ display: 'flex', gap: 6 }}>
          <input type="text" className="form-input" placeholder={t('part_search')} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-accent btn-sm" onClick={startNew} title={t('part_new')}>{t('btn_new')}</button>
        </div>
        {loading ? <div className="list-loading"><div className="spinner-sm"></div></div> : (
          <div className="participant-list">
            {Object.entries(grouped).map(([org, members]) => (
              <div key={org} className="org-group">
                <div className="org-group-header"><span>{org}</span><span className="org-count">{members.length}</span></div>
                {members.map(p => (
                  <div key={p.id} className={`participant-item ${sel?.id === p.id ? 'selected' : ''}`} onClick={() => selectParticipant(p)}>
                    <div className="participant-avatar">{(p.name || '?').charAt(0)}{(p.surname || '').charAt(0)}</div>
                    <div className="participant-info">
                      <div className="participant-name">{p.name} {p.surname}</div>
                      <div className="participant-meta">{p.nationality}{p.destination_city ? ` · ${p.destination_city}` : ''}</div>
                    </div>
                    <Badge text={p.indiv_group || 'Individual'} color={p.indiv_group === 'Group' ? '#8B5CF6' : '#2D7A6F'} />
                  </div>
                ))}
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">{t('list_empty')}</div>}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="split-right">
        {(sel || isNew) ? (
          <div className="detail-panel">
            {!editing ? (
              <div className="detail-action-bar">
                <div className="action-bar-left">
                  <Badge text={sel?.mobility_typology || typology} color="#2D7A6F" />
                  <Badge text={sel?.indiv_group || 'Individual'} color="#1D72B8" />
                </div>
                <div className="action-bar-right">
                  {sel && <>
                    <a href={`${pdfBase}/${sel.id}/participants`} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm">{t('pdf_voucher')}</a>
                    <a href={`${pdfBase}/${sel.id}/financial-report`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">{t('pdf_financial')}</a>
                    <a href={`${pdfBase}/${sel.id}/certificate`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">{t('pdf_certificate')}</a>
                  </>}
                  <button className="btn btn-edit btn-sm" onClick={startEdit}>{t('btn_edit')}</button>
                  {sel && <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>{t('btn_delete')}</button>}
                </div>
              </div>
            ) : (
              <div className="detail-action-bar">
                <span style={{ fontWeight: 600, color: '#2D7A6F' }}>{isNew ? t('part_new') : t('detail_mode_edit')}</span>
                <div className="action-bar-right">
                  {saveError && <span className="save-error">{saveError}</span>}
                  <button className="btn btn-secondary btn-sm" onClick={cancelEdit} disabled={saving}>{t('btn_cancel')}</button>
                  <button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>{saving ? t('btn_saving') : t('btn_save')}</button>
                </div>
              </div>
            )}

            {/* Name header */}
            {!isNew && sel && (
              <div className="detail-name-header">
                <div className="detail-avatar">{(sel.name || '?').charAt(0)}{(sel.surname || '').charAt(0)}</div>
                <div>
                  <h2 className="detail-name">{sel.name} {sel.surname}</h2>
                  <p className="detail-id">{sel.id_formattato} · Record #{sel.record_number}</p>
                </div>
              </div>
            )}
            {isNew && (
              <div className="detail-name-header">
                <div className="detail-avatar" style={{ background: '#1D72B8' }}>+</div>
                <div><h2 className="detail-name">{t('part_new')}</h2></div>
              </div>
            )}

            <div className="detail-sections">

              {/* Personal */}
              <div className="detail-section-header">{t('sec_personal')}</div>
              <div className="fields-grid">
                <FR label={t('fld_name')} name="name" value={fv('name')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_surname')} name="surname" value={fv('surname')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_sex')} name="sex" value={fv('sex')} editing={editing} onChange={handleChange} options={['Male', 'Female', 'Other']} />
                <FR label={t('fld_status')} name="status" value={fv('status')} editing={editing} onChange={handleChange} options={['Student', 'Teacher', 'Job seeker', 'Worker', 'Other']} />
                <FR label={t('fld_dob')} name="date_of_birth" value={fv('date_of_birth')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_pob')} name="place_of_birth" value={fv('place_of_birth')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_nationality')} name="nationality" value={fv('nationality')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_marital')} name="marital_status" value={fv('marital_status')} editing={editing} onChange={handleChange} options={['Single', 'Married', 'Divorced', 'Widowed']} />
                <FR label={t('fld_driving')} name="driving_licence" value={fv('driving_licence')} editing={editing} onChange={handleChange} options={['Yes', 'No']} />
              </div>

              {/* Address */}
              <div className="detail-section-header">{t('sec_address')}</div>
              <div className="fields-grid">
                <FR label={t('fld_address')} name="address" value={fv('address')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_postcode')} name="postcode" value={fv('postcode')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_city')} name="city" value={fv('city')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_country')} name="country" value={fv('country')} editing={editing} onChange={handleChange} />
              </div>

              {/* Contacts */}
              <div className="detail-section-header">{t('sec_contacts')}</div>
              <div className="fields-grid">
                <FR label={t('fld_email')} name="email" value={fv('email')} editing={editing} type="email" onChange={handleChange} />
                <FR label={t('fld_phone')} name="phone" value={fv('phone')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_mobile')} name="mobile_phone" value={fv('mobile_phone')} editing={editing} onChange={handleChange} />
              </div>

              {/* Passport */}
              <div className="detail-section-header">{t('sec_passport')}</div>
              <div className="fields-grid">
                <FR label={t('fld_passport_no')} name="passport_number" value={fv('passport_number')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_passport_exp')} name="passport_expiring_date" value={fv('passport_expiring_date')} editing={editing} type="date" onChange={handleChange} />
              </div>

              {/* Languages */}
              <div className="detail-section-header">{t('sec_languages')}</div>
              <div className="fields-grid">
                <FR label={t('fld_lang_english')} name="lang_english" value={fv('lang_english')} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label={t('fld_lang_spanish')} name="lang_spanish" value={fv('lang_spanish')} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label={t('fld_lang_french')} name="lang_french" value={fv('lang_french')} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label={t('fld_lang_german')} name="lang_german" value={fv('lang_german')} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label={t('fld_lang_italian')} name="lang_italian" value={fv('lang_italian')} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label={t('fld_lang_other')} name="lang_other" value={fv('lang_other')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_lang_test')} name="language_test_validated" value={fv('language_test_validated')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_lang_score')} name="language_test_score" value={fv('language_test_score')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_lang_cert')} name="language_test_certificate" value={fv('language_test_certificate')} editing={editing} onChange={handleChange} />
              </div>

              {/* Education */}
              <div className="detail-section-header">{t('sec_education')}</div>
              <div className="fields-grid">
                <FR label={t('fld_diploma')} name="last_diploma" value={fv('last_diploma')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_year')} name="year_obtained" value={fv('year_obtained')} editing={editing} onChange={handleChange} />
              </div>

              {/* Banking */}
              <div className="detail-section-header">{t('sec_banking')}</div>
              <div className="fields-grid">
                <FR label={t('fld_swift')} name="swift_code" value={fv('swift_code')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_iban')} name="iban" value={fv('iban')} editing={editing} onChange={handleChange} />
              </div>

              {/* Mobility */}
              <div className="detail-section-header">{t('sec_mobility')}</div>
              <div className="fields-grid">
                <FR label={t('fld_typology')} name="mobility_typology" value={fv('mobility_typology')} editing={editing} onChange={handleChange} options={['Incoming', 'Outgoing']} />
                <FR label={t('fld_indiv_group')} name="indiv_group" value={fv('indiv_group')} editing={editing} onChange={handleChange} options={['Individual', 'Group']} />
                <FR label={t('fld_dest_country')} name="destination_country" value={fv('destination_country')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_dest_city')} name="destination_city" value={fv('destination_city')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_arrival')} name="arrival_date" value={fv('arrival_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_departure')} name="departure_date" value={fv('departure_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_program')} name="program" value={fv('program')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_project')} name="project_name" value={fv('project_name')} editing={editing} onChange={handleChange} />
                <FR label={t('fld_group_name')} name="group_name" value={fv('group_name')} editing={editing} onChange={handleChange} />
              </div>

              {/* Providers */}
              <div className="detail-section-header">{t('sec_providers')}</div>
              <div className="fields-grid">
                <FRRef label={t('fld_sending_org')} name="sending_organisation_id"
                  valueId={editing ? ed.sending_organisation_id ?? null : sel?.sending_organisation_id ?? null}
                  valueName={sel?.sending_organisations?.name ?? null}
                  editing={editing} onChange={handleChange} options={sendingOrgs} />
                <FRRef label={t('fld_host_company')} name="host_company_id"
                  valueId={editing ? ed.host_company_id ?? null : sel?.host_company_id ?? null}
                  valueName={sel?.host_companies?.name ?? null}
                  editing={editing} onChange={handleChange} options={hostCompanies} />
                <FRRef label={t('fld_insurance_prov')} name="insurance_provider_id"
                  valueId={editing ? ed.insurance_provider_id ?? null : sel?.insurance_provider_id ?? null}
                  valueName={sel?.insurance_providers?.name ?? null}
                  editing={editing} onChange={handleChange} options={insuranceProviders} />
                <FRRef label={t('fld_transfer_prov')} name="transfer_provider_id"
                  valueId={editing ? ed.transfer_provider_id ?? null : sel?.transfer_provider_id ?? null}
                  valueName={sel?.transfer_providers?.name ?? null}
                  editing={editing} onChange={handleChange} options={transferProviders} />
                <FRRef label={t('fld_lc_provider')} name="language_course_provider_id"
                  valueId={editing ? ed.language_course_provider_id ?? null : sel?.language_course_provider_id ?? null}
                  valueName={sel?.language_course_providers?.name ?? null}
                  editing={editing} onChange={handleChange} options={langCourseProviders} />
                <FRRef label={t('fld_mobility_prov')} name="mobility_service_provider_id"
                  valueId={editing ? ed.mobility_service_provider_id ?? null : sel?.mobility_service_provider_id ?? null}
                  valueName={(sel as any)?.mobility_service_providers?.name ?? null}
                  editing={editing} onChange={handleChange} options={mobilityProviders} />
              </div>

              {/* Language Course */}
              <div className="detail-section-header">{t('sec_lang_course')}</div>
              <div className="fields-grid">
                <FR label={t('fld_lc_start')} name="language_course_start_date" value={fv('language_course_start_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_lc_end')} name="language_course_end_date" value={fv('language_course_end_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_lc_weeks')} name="language_course_weeks" value={fv('language_course_weeks')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_lc_cost')} name="language_course_cost" value={fv('language_course_cost')} editing={editing} type="number" onChange={handleChange} />
              </div>

              {/* Internship */}
              <div className="detail-section-header">{t('sec_internship')}</div>
              <div className="fields-grid">
                <FR label={t('fld_int_start')} name="internship_start_date" value={fv('internship_start_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_int_end')} name="internship_end_date" value={fv('internship_end_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_int_weeks')} name="internship_weeks" value={fv('internship_weeks')} editing={editing} type="number" onChange={handleChange} />
              </div>

              {/* Accommodation */}
              <div className="detail-section-header">{t('sec_accommodation')}</div>
              <div className="fields-grid">
                <FRRef label={t('fld_acc1')} name="accommodation_1_id"
                  valueId={editing ? ed.accommodation_1_id ?? null : sel?.accommodation_1_id ?? null}
                  valueName={sel?.accommodation_1?.name ?? null}
                  editing={editing} onChange={handleChange} options={accommodations} />
                <FR label={t('fld_acc1_start')} name="accommodation_1_start_date" value={fv('accommodation_1_start_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_acc1_end')} name="accommodation_1_end_date" value={fv('accommodation_1_end_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_acc1_weeks')} name="accommodation_1_weeks" value={fv('accommodation_1_weeks')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_acc1_cost')} name="accommodation_1_cost" value={fv('accommodation_1_cost')} editing={editing} type="number" onChange={handleChange} />
                <FRRef label={t('fld_acc2')} name="accommodation_2_id"
                  valueId={editing ? ed.accommodation_2_id ?? null : sel?.accommodation_2_id ?? null}
                  valueName={sel?.accommodation_2?.name ?? null}
                  editing={editing} onChange={handleChange} options={accommodations} />
                <FR label={t('fld_acc2_start')} name="accommodation_2_start_date" value={fv('accommodation_2_start_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_acc2_end')} name="accommodation_2_end_date" value={fv('accommodation_2_end_date')} editing={editing} type="date" onChange={handleChange} />
                <FR label={t('fld_acc2_weeks')} name="accommodation_2_weeks" value={fv('accommodation_2_weeks')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_acc2_cost')} name="accommodation_2_cost" value={fv('accommodation_2_cost')} editing={editing} type="number" onChange={handleChange} />
              </div>

              {/* Financials */}
              <div className="detail-section-header">{t('sec_financials')}</div>
              <div className="fields-grid">
                <FR label={t('fld_grant')} name="grant_amount" value={fv('grant_amount')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_intl_transport')} name="international_transport_cost" value={fv('international_transport_cost')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_local_transport')} name="local_transport_cost" value={fv('local_transport_cost')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_food')} name="food_allowance_cost" value={fv('food_allowance_cost')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_insurance_cost')} name="insurance_cost" value={fv('insurance_cost')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_transfer_cost')} name="transfer_cost" value={fv('transfer_cost')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_lc_cost')} name="language_course_cost" value={fv('language_course_cost')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_cultural')} name="cultural_activities_cost" value={fv('cultural_activities_cost')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_other_expenses')} name="other_expenses" value={fv('other_expenses')} editing={editing} type="number" onChange={handleChange} />
                <FR label={t('fld_other_notes')} name="note_other_expenses" value={fv('note_other_expenses')} editing={editing} onChange={handleChange} />
              </div>

              {/* Host Company detail (read-only) */}
              {!editing && sel?.host_companies && (
                <>
                  <div className="detail-section-header">{t('sec_host_company_detail')}</div>
                  <div className="fields-grid">
                    <div className="field-row"><div className="field-label">{t('fld_company_name')}</div><div className="field-value">{sel.host_companies.name}</div></div>
                    <div className="field-row"><div className="field-label">{t('fld_city')}</div><div className="field-value">{sel.host_companies.city || '—'}</div></div>
                    <div className="field-row"><div className="field-label">{t('fld_sector')}</div><div className="field-value">{sel.host_companies.sector || '—'}</div></div>
                    <div className="field-row"><div className="field-label">{t('fld_tutor')}</div><div className="field-value">{sel.host_companies.tutor || '—'}</div></div>
                    <div className="field-row"><div className="field-label">{t('fld_tutor_phone')}</div><div className="field-value">{sel.host_companies.tutor_phone || '—'}</div></div>
                    <div className="field-row"><div className="field-label">{t('fld_tutor_email')}</div><div className="field-value">{sel.host_companies.tutor_email || '—'}</div></div>
                  </div>
                </>
              )}

              {/* PDF buttons at bottom */}
              {!editing && sel && (
                <div style={{ padding: '16px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={`${pdfBase}/${sel.id}/participants`} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm">{t('pdf_voucher')}</a>
                  <a href={`${pdfBase}/${sel.id}/financial-report`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">{t('pdf_financial')}</a>
                  <a href={`${pdfBase}/${sel.id}/certificate`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">{t('pdf_certificate')}</a>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="detail-empty">
            <div className="detail-empty-icon">👤</div>
            <p>{t('part_hint')}</p>
            <button className="btn btn-accent" onClick={startNew} style={{ marginTop: 12 }}>{t('part_new_btn')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
