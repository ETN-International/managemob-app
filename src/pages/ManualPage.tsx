import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../lib/i18n'
import { exportPageToPdf, exportPageToWord } from '../lib/exportPage'

interface Section {
  id: string
  icon: string
  title: string
  content: string[]
}

export default function ManualPage() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const contentRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const handlePdf = async () => {
    if (!contentRef.current) return
    setExporting(true)
    try { await exportPageToPdf(contentRef.current, `Managemob_Manual_${lang.toUpperCase()}.pdf`) }
    finally { setExporting(false) }
  }

  const handleWord = () => {
    if (!contentRef.current) return
    exportPageToWord(contentRef.current, `Managemob_Manual_${lang.toUpperCase()}.doc`)
  }

  const sections: Section[] = [
    {
      id: 'login',
      icon: '\u{1F511}',
      title: t('manual_login_title'),
      content: [t('manual_login_1'), t('manual_login_2')],
    },
    {
      id: 'home',
      icon: '\u{1F3E0}',
      title: t('manual_home_title'),
      content: [t('manual_home_1'), t('manual_home_2'), t('manual_home_3'), t('manual_home_4')],
    },
    {
      id: 'add-participant',
      icon: '\u{1F464}',
      title: t('manual_add_part_title'),
      content: [t('manual_add_part_1'), t('manual_add_part_2'), t('manual_add_part_3'), t('manual_add_part_4')],
    },
    {
      id: 'add-group',
      icon: '\u{1F465}',
      title: t('manual_add_group_title'),
      content: [t('manual_add_group_1'), t('manual_add_group_2'), t('manual_add_group_3')],
    },
    {
      id: 'providers',
      icon: '\u{1F3E2}',
      title: t('manual_providers_title'),
      content: [t('manual_providers_1'), t('manual_providers_2'), t('manual_providers_3')],
    },
    {
      id: 'services',
      icon: '\u{1F517}',
      title: t('manual_services_title'),
      content: [t('manual_services_1'), t('manual_services_2'), t('manual_services_3')],
    },
    {
      id: 'participants-list',
      icon: '\u{1F4CB}',
      title: t('manual_list_title'),
      content: [t('manual_list_1'), t('manual_list_2'), t('manual_list_3'), t('manual_list_4')],
    },
    {
      id: 'edit-participant',
      icon: '\u{270F}\uFE0F',
      title: t('manual_edit_title'),
      content: [t('manual_edit_1'), t('manual_edit_2'), t('manual_edit_3')],
    },
    {
      id: 'calendar',
      icon: '\u{1F4C5}',
      title: t('manual_calendar_title'),
      content: [t('manual_calendar_1'), t('manual_calendar_2'), t('manual_calendar_3'), t('manual_calendar_4')],
    },
    {
      id: 'travel',
      icon: '\u{2708}\uFE0F',
      title: t('manual_travel_title'),
      content: [t('manual_travel_1'), t('manual_travel_2'), t('manual_travel_3')],
    },
    {
      id: 'financial',
      icon: '\u{1F4B0}',
      title: t('manual_financial_title'),
      content: [t('manual_financial_1'), t('manual_financial_2'), t('manual_financial_3')],
    },
    {
      id: 'documents',
      icon: '\u{1F4C4}',
      title: t('manual_documents_title'),
      content: [t('manual_documents_1'), t('manual_documents_2'), t('manual_documents_3'), t('manual_documents_4')],
    },
    {
      id: 'dashboard',
      icon: '\u{1F4CA}',
      title: t('manual_dashboard_title'),
      content: [t('manual_dashboard_1'), t('manual_dashboard_2')],
    },
  ]

  return (
    <div className="page-container" style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
            {'\u2190'} Home
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/guide')}>
            {t('nav_guide')}
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              disabled={exporting}
              onClick={handlePdf}
              style={{ padding: '6px 16px', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#e53935', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, opacity: exporting ? 0.6 : 1 }}
            >
              {exporting ? '\u23F3' : '\u{1F4C4}'} PDF
            </button>
            <button
              onClick={handleWord}
              style={{ padding: '6px 16px', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#1565c0', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {'\u{1F4C4}'} Word
            </button>
          </div>
        </div>

        <div ref={contentRef}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          {t('manual_page_title')}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
          {t('manual_page_intro')}
        </p>

        {/* TOC */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '16px 20px', marginBottom: 32,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            {t('manual_toc')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', padding: '3px 0', display: 'flex', gap: 6, alignItems: 'center' }}
              >
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, width: 20 }}>{i + 1}.</span>
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, idx) => (
          <div key={section.id} id={section.id} className="tg-section">
            <h2 className="tg-section-title">
              <span style={{ marginRight: 8 }}>{section.icon}</span>
              {idx + 1}. {section.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.content.map((step, i) => (
                <div key={i} className="tg-step">
                  <div className="tg-step-num" style={{ background: '#f0f4f8', color: 'var(--teal)', width: 28, height: 28, fontSize: 13 }}>
                    {i + 1}
                  </div>
                  <div className="tg-step-desc" style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ height: 48 }} />
        </div>{/* end contentRef */}
      </div>
    </div>
  )
}
