import { useState, useEffect, useRef } from 'react'
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
type Dir = 'fwd' | 'bwd'
type Mode = 'individual' | 'group'
type GroupTab = 'paste' | 'csv'

const C_BLUE   = '#1D72B8'
const C_PURPLE = '#8B5CF6'
const C_GREEN  = '#10B981'
const C_TEAL   = '#2D7A6F'

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

// ─── Step-0 Individual form state ────────────────────────────────────────────
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

// ─── Quick-add forms ──────────────────────────────────────────────────────────
interface QuickSO  { name: string; contact_person: string; email: string; phone: string; city: string; country: string }
interface QuickHC  { name: string; sector: string; city: string; contact_person: string; email: string }
interface QuickAcc { name: string; typology: string; city: string; contact_person: string; email: string; phone: string }
interface QuickIns { name: string; contact_person: string; email: string; phone: string; city: string }
interface QuickTr  { name: string; contact_person: string; email: string; phone: string; normal_price: string }
interface QuickLC  { name: string; city: string; country: string; contact_person: string; email: string; language_taught: string }
interface QuickMSP { name: string; city: string; country: string; contact_person: string; email: string; website: string }

const emptySO  = (): QuickSO  => ({ name: '', contact_person: '', email: '', phone: '', city: '', country: '' })
const emptyHC  = (): QuickHC  => ({ name: '', sector: '', city: '', contact_person: '', email: '' })
const emptyAcc = (): QuickAcc => ({ name: '', typology: '', city: '', contact_person: '', email: '', phone: '' })
const emptyIns = (): QuickIns => ({ name: '', contact_person: '', email: '', phone: '', city: '' })
const emptyTr  = (): QuickTr  => ({ name: '', contact_person: '', email: '', phone: '', normal_price: '' })
const emptyLC  = (): QuickLC  => ({ name: '', city: '', country: '', contact_person: '', email: '', language_taught: '' })
const emptyMSP = (): QuickMSP => ({ name: '', city: '', country: '', contact_person: '', email: '', website: '' })

