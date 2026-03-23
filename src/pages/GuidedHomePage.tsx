import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'

type Mode = 'individual' | 'group'

interface Task {
  label: string
  hint: string
  route: string
  count: number
  required: boolean
  badge?: string
  badgeColor?: string
}

interface Step {
  icon: string
  title: string
  desc: string
  color: string
  tasks: Task[]
}

const C_TEAL   = '#2D7A6F'
const C_BLUE   = '#1D72B8'
const C_INDIGO = '#6366F1'
const C_GREEN  = '#10B981'
const C_PURPLE = '#8B5CF6'
const C_AMBER  = '#F59E0B'

export default function GuidedHomePage() {
  const { t } = useT()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('individual')
  const [currentStep, setCurrentStep] = useState(0)
  const [counts, setCounts] = useState({
    sendingOrgs: 0, hostCompanies: 0, accommodation: 0,
    insurance: 0, transfer: 0, langCourse: 0, mobilityProviders: 0,
    incomingInd: 0, outgoingInd: 0,
    incomingGrp: 0, outgoingGrp: 0,
    travelIncoming: 0, travelOutgoing: 0,
    financialIncoming: 0, financialOutgoing: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [so, hc, acc, ins, tr, lcp, msp,
             incI, outI, incG, outG,
             tInc, tOut, fInc, fOut] = await Promise.all([
        supabase.from('sending_organisations').select('id', { count: 'exact', head: true }),
        supabase.from('host_companies').select('id', { count: 'exact', head: true }),
        supabase.from('accommodation').select('id', { count: 'exact', head: true }),
        supabase.from('insurance_providers').select('id', { count: 'exact', head: true }),
        supabase.from('transfer_providers').select('id', { count: 'exact', head: true }),
        supabase.from('language_course_providers').select('id', { count: 'exact', head: true }),
        supabase.from('mobility_service_providers').select('id', { count: 'exact', head: true }),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Incoming').eq('indiv_group', 'Individual'),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Outgoing').eq('indiv_group', 'Individual'),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Incoming').eq('indiv_group', 'Group'),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Outgoing').eq('indiv_group', 'Group'),
        supabase.from('travel_details').select('id', { count: 'exact', head: true }),
        supabase.from('travel_details').select('id', { count: 'exact', head: true }),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Incoming').not('grant_amount', 'is', null),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('mobility_typology', 'Outgoing').not('grant_amount', 'is', null),
      ])
      setCounts({
        sendingOrgs: so.count ?? 0, hostCompanies: hc.count ?? 0, accommodation: acc.count ?? 0,
        insurance: ins.count ?? 0, transfer: tr.count ?? 0, langCourse: lcp.count ?? 0,
        mobilityProviders: msp.count ?? 0,
        incomingInd: incI.count ?? 0, outgoingInd: outI.count ?? 0,
        incomingGrp: incG.count ?? 0, outgoingGrp: outG.count ?? 0,
        travelIncoming: tInc.count ?? 0, travelOutgoing: tOut.count ?? 0,
        financialIncoming: fInc.count ?? 0, financialOutgoing: fOut.count ?? 0,
      })
      setLoading(false)
    })()
  }, [])

  const setupStep: Step = {
    icon: '⚙️',
    title: t('home_s1_title'),
    desc: t('home_s1_desc'),
    color: C_TEAL,
    tasks: [
      { label: t('nav_sendingOrgs'),            hint: t('home_s1_so_hint'),  route: '/incoming/sending-orgs',              count: counts.sendingOrgs,       required: true  },
      { label: t('nav_hostCompanies'),           hint: t('home_s1_hc_hint'),  route: '/incoming/host-companies',            count: counts.hostCompanies,     required: true  },
      { label: t('nav_accommodation'),           hint: t('home_s1_acc_hint'), route: '/incoming/accommodation',             count: counts.accommodation,     required: true  },
      { label: t('nav_insurance'),               hint: t('home_s1_ins_hint'), route: '/incoming/insurance',                 count: counts.insurance,         required: false, badge: t('home_optional'), badgeColor: C_AMBER  },
      { label: t('nav_transfer'),                hint: t('home_s1_tr_hint'),  route: '/incoming/transfer',                  count: counts.transfer,          required: false, badge: t('home_optional'), badgeColor: C_AMBER  },
      { label: t('nav_languageCourseProviders'), hint: t('home_s1_lcp_hint'), route: '/incoming/language-course-providers', count: counts.langCourse,        required: false, badge: t('home_optional'), badgeColor: C_AMBER  },
      { label: t('nav_mobilityProviders'),       hint: t('home_s1_msp_hint'), route: '/incoming/mobility-providers',        count: counts.mobilityProviders, required: false, badge: t('home_optional'), badgeColor: C_AMBER  },
    ],
  }

  const travelStep: Step = {
    icon: '\u2708\uFE0F',
    title: t('home_s3_title'),
    desc: t('home_s3_desc'),
    color: C_INDIGO,
    tasks: [
      { label: t('nav_travel'), hint: t('home_s3_inc_hint'), route: '/incoming/travel', count: counts.travelIncoming, required: false, badge: t('home_incoming'), badgeColor: C_TEAL },
      { label: t('nav_travel'), hint: t('home_s3_out_hint'), route: '/outgoing/travel', count: counts.travelOutgoing, required: false, badge: t('home_outgoing'), badgeColor: C_BLUE },
    ],
  }

  const financialStep: Step = {
    icon: '\uD83D\uDCB6',
    title: t('home_s4_title'),
    desc: t('home_s4_desc'),
    color: C_GREEN,
    tasks: [
      { label: t('nav_financial'), hint: t('home_s4_inc_hint'), route: '/incoming/financial', count: counts.financialIncoming, required: false, badge: t('home_incoming'), badgeColor: C_TEAL },
      { label: t('nav_financial'), hint: t('home_s4_out_hint'), route: '/outgoing/financial', count: counts.financialOutgoing, required: false, badge: t('home_outgoing'), badgeColor: C_BLUE },
    ],
  }

  const individualSteps: Step[] = [
    setupStep,
    {
      icon: '\uD83D\uDC64',
      title: t('home_s2i_title'),
      desc: t('home_s2i_desc'),
      color: C_BLUE,
      tasks: [
        { label: t('nav_individuals'), hint: t('home_s2i_inc_hint'), route: '/incoming/individuals', count: counts.incomingInd, required: true,  badge: t('home_incoming'), badgeColor: C_TEAL },
        { label: t('nav_individuals'), hint: t('home_s2i_out_hint'), route: '/outgoing/individuals', count: counts.outgoingInd, required: false, badge: t('home_outgoing'), badgeColor: C_BLUE },
      ],
    },
    travelStep,
    financialStep,
  ]

  const groupSteps: Step[] = [
    setupStep,
    {
      icon: '\uD83D\uDC65',
      title: t('home_s2g_title'),
      desc: t('home_s2g_desc'),
      color: C_PURPLE,
      tasks: [
        { label: t('nav_groups'), hint: t('home_s2g_inc_hint'), route: '/incoming/groups', count: counts.incomingGrp, required: true,  badge: t('home_incoming'), badgeColor: C_TEAL  },
        { label: t('nav_groups'), hint: t('home_s2g_out_hint'), route: '/outgoing/groups', count: counts.outgoingGrp, required: false, badge: t('home_outgoing'), badgeColor: C_BLUE  },
      ],
    },
    travelStep,
    financialStep,
  ]

  const steps = mode === 'individual' ? individualSteps : groupSteps

  const isStepDone = (s: Step) => {
    const req = s.tasks.filter(tk => tk.required)
    return req.length > 0 ? req.every(tk => tk.count > 0) : s.tasks.some(tk => tk.count > 0)
  }

  const completedSteps = steps.filter(isStepDone).length
  const step = steps[Math.min(currentStep, steps.length - 1)]

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>

  return (
    <div className="home-page">

      {/* Header */}
      <div className="home-header">
        <div>
          <h1 className="home-title">Home</h1>
          <p className="home-subtitle-text">{t('home_subtitle')}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
          📊 Dashboard
        </button>
      </div>

      {/* Mode tabs */}
      <div className="home-mode-tabs">
        <button
          className={`home-mode-tab${mode === 'individual' ? ' active' : ''}`}
          onClick={() => { setMode('individual'); setCurrentStep(0) }}
        >
          👤 {t('home_mode_individual')}
        </button>
        <button
          className={`home-mode-tab${mode === 'group' ? ' active' : ''}`}
          onClick={() => { setMode('group'); setCurrentStep(0) }}
        >
          👥 {t('home_mode_group')}
        </button>
      </div>

      {/* Flow indicator */}
      <div className="home-flow">
        {steps.map((s, i) => {
          const done = isStepDone(s)
          const active = i === currentStep
          return (
            <div key={i} className="home-flow-item">
              <button
                className="home-flow-step"
                onClick={() => setCurrentStep(i)}
                title={s.title}
              >
                <div
                  className="home-flow-circle"
                  style={{
                    background: done ? s.color : active ? s.color : '#E5E7EB',
                    color: (done || active) ? 'white' : '#9CA3AF',
                    boxShadow: active ? `0 0 0 4px ${s.color}30` : 'none',
                    transform: active ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span
                  className="home-flow-label"
                  style={{ color: (active || done) ? s.color : '#9CA3AF' }}
                >
                  {s.title}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className="home-flow-connector"
                  style={{ background: done ? s.color : '#E5E7EB' }}
                />
              )}
            </div>
          )
        })}
        <span className="home-flow-count" style={{ color: C_TEAL }}>
          {completedSteps}/{steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="home-progress-bar">
        <div
          className="home-progress-fill"
          style={{ width: `${Math.round((completedSteps / steps.length) * 100)}%` }}
        />
      </div>

      {/* Step card */}
      <div
        className="home-step-card"
        style={{ borderColor: `${step.color}25`, boxShadow: `0 4px 24px ${step.color}0f` }}
      >
        <div className="home-card-header">
          <div className="home-card-icon" style={{ background: `${step.color}18` }}>
            {step.icon}
          </div>
          <div className="home-card-heading">
            <div className="home-card-step-label" style={{ color: step.color }}>
              Step {currentStep + 1} / {steps.length}
              {isStepDone(step) && (
                <span className="home-done-badge">✓ {t('home_done')}</span>
              )}
            </div>
            <h2 className="home-card-title">{step.title}</h2>
          </div>
        </div>

        <p className="home-card-desc">{step.desc}</p>

        <div className="home-tasks">
          {step.tasks.map((task, ti) => {
            const hasBg = task.count > 0
            return (
              <div
                key={ti}
                className="home-task-row"
                style={{
                  borderColor: hasBg ? `${step.color}40` : '#E5E7EB',
                  background: hasBg ? `${step.color}08` : '#FAFAFA',
                }}
                onClick={() => navigate(task.route)}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = step.color
                  el.style.background = `${step.color}12`
                  el.style.transform = 'translateX(2px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = hasBg ? `${step.color}40` : '#E5E7EB'
                  el.style.background = hasBg ? `${step.color}08` : '#FAFAFA'
                  el.style.transform = 'translateX(0)'
                }}
              >
                <div
                  className="home-task-dot"
                  style={{
                    background: hasBg ? `${step.color}20` : task.required ? '#FEE2E2' : '#F3F4F6',
                    color: hasBg ? step.color : task.required ? '#EF4444' : '#D1D5DB',
                  }}
                >
                  {hasBg ? '✓' : task.required ? '!' : '○'}
                </div>

                <div className="home-task-info">
                  <div className="home-task-name">
                    <span>{task.label}</span>
                    {task.badge && (
                      <span
                        className="home-task-badge"
                        style={{ background: `${task.badgeColor}20`, color: task.badgeColor }}
                      >
                        {task.badge}
                      </span>
                    )}
                    {task.required && !hasBg && (
                      <span className="home-task-badge home-task-badge-req">
                        {t('home_required')}
                      </span>
                    )}
                  </div>
                  <span className="home-task-hint">{task.hint}</span>
                </div>

                <div className="home-task-action">
                  {hasBg ? (
                    <span className="home-task-count" style={{ color: step.color }}>
                      {task.count}
                    </span>
                  ) : (
                    <span
                      className="home-task-cta"
                      style={{ background: `${step.color}18`, color: step.color }}
                    >
                      {t('home_add_cta')} →
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="home-nav">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
          disabled={currentStep === 0}
        >
          ← {t('home_btn_prev')}
        </button>

        <div className="home-dots">
          {steps.map((_s, i) => (
            <button
              key={i}
              className="home-dot"
              onClick={() => setCurrentStep(i)}
              style={{
                width: i === currentStep ? 22 : 8,
                background: i === currentStep
                  ? step.color
                  : isStepDone(steps[i]) ? `${steps[i].color}80` : '#D1D5DB',
              }}
            />
          ))}
        </div>

        {currentStep < steps.length - 1 ? (
          <button className="btn btn-accent" onClick={() => setCurrentStep(s => s + 1)}>
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
