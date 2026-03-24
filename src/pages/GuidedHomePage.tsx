import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import type {
  Participant,
  SendingOrganisation,
  HostCompany,
  InsuranceProvider,
  TransferProvider,
  LanguageCourseProvider,
  Accommodation,
  MobilityServiceProvider,
} from '../types'

// ─── Constants ───────────────────────────────────────────────────────────────
type GroupTab = 'paste' | 'csv'
type ModalType = 'participant' | 'group' | 'services' | 'providers' | null

const C_BLUE   = '#1D72B8'
const C_PURPLE = '#8B5CF6'
const C_GREEN  = '#10B981'
const C_TEAL   = '#2D7A6F'
const C_ORANGE = '#F59E0B'

// ─── Helper: parse CSV ────────────────────────────────────────────────────────
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

// ─── Individual form state ───────────────────────────────────────────────────
interface IndivForm {
  name: string; surname: string; sex: string
  date_of_birth: string; nationality: string
  email: string; phone: string
  mobility_typology: string
  arrival_date: string; departure_date: string
  destination_country: string; destination_city: string
  program: string; project_name: string; group_name: string
}
const emptyIndivForm = (): IndivForm => ({
  name: '', surname: '', sex: '', date_of_birth: '', nationality: '',
  email: '', phone: '', mobility_typology: 'Incoming',
  arrival_date: '', departure_date: '', destination_country: '', destination_city: '',
  program: '', project_name: '', group_name: '',
})

// ─── Group form state ─────────────────────────────────────────────────────────
interface GroupFields {
  group_name: string; mobility_typology: string
  destination_country: string; destination_city: string
  arrival_date: string; departure_date: string
  program: string; project_name: string
}
const emptyGroupFields = (): GroupFields => ({
  group_name: '', mobility_typology: 'Incoming',
  destination_country: '', destination_city: '',
  arrival_date: '', departure_date: '',
  program: '', project_name: '',
})

// ─── Parsed name row ──────────────────────────────────────────────────────────
interface NameRow { name: string; surname: string }

// ─── CSV mapping ──────────────────────────────────────────────────────────────
interface CsvMapping {
  name: number; surname: number; email: number
  date_of_birth: number; nationality: number
}

// ─── Service assignment form ──────────────────────────────────────────────────
interface ServiceForm {
  sending_organisation_id: string
  host_company_id: string
  accommodation_1_id: string
  accommodation_1_start_date: string
  accommodation_1_end_date: string
  insurance_provider_id: string
  transfer_provider_id: string
  language_course_provider_id: string
  mobility_service_provider_id: string
}
const emptyServiceForm = (): ServiceForm => ({
  sending_organisation_id: '',
  host_company_id: '',
  accommodation_1_id: '',
  accommodation_1_start_date: '',
  accommodation_1_end_date: '',
  insurance_provider_id: '',
  transfer_provider_id: '',
  language_course_provider_id: '',
  mobility_service_provider_id: '',
})

// ─── Full provider forms ─────────────────────────────────────────────────────
interface FullSO  { name: string; contact_person: string; email: string; phone: string; address: string; city: string; country: string }
interface FullHC  { name: string; address: string; city: string; sector: string; contact_person: string; email: string; phone: string; tutor: string; tutor_phone: string; tutor_email: string }
interface FullAcc { name: string; typology: string; contact_person: string; email: string; phone: string; mobile_phone: string; address: string; postcode: string; city: string; country: string; num_bedrooms: string; size_m2: string; has_desk: boolean; has_internet: boolean; has_washing_machine: boolean; has_air_conditioning: boolean; has_heating: boolean; has_pets: boolean; board_option_1: string; price_week_option_1: string; board_option_2: string; price_week_option_2: string; board_option_3: string; price_week_option_3: string; family_rules: string; comments: string }
interface FullIns { name: string; contact_person: string; phone: string; email: string; address: string; city: string; notes: string; status: string }
interface FullTr  { name: string; contact_person: string; phone: string; email: string; normal_price: string; notes: string }
interface FullLC  { name: string; address: string; city: string; country: string; contact_person: string; email: string; phone: string; website: string; language_taught: string }
interface FullMSP { name: string; pic_number: string; address: string; postcode: string; city: string; country: string; website: string; email: string; phone: string; contact_person: string; contact_email: string; contact_phone: string; contact_comments: string; num_offices: string; num_employees: string; placement_capacity: string; placement_fees: string; geographic_area: string; specialty_1: string; specialty_2: string; specialty_3: string; notes: string }

const emptySO  = (): FullSO  => ({ name: '', contact_person: '', email: '', phone: '', address: '', city: '', country: '' })
const emptyHC  = (): FullHC  => ({ name: '', address: '', city: '', sector: '', contact_person: '', email: '', phone: '', tutor: '', tutor_phone: '', tutor_email: '' })
const emptyAcc = (): FullAcc => ({ name: '', typology: '', contact_person: '', email: '', phone: '', mobile_phone: '', address: '', postcode: '', city: '', country: '', num_bedrooms: '', size_m2: '', has_desk: false, has_internet: false, has_washing_machine: false, has_air_conditioning: false, has_heating: false, has_pets: false, board_option_1: '', price_week_option_1: '', board_option_2: '', price_week_option_2: '', board_option_3: '', price_week_option_3: '', family_rules: '', comments: '' })
const emptyIns = (): FullIns => ({ name: '', contact_person: '', phone: '', email: '', address: '', city: '', notes: '', status: '' })
const emptyTr  = (): FullTr  => ({ name: '', contact_person: '', phone: '', email: '', normal_price: '', notes: '' })
const emptyLC  = (): FullLC  => ({ name: '', address: '', city: '', country: '', contact_person: '', email: '', phone: '', website: '', language_taught: '' })
const emptyMSP = (): FullMSP => ({ name: '', pic_number: '', address: '', postcode: '', city: '', country: '', website: '', email: '', phone: '', contact_person: '', contact_email: '', contact_phone: '', contact_comments: '', num_offices: '', num_employees: '', placement_capacity: '', placement_fees: '', geographic_area: '', specialty_1: '', specialty_2: '', specialty_3: '', notes: '' })

type ProviderModalType = 'so' | 'hc' | 'acc' | 'ins' | 'tr' | 'lc' | 'msp' | null

