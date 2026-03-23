import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Counts {
  sendingOrgs: number
  hostCompanies: number
  accommodation: number
  insurance: number
  transfer: number
  langCourse: number
  mobilityProviders: number
  incomingParticipants: number
  outgoingParticipants: number
  travelDetails: number
  financialComplete: number // participants with grant_amount set
}

interface StepItem {
  label: string
  count: number
  route: string
  icon: string
  required?: boolean
  hint?: string
}

interface Phase {
  number: number
  title: string
  subtitle: string
  color: string
  items: StepItem[]
}

function StatusDot({ done }: { done: boolean }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: done ? '#10B981' : '#D1D5DB', flexShrink: 0,
      boxShadow: done ? '0 0 0 3px #10B98120' : 'none',
    }} />
  )
}

export default function GuidedHomePage() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      const [so, hc, acc, ins, tr, lcp, msp, inc, out, td, fp] = await Promise.all([
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
        supabase.from('participants').select('id', { count: 'exact', head: true }).not('grant_amount', 'is', null),
      ])
      setCounts({
        sendingOrgs: so.count || 0,
        hostCompanies: hc.count || 0,
        accommodation: acc.count || 0,
        insurance: ins.count || 0,
        transfer: tr.count || 0,
        langCourse: lcp.count || 0,
        mobilityProviders: msp.count || 0,
        incomingParticipants: inc.count || 0,
        outgoingParticipants: out.count || 0,
        travelDetails: td.count || 0,
        financialComplete: fp.count || 0,
      })
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Caricamento...</p>
      </div>
    )
  }

  const c = counts!
  const totalParticipants = c.incomingParticipants + c.outgoingParticipants

  const phases: Phase[] = [
    {
      number: 1,
      title: 'Configura i Provider',
      subtitle: 'Prima di aggiungere partecipanti, inserisci tutte le organizzazioni e i fornitori che utilizzerai',
      color: '#2D7A6F',
      items: [
        { label: 'Organizzazioni mittenti', count: c.sendingOrgs, route: '/incoming/sending-orgs', icon: '🏛️', required: true, hint: 'Chi invia i partecipanti' },
        { label: 'Aziende ospitanti', count: c.hostCompanies, route: '/incoming/host-companies', icon: '🏢', required: true, hint: 'Dove faranno il tirocinio' },
        { label: 'Alloggi', count: c.accommodation, route: '/incoming/accommodation', icon: '🏠', required: true, hint: 'Dove dormiranno i partecipanti' },
        { label: 'Assicurazioni', count: c.insurance, route: '/incoming/insurance', icon: '🛡️', hint: 'Provider assicurativi' },
        { label: 'Transfer', count: c.transfer, route: '/incoming/transfer', icon: '🚌', hint: 'Servizi di trasporto' },
        { label: 'Corsi di lingua', count: c.langCourse, route: '/incoming/language-course-providers', icon: '📚', hint: 'Scuole di lingua' },
        { label: 'Provider mobilità', count: c.mobilityProviders, route: '/incoming/mobility-providers', icon: '🌐', hint: 'Partner per la mobilità' },
      ],
    },
    {
      number: 2,
      title: 'Aggiungi i Partecipanti',
      subtitle: 'Inserisci i dati personali, di mobilità e collega i provider configurati nel passo precedente',
      color: '#1D72B8',
      items: [
        { label: 'Partecipanti Incoming', count: c.incomingParticipants, route: '/incoming/individuals', icon: '⬇️', required: true, hint: 'Partecipanti in entrata' },
        { label: 'Partecipanti Outgoing', count: c.outgoingParticipants, route: '/outgoing/individuals', icon: '⬆️', hint: 'Partecipanti in uscita' },
        { label: 'Gruppi Incoming', count: c.incomingParticipants, route: '/incoming/groups', icon: '👥', hint: 'Visualizzazione per gruppi' },
        { label: 'Gruppi Outgoing', count: c.outgoingParticipants, route: '/outgoing/groups', icon: '👥', hint: 'Visualizzazione per gruppi' },
      ],
    },
    {
      number: 3,
      title: 'Dettagli di Viaggio',
      subtitle: 'Aggiungi i dettagli dei voli e trasporti per ogni partecipante',
      color: '#8B5CF6',
      items: [
        { label: 'Viaggi Incoming', count: c.travelDetails, route: '/incoming/travel', icon: '✈️', hint: 'Voli e treni arrivo' },
        { label: 'Viaggi Outgoing', count: c.travelDetails, route: '/outgoing/travel', icon: '✈️', hint: 'Voli e treni partenza' },
      ],
    },
    {
      number: 4,
      title: 'Finanze e Documenti',
      subtitle: 'Verifica i dati finanziari e genera i documenti ufficiali per ogni partecipante',
      color: '#10B981',
      items: [
        { label: 'Info finanziarie Incoming', count: c.financialComplete, route: '/incoming/financial', icon: '💶', hint: 'Grant, costi, margini' },
        { label: 'Info finanziarie Outgoing', count: c.financialComplete, route: '/outgoing/financial', icon: '💶', hint: 'Grant, costi, margini' },
      ],
    },
  ]

  // Compute completion per phase
  const phaseStatus = phases.map(phase => {
    const requiredItems = phase.items.filter(i => i.required)
    const done = requiredItems.length === 0
      ? phase.items.every(i => i.count > 0)
      : requiredItems.every(i => i.count > 0)
    const partial = phase.items.some(i => i.count > 0)
    return done ? 'done' : partial ? 'partial' : 'empty'
  })

  const overallProgress = Math.round(
    (phases.reduce((s, p, i) => s + (phaseStatus[i] === 'done' ? 1 : phaseStatus[i] === 'partial' ? 0.5 : 0), 0) / phases.length) * 100
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

      {/* Hero */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>Benvenuto in Managemob</h1>
            <p style={{ color: '#6B7280', marginTop: 6, fontSize: 15 }}>
              Segui i passaggi per configurare e gestire i tuoi programmi di mobilità
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/dashboard')}
            style={{ whiteSpace: 'nowrap' }}
          >
            📊 Vai alla Dashboard
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 24, background: '#F3F4F6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, #2D7A6F, #10B981)',
            width: `${overallProgress}%`,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Completamento configurazione</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#2D7A6F' }}>{overallProgress}%</span>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 36 }}>
        {[
          { label: 'Provider configurati', value: c.sendingOrgs + c.hostCompanies + c.accommodation + c.insurance + c.transfer + c.langCourse + c.mobilityProviders, color: '#2D7A6F', icon: '⚙️' },
          { label: 'Partecipanti totali', value: totalParticipants, color: '#1D72B8', icon: '👥' },
          { label: 'Dettagli viaggio', value: c.travelDetails, color: '#8B5CF6', icon: '✈️' },
          { label: 'Con dati finanziari', value: c.financialComplete, color: '#10B981', icon: '💶' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Phases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {phases.map((phase, pi) => {
          const status = phaseStatus[pi]
          const isOpen = activePhase === pi
          const statusColor = status === 'done' ? '#10B981' : status === 'partial' ? '#F59E0B' : '#D1D5DB'
          const statusLabel = status === 'done' ? 'Completato' : status === 'partial' ? 'In corso' : 'Da iniziare'

          return (
            <div key={pi} style={{
              background: 'white', borderRadius: 12,
              border: `1px solid ${isOpen ? phase.color + '44' : '#E5E7EB'}`,
              boxShadow: isOpen ? `0 4px 20px ${phase.color}18` : '0 1px 4px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}>

              {/* Phase header */}
              <div
                style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                onClick={() => setActivePhase(isOpen ? null : pi)}
              >
                {/* Number badge */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: status === 'done' ? '#10B981' : isOpen ? phase.color : '#F3F4F6',
                  color: status === 'done' || isOpen ? 'white' : '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16,
                  transition: 'background 0.2s',
                }}>
                  {status === 'done' ? '✓' : phase.number}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>{phase.title}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: `${statusColor}20`, color: statusColor,
                    }}>{statusLabel}</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6B7280' }}>{phase.subtitle}</p>
                </div>

                <div style={{ color: '#9CA3AF', fontSize: 18, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                  ⌄
                </div>
              </div>

              {/* Phase content */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${phase.color}22`, padding: '16px 22px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                    {phase.items.map((item, ii) => (
                      <div
                        key={ii}
                        onClick={() => navigate(item.route)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                          border: '1px solid #E5E7EB',
                          background: item.count > 0 ? '#F0FAF8' : '#FAFAFA',
                          transition: 'background 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = phase.color; (e.currentTarget as HTMLElement).style.background = `${phase.color}0A` }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLElement).style.background = item.count > 0 ? '#F0FAF8' : '#FAFAFA' }}
                      >
                        <span style={{ fontSize: 22 }}>{item.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{item.label}</span>
                            {item.required && <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 600 }}>*</span>}
                          </div>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{item.hint}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <StatusDot done={item.count > 0} />
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: item.count > 0 ? phase.color : '#9CA3AF',
                          }}>
                            {item.count > 0 ? item.count : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Phase CTA */}
                  <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {phase.items.filter(i => i.required && i.count === 0).map((item, ii) => (
                      <button
                        key={ii}
                        className="btn btn-accent btn-sm"
                        onClick={() => navigate(item.route)}
                      >
                        + Aggiungi {item.label}
                      </button>
                    ))}
                    {phase.items.filter(i => i.required && i.count === 0).length === 0 && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(phase.items[0].route)}
                      >
                        Vai a {phase.title} →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom tip */}
      <div style={{
        marginTop: 32, padding: '16px 20px', borderRadius: 10,
        background: 'linear-gradient(135deg, #F0FAF8, #EFF6FF)',
        border: '1px solid #C8E6E1', display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div>
          <strong style={{ fontSize: 13, color: '#111827' }}>Consiglio</strong>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
            Inizia sempre configurando prima i <strong>provider</strong> (organizzazioni, alloggi, aziende ospitanti), poi aggiungi i <strong>partecipanti</strong> collegandoli ai provider già inseriti.
            Il sistema calcolerà automaticamente le settimane e i margini finanziari.
          </p>
        </div>
      </div>
    </div>
  )
}