// ─── Main component ───────────────────────────────────────────────────────────
export default function GuidedHomePage() {
  const { t } = useT()
  const navigate = useNavigate()

  // ── UI state ────────────────────────────────────────────────────────────────
  const [mode, setMode]               = useState<Mode>('individual')
  const [currentStep, setCurrentStep] = useState(0)
  const [dir, setDir]                 = useState<Dir>('fwd')
  const [animKey, setAnimKey]         = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

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

  // ── Step-0 Individual ───────────────────────────────────────────────────────
  const [indivForm, setIndivForm]       = useState<IndivForm>(emptyIndivForm())
  const [savingIndiv, setSavingIndiv]   = useState(false)
  const [indivSuccess, setIndivSuccess] = useState(false)
  const [recentParticipants, setRecentParticipants] = useState<Participant[]>([])

  // ── Step-0 Group ────────────────────────────────────────────────────────────
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

  // ── Step-1 Services ─────────────────────────────────────────────────────────
  const [participantSearch, setParticipantSearch] = useState('')
  const [allParticipants,   setAllParticipants]   = useState<Participant[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [serviceForm, setServiceForm]   = useState<ServiceForm>(emptyServiceForm())
  const [savingServices, setSavingServices] = useState(false)
  const [servicesSuccess, setServicesSuccess] = useState(false)
  const [applyToGroup, setApplyToGroup] = useState(false)

  // ── Step-2 Providers ────────────────────────────────────────────────────────
  const [openQuickAdd, setOpenQuickAdd] = useState<string | null>(null)
  const [quickSO,  setQuickSO]  = useState<QuickSO>(emptySO())
  const [quickHC,  setQuickHC]  = useState<QuickHC>(emptyHC())
  const [quickAcc, setQuickAcc] = useState<QuickAcc>(emptyAcc())
  const [quickIns, setQuickIns] = useState<QuickIns>(emptyIns())
  const [quickTr,  setQuickTr]  = useState<QuickTr>(emptyTr())
  const [quickLC,  setQuickLC]  = useState<QuickLC>(emptyLC())
  const [quickMSP, setQuickMSP] = useState<QuickMSP>(emptyMSP())
  const [quickSaving, setQuickSaving] = useState(false)
  const [quickSuccess, setQuickSuccess] = useState('')

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
      recentParts, allParts,
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
      supabase.from('participants').select('*').order('created_at', { ascending: false }).limit(5),
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
    setRecentParticipants((recentParts.data as Participant[])      ?? [])
    setAllParticipants(   (allParts.data    as Participant[])      ?? [])

    setLoading(false)
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  const STEPS = 3
  const goTo = (i: number) => {
    if (i < 0 || i >= STEPS) return
    setDir(i > currentStep ? 'fwd' : 'bwd')
    setCurrentStep(i)
    setAnimKey(k => k + 1)
    cardRef.current?.scrollTo(0, 0)
  }
  const switchMode = (m: Mode) => {
    setMode(m)
    setCurrentStep(0)
    setAnimKey(k => k + 1)
  }

  // ── Step completion ─────────────────────────────────────────────────────────
  const step0Done = recentParticipants.length > 0 || stats.total > 0
  const step1Done = selectedParticipant != null && (
    !!(selectedParticipant as Participant & Record<string, unknown>).sending_organisation_id ||
    !!(selectedParticipant as Participant & Record<string, unknown>).host_company_id ||
    !!(selectedParticipant as Participant & Record<string, unknown>).accommodation_1_id
  )
  const providerCount = [
    stats.sendingOrgs, stats.hostCompanies, stats.accommodation,
    stats.insurance, stats.transfer, stats.langCourse, stats.mobilityProviders,
  ].filter(c => c > 0).length
  const step2Done = providerCount >= 3
  const stepDone = [step0Done, step1Done, step2Done]
  const completedSteps = stepDone.filter(Boolean).length

  const stepColors = [
    mode === 'individual' ? C_BLUE : C_PURPLE,
    C_GREEN,
    C_TEAL,
  ]
  const stepIcons = [
    mode === 'individual' ? '👤' : '👥',
    '🔗',
    '🏢',
  ]
  const stepTitles = [
    mode === 'individual' ? t('home_s1_form_title') : t('home_s1_grp_title'),
    t('home_s2_title'),
    t('home_s3_title'),
  ]

  const activeColor = stepColors[currentStep]

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 0 handlers
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
    const { data } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setRecentParticipants(data as Participant[])
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
      // auto-detect mapping
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
  // STEP 1 handlers
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
  // STEP 2 handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const toggleQuickAdd = (key: string) => {
    setOpenQuickAdd(v => v === key ? null : key)
    setQuickSuccess('')
  }

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
  }

  const handleQuickSave = async (providerKey: string) => {
    setQuickSaving(true)
    let error = null
    if (providerKey === 'so') {
      const res = await supabase.from('sending_organisations').insert({ ...quickSO })
      error = res.error
      if (!error) { setQuickSO(emptySO()); const { data } = await supabase.from('sending_organisations').select('*').order('name'); if (data) setSendingOrgs(data as SendingOrganisation[]) }
    } else if (providerKey === 'hc') {
      const res = await supabase.from('host_companies').insert({ ...quickHC })
      error = res.error
      if (!error) { setQuickHC(emptyHC()); const { data } = await supabase.from('host_companies').select('*').order('name'); if (data) setHostCompanies(data as HostCompany[]) }
    } else if (providerKey === 'acc') {
      const res = await supabase.from('accommodation').insert({ ...quickAcc })
      error = res.error
      if (!error) { setQuickAcc(emptyAcc()); const { data } = await supabase.from('accommodation').select('*').order('name'); if (data) setAccommodations(data as Accommodation[]) }
    } else if (providerKey === 'ins') {
      const res = await supabase.from('insurance_providers').insert({ ...quickIns })
      error = res.error
      if (!error) { setQuickIns(emptyIns()); const { data } = await supabase.from('insurance_providers').select('*').order('name'); if (data) setInsuranceProviders(data as InsuranceProvider[]) }
    } else if (providerKey === 'tr') {
      const res = await supabase.from('transfer_providers').insert({ normal_price: quickTr.normal_price ? parseFloat(quickTr.normal_price) : null, name: quickTr.name, contact_person: quickTr.contact_person, email: quickTr.email, phone: quickTr.phone })
      error = res.error
      if (!error) { setQuickTr(emptyTr()); const { data } = await supabase.from('transfer_providers').select('*').order('name'); if (data) setTransferProviders(data as TransferProvider[]) }
    } else if (providerKey === 'lc') {
      const res = await supabase.from('language_course_providers').insert({ ...quickLC })
      error = res.error
      if (!error) { setQuickLC(emptyLC()); const { data } = await supabase.from('language_course_providers').select('*').order('name'); if (data) setLangCourseProviders(data as LanguageCourseProvider[]) }
    } else if (providerKey === 'msp') {
      const res = await supabase.from('mobility_service_providers').insert({ ...quickMSP })
      error = res.error
      if (!error) { setQuickMSP(emptyMSP()); const { data } = await supabase.from('mobility_service_providers').select('*').order('name'); if (data) setMobilityProviders(data as MobilityServiceProvider[]) }
    }
    setQuickSaving(false)
    if (!error) {
      setQuickSuccess(providerKey)
      setOpenQuickAdd(null)
      await refreshProviderCounts()
      setTimeout(() => setQuickSuccess(''), 3000)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="home-page home-page-loading">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="home-page">

      {/* ── Top strip ──────────────────────────────────────────────────────── */}
      <div className="home-top">
        <div className="home-top-left">
          <h1 className="home-title">Home</h1>
          <p className="home-subtitle-text">{t('home_subtitle')}</p>
        </div>
        <div className="home-top-right">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/calendar')}>
            📅 {t('home_btn_calendar')}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')} style={{ marginLeft: 8 }}>
            📊 {t('home_btn_dashboard')}
          </button>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div className="hw-stats-bar">
        <div className="hw-stat-card">
          <span className="hw-stat-label">{t('home_stats_total')}</span>
          <span className="hw-stat-value">{stats.total}</span>
        </div>
        <div className="hw-stat-card" style={{ borderColor: `${C_TEAL}40` }}>
          <span className="hw-stat-label">{t('home_stats_incoming')}</span>
          <span className="hw-stat-value" style={{ color: C_TEAL }}>{stats.incoming}</span>
        </div>
        <div className="hw-stat-card" style={{ borderColor: `${C_BLUE}40` }}>
          <span className="hw-stat-label">{t('home_stats_outgoing')}</span>
          <span className="hw-stat-value" style={{ color: C_BLUE }}>{stats.outgoing}</span>
        </div>
        <div className="hw-stat-card" style={{ borderColor: `${C_GREEN}40` }}>
          <span className="hw-stat-label">{t('home_stats_recent')}</span>
          <span className="hw-stat-value" style={{ color: C_GREEN }}>{stats.recent}</span>
        </div>
      </div>

      {/* ── Mode + stepper strip ───────────────────────────────────────────── */}
      <div className="home-strip">
        {/* Mode tabs */}
        <div className="home-mode-tabs">
          <button
            className={`home-mode-tab${mode === 'individual' ? ' active' : ''}`}
            onClick={() => switchMode('individual')}
          >
            👤 {t('home_mode_individual')}
          </button>
          <button
            className={`home-mode-tab${mode === 'group' ? ' active' : ''}`}
            onClick={() => switchMode('group')}
          >
            👥 {t('home_mode_group')}
          </button>
        </div>

        {/* Stepper */}
        <div className="home-stepper">
          {stepTitles.map((title, i) => {
            const done   = stepDone[i]
            const active = i === currentStep
            const color  = stepColors[i]
            return (
              <div key={i} className="home-stepper-item">
                <button className="home-stepper-btn" onClick={() => goTo(i)} title={title}>
                  <div
                    className="home-stepper-circle"
                    style={{
                      background: done ? color : active ? color : '#E5E7EB',
                      color: (done || active) ? 'white' : '#9CA3AF',
                      boxShadow: active ? `0 0 0 3px ${color}35` : 'none',
                      transform: active ? 'scale(1.12)' : 'scale(1)',
                    }}
                  >
                    {done ? '✓' : stepIcons[i]}
                  </div>
                  <span className="home-stepper-label" style={{ color: (active || done) ? color : '#9CA3AF' }}>
                    {title}
                  </span>
                </button>
                {i < STEPS - 1 && (
                  <div
                    className="home-stepper-line"
                    style={{ background: done ? color : '#E5E7EB' }}
                  />
                )}
              </div>
            )
          })}
          <span className="home-stepper-count" style={{ color: activeColor }}>
            {completedSteps}/{STEPS}
          </span>
        </div>

        {/* Progress bar */}
        <div className="home-progress-bar">
          <div
            className="home-progress-fill"
            style={{
              width: `${Math.round((completedSteps / STEPS) * 100)}%`,
              background: activeColor,
            }}
          />
        </div>
      </div>

      {/* ── Step card ──────────────────────────────────────────────────────── */}
      <div className="home-step-area">
        <div
          key={animKey}
          ref={cardRef}
          className={`home-step-card home-step-card--${dir}`}
          style={{
            borderColor: `${activeColor}22`,
            boxShadow:   `0 4px 32px ${activeColor}10`,
          }}
        >

          {/* Card header */}
          <div className="home-card-header">
            <div className="home-card-icon" style={{ background: `${activeColor}18` }}>
              {stepIcons[currentStep]}
            </div>
            <div className="home-card-heading">
              <div className="home-card-step-label" style={{ color: activeColor }}>
                Step {currentStep + 1} / {STEPS}
                {stepDone[currentStep] && (
                  <span className="home-done-badge">✓ {t('home_done')}</span>
                )}
              </div>
              <h2 className="home-card-title">{stepTitles[currentStep]}</h2>
            </div>
          </div>

          <p className="home-card-desc">
            {currentStep === 0
              ? (mode === 'individual' ? t('home_s1_form_desc') : t('home_s1_grp_desc'))
              : currentStep === 1 ? t('home_s2_desc')
              : t('home_s3_desc')}
          </p>

          <div className="home-card-divider" />

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STEP 0: Create Individual / Group                               */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStep === 0 && mode === 'individual' && (
            <div className="hw-form-grid">
              {/* Personal section */}
              <div className="hw-form-section">
                <div className="hw-section-title">Personal</div>
                <div className="hw-form-row">
                  <div>
                    <label>{t('fld_name')} *</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={indivForm.name}
                      onChange={e => handleIndivChange('name', e.target.value)}
                      placeholder={t('fld_name')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_surname')} *</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={indivForm.surname}
                      onChange={e => handleIndivChange('surname', e.target.value)}
                      placeholder={t('fld_surname')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_sex')}</label>
                    <select
                      className="hw-select"
                      value={indivForm.sex}
                      onChange={e => handleIndivChange('sex', e.target.value)}
                    >
                      <option value="">—</option>
                      <option value="M">M</option>
                      <option value="F">F</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label>{t('fld_dob')}</label>
                    <input
                      className="hw-input"
                      type="date"
                      value={indivForm.date_of_birth}
                      onChange={e => handleIndivChange('date_of_birth', e.target.value)}
                    />
                  </div>
                  <div>
                    <label>{t('fld_nationality')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={indivForm.nationality}
                      onChange={e => handleIndivChange('nationality', e.target.value)}
                      placeholder={t('fld_nationality')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_email')}</label>
                    <input
                      className="hw-input"
                      type="email"
                      value={indivForm.email}
                      onChange={e => handleIndivChange('email', e.target.value)}
                      placeholder={t('fld_email')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_phone')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={indivForm.phone}
                      onChange={e => handleIndivChange('phone', e.target.value)}
                      placeholder={t('fld_phone')}
                    />
                  </div>
                </div>
              </div>

              {/* Mobility section */}
              <div className="hw-form-section">
                <div className="hw-section-title">Mobility</div>
                <div className="hw-form-row">
                  <div>
                    <label>{t('fld_typology')}</label>
                    <select
                      className="hw-select"
                      value={indivForm.mobility_typology}
                      onChange={e => handleIndivChange('mobility_typology', e.target.value)}
                    >
                      <option value="Incoming">Incoming</option>
                      <option value="Outgoing">Outgoing</option>
                    </select>
                  </div>
                  <div>
                    <label>{t('fld_arrival')}</label>
                    <input
                      className="hw-input"
                      type="date"
                      value={indivForm.arrival_date}
                      onChange={e => handleIndivChange('arrival_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label>{t('fld_departure')}</label>
                    <input
                      className="hw-input"
                      type="date"
                      value={indivForm.departure_date}
                      onChange={e => handleIndivChange('departure_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label>{t('fld_dest_country')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={indivForm.destination_country}
                      onChange={e => handleIndivChange('destination_country', e.target.value)}
                      placeholder={t('fld_dest_country')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_dest_city')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={indivForm.destination_city}
                      onChange={e => handleIndivChange('destination_city', e.target.value)}
                      placeholder={t('fld_dest_city')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_program')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={indivForm.program}
                      onChange={e => handleIndivChange('program', e.target.value)}
                      placeholder={t('fld_program')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_project')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={indivForm.project_name}
                      onChange={e => handleIndivChange('project_name', e.target.value)}
                      placeholder={t('fld_project')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_group_name')} <small style={{ color: '#9CA3AF' }}>(opt.)</small></label>
                    <input
                      className="hw-input"
                      type="text"
                      value={indivForm.group_name}
                      onChange={e => handleIndivChange('group_name', e.target.value)}
                      placeholder={t('fld_group_name')}
                    />
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <button
                  className="hw-btn-primary"
                  style={{ background: activeColor }}
                  onClick={handleSaveIndiv}
                  disabled={savingIndiv || !indivForm.name.trim() || !indivForm.surname.trim()}
                >
                  {savingIndiv ? '...' : t('btn_save')}
                </button>
                {indivSuccess && (
                  <span className="hw-success-msg">✓ Salvato!</span>
                )}
              </div>
            </div>
          )}

          {/* Step 0 Group */}
          {currentStep === 0 && mode === 'group' && (
            <div>
              {/* Group common fields */}
              <div className="hw-form-section">
                <div className="hw-section-title">{t('home_s1_grp_title')}</div>
                <div className="hw-form-row">
                  <div>
                    <label>{t('fld_group_name')} *</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={groupFields.group_name}
                      onChange={e => setGroupFields(f => ({ ...f, group_name: e.target.value }))}
                      placeholder={t('fld_group_name')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_typology')}</label>
                    <select
                      className="hw-select"
                      value={groupFields.mobility_typology}
                      onChange={e => setGroupFields(f => ({ ...f, mobility_typology: e.target.value }))}
                    >
                      <option value="Incoming">Incoming</option>
                      <option value="Outgoing">Outgoing</option>
                    </select>
                  </div>
                  <div>
                    <label>{t('fld_dest_country')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={groupFields.destination_country}
                      onChange={e => setGroupFields(f => ({ ...f, destination_country: e.target.value }))}
                      placeholder={t('fld_dest_country')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_dest_city')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={groupFields.destination_city}
                      onChange={e => setGroupFields(f => ({ ...f, destination_city: e.target.value }))}
                      placeholder={t('fld_dest_city')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_arrival')}</label>
                    <input
                      className="hw-input"
                      type="date"
                      value={groupFields.arrival_date}
                      onChange={e => setGroupFields(f => ({ ...f, arrival_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label>{t('fld_departure')}</label>
                    <input
                      className="hw-input"
                      type="date"
                      value={groupFields.departure_date}
                      onChange={e => setGroupFields(f => ({ ...f, departure_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label>{t('fld_program')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={groupFields.program}
                      onChange={e => setGroupFields(f => ({ ...f, program: e.target.value }))}
                      placeholder={t('fld_program')}
                    />
                  </div>
                  <div>
                    <label>{t('fld_project')}</label>
                    <input
                      className="hw-input"
                      type="text"
                      value={groupFields.project_name}
                      onChange={e => setGroupFields(f => ({ ...f, project_name: e.target.value }))}
                      placeholder={t('fld_project')}
                    />
                  </div>
                </div>
              </div>

              {/* Group sub-tabs */}
              <div className="hw-group-tabs">
                <button
                  className={`hw-group-tab${groupTab === 'paste' ? ' active' : ''}`}
                  onClick={() => setGroupTab('paste')}
                >
                  {t('home_tab_paste')}
                </button>
                <button
                  className={`hw-group-tab${groupTab === 'csv' ? ' active' : ''}`}
                  onClick={() => setGroupTab('csv')}
                >
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
                    placeholder={'Incolla un nome per riga\nEs:\nMario Rossi\nGiulia Bianchi'}
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
                          <input
                            className="hw-input"
                            style={{ flex: 1 }}
                            value={row.name}
                            onChange={e => handleParsedEdit(idx, 'name', e.target.value)}
                            placeholder={t('fld_name')}
                          />
                          <input
                            className="hw-input"
                            style={{ flex: 1 }}
                            value={row.surname}
                            onChange={e => handleParsedEdit(idx, 'surname', e.target.value)}
                            placeholder={t('fld_surname')}
                          />
                          <button
                            className="hw-btn-secondary"
                            style={{ padding: '4px 10px', color: '#EF4444', borderColor: '#EF4444' }}
                            onClick={() => handleParsedRemove(idx)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                        <button
                          className="hw-btn-primary"
                          style={{ background: activeColor }}
                          onClick={() => handleCreateGroup(parsedNames)}
                          disabled={creatingGroup || !groupFields.group_name.trim()}
                        >
                          {creatingGroup
                            ? t('home_creating')
                            : `${t('home_create_all_btn')} (${parsedNames.length})`}
                        </button>
                        {groupSuccess > 0 && (
                          <span className="hw-success-msg">
                            ✓ {groupSuccess} {t('home_created_ok')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CSV tab */}
              {groupTab === 'csv' && (
                <div>
                  <div className="hw-csv-drop">
                    <input
                      type="file"
                      accept=".csv"
                      id="csv-upload"
                      style={{ display: 'none' }}
                      onChange={handleCsvFile}
                    />
                    <label htmlFor="csv-upload" style={{ cursor: 'pointer' }}>
                      {csvFileName ? `📄 ${csvFileName}` : '📂 Seleziona file CSV'}
                    </label>
                  </div>

                  {csvHeaders.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      {/* Column mapping */}
                      <div className="hw-form-row" style={{ marginBottom: 12 }}>
                        {(['name', 'surname', 'email', 'date_of_birth', 'nationality'] as const).map(field => (
                          <div key={field}>
                            <label>{field}</label>
                            <select
                              className="hw-select"
                              value={csvMapping[field]}
                              onChange={e => setCsvMapping(m => ({ ...m, [field]: parseInt(e.target.value) }))}
                            >
                              <option value={-1}>— skip —</option>
                              {csvHeaders.map((h, i) => (
                                <option key={i} value={i}>{h}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>

                      {/* Preview table */}
                      <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                        <table className="hw-csv-preview-table">
                          <thead>
                            <tr>
                              {csvHeaders.map((h, i) => <th key={i}>{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {csvRows.map((row, ri) => (
                              <tr key={ri}>
                                {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                          className="hw-btn-primary"
                          style={{ background: activeColor }}
                          onClick={handleCreateFromCsv}
                          disabled={creatingGroup || !groupFields.group_name.trim()}
                        >
                          {creatingGroup
                            ? t('home_creating')
                            : `${t('home_create_all_btn')} (${csvRows.length})`}
                        </button>
                        {groupSuccess > 0 && (
                          <span className="hw-success-msg">
                            ✓ {groupSuccess} {t('home_created_ok')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recent participants (step 0 shared) */}
          {currentStep === 0 && recentParticipants.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div className="hw-section-title" style={{ marginBottom: 8 }}>{t('home_recent')}</div>
              <div className="hw-recent-list">
                {recentParticipants.map(p => (
                  <div key={p.id} className="hw-recent-item">
                    <span className="hw-recent-name">{p.name} {p.surname}</span>
                    <span
                      className="hw-typology-badge"
                      style={{
                        background: p.mobility_typology === 'Incoming' ? `${C_TEAL}18` : `${C_BLUE}18`,
                        color:      p.mobility_typology === 'Incoming' ? C_TEAL : C_BLUE,
                      }}
                    >
                      {p.mobility_typology ?? '—'}
                    </span>
                    {p.arrival_date && (
                      <span style={{ color: '#9CA3AF', fontSize: 12 }}>
                        {p.arrival_date} — {p.departure_date ?? '?'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STEP 1: Assign Services                                         */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div>
              {/* Participant search */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  {t('home_assign_to')}
                </label>
                <input
                  className="hw-input"
                  type="text"
                  value={participantSearch}
                  onChange={e => setParticipantSearch(e.target.value)}
                  placeholder="Cerca partecipante..."
                  style={{ marginBottom: 8 }}
                />
                <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                  {filteredParticipants.length === 0 && (
                    <div style={{ padding: '12px 16px', color: '#9CA3AF', fontSize: 14 }}>
                      Nessun partecipante trovato
                    </div>
                  )}
                  {filteredParticipants.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectParticipant(p)}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: selectedParticipant?.id === p.id ? `${C_GREEN}10` : 'transparent',
                        borderBottom: '1px solid #F3F4F6',
                      }}
                    >
                      <span style={{ fontWeight: selectedParticipant?.id === p.id ? 600 : 400 }}>
                        {p.name} {p.surname}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background: p.mobility_typology === 'Incoming' ? `${C_TEAL}18` : `${C_BLUE}18`,
                          color:      p.mobility_typology === 'Incoming' ? C_TEAL : C_BLUE,
                        }}
                      >
                        {p.mobility_typology ?? '—'}
                      </span>
                      {p.group_name && (
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{p.group_name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Service assignment form */}
              {selectedParticipant && (
                <div>
                  <div className="hw-service-grid">
                    {/* Sending Org */}
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_sending_org')}</div>
                      <select
                        className="hw-service-select"
                        value={serviceForm.sending_organisation_id}
                        onChange={e => handleServiceChange('sending_organisation_id', e.target.value)}
                      >
                        <option value="">— {t('fld_sending_org')} —</option>
                        {sendingOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </div>

                    {/* Host Company */}
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_host_company')}</div>
                      <select
                        className="hw-service-select"
                        value={serviceForm.host_company_id}
                        onChange={e => handleServiceChange('host_company_id', e.target.value)}
                      >
                        <option value="">— {t('fld_host_company')} —</option>
                        {hostCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    {/* Accommodation 1 */}
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_acc1')}</div>
                      <select
                        className="hw-service-select"
                        value={serviceForm.accommodation_1_id}
                        onChange={e => handleServiceChange('accommodation_1_id', e.target.value)}
                      >
                        <option value="">— {t('fld_acc1')} —</option>
                        {accommodations.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: '#6B7280' }}>{t('fld_acc1_start')}</label>
                          <input
                            className="hw-input"
                            type="date"
                            value={serviceForm.accommodation_1_start_date}
                            onChange={e => handleServiceChange('accommodation_1_start_date', e.target.value)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: '#6B7280' }}>{t('fld_acc1_end')}</label>
                          <input
                            className="hw-input"
                            type="date"
                            value={serviceForm.accommodation_1_end_date}
                            onChange={e => handleServiceChange('accommodation_1_end_date', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Insurance */}
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_insurance_prov')}</div>
                      <select
                        className="hw-service-select"
                        value={serviceForm.insurance_provider_id}
                        onChange={e => handleServiceChange('insurance_provider_id', e.target.value)}
                      >
                        <option value="">— {t('fld_insurance_prov')} —</option>
                        {insuranceProviders.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>

                    {/* Transfer */}
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_transfer_prov')}</div>
                      <select
                        className="hw-service-select"
                        value={serviceForm.transfer_provider_id}
                        onChange={e => handleServiceChange('transfer_provider_id', e.target.value)}
                      >
                        <option value="">— {t('fld_transfer_prov')} —</option>
                        {transferProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>

                    {/* Language Course */}
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_lc_provider')}</div>
                      <select
                        className="hw-service-select"
                        value={serviceForm.language_course_provider_id}
                        onChange={e => handleServiceChange('language_course_provider_id', e.target.value)}
                      >
                        <option value="">— {t('fld_lc_provider')} —</option>
                        {langCourseProviders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>

                    {/* Mobility Provider */}
                    <div className="hw-service-card">
                      <div className="hw-service-card-title">{t('fld_mobility_prov')}</div>
                      <select
                        className="hw-service-select"
                        value={serviceForm.mobility_service_provider_id}
                        onChange={e => handleServiceChange('mobility_service_provider_id', e.target.value)}
                      >
                        <option value="">— {t('fld_mobility_prov')} —</option>
                        {mobilityProviders.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Bulk apply to group */}
                  {selectedParticipant.group_name && (
                    <div className="hw-bulk-row">
                      <input
                        type="checkbox"
                        id="bulk-group"
                        checked={applyToGroup}
                        onChange={e => setApplyToGroup(e.target.checked)}
                      />
                      <label htmlFor="bulk-group">
                        {t('home_bulk_group')} "{selectedParticipant.group_name}"
                      </label>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                    <button
                      className="hw-btn-primary"
                      style={{ background: C_GREEN }}
                      onClick={handleSaveServices}
                      disabled={savingServices}
                    >
                      {savingServices ? '...' : t('btn_save')}
                    </button>
                    {servicesSuccess && (
                      <span className="hw-success-msg">✓ {t('home_services_saved')}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STEP 2: Manage Providers                                        */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div>
              {quickSuccess && (
                <div className="hw-success-msg" style={{ marginBottom: 12 }}>
                  ✓ Provider aggiunto con successo!
                </div>
              )}

              <div className="hw-prov-grid">

                {/* Sending Org */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>🏛️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_sendingOrgs')}</div>
                      <div className="hw-prov-count">{stats.sendingOrgs} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => navigate('/incoming/sending-orgs')}>
                      {t('home_view_all')}
                    </button>
                    <button className="hw-btn-secondary" onClick={() => toggleQuickAdd('so')}>
                      {t('home_quick_add')}
                    </button>
                  </div>
                  {openQuickAdd === 'so' && (
                    <div className="hw-quick-form">
                      <div className="hw-quick-form-fields">
                        <input className="hw-input" placeholder={t('fld_name') + ' *'} value={quickSO.name} onChange={e => setQuickSO(f => ({ ...f, name: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_contact_person')} value={quickSO.contact_person} onChange={e => setQuickSO(f => ({ ...f, contact_person: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_email')} value={quickSO.email} onChange={e => setQuickSO(f => ({ ...f, email: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_phone')} value={quickSO.phone} onChange={e => setQuickSO(f => ({ ...f, phone: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_city')} value={quickSO.city} onChange={e => setQuickSO(f => ({ ...f, city: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_country')} value={quickSO.country} onChange={e => setQuickSO(f => ({ ...f, country: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="hw-btn-primary" style={{ background: C_TEAL }} disabled={!quickSO.name.trim() || quickSaving} onClick={() => handleQuickSave('so')}>{quickSaving ? '...' : t('btn_save')}</button>
                        <button className="hw-btn-secondary" onClick={() => setOpenQuickAdd(null)}>{t('btn_cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Host Company */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>🏢</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_hostCompanies')}</div>
                      <div className="hw-prov-count">{stats.hostCompanies} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => navigate('/incoming/host-companies')}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => toggleQuickAdd('hc')}>{t('home_quick_add')}</button>
                  </div>
                  {openQuickAdd === 'hc' && (
                    <div className="hw-quick-form">
                      <div className="hw-quick-form-fields">
                        <input className="hw-input" placeholder={t('fld_name') + ' *'} value={quickHC.name} onChange={e => setQuickHC(f => ({ ...f, name: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_sector')} value={quickHC.sector} onChange={e => setQuickHC(f => ({ ...f, sector: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_city')} value={quickHC.city} onChange={e => setQuickHC(f => ({ ...f, city: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_contact')} value={quickHC.contact_person} onChange={e => setQuickHC(f => ({ ...f, contact_person: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_email')} value={quickHC.email} onChange={e => setQuickHC(f => ({ ...f, email: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="hw-btn-primary" style={{ background: C_TEAL }} disabled={!quickHC.name.trim() || quickSaving} onClick={() => handleQuickSave('hc')}>{quickSaving ? '...' : t('btn_save')}</button>
                        <button className="hw-btn-secondary" onClick={() => setOpenQuickAdd(null)}>{t('btn_cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accommodation */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>🏠</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_accommodation')}</div>
                      <div className="hw-prov-count">{stats.accommodation} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => navigate('/incoming/accommodation')}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => toggleQuickAdd('acc')}>{t('home_quick_add')}</button>
                  </div>
                  {openQuickAdd === 'acc' && (
                    <div className="hw-quick-form">
                      <div className="hw-quick-form-fields">
                        <input className="hw-input" placeholder={t('fld_acc_name') + ' *'} value={quickAcc.name} onChange={e => setQuickAcc(f => ({ ...f, name: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_acc_typology')} value={quickAcc.typology} onChange={e => setQuickAcc(f => ({ ...f, typology: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_city')} value={quickAcc.city} onChange={e => setQuickAcc(f => ({ ...f, city: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_acc_contact')} value={quickAcc.contact_person} onChange={e => setQuickAcc(f => ({ ...f, contact_person: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_email')} value={quickAcc.email} onChange={e => setQuickAcc(f => ({ ...f, email: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_phone')} value={quickAcc.phone} onChange={e => setQuickAcc(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="hw-btn-primary" style={{ background: C_TEAL }} disabled={!quickAcc.name.trim() || quickSaving} onClick={() => handleQuickSave('acc')}>{quickSaving ? '...' : t('btn_save')}</button>
                        <button className="hw-btn-secondary" onClick={() => setOpenQuickAdd(null)}>{t('btn_cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Insurance */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>🛡️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_insurance')}</div>
                      <div className="hw-prov-count">{stats.insurance} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => navigate('/incoming/insurance')}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => toggleQuickAdd('ins')}>{t('home_quick_add')}</button>
                  </div>
                  {openQuickAdd === 'ins' && (
                    <div className="hw-quick-form">
                      <div className="hw-quick-form-fields">
                        <input className="hw-input" placeholder={t('fld_name') + ' *'} value={quickIns.name} onChange={e => setQuickIns(f => ({ ...f, name: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_contact_person')} value={quickIns.contact_person} onChange={e => setQuickIns(f => ({ ...f, contact_person: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_email')} value={quickIns.email} onChange={e => setQuickIns(f => ({ ...f, email: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_phone')} value={quickIns.phone} onChange={e => setQuickIns(f => ({ ...f, phone: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_city')} value={quickIns.city} onChange={e => setQuickIns(f => ({ ...f, city: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="hw-btn-primary" style={{ background: C_TEAL }} disabled={!quickIns.name.trim() || quickSaving} onClick={() => handleQuickSave('ins')}>{quickSaving ? '...' : t('btn_save')}</button>
                        <button className="hw-btn-secondary" onClick={() => setOpenQuickAdd(null)}>{t('btn_cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transfer */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>🚐</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_transfer')}</div>
                      <div className="hw-prov-count">{stats.transfer} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => navigate('/incoming/transfer')}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => toggleQuickAdd('tr')}>{t('home_quick_add')}</button>
                  </div>
                  {openQuickAdd === 'tr' && (
                    <div className="hw-quick-form">
                      <div className="hw-quick-form-fields">
                        <input className="hw-input" placeholder={t('fld_name') + ' *'} value={quickTr.name} onChange={e => setQuickTr(f => ({ ...f, name: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_contact_person')} value={quickTr.contact_person} onChange={e => setQuickTr(f => ({ ...f, contact_person: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_email')} value={quickTr.email} onChange={e => setQuickTr(f => ({ ...f, email: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_phone')} value={quickTr.phone} onChange={e => setQuickTr(f => ({ ...f, phone: e.target.value }))} />
                        <input className="hw-input" type="number" placeholder={t('fld_tr_price')} value={quickTr.normal_price} onChange={e => setQuickTr(f => ({ ...f, normal_price: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="hw-btn-primary" style={{ background: C_TEAL }} disabled={!quickTr.name.trim() || quickSaving} onClick={() => handleQuickSave('tr')}>{quickSaving ? '...' : t('btn_save')}</button>
                        <button className="hw-btn-secondary" onClick={() => setOpenQuickAdd(null)}>{t('btn_cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Language Course */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>📚</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_languageCourseProviders')}</div>
                      <div className="hw-prov-count">{stats.langCourse} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => navigate('/incoming/language-course-providers')}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => toggleQuickAdd('lc')}>{t('home_quick_add')}</button>
                  </div>
                  {openQuickAdd === 'lc' && (
                    <div className="hw-quick-form">
                      <div className="hw-quick-form-fields">
                        <input className="hw-input" placeholder={t('fld_name') + ' *'} value={quickLC.name} onChange={e => setQuickLC(f => ({ ...f, name: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_city')} value={quickLC.city} onChange={e => setQuickLC(f => ({ ...f, city: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_country')} value={quickLC.country} onChange={e => setQuickLC(f => ({ ...f, country: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_contact_person')} value={quickLC.contact_person} onChange={e => setQuickLC(f => ({ ...f, contact_person: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_email')} value={quickLC.email} onChange={e => setQuickLC(f => ({ ...f, email: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_language_taught')} value={quickLC.language_taught} onChange={e => setQuickLC(f => ({ ...f, language_taught: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="hw-btn-primary" style={{ background: C_TEAL }} disabled={!quickLC.name.trim() || quickSaving} onClick={() => handleQuickSave('lc')}>{quickSaving ? '...' : t('btn_save')}</button>
                        <button className="hw-btn-secondary" onClick={() => setOpenQuickAdd(null)}>{t('btn_cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobility Provider */}
                <div className="hw-prov-card">
                  <div className="hw-prov-card-header">
                    <span style={{ fontSize: 22 }}>🌐</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('nav_mobilityProviders')}</div>
                      <div className="hw-prov-count">{stats.mobilityProviders} records</div>
                    </div>
                  </div>
                  <div className="hw-prov-actions">
                    <button className="hw-btn-secondary" onClick={() => navigate('/incoming/mobility-providers')}>{t('home_view_all')}</button>
                    <button className="hw-btn-secondary" onClick={() => toggleQuickAdd('msp')}>{t('home_quick_add')}</button>
                  </div>
                  {openQuickAdd === 'msp' && (
                    <div className="hw-quick-form">
                      <div className="hw-quick-form-fields">
                        <input className="hw-input" placeholder={t('fld_name') + ' *'} value={quickMSP.name} onChange={e => setQuickMSP(f => ({ ...f, name: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_city')} value={quickMSP.city} onChange={e => setQuickMSP(f => ({ ...f, city: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_country')} value={quickMSP.country} onChange={e => setQuickMSP(f => ({ ...f, country: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_contact_person')} value={quickMSP.contact_person} onChange={e => setQuickMSP(f => ({ ...f, contact_person: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_email')} value={quickMSP.email} onChange={e => setQuickMSP(f => ({ ...f, email: e.target.value }))} />
                        <input className="hw-input" placeholder={t('fld_website')} value={quickMSP.website} onChange={e => setQuickMSP(f => ({ ...f, website: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="hw-btn-primary" style={{ background: C_TEAL }} disabled={!quickMSP.name.trim() || quickSaving} onClick={() => handleQuickSave('msp')}>{quickSaving ? '...' : t('btn_save')}</button>
                        <button className="hw-btn-secondary" onClick={() => setOpenQuickAdd(null)}>{t('btn_cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom navigation ───────────────────────────────────────────── */}
      <div className="home-bottom-nav">
        <button
          className="btn btn-secondary"
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep === 0}
        >
          ← {t('home_btn_prev')}
        </button>

        <div className="home-dots">
          {Array.from({ length: STEPS }).map((_, i) => (
            <button
              key={i}
              className="home-dot"
              onClick={() => goTo(i)}
              style={{
                width:      i === currentStep ? 22 : 8,
                background: i === currentStep
                  ? stepColors[i]
                  : stepDone[i] ? `${stepColors[i]}80` : '#D1D5DB',
              }}
            />
          ))}
        </div>

        {currentStep < STEPS - 1 ? (
          <button className="btn btn-accent" onClick={() => goTo(currentStep + 1)}>
            {t('home_btn_next')} →
          </button>
        ) : (
          <button className="btn btn-accent" onClick={() => navigate('/dashboard')}>
            📊 {t('home_btn_dashboard')}
          </button>
        )}
      </div>

    </div>
  )
}
