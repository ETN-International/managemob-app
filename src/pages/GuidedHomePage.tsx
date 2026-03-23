import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface StepData {
  title: string
  icon: string
  description: string
  color: string
  tasks: {
    label: string
    hint: string
    route: string
    count: number
    required: boolean
  }[]
}

const TEAL = '#2D7A6F'
const BLUE = '#1D72B8'
const PURPLE = '#8B5CF6'
const ORANGE = '#F59E0B'
const GREEN = '#10B981'
const PINK = '#EC4899'
const INDIGO = '#6366F1'
const CYAN = '#0891B2'

export default function GuidedHomePage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [counts, setCounts] = useState({
    sendingOrgs: 0, hostCompanies: 0, accommodation: 0,
    insurance: 0, transfer: 0, langCourse: 0, mobilityProviders: 0,
    incomingParticipants: 0, outgoingParticipants: 0,
    travelIncoming: 0, travelOutgoing: 0,
    financialIncoming: 0, financialOutgoing: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [so, hc, acc, ins, tr, lcp, msp, inc, out, ti, to, fi, fo] = await Promise.all([
        supabase.from('sending_organisations').select('id', { count: 'exact', head: true }),
        supabase.from('host_companies').select('id', { count: 'exact', head: true }),
        supabase.from('accommodation').select('id', { count: 'exact', head: true }),
        supabase.from('insurance_providers').select('id', { count: 'exact', head: true }),
        supabase.from('transfer_providers').select('id', { count: 'exact', head: true }),
        supabase.from('language_course_providers').select('id', { count: 'exact', head: true }),
        supabase.from('mobility_service_providers').select('id', { count: 'exact', head: true }),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Incoming'),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Outgoing'),
        supabase.from('travel_details').select('id', { count: 'exact', head: true }),
        supabase.from('travel_details').select('id', { count: 'exact', head: true }),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Incoming').not('grant_amount', 'is', null),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Outgoing').not('grant_amount', 'is', null),
      ])
      setCounts({
        sendingOrgs: so.count || 0, hostCompanies: hc.count || 0, accommodation: acc.count || 0,
        insurance: ins.count || 0, transfer: tr.count || 0, langCourse: lcp.count || 0,
        mobilityProviders: msp.count || 0, incomingParticipants: inc.count || 0,
        outgoingParticipants: out.count || 0, travelIncoming: ti.count || 0,
        travelOutgoing: to.count || 0, financialIncoming: fi.count || 0,
        financialOutgoing: fo.count || 0,
      })
      setLoading(false)
    })()
  }, [])

  const steps: StepData[] = [
    {
      title: 'Organizzazioni mittenti',
      icon: '🏛️',
      color: TEAL,
      description: 'Inizia inserendo le organizzazioni che inviano i partecipanti al programma di mobilità. Senza di esse non potrai collegare i partecipanti a un\'origine.',
      tasks: [
        { label: 'Crea organizzazioni mittenti', hint: 'Chi invia i partecipanti (scuole, università, aziende)', route: '/incoming/sending-orgs', count: counts.sendingOrgs, required: true },
      ],
    },
    {
      title: 'Aziende ospitanti',
      icon: '🏢',
      color: BLUE,
      description: 'Aggiungi le aziende dove i partecipanti svolgeranno il tirocinio. Per ogni azienda potrai specificare settore, indirizzo e dati del tutor.',
      tasks: [
        { label: 'Crea aziende ospitanti', hint: 'Dove i partecipanti faranno stage o lavoreranno', route: '/incoming/host-companies', count: counts.hostCompanies, required: true },
      ],
    },
    {
      title: 'Alloggi',
      icon: '🏠',
      color: ORANGE,
      description: 'Configura le sistemazioni disponibili: famiglie ospitanti, ostelli, B&B o appartamenti condivisi. Ogni alloggio ha opzioni di pensione e prezzi settimanali.',
      tasks: [
        { label: 'Crea alloggi', hint: 'Famiglia ospitante, ostello, B&B, appartamento…', route: '/incoming/accommodation', count: counts.accommodation, required: true },
      ],
    },
    {
      title: 'Provider di supporto',
      icon: '🔧',
      color: PURPLE,
      description: 'Configura i fornitori di servizi aggiuntivi: assicurazioni, transfer aeroportuale, scuole di lingua e provider di mobilità. Potrai collegarli ai partecipanti nel passo successivo.',
      tasks: [
        { label: 'Assicurazioni', hint: 'Provider assicurativi per i partecipanti', route: '/incoming/insurance', count: counts.insurance, required: false },
        { label: 'Transfer', hint: 'Servizi di trasporto aeroportuale', route: '/incoming/transfer', count: counts.transfer, required: false },
        { label: 'Corsi di lingua', hint: 'Scuole e provider per corsi linguistici', route: '/incoming/language-course-providers', count: counts.langCourse, required: false },
        { label: 'Provider mobilità', hint: 'Partner internazionali per la mobilità', route: '/incoming/mobility-providers', count: counts.mobilityProviders, required: false },
      ],
    },
    {
      title: 'Partecipanti Incoming',
      icon: '⬇️',
      color: GREEN,
      description: 'Inserisci i partecipanti in entrata: dati personali, passaporto, lingue, istruzione e banca. Poi collegali ai provider configurati nei passi precedenti.',
      tasks: [
        { label: 'Aggiungi partecipanti Incoming', hint: 'Inserisci i dati e collega org., alloggio, azienda ospitante…', route: '/incoming/individuals', count: counts.incomingParticipants, required: true },
        { label: 'Gruppi Incoming', hint: 'Visualizza e gestisci per gruppo di appartenenza', route: '/incoming/groups', count: counts.incomingParticipants, required: false },
      ],
    },
    {
      title: 'Partecipanti Outgoing',
      icon: '⬆️',
      color: CYAN,
      description: 'Inserisci i partecipanti in uscita. La struttura è identica agli Incoming: dati personali, mobilità, alloggio e provider da collegare.',
      tasks: [
        { label: 'Aggiungi partecipanti Outgoing', hint: 'Inserisci i dati e collega tutti i provider', route: '/outgoing/individuals', count: counts.outgoingParticipants, required: false },
        { label: 'Gruppi Outgoing', hint: 'Visualizza e gestisci per gruppo', route: '/outgoing/groups', count: counts.outgoingParticipants, required: false },
      ],
    },
    {
      title: 'Dettagli di viaggio',
      icon: '✈️',
      color: INDIGO,
      description: 'Registra i dettagli dei voli e trasporti per ogni partecipante: numero volo/treno, data e orario di partenza e arrivo, prezzo biglietto.',
      tasks: [
        { label: 'Viaggi Incoming', hint: 'Voli/treni per i partecipanti in entrata', route: '/incoming/travel', count: counts.travelIncoming, required: false },
        { label: 'Viaggi Outgoing', hint: 'Voli/treni per i partecipanti in uscita', route: '/outgoing/travel', count: counts.travelOutgoing, required: false },
      ],
    },
    {
      title: 'Finanze e documenti',
      icon: '💶',
      color: PINK,
      description: 'Verifica i dati economici: grant, costi di trasporto, alloggio, vitto, assicurazione e margini. Da qui puoi anche generare i documenti ufficiali PDF per ogni partecipante.',
      tasks: [
        { label: 'Info finanziarie Incoming', hint: 'Grant, costi, margini — verifica e completa', route: '/incoming/financial', count: counts.financialIncoming, required: false },
        { label: 'Info finanziarie Outgoing', hint: 'Grant, costi, margini — verifica e completa', route: '/outgoing/financial', count: counts.financialOutgoing, required: false },
      ],
    },
  ]

  const isStepDone = (s: StepData) => {
    const required = s.tasks.filter(t => t.required)
    return required.length > 0 ? required.every(t => t.count > 0) : s.tasks.some(t => t.count > 0)
  }

  const completedSteps = steps.filter(isStepDone).length
  const progress = Math.round((completedSteps / steps.length) * 100)

  const step = steps[currentStep]
  const done = isStepDone(step)

  if (loading) return <div className="page-loading"><div className="spinner"></div><p>Caricamento...</p></div>

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Configurazione guidata</h1>
          <p style={{ color: '#6B7280', marginTop: 4, fontSize: 14 }}>
            Segui i passi per configurare il tuo programma di mobilità
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
          📊 Dashboard
        </button>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36, overflowX: 'auto', paddingBottom: 4 }}>
        {steps.map((s, i) => {
          const isDone = isStepDone(s)
          const isCurrent = i === currentStep
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={() => setCurrentStep(i)}
                title={s.title}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                  background: isDone ? s.color : isCurrent ? s.color : '#E5E7EB',
                  color: isDone || isCurrent ? 'white' : '#9CA3AF',
                  boxShadow: isCurrent ? `0 0 0 4px ${s.color}30` : 'none',
                  transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isDone ? '✓' : i + 1}
              </button>
              {i < steps.length - 1 && (
                <div style={{
                  height: 2, width: 32, flexShrink: 0,
                  background: isStepDone(steps[i]) ? steps[i].color : '#E5E7EB',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
        <div style={{ marginLeft: 'auto', paddingLeft: 16, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: TEAL }}>{completedSteps}/{steps.length} step</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#F3F4F6', borderRadius: 99, height: 6, marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${TEAL}, ${GREEN})`, width: `${progress}%`, transition: 'width 0.5s ease' }} />
      </div>

      {/* Step card */}
      <div style={{
        background: 'white', borderRadius: 16, padding: '28px 32px',
        border: `2px solid ${step.color}22`,
        boxShadow: `0 4px 24px ${step.color}12`,
      }}>
        {/* Step header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: `${step.color}15`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 26,
          }}>
            {step.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: step.color, letterSpacing: 1, textTransform: 'uppercase' }}>
                Passo {currentStep + 1} di {steps.length}
              </span>
              {done && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#10B98120', color: '#10B981' }}>
                  ✓ Completato
                </span>
              )}
            </div>
            <h2 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 700, color: '#111827' }}>{step.title}</h2>
          </div>
        </div>

        {/* Description */}
        <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, marginBottom: 24, paddingLeft: 66 }}>
          {step.description}
        </p>

        {/* Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {step.tasks.map((task, ti) => (
            <div
              key={ti}
              onClick={() => navigate(task.route)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${task.count > 0 ? step.color + '44' : '#E5E7EB'}`,
                background: task.count > 0 ? `${step.color}08` : '#FAFAFA',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = step.color; (e.currentTarget as HTMLElement).style.background = `${step.color}10` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = task.count > 0 ? step.color + '44' : '#E5E7EB'; (e.currentTarget as HTMLElement).style.background = task.count > 0 ? `${step.color}08` : '#FAFAFA' }}
            >
              {/* Status circle */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: task.count > 0 ? `${step.color}20` : '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: task.count > 0 ? step.color : '#D1D5DB',
              }}>
                {task.count > 0 ? '✓' : task.required ? '!' : '○'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{task.label}</span>
                  {task.required && task.count === 0 && (
                    <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: '#FEE2E2' }}>richiesto</span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{task.hint}</span>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {task.count > 0 ? (
                  <span style={{ fontSize: 20, fontWeight: 700, color: step.color }}>{task.count}</span>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 600, color: step.color, padding: '5px 12px', borderRadius: 6, background: `${step.color}15` }}>
                    + Aggiungi →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          style={{ opacity: currentStep === 0 ? 0.4 : 1 }}
        >
          ← Precedente
        </button>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              style={{
                width: i === currentStep ? 20 : 8, height: 8,
                borderRadius: 99, border: 'none', cursor: 'pointer',
                background: i === currentStep ? step.color : isStepDone(steps[i]) ? `${steps[i].color}80` : '#D1D5DB',
                transition: 'all 0.2s', padding: 0,
              }}
            />
          ))}
        </div>

        {currentStep < steps.length - 1 ? (
          <button
            className="btn btn-accent"
            onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
          >
            Successivo →
          </button>
        ) : (
          <button className="btn btn-accent" onClick={() => navigate('/dashboard')}>
            📊 Vai alla Dashboard
          </button>
        )}
      </div>

      {/* Bottom summary */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            style={{
              padding: '10px 8px', borderRadius: 8, border: `1px solid ${isStepDone(s) ? s.color + '44' : '#E5E7EB'}`,
              background: i === currentStep ? `${s.color}10` : isStepDone(s) ? `${s.color}08` : 'white',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: i === currentStep ? s.color : isStepDone(s) ? s.color : '#9CA3AF', marginTop: 3, lineHeight: 1.2 }}>
              {s.title}
            </div>
            {isStepDone(s) && <div style={{ fontSize: 10, color: GREEN, marginTop: 2 }}>✓</div>}
          </button>
        ))}
      </div>
    </div>
  )
}