// ─── Main component ───────────────────────────────────────────────────────────
export default function GuidedHomePage() {
  const { t } = useT()
  const navigate = useNavigate()

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // ── Loading ─────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)

  // ── Stats ───────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    total: 0, incoming: 0, outgoing: 0, recent: 0,
    sendingOrgs: 0, hostCompanies: 0, accommodation: 0,
    insurance: 0, transfer: 0, langCourse: 0, mobilityProviders: 0,
  })

  // ── Reference data ──────────────────────────────────────────────────────────
  const [sendingOrgs,       setSendingOrgs]       = useState<SendingOrganisation[]>([])
  const [hostCompanies,     setHostCompanies]      = useState<HostCompany[]>([])
  const [accommodations,    setAccommodations]     = useState<Accommodation[]>([])
  const [insuranceProviders,setInsuranceProviders] = useState<InsuranceProvider[]>([])
  const [transferProviders, setTransferProviders]  = useState<TransferProvider[]>([])
  const [langCourseProviders,setLangCourseProviders] = useState<LanguageCourseProvider[]>([])
  const [mobilityProviders, setMobilityProviders]  = useState<MobilityServiceProvider[]>([])

  // ── Participant form ──────────────────────────────────────────────────────
  const [indivForm, setIndivForm]       = useState<IndivForm>(emptyIndivForm())
  const [savingIndiv, setSavingIndiv]   = useState(false)
  const [indivSuccess, setIndivSuccess] = useState(false)

  // ── Group form ────────────────────────────────────────────────────────────
  const [groupTab, setGroupTab]         = useState<GroupTab>('paste')
  const [groupFields, setGroupFields]   = useState<GroupFields>(emptyGroupFields())
  const [pasteText, setPasteText]       = useState('')
  const [parsedNames, setParsedNames]   = useState<NameRow[]>([])
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [groupSuccess, setGroupSuccess] = useState(0)

  // CSV state
  const [csvHeaders,  setCsvHeaders]  = useState<string[]>([])
  const [csvRows,     setCsvRows]     = useState<string[][]>([])
  const [csvMapping,  setCsvMapping]  = useState<CsvMapping>({ name: 0, surname: 1, email: -1, date_of_birth: -1, nationality: -1 })
  const [csvFileName, setCsvFileName] = useState('')

  // ── Services ──────────────────────────────────────────────────────────────
  const [participantSearch, setParticipantSearch] = useState('')
  const [allParticipants,   setAllParticipants]   = useState<Participant[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [serviceForm, setServiceForm]   = useState<ServiceForm>(emptyServiceForm())
  const [savingServices, setSavingServices] = useState(false)
  const [servicesSuccess, setServicesSuccess] = useState(false)
  const [applyToGroup, setApplyToGroup] = useState(false)

  // ── Providers ─────────────────────────────────────────────────────────────
  const [providerModal, setProviderModal] = useState<ProviderModalType>(null)
  const [formSO,  setFormSO]  = useState<FullSO>(emptySO())
  const [formHC,  setFormHC]  = useState<FullHC>(emptyHC())
  const [formAcc, setFormAcc] = useState<FullAcc>(emptyAcc())
  const [formIns, setFormIns] = useState<FullIns>(emptyIns())
  const [formTr,  setFormTr]  = useState<FullTr>(emptyTr())
  const [formLC,  setFormLC]  = useState<FullLC>(emptyLC())
  const [formMSP, setFormMSP] = useState<FullMSP>(emptyMSP())
  const [provSaving, setProvSaving] = useState(false)
  const [provSuccess, setProvSuccess] = useState('')

  // ── Initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const [
      total, incoming, outgoing, recent,
      so, hc, acc, ins, tr, lcp, msp,
      soList, hcList, accList, insList, trList, lcpList, mspList,
      allParts,
    ] = await Promise.all([
      supabase.from('participants').select('id', { count: 'exact', head: true }),
      supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Incoming'),
      supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Outgoing'),
      supabase.from('participants').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      supabase.from('sending_organisations').select('id', { count: 'exact', head: true }),
      supabase.from('host_companies').select('id', { count: 'exact', head: true }),
      supabase.from('accommodation').select('id', { count: 'exact', head: true }),
      supabase.from('insurance_providers').select('id', { count: 'exact', head: true }),
      supabase.from('transfer_providers').select('id', { count: 'exact', head: true }),
      supabase.from('language_course_providers').select('id', { count: 'exact', head: true }),
      supabase.from('mobility_service_providers').select('id', { count: 'exact', head: true }),
      supabase.from('sending_organisations').select('*').order('name'),
      supabase.from('host_companies').select('*').order('name'),
      supabase.from('accommodation').select('*').order('name'),
      supabase.from('insurance_providers').select('*').order('name'),
      supabase.from('transfer_providers').select('*').order('name'),
      supabase.from('language_course_providers').select('*').order('name'),
      supabase.from('mobility_service_providers').select('*').order('name'),
      supabase.from('participants').select('id,name,surname,mobility_typology,group_name,sending_organisation_id,host_company_id,accommodation_1_id,insurance_provider_id,transfer_provider_id,language_course_provider_id,mobility_service_provider_id').order('name'),
    ])

    setStats({
      total:    total.count    ?? 0,
      incoming: incoming.count ?? 0,
      outgoing: outgoing.count ?? 0,
      recent:   recent.count   ?? 0,
      sendingOrgs:      so.count  ?? 0,
      hostCompanies:    hc.count  ?? 0,
      accommodation:    acc.count ?? 0,
      insurance:        ins.count ?? 0,
      transfer:         tr.count  ?? 0,
      langCourse:       lcp.count ?? 0,
      mobilityProviders: msp.count ?? 0,
    })

    setSendingOrgs(       (soList.data  as SendingOrganisation[])  ?? [])
    setHostCompanies(     (hcList.data  as HostCompany[])          ?? [])
    setAccommodations(    (accList.data as Accommodation[])        ?? [])
    setInsuranceProviders((insList.data as InsuranceProvider[])    ?? [])
    setTransferProviders( (trList.data  as TransferProvider[])     ?? [])
    setLangCourseProviders((lcpList.data as LanguageCourseProvider[]) ?? [])
    setMobilityProviders( (mspList.data as MobilityServiceProvider[]) ?? [])
    setAllParticipants(   (allParts.data    as Participant[])      ?? [])

    setLoading(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PARTICIPANT handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleIndivChange = (field: keyof IndivForm, value: string) => {
    setIndivForm(f => ({ ...f, [field]: value }))
  }

  const handleSaveIndiv = async () => {
    if (!indivForm.name.trim() || !indivForm.surname.trim()) return
    setSavingIndiv(true)
    await supabase.from('participants').insert({
      name:               indivForm.name.trim(),
      surname:            indivForm.surname.trim(),
      sex:                indivForm.sex || null,
      date_of_birth:      indivForm.date_of_birth || null,
      nationality:        indivForm.nationality || null,
      email:              indivForm.email || null,
      phone:              indivForm.phone || null,
      mobility_typology:  indivForm.mobility_typology,
      indiv_group:        'Individual',
      arrival_date:       indivForm.arrival_date || null,
      departure_date:     indivForm.departure_date || null,
      destination_country: indivForm.destination_country || null,
      destination_city:   indivForm.destination_city || null,
      program:            indivForm.program || null,
      project_name:       indivForm.project_name || null,
      group_name:         indivForm.group_name || null,
    })
    setSavingIndiv(false)
    setIndivSuccess(true)
    setIndivForm(emptyIndivForm())
    setTimeout(() => setIndivSuccess(false), 3000)
    await refreshRecent()
  }

  const refreshRecent = async () => {
    const total = await supabase.from('participants').select('id', { count: 'exact', head: true })
    const inc   = await supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Incoming')
    const out   = await supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Outgoing')
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const rec   = await supabase.from('participants').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo)
    setStats(s => ({
      ...s,
      total:    total.count ?? 0,
      incoming: inc.count   ?? 0,
      outgoing: out.count   ?? 0,
      recent:   rec.count   ?? 0,
    }))
    const { data: allParts } = await supabase
      .from('participants')
      .select('id,name,surname,mobility_typology,group_name,sending_organisation_id,host_company_id,accommodation_1_id,insurance_provider_id,transfer_provider_id,language_course_provider_id,mobility_service_provider_id')
      .order('name')
    if (allParts) setAllParticipants(allParts as Participant[])
  }

  // Group: parse names
  const handleParseNames = () => {
    const rows: NameRow[] = pasteText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const parts = l.split(/\s+/)
        return { name: parts[0] ?? '', surname: parts.slice(1).join(' ') }
      })
    setParsedNames(rows)
  }

  const handleParsedEdit = (idx: number, field: 'name' | 'surname', val: string) => {
    setParsedNames(rows => rows.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }
  const handleParsedRemove = (idx: number) => {
    setParsedNames(rows => rows.filter((_, i) => i !== idx))
  }

  const handleCreateGroup = async (rows: NameRow[]) => {
    if (!groupFields.group_name.trim() || rows.length === 0) return
    setCreatingGroup(true)
    const inserts = rows.map(r => ({
      name:                r.name,
      surname:             r.surname,
      mobility_typology:   groupFields.mobility_typology,
      indiv_group:         'Group',
      group_name:          groupFields.group_name,
      destination_country: groupFields.destination_country || null,
      destination_city:    groupFields.destination_city    || null,
      arrival_date:        groupFields.arrival_date        || null,
      departure_date:      groupFields.departure_date      || null,
      program:             groupFields.program             || null,
      project_name:        groupFields.project_name        || null,
    }))
    await supabase.from('participants').insert(inserts)
    setCreatingGroup(false)
    setGroupSuccess(rows.length)
    setParsedNames([])
    setPasteText('')
    setCsvRows([])
    setCsvHeaders([])
    setCsvFileName('')
    setGroupFields(emptyGroupFields())
    setTimeout(() => setGroupSuccess(0), 4000)
    await refreshRecent()
  }

  // CSV handlers
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length === 0) return
      const headers = parseCsvLine(lines[0])
      const rows = lines.slice(1, 11).map(l => parseCsvLine(l))
      setCsvHeaders(headers)
      setCsvRows(rows)
      const nameIdx    = headers.findIndex(h => /name|nome/i.test(h) && !/sur|cogn|last/i.test(h))
      const surnameIdx = headers.findIndex(h => /sur|cogn|last/i.test(h))
      const emailIdx   = headers.findIndex(h => /email/i.test(h))
      const dobIdx     = headers.findIndex(h => /birth|nascita|dob/i.test(h))
      const natIdx     = headers.findIndex(h => /nation|nazion/i.test(h))
      setCsvMapping({
        name:         nameIdx    >= 0 ? nameIdx    : 0,
        surname:      surnameIdx >= 0 ? surnameIdx : 1,
        email:        emailIdx   >= 0 ? emailIdx   : -1,
        date_of_birth: dobIdx    >= 0 ? dobIdx     : -1,
        nationality:  natIdx     >= 0 ? natIdx     : -1,
      })
    }
    reader.readAsText(file)
  }

  const handleCreateFromCsv = async () => {
    if (!groupFields.group_name.trim() || csvRows.length === 0) return
    const rows: NameRow[] = csvRows.map(r => ({
      name:    r[csvMapping.name]    ?? '',
      surname: r[csvMapping.surname] ?? '',
    }))
    await handleCreateGroup(rows)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVICES handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const filteredParticipants = allParticipants.filter(p => {
    if (!participantSearch.trim()) return true
    const q = participantSearch.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.surname?.toLowerCase().includes(q) ||
      p.group_name?.toLowerCase().includes(q)
    )
  })

  const handleSelectParticipant = (p: Participant) => {
    setSelectedParticipant(p)
    setServiceForm({
      sending_organisation_id:      p.sending_organisation_id    ?? '',
      host_company_id:              p.host_company_id            ?? '',
      accommodation_1_id:           p.accommodation_1_id         ?? '',
      accommodation_1_start_date:   p.accommodation_1_start_date ?? '',
      accommodation_1_end_date:     p.accommodation_1_end_date   ?? '',
      insurance_provider_id:        p.insurance_provider_id      ?? '',
      transfer_provider_id:         p.transfer_provider_id       ?? '',
      language_course_provider_id:  p.language_course_provider_id ?? '',
      mobility_service_provider_id: p.mobility_service_provider_id ?? '',
    })
    setServicesSuccess(false)
  }

  const handleServiceChange = (field: keyof ServiceForm, value: string) => {
    setServiceForm(f => ({ ...f, [field]: value }))
  }

  const handleSaveServices = async () => {
    if (!selectedParticipant) return
    setSavingServices(true)
    const patch = {
      sending_organisation_id:      serviceForm.sending_organisation_id      || null,
      host_company_id:              serviceForm.host_company_id              || null,
      accommodation_1_id:           serviceForm.accommodation_1_id           || null,
      accommodation_1_start_date:   serviceForm.accommodation_1_start_date   || null,
      accommodation_1_end_date:     serviceForm.accommodation_1_end_date     || null,
      insurance_provider_id:        serviceForm.insurance_provider_id        || null,
      transfer_provider_id:         serviceForm.transfer_provider_id         || null,
      language_course_provider_id:  serviceForm.language_course_provider_id  || null,
      mobility_service_provider_id: serviceForm.mobility_service_provider_id || null,
    }
    if (applyToGroup && selectedParticipant.group_name) {
      await supabase
        .from('participants')
        .update(patch)
        .eq('group_name', selectedParticipant.group_name)
    } else {
      await supabase
        .from('participants')
        .update(patch)
        .eq('id', selectedParticipant.id)
    }
    setSavingServices(false)
    setServicesSuccess(true)
    setSelectedParticipant({ ...selectedParticipant, ...patch } as Participant)
    setTimeout(() => setServicesSuccess(false), 3000)
    await refreshRecent()
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PROVIDERS handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const refreshProviderCounts = async () => {
    const [so, hc, acc, ins, tr, lcp, msp] = await Promise.all([
      supabase.from('sending_organisations').select('id', { count: 'exact', head: true }),
      supabase.from('host_companies').select('id', { count: 'exact', head: true }),
      supabase.from('accommodation').select('id', { count: 'exact', head: true }),
      supabase.from('insurance_providers').select('id', { count: 'exact', head: true }),
      supabase.from('transfer_providers').select('id', { count: 'exact', head: true }),
      supabase.from('language_course_providers').select('id', { count: 'exact', head: true }),
      supabase.from('mobility_service_providers').select('id', { count: 'exact', head: true }),
    ])
    setStats(s => ({
      ...s,
      sendingOrgs:      so.count  ?? 0,
      hostCompanies:    hc.count  ?? 0,
      accommodation:    acc.count ?? 0,
      insurance:        ins.count ?? 0,
      transfer:         tr.count  ?? 0,
      langCourse:       lcp.count ?? 0,
      mobilityProviders: msp.count ?? 0,
    }))
    // Also refresh provider lists for service dropdowns
    const [soList, hcList, accList, insList, trList, lcpList, mspList] = await Promise.all([
      supabase.from('sending_organisations').select('*').order('name'),
      supabase.from('host_companies').select('*').order('name'),
      supabase.from('accommodation').select('*').order('name'),
      supabase.from('insurance_providers').select('*').order('name'),
      supabase.from('transfer_providers').select('*').order('name'),
      supabase.from('language_course_providers').select('*').order('name'),
      supabase.from('mobility_service_providers').select('*').order('name'),
    ])
    if (soList.data) setSendingOrgs(soList.data as SendingOrganisation[])
    if (hcList.data) setHostCompanies(hcList.data as HostCompany[])
    if (accList.data) setAccommodations(accList.data as Accommodation[])
    if (insList.data) setInsuranceProviders(insList.data as InsuranceProvider[])
    if (trList.data) setTransferProviders(trList.data as TransferProvider[])
    if (lcpList.data) setLangCourseProviders(lcpList.data as LanguageCourseProvider[])
    if (mspList.data) setMobilityProviders(mspList.data as MobilityServiceProvider[])
  }

  const openProviderAdd = (key: ProviderModalType) => {
    // Reset the appropriate form and open the sub-modal
    if (key === 'so')  setFormSO(emptySO())
    if (key === 'hc')  setFormHC(emptyHC())
    if (key === 'acc') setFormAcc(emptyAcc())
    if (key === 'ins') setFormIns(emptyIns())
    if (key === 'tr')  setFormTr(emptyTr())
    if (key === 'lc')  setFormLC(emptyLC())
    if (key === 'msp') setFormMSP(emptyMSP())
    setProvSuccess('')
    setProviderModal(key)
  }

  const closeProviderModal = () => {
    setProviderModal(null)
    setProvSuccess('')
  }

  const handleProviderSave = async () => {
    setProvSaving(true)
    let error = null

    if (providerModal === 'so') {
      const res = await supabase.from('sending_organisations').insert({
        name: formSO.name.trim(),
        contact_person: formSO.contact_person || null,
        email: formSO.email || null,
        phone: formSO.phone || null,
        address: formSO.address || null,
        city: formSO.city || null,
        country: formSO.country || null,
      })
      error = res.error
      if (!error) setFormSO(emptySO())
    } else if (providerModal === 'hc') {
      const res = await supabase.from('host_companies').insert({
        name: formHC.name.trim(),
        address: formHC.address || null,
        city: formHC.city || null,
        sector: formHC.sector || null,
        contact_person: formHC.contact_person || null,
        email: formHC.email || null,
        phone: formHC.phone || null,
        tutor: formHC.tutor || null,
        tutor_phone: formHC.tutor_phone || null,
        tutor_email: formHC.tutor_email || null,
      })
      error = res.error
      if (!error) setFormHC(emptyHC())
    } else if (providerModal === 'acc') {
      const res = await supabase.from('accommodation').insert({
        name: formAcc.name.trim(),
        typology: formAcc.typology || null,
        contact_person: formAcc.contact_person || null,
        email: formAcc.email || null,
        phone: formAcc.phone || null,
        mobile_phone: formAcc.mobile_phone || null,
        address: formAcc.address || null,
        postcode: formAcc.postcode || null,
        city: formAcc.city || null,
        country: formAcc.country || null,
        num_bedrooms: formAcc.num_bedrooms ? parseInt(formAcc.num_bedrooms) : null,
        size_m2: formAcc.size_m2 ? parseFloat(formAcc.size_m2) : null,
        has_desk: formAcc.has_desk,
        has_internet: formAcc.has_internet,
        has_washing_machine: formAcc.has_washing_machine,
        has_air_conditioning: formAcc.has_air_conditioning,
        has_heating: formAcc.has_heating,
        has_pets: formAcc.has_pets,
        board_option_1: formAcc.board_option_1 || null,
        price_week_option_1: formAcc.price_week_option_1 ? parseFloat(formAcc.price_week_option_1) : null,
        board_option_2: formAcc.board_option_2 || null,
        price_week_option_2: formAcc.price_week_option_2 ? parseFloat(formAcc.price_week_option_2) : null,
        board_option_3: formAcc.board_option_3 || null,
        price_week_option_3: formAcc.price_week_option_3 ? parseFloat(formAcc.price_week_option_3) : null,
        family_rules: formAcc.family_rules || null,
        comments: formAcc.comments || null,
      })
      error = res.error
      if (!error) setFormAcc(emptyAcc())
    } else if (providerModal === 'ins') {
      const res = await supabase.from('insurance_providers').insert({
        name: formIns.name.trim(),
        contact_person: formIns.contact_person || null,
        phone: formIns.phone || null,
        email: formIns.email || null,
        address: formIns.address || null,
        city: formIns.city || null,
        notes: formIns.notes || null,
        status: formIns.status || null,
      })
      error = res.error
      if (!error) setFormIns(emptyIns())
    } else if (providerModal === 'tr') {
      const res = await supabase.from('transfer_providers').insert({
        name: formTr.name.trim(),
        contact_person: formTr.contact_person || null,
        phone: formTr.phone || null,
        email: formTr.email || null,
        normal_price: formTr.normal_price ? parseFloat(formTr.normal_price) : null,
        notes: formTr.notes || null,
      })
      error = res.error
      if (!error) setFormTr(emptyTr())
    } else if (providerModal === 'lc') {
      const res = await supabase.from('language_course_providers').insert({
        name: formLC.name.trim(),
        address: formLC.address || null,
        city: formLC.city || null,
        country: formLC.country || null,
        contact_person: formLC.contact_person || null,
        email: formLC.email || null,
        phone: formLC.phone || null,
        website: formLC.website || null,
        language_taught: formLC.language_taught || null,
      })
      error = res.error
      if (!error) setFormLC(emptyLC())
    } else if (providerModal === 'msp') {
      const res = await supabase.from('mobility_service_providers').insert({
        name: formMSP.name.trim(),
        pic_number: formMSP.pic_number || null,
        address: formMSP.address || null,
        postcode: formMSP.postcode || null,
        city: formMSP.city || null,
        country: formMSP.country || null,
        website: formMSP.website || null,
        email: formMSP.email || null,
        phone: formMSP.phone || null,
        contact_person: formMSP.contact_person || null,
        contact_email: formMSP.contact_email || null,
        contact_phone: formMSP.contact_phone || null,
        contact_comments: formMSP.contact_comments || null,
        num_offices: formMSP.num_offices ? parseInt(formMSP.num_offices) : null,
        num_employees: formMSP.num_employees ? parseInt(formMSP.num_employees) : null,
        placement_capacity: formMSP.placement_capacity ? parseInt(formMSP.placement_capacity) : null,
        placement_fees: formMSP.placement_fees || null,
        geographic_area: formMSP.geographic_area || null,
        specialty_1: formMSP.specialty_1 || null,
        specialty_2: formMSP.specialty_2 || null,
        specialty_3: formMSP.specialty_3 || null,
        notes: formMSP.notes || null,
      })
      error = res.error
      if (!error) setFormMSP(emptyMSP())
    }

    setProvSaving(false)
    if (!error) {
      setProvSuccess(providerModal ?? '')
      await refreshProviderCounts()
      setProviderModal(null)
      setTimeout(() => setProvSuccess(''), 3000)
    }
  }

  const isProviderSaveDisabled = (): boolean => {
    if (provSaving) return true
    if (providerModal === 'so')  return !formSO.name.trim()
    if (providerModal === 'hc')  return !formHC.name.trim()
    if (providerModal === 'acc') return !formAcc.name.trim()
    if (providerModal === 'ins') return !formIns.name.trim()
    if (providerModal === 'tr')  return !formTr.name.trim()
    if (providerModal === 'lc')  return !formLC.name.trim()
    if (providerModal === 'msp') return !formMSP.name.trim()
    return true
  }

  // ── Close modal helper ─────────────────────────────────────────────────────
  const closeModal = () => {
    setActiveModal(null)
    setProviderModal(null)
    setProvSuccess('')
  }

  // ── Provider total count ──────────────────────────────────────────────────
  const totalProviders = stats.sendingOrgs + stats.hostCompanies + stats.accommodation +
    stats.insurance + stats.transfer + stats.langCourse + stats.mobilityProviders

  // ── Provider sub-modal title ──────────────────────────────────────────────
  const providerModalTitle = (): string => {
    if (providerModal === 'so')  return t('nav_sendingOrgs')
    if (providerModal === 'hc')  return t('nav_hostCompanies')
    if (providerModal === 'acc') return t('nav_accommodation')
    if (providerModal === 'ins') return t('nav_insurance')
    if (providerModal === 'tr')  return t('nav_transfer')
    if (providerModal === 'lc')  return t('nav_languageCourseProviders')
    if (providerModal === 'msp') return t('nav_mobilityProviders')
    return ''
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="home-page home-page-loading">
      <div className="spinner" />
    </div>
  )

  // Card definitions
  const cards = [
    {
      key: 'participant' as ModalType,
      icon: '\u{1F464}',
      color: C_BLUE,
      title: t('card_add_participant'),
      desc: t('card_add_participant_desc'),
      badge: `${stats.total} ${t('home_stats_total').toLowerCase()}`,
    },
    {
      key: 'group' as ModalType,
      icon: '\u{1F465}',
      color: C_PURPLE,
      title: t('card_add_group'),
      desc: t('card_add_group_desc'),
      badge: `${stats.recent} ${t('home_stats_recent').toLowerCase()}`,
    },
    {
      key: 'services' as ModalType,
      icon: '\u{1F517}',
      color: C_GREEN,
      title: t('card_assign_services'),
      desc: t('card_assign_services_desc'),
      badge: `${stats.total} ${t('home_stats_total').toLowerCase()}`,
    },
    {
      key: 'providers' as ModalType,
      icon: '\u{1F3E2}',
      color: C_ORANGE,
      title: t('card_manage_providers'),
      desc: t('card_manage_providers_desc'),
      badge: `${totalProviders} provider`,
    },
  ]

  return (
    <div className="home-page" style={{ overflow: 'auto' }}>

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <div className="hm-hero">
        <div className="hm-hero-content">
          <h1 className="hm-hero-title">Managemob</h1>
          <p className="hm-hero-subtitle">{t('home_subtitle')}</p>
          <div className="hm-hero-stats">
            <div className="hm-hero-stat">
              <span className="hm-hero-stat-value">{stats.total}</span>
              <span className="hm-hero-stat-label">{t('home_stats_total')}</span>
            </div>
            <div className="hm-hero-stat-divider" />
            <div className="hm-hero-stat">
              <span className="hm-hero-stat-value" style={{ color: C_TEAL }}>{stats.incoming}</span>
              <span className="hm-hero-stat-label">{t('home_stats_incoming')}</span>
            </div>
            <div className="hm-hero-stat-divider" />
            <div className="hm-hero-stat">
              <span className="hm-hero-stat-value" style={{ color: C_BLUE }}>{stats.outgoing}</span>
              <span className="hm-hero-stat-label">{t('home_stats_outgoing')}</span>
            </div>
            <div className="hm-hero-stat-divider" />
            <div className="hm-hero-stat">
              <span className="hm-hero-stat-value" style={{ color: C_GREEN }}>{stats.recent}</span>
              <span className="hm-hero-stat-label">{t('home_stats_recent')}</span>
            </div>
          </div>
        </div>
        <div className="hm-hero-actions">
          <button className="hm-hero-btn" onClick={() => navigate('/dashboard')}>
            {t('home_btn_dashboard')}
          </button>
          <button className="hm-hero-btn" onClick={() => navigate('/calendar')}>
            {t('home_btn_calendar')}
          </button>
        </div>
      </div>

      {/* ── Section title ──────────────────────────────────────────────────── */}
      <div className="hm-section-header">
        <h2 className="hm-section-title">{t('home_quick_actions')}</h2>
      </div>

      {/* ── Action cards grid ──────────────────────────────────────────────── */}
      <div className="hm-cards-grid">
        {cards.map(card => (
          <button
            key={card.key}
            className="hm-action-card"
            onClick={() => setActiveModal(card.key)}
            style={{ borderLeft: `4px solid ${card.color}` }}
          >
            <div className="hm-card-icon" style={{ background: `${card.color}14`, color: card.color }}>
              {card.icon}
            </div>
            <div className="hm-card-body">
              <h3 className="hm-card-title">{card.title}</h3>
              <p className="hm-card-desc">{card.desc}</p>
            </div>
            <div className="hm-card-badge" style={{ background: `${card.color}14`, color: card.color }}>
              {card.badge}
            </div>
            <div className="hm-card-arrow" style={{ color: card.color }}>&#8250;</div>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Add Participant                                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeModal === 'participant' && (
        <div className="hm-modal-overlay" onClick={closeModal}>
          <div className="hm-modal" onClick={e => e.stopPropagation()}>
            <div className="hm-modal-header" style={{ borderColor: C_BLUE }}>
              <div className="hm-modal-header-icon" style={{ background: `${C_BLUE}14`, color: C_BLUE }}>
                {'\u{1F464}'}
              </div>
              <h2 className="hm-modal-title">{t('card_add_participant')}</h2>
              <button className="hm-modal-close" onClick={closeModal}>&times;</button>
            </div>

            <div className="hm-modal-body">
              {/* Personal section */}
              <div className="hw-form-section">
                <div className="hw-section-title">{t('sec_personal')}</div>
                <div className="hm-form-grid">
                  <div className="hm-field">
                    <label>{t('fld_name')} *</label>
                    <input className="hw-input" type="text" value={indivForm.name} onChange={e => handleIndivChange('name', e.target.value)} placeholder={t('fld_name')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_surname')} *</label>
                    <input className="hw-input" type="text" value={indivForm.surname} onChange={e => handleIndivChange('surname', e.target.value)} placeholder={t('fld_surname')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_sex')}</label>
                    <select className="hw-select" value={indivForm.sex} onChange={e => handleIndivChange('sex', e.target.value)}>
                      <option value="">\u2014</option>
                      <option value="M">M</option>
                      <option value="F">F</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_dob')}</label>
                    <input className="hw-input" type="date" value={indivForm.date_of_birth} onChange={e => handleIndivChange('date_of_birth', e.target.value)} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_nationality')}</label>
                    <input className="hw-input" type="text" value={indivForm.nationality} onChange={e => handleIndivChange('nationality', e.target.value)} placeholder={t('fld_nationality')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_email')}</label>
                    <input className="hw-input" type="email" value={indivForm.email} onChange={e => handleIndivChange('email', e.target.value)} placeholder={t('fld_email')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_phone')}</label>
                    <input className="hw-input" type="text" value={indivForm.phone} onChange={e => handleIndivChange('phone', e.target.value)} placeholder={t('fld_phone')} />
                  </div>
                </div>
              </div>

              {/* Mobility section */}
              <div className="hw-form-section">
                <div className="hw-section-title">{t('sec_mobility')}</div>
                <div className="hm-form-grid">
                  <div className="hm-field">
                    <label>{t('fld_typology')}</label>
                    <select className="hw-select" value={indivForm.mobility_typology} onChange={e => handleIndivChange('mobility_typology', e.target.value)}>
                      <option value="Incoming">Incoming</option>
                      <option value="Outgoing">Outgoing</option>
                    </select>
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_arrival')}</label>
                    <input className="hw-input" type="date" value={indivForm.arrival_date} onChange={e => handleIndivChange('arrival_date', e.target.value)} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_departure')}</label>
                    <input className="hw-input" type="date" value={indivForm.departure_date} onChange={e => handleIndivChange('departure_date', e.target.value)} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_dest_country')}</label>
                    <input className="hw-input" type="text" value={indivForm.destination_country} onChange={e => handleIndivChange('destination_country', e.target.value)} placeholder={t('fld_dest_country')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_dest_city')}</label>
                    <input className="hw-input" type="text" value={indivForm.destination_city} onChange={e => handleIndivChange('destination_city', e.target.value)} placeholder={t('fld_dest_city')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_program')}</label>
                    <input className="hw-input" type="text" value={indivForm.program} onChange={e => handleIndivChange('program', e.target.value)} placeholder={t('fld_program')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_project')}</label>
                    <input className="hw-input" type="text" value={indivForm.project_name} onChange={e => handleIndivChange('project_name', e.target.value)} placeholder={t('fld_project')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_group_name')}</label>
                    <input className="hw-input" type="text" value={indivForm.group_name} onChange={e => handleIndivChange('group_name', e.target.value)} placeholder={t('fld_group_name')} />
                  </div>
                </div>
              </div>
            </div>

            <div className="hm-modal-footer">
              <button className="hw-btn-secondary" onClick={closeModal}>{t('btn_cancel')}</button>
              <button
                className="hw-btn-primary"
                style={{ background: C_BLUE }}
                onClick={handleSaveIndiv}
                disabled={savingIndiv || !indivForm.name.trim() || !indivForm.surname.trim()}
              >
                {savingIndiv ? '...' : t('btn_save')}
              </button>
              {indivSuccess && <span className="hw-success-msg" style={{ margin: 0 }}>{t('home_created_ok')}</span>}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Add Group                                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeModal === 'group' && (
        <div className="hm-modal-overlay" onClick={closeModal}>
          <div className="hm-modal hm-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="hm-modal-header" style={{ borderColor: C_PURPLE }}>
              <div className="hm-modal-header-icon" style={{ background: `${C_PURPLE}14`, color: C_PURPLE }}>
                {'\u{1F465}'}
              </div>
              <h2 className="hm-modal-title">{t('card_add_group')}</h2>
              <button className="hm-modal-close" onClick={closeModal}>&times;</button>
            </div>

            <div className="hm-modal-body">
              {/* Group common fields */}
              <div className="hw-form-section">
                <div className="hw-section-title">{t('card_group_info')}</div>
                <div className="hm-form-grid">
                  <div className="hm-field">
                    <label>{t('fld_group_name')} *</label>
                    <input className="hw-input" type="text" value={groupFields.group_name} onChange={e => setGroupFields(f => ({ ...f, group_name: e.target.value }))} placeholder={t('fld_group_name')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_typology')}</label>
                    <select className="hw-select" value={groupFields.mobility_typology} onChange={e => setGroupFields(f => ({ ...f, mobility_typology: e.target.value }))}>
                      <option value="Incoming">Incoming</option>
                      <option value="Outgoing">Outgoing</option>
                    </select>
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_dest_country')}</label>
                    <input className="hw-input" type="text" value={groupFields.destination_country} onChange={e => setGroupFields(f => ({ ...f, destination_country: e.target.value }))} placeholder={t('fld_dest_country')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_dest_city')}</label>
                    <input className="hw-input" type="text" value={groupFields.destination_city} onChange={e => setGroupFields(f => ({ ...f, destination_city: e.target.value }))} placeholder={t('fld_dest_city')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_arrival')}</label>
                    <input className="hw-input" type="date" value={groupFields.arrival_date} onChange={e => setGroupFields(f => ({ ...f, arrival_date: e.target.value }))} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_departure')}</label>
                    <input className="hw-input" type="date" value={groupFields.departure_date} onChange={e => setGroupFields(f => ({ ...f, departure_date: e.target.value }))} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_program')}</label>
                    <input className="hw-input" type="text" value={groupFields.program} onChange={e => setGroupFields(f => ({ ...f, program: e.target.value }))} placeholder={t('fld_program')} />
                  </div>
                  <div className="hm-field">
                    <label>{t('fld_project')}</label>
                    <input className="hw-input" type="text" value={groupFields.project_name} onChange={e => setGroupFields(f => ({ ...f, project_name: e.target.value }))} placeholder={t('fld_project')} />
                  </div>
                </div>
              </div>

              {/* Group sub-tabs */}
              <div className="hw-form-section">
                <div className="hw-section-title">{t('card_group_members')}</div>
                <div className="hw-group-tabs">
                  <button className={`hw-group-tab${groupTab === 'paste' ? ' active' : ''}`} onClick={() => setGroupTab('paste')}>
                    {t('home_tab_paste')}
                  </button>
                  <button className={`hw-group-tab${groupTab === 'csv' ? ' active' : ''}`} onClick={() => setGroupTab('csv')}>
                    {t('home_tab_csv')}
                  </button>
                </div>

                {/* Paste tab */}
                {groupTab === 'paste' && (
                  <div>
                    <textarea
                      className="hw-paste-area"
                      rows={6}
                      value={pasteText}
                      onChange={e => setPasteText(e.target.value)}
                      placeholder={t('card_group_paste_placeholder')}
                    />
                    <button
                      className="hw-btn-secondary"
                      style={{ marginTop: 8 }}
                      onClick={handleParseNames}
                      disabled={!pasteText.trim()}
                    >
                      {t('home_parse_btn')}
                    </button>

                    {parsedNames.length > 0 && (
                      <div className="hw-parsed-names">
                        {parsedNames.map((row, idx) => (
                          <div key={idx} className="hw-parsed-item">
                            <input className="hw-input" style={{ flex: 1 }} value={row.name} onChange={e => handleParsedEdit(idx, 'name', e.target.value)} placeholder={t('fld_name')} />
                            <input className="hw-input" style={{ flex: 1 }} value={row.surname} onChange={e => handleParsedEdit(idx, 'surname', e.target.value)} placeholder={t('fld_surname')} />
                            <button className="hw-btn-secondary" style={{ padding: '4px 10px', color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleParsedRemove(idx)}>&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CSV tab */}
                {groupTab === 'csv' && (
                  <div>
                    <div className="hw-csv-drop">
                      <input type="file" accept=".csv" id="csv-upload" style={{ display: 'none' }} onChange={handleCsvFile} />
                      <label htmlFor="csv-upload" style={{ cursor: 'pointer' }}>
                        {csvFileName ? `\u{1F4C4} ${csvFileName}` : t('card_group_csv_select')}
                      </label>
                    </div>

                    {csvHeaders.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div className="hm-form-grid" style={{ marginBottom: 12 }}>
                          {(['name', 'surname', 'email', 'date_of_birth', 'nationality'] as const).map(field => (
                            <div key={field} className="hm-field">
                              <label>{field}</label>
                              <select className="hw-select" value={csvMapping[field]} onChange={e => setCsvMapping(m => ({ ...m, [field]: parseInt(e.target.value) }))}>
                                <option value={-1}>\u2014 skip \u2014</option>
                                {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>

                        <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                          <table className="hw-csv-preview-table">
                            <thead>
                              <tr>{csvHeaders.map((h, i) => <th key={i}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                              {csvRows.map((row, ri) => (
                                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="hm-modal-footer">
              <button className="hw-btn-secondary" onClick={closeModal}>{t('btn_cancel')}</button>
              {groupTab === 'paste' && parsedNames.length > 0 && (
                <button
                  className="hw-btn-primary"
                  style={{ background: C_PURPLE }}
                  onClick={() => handleCreateGroup(parsedNames)}
                  disabled={creatingGroup || !groupFields.group_name.trim()}
                >
                  {creatingGroup ? t('home_creating') : `${t('home_create_all_btn')} (${parsedNames.length})`}
                </button>
              )}
              {groupTab === 'csv' && csvRows.length > 0 && (
                <button
                  className="hw-btn-primary"
                  style={{ background: C_PURPLE }}
                  onClick={handleCreateFromCsv}
                  disabled={creatingGroup || !groupFields.group_name.trim()}
                >
                  {creatingGroup ? t('home_creating') : `${t('home_create_all_btn')} (${csvRows.length})`}
                </button>
              )}
              {groupSuccess > 0 && <span className="hw-success-msg" style={{ margin: 0 }}>{groupSuccess} {t('home_created_ok')}</span>}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Assign Services                                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeModal === 'services' && (
        <div className="hm-modal-overlay" onClick={closeModal}>
          <div className="hm-modal hm-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="hm-modal-header" style={{ borderColor: C_GREEN }}>
              <div className="hm-modal-header-icon" style={{ background: `${C_GREEN}14`, color: C_GREEN }}>
                {'\u{1F517}'}
              </div>
              <h2 className="hm-modal-title">{t('card_assign_services')}</h2>
              <button className="hm-modal-close" onClick={closeModal}>&times;</button>
            </div>

            <div className="hm-modal-body">
              {/* Participant search */}
              <div className="hw-form-section">
                <div className="hw-section-title">{t('home_assign_to')}</div>
                <input
                  className="hw-input"
                  type="text"
                  value={participantSearch}
                  onChange={e => setParticipantSearch(e.target.value)}
                  placeholder={t('list_search')}
                  style={{ marginBottom: 8 }}
                />
                <div className="hm-participant-list">
                  {filteredParticipants.length === 0 && (
                    <div style={{ padding: '12px 16px', color: '#9CA3AF', fontSize: 14 }}>
                      {t('list_empty')}
                    </div>
                  )}
                  {filteredParticipants.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectParticipant(p)}
                      className={`hm-participant-option${selectedParticipant?.id === p.id ? ' selected' : ''}`}
                    >
                      <span className="hm-participant-option-name">{p.name} {p.surname}</span>
                      <span
                        className="hw-typology-badge"
                        style={{
                          background: p.mobility_typology === 'Incoming' ? `${C_TEAL}18` : `${C_BLUE}18`,
                          color:      p.mobility_typology === 'Incoming' ? C_TEAL : C_BLUE,
                        }}
                      >
                        {p.mobility_typology ?? '\u2014'}
                      </span>
                      {p.group_name && <span style={{ fontSize: 11, color: '#9CA3AF' }}>{p.group_name}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Service assignment form */}
              {selectedParticipant && (
                <div className="hw-form-section">
                  <div className="hw-section-title">
                    {t('card_services_for')} {selectedParticipant.name} {selectedParticipant.surname}
                  </div>
                  <div className="hw-service-grid">
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_sending_org')}</div>
                      <select className="hw-service-select" value={serviceForm.sending_organisation_id} onChange={e => handleServiceChange('sending_organisation_id', e.target.value)}>
                        <option value="">\u2014 {t('fld_sending_org')} \u2014</option>
                        {sendingOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </div>
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_host_company')}</div>
                      <select className="hw-service-select" value={serviceForm.host_company_id} onChange={e => handleServiceChange('host_company_id', e.target.value)}>
                        <option value="">\u2014 {t('fld_host_company')} \u2014</option>
                        {hostCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_acc1')}</div>
                      <select className="hw-service-select" value={serviceForm.accommodation_1_id} onChange={e => handleServiceChange('accommodation_1_id', e.target.value)}>
                        <option value="">\u2014 {t('fld_acc1')} \u2014</option>
                        {accommodations.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: '#6B7280' }}>{t('fld_acc1_start')}</label>
                          <input className="hw-input" type="date" value={serviceForm.accommodation_1_start_date} onChange={e => handleServiceChange('accommodation_1_start_date', e.target.value)} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: '#6B7280' }}>{t('fld_acc1_end')}</label>
                          <input className="hw-input" type="date" value={serviceForm.accommodation_1_end_date} onChange={e => handleServiceChange('accommodation_1_end_date', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_insurance_prov')}</div>
                      <select className="hw-service-select" value={serviceForm.insurance_provider_id} onChange={e => handleServiceChange('insurance_provider_id', e.target.value)}>
                        <option value="">\u2014 {t('fld_insurance_prov')} \u2014</option>
                        {insuranceProviders.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_transfer_prov')}</div>
                      <select className="hw-service-select" value={serviceForm.transfer_provider_id} onChange={e => handleServiceChange('transfer_provider_id', e.target.value)}>
                        <option value="">\u2014 {t('fld_transfer_prov')} \u2014</option>
                        {transferProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_lc_provider')}</div>
                      <select className="hw-service-select" value={serviceForm.language_course_provider_id} onChange={e => handleServiceChange('language_course_provider_id', e.target.value)}>
                        <option value="">\u2014 {t('fld_lc_provider')} \u2014</option>
                        {langCourseProviders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_mobility_prov')}</div>
                      <select className="hw-service-select" value={serviceForm.mobility_service_provider_id} onChange={e => handleServiceChange('mobility_service_provider_id', e.target.value)}>
                        <option value="">\u2014 {t('fld_mobility_prov')} \u2014</option>
                        {mobilityProviders.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {selectedParticipant.group_name && (
                    <div className="hw-bulk-row">
                      <input type="checkbox" id="bulk-group" checked={applyToGroup} onChange={e => setApplyToGroup(e.target.checked)} />
                      <label htmlFor="bulk-group">{t('home_bulk_group')} "{selectedParticipant.group_name}"</label>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hm-modal-footer">
              <button className="hw-btn-secondary" onClick={closeModal}>{t('btn_cancel')}</button>
              {selectedParticipant && (
                <button className="hw-btn-primary" style={{ background: C_GREEN }} onClick={handleSaveServices} disabled={savingServices}>
                  {savingServices ? '...' : t('btn_save')}
                </button>
              )}
              {servicesSuccess && <span className="hw-success-msg" style={{ margin: 0 }}>{t('home_services_saved')}</span>}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Manage Providers                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeModal === 'providers' && (
        <div className="hm-modal-overlay" onClick={closeModal}>
          <div className="hm-modal hm-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="hm-modal-header" style={{ borderColor: C_ORANGE }}>
              <div className="hm-modal-header-icon" style={{ background: `${C_ORANGE}14`, color: C_ORANGE }}>
                {'\u{1F3E2}'}
              </div>
              <h2 className="hm-modal-title">{t('card_manage_providers')}</h2>
              <button className="hm-modal-close" onClick={closeModal}>&times;</button>
            </div>

            <div className="hm-modal-body">
              {provSuccess && (
                <div className="hw-success-msg" style={{ marginBottom: 12 }}>
                  {t('card_provider_added')}
                </div>
              )}

              <div className="hw-prov-grid">
                {/* Sending Org */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>{'\u{1F3DB}\uFE0F'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_sendingOrgs')}</div>
                      <div className="hw-prov-count">{stats.sendingOrgs} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => { closeModal(); navigate('/incoming/sending-orgs') }}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => openProviderAdd('so')}>+ Aggiungi</button>
                  </div>
                </div>

                {/* Host Company */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>{'\u{1F3E2}'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_hostCompanies')}</div>
                      <div className="hw-prov-count">{stats.hostCompanies} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => { closeModal(); navigate('/incoming/host-companies') }}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => openProviderAdd('hc')}>+ Aggiungi</button>
                  </div>
                </div>

                {/* Accommodation */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>{'\u{1F3E0}'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_accommodation')}</div>
                      <div className="hw-prov-count">{stats.accommodation} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => { closeModal(); navigate('/incoming/accommodation') }}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => openProviderAdd('acc')}>+ Aggiungi</button>
                  </div>
                </div>

                {/* Insurance */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>{'\u{1F6E1}\uFE0F'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_insurance')}</div>
                      <div className="hw-prov-count">{stats.insurance} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => { closeModal(); navigate('/incoming/insurance') }}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => openProviderAdd('ins')}>+ Aggiungi</button>
                  </div>
                </div>

                {/* Transfer */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>{'\u{1F690}'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_transfer')}</div>
                      <div className="hw-prov-count">{stats.transfer} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => { closeModal(); navigate('/incoming/transfer') }}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => openProviderAdd('tr')}>+ Aggiungi</button>
                  </div>
                </div>

                {/* Language Course */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>{'\u{1F4DA}'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_languageCourseProviders')}</div>
                      <div className="hw-prov-count">{stats.langCourse} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => { closeModal(); navigate('/incoming/language-course-providers') }}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => openProviderAdd('lc')}>+ Aggiungi</button>
                  </div>
                </div>

                {/* Mobility Provider */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>{'\u{1F310}'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_mobilityProviders')}</div>
                      <div className="hw-prov-count">{stats.mobilityProviders} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => { closeModal(); navigate('/incoming/mobility-providers') }}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => openProviderAdd('msp')}>+ Aggiungi</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="hm-modal-footer">
              <button className="hw-btn-secondary" onClick={closeModal}>{t('btn_cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PROVIDER SUB-MODAL (rendered on top of providers modal)               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {providerModal && (
        <div className="hm-modal-overlay" style={{ zIndex: 1100 }} onClick={closeProviderModal}>
          <div className="hm-modal hm-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="hm-modal-header" style={{ borderColor: C_ORANGE }}>
              <div className="hm-modal-header-icon" style={{ background: `${C_ORANGE}14`, color: C_ORANGE }}>
                {'\u{1F3E2}'}
              </div>
              <h2 className="hm-modal-title">{providerModalTitle()}</h2>
              <button className="hm-modal-close" onClick={closeProviderModal}>&times;</button>
            </div>

            <div className="hm-modal-body">

              {/* ── Sending Organisation Form ─────────────────────────────── */}
              {providerModal === 'so' && (
                <div className="hw-form-section">
                  <div className="hw-section-title">{t('sec_so_details')}</div>
                  <div className="hm-form-grid">
                    <div className="hm-field">
                      <label>{t('fld_name')} *</label>
                      <input className="hw-input" type="text" value={formSO.name} onChange={e => setFormSO(f => ({ ...f, name: e.target.value }))} placeholder={t('fld_name')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_contact_person')}</label>
                      <input className="hw-input" type="text" value={formSO.contact_person} onChange={e => setFormSO(f => ({ ...f, contact_person: e.target.value }))} placeholder={t('fld_contact_person')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_email')}</label>
                      <input className="hw-input" type="email" value={formSO.email} onChange={e => setFormSO(f => ({ ...f, email: e.target.value }))} placeholder={t('fld_email')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_phone')}</label>
                      <input className="hw-input" type="text" value={formSO.phone} onChange={e => setFormSO(f => ({ ...f, phone: e.target.value }))} placeholder={t('fld_phone')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_address')}</label>
                      <input className="hw-input" type="text" value={formSO.address} onChange={e => setFormSO(f => ({ ...f, address: e.target.value }))} placeholder={t('fld_address')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_city')}</label>
                      <input className="hw-input" type="text" value={formSO.city} onChange={e => setFormSO(f => ({ ...f, city: e.target.value }))} placeholder={t('fld_city')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_country')}</label>
                      <input className="hw-input" type="text" value={formSO.country} onChange={e => setFormSO(f => ({ ...f, country: e.target.value }))} placeholder={t('fld_country')} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Host Company Form ─────────────────────────────────────── */}
              {providerModal === 'hc' && (
                <>
                  <div className="hw-form-section">
                    <div className="hw-section-title">{t('sec_hc_details')}</div>
                    <div className="hm-form-grid">
                      <div className="hm-field">
                        <label>{t('fld_company_name')} *</label>
                        <input className="hw-input" type="text" value={formHC.name} onChange={e => setFormHC(f => ({ ...f, name: e.target.value }))} placeholder={t('fld_company_name')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_address')}</label>
                        <input className="hw-input" type="text" value={formHC.address} onChange={e => setFormHC(f => ({ ...f, address: e.target.value }))} placeholder={t('fld_address')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_city')}</label>
                        <input className="hw-input" type="text" value={formHC.city} onChange={e => setFormHC(f => ({ ...f, city: e.target.value }))} placeholder={t('fld_city')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_sector')}</label>
                        <input className="hw-input" type="text" value={formHC.sector} onChange={e => setFormHC(f => ({ ...f, sector: e.target.value }))} placeholder={t('fld_sector')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_contact')}</label>
                        <input className="hw-input" type="text" value={formHC.contact_person} onChange={e => setFormHC(f => ({ ...f, contact_person: e.target.value }))} placeholder={t('fld_contact')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_email')}</label>
                        <input className="hw-input" type="email" value={formHC.email} onChange={e => setFormHC(f => ({ ...f, email: e.target.value }))} placeholder={t('fld_email')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_phone')}</label>
                        <input className="hw-input" type="text" value={formHC.phone} onChange={e => setFormHC(f => ({ ...f, phone: e.target.value }))} placeholder={t('fld_phone')} />
                      </div>
                    </div>
                  </div>
                  <div className="hw-form-section">
                    <div className="hw-section-title">{t('sec_hc_tutor')}</div>
                    <div className="hm-form-grid">
                      <div className="hm-field">
                        <label>{t('fld_tutor')}</label>
                        <input className="hw-input" type="text" value={formHC.tutor} onChange={e => setFormHC(f => ({ ...f, tutor: e.target.value }))} placeholder={t('fld_tutor')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_tutor_phone')}</label>
                        <input className="hw-input" type="text" value={formHC.tutor_phone} onChange={e => setFormHC(f => ({ ...f, tutor_phone: e.target.value }))} placeholder={t('fld_tutor_phone')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_tutor_email')}</label>
                        <input className="hw-input" type="email" value={formHC.tutor_email} onChange={e => setFormHC(f => ({ ...f, tutor_email: e.target.value }))} placeholder={t('fld_tutor_email')} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Accommodation Form ────────────────────────────────────── */}
              {providerModal === 'acc' && (
                <>
                  <div className="hw-form-section">
                    <div className="hw-section-title">{t('sec_acc_basic')}</div>
                    <div className="hm-form-grid">
                      <div className="hm-field">
                        <label>{t('fld_acc_name')} *</label>
                        <input className="hw-input" type="text" value={formAcc.name} onChange={e => setFormAcc(f => ({ ...f, name: e.target.value }))} placeholder={t('fld_acc_name')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_typology')}</label>
                        <input className="hw-input" type="text" value={formAcc.typology} onChange={e => setFormAcc(f => ({ ...f, typology: e.target.value }))} placeholder={t('fld_acc_typology')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_contact')}</label>
                        <input className="hw-input" type="text" value={formAcc.contact_person} onChange={e => setFormAcc(f => ({ ...f, contact_person: e.target.value }))} placeholder={t('fld_acc_contact')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_email')}</label>
                        <input className="hw-input" type="email" value={formAcc.email} onChange={e => setFormAcc(f => ({ ...f, email: e.target.value }))} placeholder={t('fld_email')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_phone')}</label>
                        <input className="hw-input" type="text" value={formAcc.phone} onChange={e => setFormAcc(f => ({ ...f, phone: e.target.value }))} placeholder={t('fld_acc_phone')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_mobile')}</label>
                        <input className="hw-input" type="text" value={formAcc.mobile_phone} onChange={e => setFormAcc(f => ({ ...f, mobile_phone: e.target.value }))} placeholder={t('fld_acc_mobile')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_address')}</label>
                        <input className="hw-input" type="text" value={formAcc.address} onChange={e => setFormAcc(f => ({ ...f, address: e.target.value }))} placeholder={t('fld_address')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_postcode')}</label>
                        <input className="hw-input" type="text" value={formAcc.postcode} onChange={e => setFormAcc(f => ({ ...f, postcode: e.target.value }))} placeholder={t('fld_postcode')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_city')}</label>
                        <input className="hw-input" type="text" value={formAcc.city} onChange={e => setFormAcc(f => ({ ...f, city: e.target.value }))} placeholder={t('fld_city')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_country')}</label>
                        <input className="hw-input" type="text" value={formAcc.country} onChange={e => setFormAcc(f => ({ ...f, country: e.target.value }))} placeholder={t('fld_country')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_bedrooms')}</label>
                        <input className="hw-input" type="number" value={formAcc.num_bedrooms} onChange={e => setFormAcc(f => ({ ...f, num_bedrooms: e.target.value }))} placeholder={t('fld_acc_bedrooms')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_size')}</label>
                        <input className="hw-input" type="number" value={formAcc.size_m2} onChange={e => setFormAcc(f => ({ ...f, size_m2: e.target.value }))} placeholder={t('fld_acc_size')} />
                      </div>
                    </div>
                  </div>

                  <div className="hw-form-section">
                    <div className="hw-section-title">{t('sec_acc_features')}</div>
                    <div className="hm-form-grid">
                      <div className="hm-field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={formAcc.has_desk} onChange={e => setFormAcc(f => ({ ...f, has_desk: e.target.checked }))} />
                          {t('fld_acc_desk')}
                        </label>
                      </div>
                      <div className="hm-field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={formAcc.has_internet} onChange={e => setFormAcc(f => ({ ...f, has_internet: e.target.checked }))} />
                          {t('fld_acc_internet')}
                        </label>
                      </div>
                      <div className="hm-field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={formAcc.has_washing_machine} onChange={e => setFormAcc(f => ({ ...f, has_washing_machine: e.target.checked }))} />
                          {t('fld_acc_washing')}
                        </label>
                      </div>
                      <div className="hm-field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={formAcc.has_air_conditioning} onChange={e => setFormAcc(f => ({ ...f, has_air_conditioning: e.target.checked }))} />
                          {t('fld_acc_ac')}
                        </label>
                      </div>
                      <div className="hm-field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={formAcc.has_heating} onChange={e => setFormAcc(f => ({ ...f, has_heating: e.target.checked }))} />
                          {t('fld_acc_heating')}
                        </label>
                      </div>
                      <div className="hm-field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={formAcc.has_pets} onChange={e => setFormAcc(f => ({ ...f, has_pets: e.target.checked }))} />
                          {t('fld_acc_pets')}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="hw-form-section">
                    <div className="hw-section-title">{t('sec_acc_board')}</div>
                    <div className="hm-form-grid">
                      <div className="hm-field">
                        <label>{t('fld_acc_board1')}</label>
                        <input className="hw-input" type="text" value={formAcc.board_option_1} onChange={e => setFormAcc(f => ({ ...f, board_option_1: e.target.value }))} placeholder={t('fld_acc_board1')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_price1')}</label>
                        <input className="hw-input" type="number" value={formAcc.price_week_option_1} onChange={e => setFormAcc(f => ({ ...f, price_week_option_1: e.target.value }))} placeholder={t('fld_acc_price1')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_board2')}</label>
                        <input className="hw-input" type="text" value={formAcc.board_option_2} onChange={e => setFormAcc(f => ({ ...f, board_option_2: e.target.value }))} placeholder={t('fld_acc_board2')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_price2')}</label>
                        <input className="hw-input" type="number" value={formAcc.price_week_option_2} onChange={e => setFormAcc(f => ({ ...f, price_week_option_2: e.target.value }))} placeholder={t('fld_acc_price2')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_board3')}</label>
                        <input className="hw-input" type="text" value={formAcc.board_option_3} onChange={e => setFormAcc(f => ({ ...f, board_option_3: e.target.value }))} placeholder={t('fld_acc_board3')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_acc_price3')}</label>
                        <input className="hw-input" type="number" value={formAcc.price_week_option_3} onChange={e => setFormAcc(f => ({ ...f, price_week_option_3: e.target.value }))} placeholder={t('fld_acc_price3')} />
                      </div>
                    </div>
                  </div>

                  <div className="hw-form-section">
                    <div className="hw-section-title">{t('sec_acc_rules')}</div>
                    <div className="hm-form-grid">
                      <div className="hm-field" style={{ gridColumn: '1 / -1' }}>
                        <label>{t('fld_acc_rules')}</label>
                        <textarea className="hw-input" rows={3} value={formAcc.family_rules} onChange={e => setFormAcc(f => ({ ...f, family_rules: e.target.value }))} placeholder={t('fld_acc_rules')} />
                      </div>
                      <div className="hm-field" style={{ gridColumn: '1 / -1' }}>
                        <label>{t('sec_notes')}</label>
                        <textarea className="hw-input" rows={3} value={formAcc.comments} onChange={e => setFormAcc(f => ({ ...f, comments: e.target.value }))} placeholder={t('sec_notes')} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Insurance Provider Form ───────────────────────────────── */}
              {providerModal === 'ins' && (
                <div className="hw-form-section">
                  <div className="hw-section-title">{t('sec_ins_details')}</div>
                  <div className="hm-form-grid">
                    <div className="hm-field">
                      <label>{t('fld_name')} *</label>
                      <input className="hw-input" type="text" value={formIns.name} onChange={e => setFormIns(f => ({ ...f, name: e.target.value }))} placeholder={t('fld_name')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_contact_person')}</label>
                      <input className="hw-input" type="text" value={formIns.contact_person} onChange={e => setFormIns(f => ({ ...f, contact_person: e.target.value }))} placeholder={t('fld_contact_person')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_phone')}</label>
                      <input className="hw-input" type="text" value={formIns.phone} onChange={e => setFormIns(f => ({ ...f, phone: e.target.value }))} placeholder={t('fld_phone')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_email')}</label>
                      <input className="hw-input" type="email" value={formIns.email} onChange={e => setFormIns(f => ({ ...f, email: e.target.value }))} placeholder={t('fld_email')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_address')}</label>
                      <input className="hw-input" type="text" value={formIns.address} onChange={e => setFormIns(f => ({ ...f, address: e.target.value }))} placeholder={t('fld_address')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_city')}</label>
                      <input className="hw-input" type="text" value={formIns.city} onChange={e => setFormIns(f => ({ ...f, city: e.target.value }))} placeholder={t('fld_city')} />
                    </div>
                    <div className="hm-field">
                      <label>Status</label>
                      <input className="hw-input" type="text" value={formIns.status} onChange={e => setFormIns(f => ({ ...f, status: e.target.value }))} placeholder="Status" />
                    </div>
                    <div className="hm-field" style={{ gridColumn: '1 / -1' }}>
                      <label>{t('sec_notes')}</label>
                      <textarea className="hw-input" rows={3} value={formIns.notes} onChange={e => setFormIns(f => ({ ...f, notes: e.target.value }))} placeholder={t('sec_notes')} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Transfer Provider Form ────────────────────────────────── */}
              {providerModal === 'tr' && (
                <div className="hw-form-section">
                  <div className="hw-section-title">{t('nav_transfer')}</div>
                  <div className="hm-form-grid">
                    <div className="hm-field">
                      <label>{t('fld_name')} *</label>
                      <input className="hw-input" type="text" value={formTr.name} onChange={e => setFormTr(f => ({ ...f, name: e.target.value }))} placeholder={t('fld_name')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_contact_person')}</label>
                      <input className="hw-input" type="text" value={formTr.contact_person} onChange={e => setFormTr(f => ({ ...f, contact_person: e.target.value }))} placeholder={t('fld_contact_person')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_phone')}</label>
                      <input className="hw-input" type="text" value={formTr.phone} onChange={e => setFormTr(f => ({ ...f, phone: e.target.value }))} placeholder={t('fld_phone')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_email')}</label>
                      <input className="hw-input" type="email" value={formTr.email} onChange={e => setFormTr(f => ({ ...f, email: e.target.value }))} placeholder={t('fld_email')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_tr_price')}</label>
                      <input className="hw-input" type="number" value={formTr.normal_price} onChange={e => setFormTr(f => ({ ...f, normal_price: e.target.value }))} placeholder={t('fld_tr_price')} />
                    </div>
                    <div className="hm-field" style={{ gridColumn: '1 / -1' }}>
                      <label>{t('fld_tr_notes')}</label>
                      <textarea className="hw-input" rows={3} value={formTr.notes} onChange={e => setFormTr(f => ({ ...f, notes: e.target.value }))} placeholder={t('fld_tr_notes')} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Language Course Provider Form ─────────────────────────── */}
              {providerModal === 'lc' && (
                <div className="hw-form-section">
                  <div className="hw-section-title">{t('nav_languageCourseProviders')}</div>
                  <div className="hm-form-grid">
                    <div className="hm-field">
                      <label>{t('fld_name')} *</label>
                      <input className="hw-input" type="text" value={formLC.name} onChange={e => setFormLC(f => ({ ...f, name: e.target.value }))} placeholder={t('fld_name')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_address')}</label>
                      <input className="hw-input" type="text" value={formLC.address} onChange={e => setFormLC(f => ({ ...f, address: e.target.value }))} placeholder={t('fld_address')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_city')}</label>
                      <input className="hw-input" type="text" value={formLC.city} onChange={e => setFormLC(f => ({ ...f, city: e.target.value }))} placeholder={t('fld_city')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_country')}</label>
                      <input className="hw-input" type="text" value={formLC.country} onChange={e => setFormLC(f => ({ ...f, country: e.target.value }))} placeholder={t('fld_country')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_contact_person')}</label>
                      <input className="hw-input" type="text" value={formLC.contact_person} onChange={e => setFormLC(f => ({ ...f, contact_person: e.target.value }))} placeholder={t('fld_contact_person')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_email')}</label>
                      <input className="hw-input" type="email" value={formLC.email} onChange={e => setFormLC(f => ({ ...f, email: e.target.value }))} placeholder={t('fld_email')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_phone')}</label>
                      <input className="hw-input" type="text" value={formLC.phone} onChange={e => setFormLC(f => ({ ...f, phone: e.target.value }))} placeholder={t('fld_phone')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_website')}</label>
                      <input className="hw-input" type="text" value={formLC.website} onChange={e => setFormLC(f => ({ ...f, website: e.target.value }))} placeholder={t('fld_website')} />
                    </div>
                    <div className="hm-field">
                      <label>{t('fld_language_taught')}</label>
                      <input className="hw-input" type="text" value={formLC.language_taught} onChange={e => setFormLC(f => ({ ...f, language_taught: e.target.value }))} placeholder={t('fld_language_taught')} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Mobility Service Provider Form ────────────────────────── */}
              {providerModal === 'msp' && (
                <>
                  <div className="hw-form-section">
                    <div className="hw-section-title">{t('sec_msp_org')}</div>
                    <div className="hm-form-grid">
                      <div className="hm-field">
                        <label>{t('fld_name')} *</label>
                        <input className="hw-input" type="text" value={formMSP.name} onChange={e => setFormMSP(f => ({ ...f, name: e.target.value }))} placeholder={t('fld_name')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_pic')}</label>
                        <input className="hw-input" type="text" value={formMSP.pic_number} onChange={e => setFormMSP(f => ({ ...f, pic_number: e.target.value }))} placeholder={t('fld_pic')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_address')}</label>
                        <input className="hw-input" type="text" value={formMSP.address} onChange={e => setFormMSP(f => ({ ...f, address: e.target.value }))} placeholder={t('fld_address')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_postcode')}</label>
                        <input className="hw-input" type="text" value={formMSP.postcode} onChange={e => setFormMSP(f => ({ ...f, postcode: e.target.value }))} placeholder={t('fld_postcode')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_city')}</label>
                        <input className="hw-input" type="text" value={formMSP.city} onChange={e => setFormMSP(f => ({ ...f, city: e.target.value }))} placeholder={t('fld_city')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_country')}</label>
                        <input className="hw-input" type="text" value={formMSP.country} onChange={e => setFormMSP(f => ({ ...f, country: e.target.value }))} placeholder={t('fld_country')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_website')}</label>
                        <input className="hw-input" type="text" value={formMSP.website} onChange={e => setFormMSP(f => ({ ...f, website: e.target.value }))} placeholder={t('fld_website')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_email')}</label>
                        <input className="hw-input" type="email" value={formMSP.email} onChange={e => setFormMSP(f => ({ ...f, email: e.target.value }))} placeholder={t('fld_email')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_phone')}</label>
                        <input className="hw-input" type="text" value={formMSP.phone} onChange={e => setFormMSP(f => ({ ...f, phone: e.target.value }))} placeholder={t('fld_phone')} />
                      </div>
                    </div>
                  </div>

                  <div className="hw-form-section">
                    <div className="hw-section-title">{t('sec_msp_contact')}</div>
                    <div className="hm-form-grid">
                      <div className="hm-field">
                        <label>{t('fld_contact_person')}</label>
                        <input className="hw-input" type="text" value={formMSP.contact_person} onChange={e => setFormMSP(f => ({ ...f, contact_person: e.target.value }))} placeholder={t('fld_contact_person')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_contact_email')}</label>
                        <input className="hw-input" type="email" value={formMSP.contact_email} onChange={e => setFormMSP(f => ({ ...f, contact_email: e.target.value }))} placeholder={t('fld_contact_email')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_contact_phone')}</label>
                        <input className="hw-input" type="text" value={formMSP.contact_phone} onChange={e => setFormMSP(f => ({ ...f, contact_phone: e.target.value }))} placeholder={t('fld_contact_phone')} />
                      </div>
                      <div className="hm-field" style={{ gridColumn: '1 / -1' }}>
                        <label>{t('fld_contact_notes')}</label>
                        <textarea className="hw-input" rows={3} value={formMSP.contact_comments} onChange={e => setFormMSP(f => ({ ...f, contact_comments: e.target.value }))} placeholder={t('fld_contact_notes')} />
                      </div>
                    </div>
                  </div>

                  <div className="hw-form-section">
                    <div className="hw-section-title">{t('sec_msp_capacity')}</div>
                    <div className="hm-form-grid">
                      <div className="hm-field">
                        <label>{t('fld_num_offices')}</label>
                        <input className="hw-input" type="number" value={formMSP.num_offices} onChange={e => setFormMSP(f => ({ ...f, num_offices: e.target.value }))} placeholder={t('fld_num_offices')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_num_employees')}</label>
                        <input className="hw-input" type="number" value={formMSP.num_employees} onChange={e => setFormMSP(f => ({ ...f, num_employees: e.target.value }))} placeholder={t('fld_num_employees')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_placement_capacity')}</label>
                        <input className="hw-input" type="number" value={formMSP.placement_capacity} onChange={e => setFormMSP(f => ({ ...f, placement_capacity: e.target.value }))} placeholder={t('fld_placement_capacity')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_placement_fees')}</label>
                        <input className="hw-input" type="text" value={formMSP.placement_fees} onChange={e => setFormMSP(f => ({ ...f, placement_fees: e.target.value }))} placeholder={t('fld_placement_fees')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_geographic_area')}</label>
                        <input className="hw-input" type="text" value={formMSP.geographic_area} onChange={e => setFormMSP(f => ({ ...f, geographic_area: e.target.value }))} placeholder={t('fld_geographic_area')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_specialty_1')}</label>
                        <input className="hw-input" type="text" value={formMSP.specialty_1} onChange={e => setFormMSP(f => ({ ...f, specialty_1: e.target.value }))} placeholder={t('fld_specialty_1')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_specialty_2')}</label>
                        <input className="hw-input" type="text" value={formMSP.specialty_2} onChange={e => setFormMSP(f => ({ ...f, specialty_2: e.target.value }))} placeholder={t('fld_specialty_2')} />
                      </div>
                      <div className="hm-field">
                        <label>{t('fld_specialty_3')}</label>
                        <input className="hw-input" type="text" value={formMSP.specialty_3} onChange={e => setFormMSP(f => ({ ...f, specialty_3: e.target.value }))} placeholder={t('fld_specialty_3')} />
                      </div>
                      <div className="hm-field" style={{ gridColumn: '1 / -1' }}>
                        <label>{t('sec_notes')}</label>
                        <textarea className="hw-input" rows={3} value={formMSP.notes} onChange={e => setFormMSP(f => ({ ...f, notes: e.target.value }))} placeholder={t('sec_notes')} />
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>

            <div className="hm-modal-footer">
              <button className="hw-btn-secondary" onClick={closeProviderModal}>{t('btn_cancel')}</button>
              <button
                className="hw-btn-primary"
                style={{ background: C_ORANGE }}
                onClick={handleProviderSave}
                disabled={isProviderSaveDisabled()}
              >
                {provSaving ? t('btn_saving') : t('btn_save')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
