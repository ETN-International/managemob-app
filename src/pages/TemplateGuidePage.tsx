import { useNavigate } from 'react-router-dom'
import { useT } from '../lib/i18n'
import { TEMPLATE_VARIABLES, TEMPLATE_CATEGORIES, CATEGORY_LABELS } from '../lib/templateVariables'

const EXAMPLES: Record<string, string> = {
  name: 'Mario', surname: 'Rossi', sex: 'Male', status: 'Student',
  date_of_birth: '1995-03-15', place_of_birth: 'Roma', nationality: 'Italian',
  email: 'mario.rossi@email.com', phone: '+39 333 1234567',
  arrival_date: '2026-03-15', departure_date: '2026-06-15',
  destination_city: 'Lecce', destination_country: 'Italy', program: 'Erasmus+',
  host_company_name: 'ABC Company', host_company_tutor: 'Maria Bianchi',
  sending_org_name: 'France Travail', grant_amount: '5,200.00',
  accommodation_1_name: 'Host Family Rossi',
}

export default function TemplateGuidePage() {
  const { t } = useT()
  const navigate = useNavigate()

  return (
    <div className="page-container" style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/documents')}>
            {'\u2190'} {t('nav_documents')}
          </button>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          {t('guide_title')}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          {t('guide_intro')}
        </p>

        {/* How it works */}
        <div className="tg-section">
          <h2 className="tg-section-title">{t('guide_how_title')}</h2>
          <div className="tg-steps">
            <div className="tg-step">
              <div className="tg-step-num" style={{ background: '#dbeafe', color: '#1D72B8' }}>1</div>
              <div>
                <div className="tg-step-title">{t('guide_step1_title')}</div>
                <div className="tg-step-desc">{t('guide_step1_desc')}</div>
              </div>
            </div>
            <div className="tg-step">
              <div className="tg-step-num" style={{ background: '#ede9fe', color: '#8B5CF6' }}>2</div>
              <div>
                <div className="tg-step-title">{t('guide_step2_title')}</div>
                <div className="tg-step-desc">{t('guide_step2_desc')}</div>
              </div>
            </div>
            <div className="tg-step">
              <div className="tg-step-num" style={{ background: '#d1fae5', color: '#10B981' }}>3</div>
              <div>
                <div className="tg-step-title">{t('guide_step3_title')}</div>
                <div className="tg-step-desc">{t('guide_step3_desc')}</div>
              </div>
            </div>
            <div className="tg-step">
              <div className="tg-step-num" style={{ background: '#fef3c7', color: '#D97706' }}>4</div>
              <div>
                <div className="tg-step-title">{t('guide_step4_title')}</div>
                <div className="tg-step-desc">{t('guide_step4_desc')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="tg-section">
          <h2 className="tg-section-title">{t('guide_rules_title')}</h2>
          <div className="tg-rules">
            <div className="tg-rule">
              <span className="tg-rule-icon" style={{ color: '#10B981' }}>{'\u2714'}</span>
              <div><code>{'{name}'}</code> {'\u2014'} {t('guide_rule_correct')}</div>
            </div>
            <div className="tg-rule">
              <span className="tg-rule-icon" style={{ color: '#EF4444' }}>{'\u2718'}</span>
              <div><code>{'{Name}'}</code>, <code>{'{ name }'}</code>, <code>{'{NAME}'}</code> {'\u2014'} {t('guide_rule_wrong')}</div>
            </div>
            <div className="tg-rule">
              <span className="tg-rule-icon" style={{ color: '#1D72B8' }}>{'\u{2139}\uFE0F'}</span>
              <div>{t('guide_rule_format')}</div>
            </div>
            <div className="tg-rule">
              <span className="tg-rule-icon" style={{ color: '#1D72B8' }}>{'\u{2139}\uFE0F'}</span>
              <div>{t('guide_rule_empty')}</div>
            </div>
          </div>
        </div>

        {/* Live example */}
        <div className="tg-section">
          <h2 className="tg-section-title">{t('guide_example_title')}</h2>
          <div className="tg-example-box">
            <div className="tg-example-label">{t('guide_example_template')}</div>
            <div className="tg-example-text">
              Gentile <code>{'{name}'}</code> <code>{'{surname}'}</code>,<br />
              confermiamo la Sua partecipazione al programma <code>{'{program}'}</code> dal <code>{'{arrival_date}'}</code> al <code>{'{departure_date}'}</code>.<br />
              Azienda ospitante: <code>{'{host_company_name}'}</code> {'\u2014'} Tutor: <code>{'{host_company_tutor}'}</code><br />
              Grant: {'\u20AC'} <code>{'{grant_amount}'}</code>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 20, color: 'var(--text-muted)' }}>{'\u2193'}</div>
          <div className="tg-example-box" style={{ borderColor: '#10B981', background: '#f0fdf4' }}>
            <div className="tg-example-label" style={{ color: '#10B981' }}>{t('guide_example_result')}</div>
            <div className="tg-example-text">
              Gentile <strong>Mario</strong> <strong>Rossi</strong>,<br />
              confermiamo la Sua partecipazione al programma <strong>Erasmus+</strong> dal <strong>2026-03-15</strong> al <strong>2026-06-15</strong>.<br />
              Azienda ospitante: <strong>ABC Company</strong> {'\u2014'} Tutor: <strong>Maria Bianchi</strong><br />
              Grant: {'\u20AC'} <strong>5,200.00</strong>
            </div>
          </div>
        </div>

        {/* Europass example */}
        <div className="tg-section">
          <h2 className="tg-section-title">{t('guide_europass_title')}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{t('guide_europass_desc')}</p>
          <table className="data-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>{t('guide_col_original')}</th>
                <th>{t('guide_col_replace')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['[Prénom(s)] [Nom(s)]', '{name} {surname}'],
                ['[JJ/MM/AAAA – JJ/MM/AAAA]', '{arrival_date} – {departure_date}'],
                ['Remplacer par du texte (organisme d\'accueil)', '{host_company_name}'],
                ['Remplacer par du texte (pays et ville)', '{destination_city}, {destination_country}'],
                ['Remplacer par le mail / téléphone', '{host_company_tutor_email} / {host_company_tutor_phone}'],
                ['Remplacer par du texte (nom complet)', '{name} {surname}'],
                ['Remplacer par du texte (mail participant)', '{email}'],
                ['Remplacer par un numéro (téléphone)', '{phone}'],
                ['Remplacer par du texte (tuteur)', '{host_company_tutor}'],
                ['Remplacer par du texte (organisme d\'envoi)', '{sending_org_name}'],
              ].map(([from, to], i) => (
                <tr key={i}>
                  <td style={{ color: '#9CA3AF' }}>{from}</td>
                  <td><code style={{ background: '#ede9fe', color: '#5B21B6', padding: '2px 6px', borderRadius: 4 }}>{to}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Full tag reference */}
        <div className="tg-section">
          <h2 className="tg-section-title">{t('guide_tags_title')}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{t('guide_tags_desc')}</p>

          {TEMPLATE_CATEGORIES.map(cat => {
            const vars = TEMPLATE_VARIABLES.filter(v => v.category === cat)
            if (vars.length === 0) return null
            return (
              <div key={cat} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {CATEGORY_LABELS[cat]}
                </h3>
                <table className="data-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Tag</th>
                      <th>{t('guide_col_desc')}</th>
                      <th>{t('guide_example_title')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vars.map(v => (
                      <tr key={v.tag}>
                        <td>
                          <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                            {`{${v.tag}}`}
                          </code>
                        </td>
                        <td>{v.label}</td>
                        <td style={{ color: '#6B7280', fontStyle: 'italic' }}>{EXAMPLES[v.tag] || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>

        {/* Tips */}
        <div className="tg-section" style={{ marginBottom: 48 }}>
          <h2 className="tg-section-title">{t('guide_tips_title')}</h2>
          <div className="tg-rules">
            <div className="tg-rule">
              <span className="tg-rule-icon">{'\u{1F4A1}'}</span>
              <div>{t('guide_tip_test')}</div>
            </div>
            <div className="tg-rule">
              <span className="tg-rule-icon">{'\u{1F4A1}'}</span>
              <div>{t('guide_tip_combine')}</div>
            </div>
            <div className="tg-rule">
              <span className="tg-rule-icon">{'\u{1F4A1}'}</span>
              <div>{t('guide_tip_check')}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
