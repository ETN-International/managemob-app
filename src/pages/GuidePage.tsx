import { useNavigate } from 'react-router-dom'
import { useT } from '../lib/i18n'

export default function GuidePage() {
  const { t } = useT()
  const navigate = useNavigate()

  return (
    <div className="page-container" style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
            {'\u2190'} Home
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/manual')}>
            {t('nav_manual')}
          </button>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          {t('guide_page_title')}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          {t('guide_page_intro')}
        </p>

        {/* What is Managemob */}
        <div className="tg-section">
          <h2 className="tg-section-title">{t('guide_what_title')}</h2>
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 16 }}>
            {t('guide_what_desc')}
          </p>
          <div className="tg-steps">
            <div className="tg-step">
              <div className="tg-step-num" style={{ background: '#dbeafe', color: '#1D72B8' }}>{'\u{1F465}'}</div>
              <div>
                <div className="tg-step-title">{t('guide_concept_participants')}</div>
                <div className="tg-step-desc">{t('guide_concept_participants_desc')}</div>
              </div>
            </div>
            <div className="tg-step">
              <div className="tg-step-num" style={{ background: '#ede9fe', color: '#8B5CF6' }}>{'\u{1F3E2}'}</div>
              <div>
                <div className="tg-step-title">{t('guide_concept_providers')}</div>
                <div className="tg-step-desc">{t('guide_concept_providers_desc')}</div>
              </div>
            </div>
            <div className="tg-step">
              <div className="tg-step-num" style={{ background: '#d1fae5', color: '#10B981' }}>{'\u{1F517}'}</div>
              <div>
                <div className="tg-step-title">{t('guide_concept_services')}</div>
                <div className="tg-step-desc">{t('guide_concept_services_desc')}</div>
              </div>
            </div>
            <div className="tg-step">
              <div className="tg-step-num" style={{ background: '#fef3c7', color: '#D97706' }}>{'\u{1F4C4}'}</div>
              <div>
                <div className="tg-step-title">{t('guide_concept_documents')}</div>
                <div className="tg-step-desc">{t('guide_concept_documents_desc')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow */}
        <div className="tg-section">
          <h2 className="tg-section-title">{t('guide_workflow_title')}</h2>
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 16 }}>
            {t('guide_workflow_intro')}
          </p>
          <div className="tg-steps">
            {[
              { num: '1', color: '#F59E0B', bg: '#fef3c7', title: t('guide_wf1_title'), desc: t('guide_wf1_desc') },
              { num: '2', color: '#1D72B8', bg: '#dbeafe', title: t('guide_wf2_title'), desc: t('guide_wf2_desc') },
              { num: '3', color: '#10B981', bg: '#d1fae5', title: t('guide_wf3_title'), desc: t('guide_wf3_desc') },
              { num: '4', color: '#8B5CF6', bg: '#ede9fe', title: t('guide_wf4_title'), desc: t('guide_wf4_desc') },
              { num: '5', color: '#2D7A6F', bg: '#f0fdf4', title: t('guide_wf5_title'), desc: t('guide_wf5_desc') },
            ].map((step, i) => (
              <div key={i} className="tg-step">
                <div className="tg-step-num" style={{ background: step.bg, color: step.color }}>{step.num}</div>
                <div>
                  <div className="tg-step-title">{step.title}</div>
                  <div className="tg-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual vs Group */}
        <div className="tg-section">
          <h2 className="tg-section-title">{t('guide_indiv_group_title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{'\u{1F464}'}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2D7A6F', marginBottom: 4 }}>Individual</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t('guide_individual_desc')}</div>
            </div>
            <div style={{ background: '#f5f3ff', border: '2px solid #ddd6fe', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{'\u{1F465}'}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#8B5CF6', marginBottom: 4 }}>Group</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t('guide_group_desc')}</div>
            </div>
          </div>
          <div className="tg-rule" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <span className="tg-rule-icon">{'\u{1F4A1}'}</span>
            <div style={{ fontSize: 13, color: '#92400e' }}>{t('guide_group_tip')}</div>
          </div>
        </div>

        {/* App sections */}
        <div className="tg-section">
          <h2 className="tg-section-title">{t('guide_sections_title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '\u{1F3E0}', name: 'Home', desc: t('guide_sec_home') },
              { icon: '\u{1F4CA}', name: 'Dashboard', desc: t('guide_sec_dashboard') },
              { icon: '\u{1F4C5}', name: t('nav_calendar'), desc: t('guide_sec_calendar') },
              { icon: '\u{1F4C4}', name: t('nav_documents'), desc: t('guide_sec_documents') },
              { icon: '\u{1F465}', name: t('nav_individuals'), desc: t('guide_sec_participants') },
              { icon: '\u{2708}\uFE0F', name: t('page_travel'), desc: t('guide_sec_travel') },
              { icon: '\u{1F4B0}', name: t('page_financial'), desc: t('guide_sec_financial') },
              { icon: '\u{1F3E2}', name: t('guide_sec_providers_name'), desc: t('guide_sec_providers') },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="tg-section" style={{ marginBottom: 48 }}>
          <h2 className="tg-section-title">{t('guide_tips_title')}</h2>
          <div className="tg-rules">
            {[
              t('guide_best_tip1'),
              t('guide_best_tip2'),
              t('guide_best_tip3'),
              t('guide_best_tip4'),
              t('guide_best_tip5'),
            ].map((tip, i) => (
              <div key={i} className="tg-rule">
                <span className="tg-rule-icon">{'\u{1F4A1}'}</span>
                <div>{tip}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
