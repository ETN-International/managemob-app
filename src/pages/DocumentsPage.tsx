import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import type { Participant } from '../types'
import { TEMPLATE_VARIABLES, TEMPLATE_CATEGORIES, CATEGORY_LABELS, flattenParticipant } from '../lib/templateVariables'
import { generateDocument, generateBatchAndDownloadAsync } from '../lib/docxGenerator'
import { saveAs } from 'file-saver'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocTemplate {
  id: string
  name: string
  file_name: string
  storage_path: string
  description: string | null
  created_at: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { t } = useT()
  const navigate = useNavigate()

  // Template state
  const [templates, setTemplates] = useState<DocTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  // Participant state
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set())
  const [participantSearch, setParticipantSearch] = useState('')

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)

  // Upload state
  const [showUpload, setShowUpload] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Placeholder reference collapse
  const [showPlaceholders, setShowPlaceholders] = useState(false)

  // ─── Data Loading ─────────────────────────────────────────────────────────

  async function loadTemplates() {
    const { data } = await supabase
      .from('document_templates')
      .select('*')
      .order('name')
    if (data) setTemplates(data)
  }

  async function loadParticipants() {
    const { data } = await supabase
      .from('participants')
      .select('*, sending_organisations(id,name), host_companies(id,name,city,sector,tutor,tutor_phone,tutor_email), insurance_providers(id,name), transfer_providers(id,name), language_course_providers(id,name), mobility_service_providers(id,name), accommodation_1:accommodation!participants_accommodation_1_id_fkey(id,name,typology,city), accommodation_2:accommodation!participants_accommodation_2_id_fkey(id,name,typology,city)')
      .order('surname')
    if (data) setParticipants(data as Participant[])
  }

  useEffect(() => {
    Promise.all([loadTemplates(), loadParticipants()]).finally(() => setLoading(false))
  }, [])

  // ─── Upload Flow ──────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!uploadFile || !uploadName.trim()) return
    setUploading(true)
    try {
      const path = `templates/${crypto.randomUUID()}.docx`
      const { error: storageError } = await supabase.storage
        .from('document-templates')
        .upload(path, uploadFile)
      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('document_templates')
        .insert({
          name: uploadName.trim(),
          file_name: uploadFile.name,
          storage_path: path,
          description: uploadDesc.trim() || null,
        })
      if (dbError) throw dbError

      await loadTemplates()
      setShowUpload(false)
      setUploadName('')
      setUploadDesc('')
      setUploadFile(null)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Check console for details.')
    } finally {
      setUploading(false)
    }
  }

  // ─── Delete Flow ──────────────────────────────────────────────────────────

  async function handleDelete(tmpl: DocTemplate) {
    if (!confirm(t('doc_delete_confirm'))) return
    await supabase.storage.from('document-templates').remove([tmpl.storage_path])
    await supabase.from('document_templates').delete().eq('id', tmpl.id)
    if (selectedTemplate?.id === tmpl.id) setSelectedTemplate(null)
    await loadTemplates()
  }

  // ─── Generate Flow ────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!selectedTemplate || selectedParticipants.size === 0) return
    setGenerating(true)
    setProgress(null)

    try {
      const { data } = await supabase.storage
        .from('document-templates')
        .download(selectedTemplate.storage_path)
      if (!data) throw new Error('Failed to download template')
      const buffer = await data.arrayBuffer()

      const selected = participants.filter(p => selectedParticipants.has(p.id))

      if (selected.length === 1) {
        const docData = flattenParticipant(selected[0])
        const blob = generateDocument(buffer, docData)
        const fileName = `${selectedTemplate.name}_${selected[0].surname || 'unknown'}_${selected[0].name || ''}.docx`
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9._-]/g, '')
        saveAs(blob, fileName)
      } else {
        await generateBatchAndDownloadAsync(buffer, selected, selectedTemplate.name, (current, total) => {
          setProgress({ current, total })
        })
      }
    } catch (err) {
      console.error('Generation failed:', err)
      alert('Generation failed. Check console for details.')
    } finally {
      setGenerating(false)
      setProgress(null)
    }
  }

  // ─── Participant helpers ──────────────────────────────────────────────────

  const filteredParticipants = participants.filter(p => {
    if (!participantSearch.trim()) return true
    const q = participantSearch.toLowerCase()
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.surname || '').toLowerCase().includes(q) ||
      (p.mobility_typology || '').toLowerCase().includes(q)
    )
  })

  function toggleParticipant(id: string) {
    setSelectedParticipants(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedParticipants(new Set(filteredParticipants.map(p => p.id)))
  }

  function clearAll() {
    setSelectedParticipants(new Set())
  }

  // ─── Export Placeholders ──────────────────────────────────────────────────

  function exportPlaceholders() {
    const header = 'Tag,Description,Category\n'
    const rows = TEMPLATE_VARIABLES.map(v =>
      `"{${v.tag}}","${v.label}","${CATEGORY_LABELS[v.category as keyof typeof CATEGORY_LABELS]}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, 'managemob_placeholders.csv')
  }

  // ─── Placeholder Reference ────────────────────────────────────────────────

  function renderPlaceholderReference() {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPlaceholders(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>{showPlaceholders ? '\u25BE' : '\u25B8'}</span>
            <span>{t('doc_placeholders')}</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportPlaceholders}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {t('doc_export_placeholders')}
          </button>
        </div>
        {showPlaceholders && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              {t('doc_placeholders_hint')}
            </p>
            {TEMPLATE_CATEGORIES.map(cat => {
              const vars = TEMPLATE_VARIABLES.filter(v => v.category === cat)
              if (vars.length === 0) return null
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--color-text-primary)' }}>
                    {CATEGORY_LABELS[cat]}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {vars.map(v => (
                      <span
                        key={v.tag}
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          backgroundColor: 'var(--color-bg-tertiary, #f0f0f0)',
                          fontSize: 12,
                          fontFamily: 'monospace',
                          color: 'var(--color-text-secondary)',
                        }}
                        title={v.label}
                      >
                        {`{${v.tag}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="page-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">{t('doc_title')}</h1>
            <p className="page-subtitle">{t('doc_subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/documents/guide')}>
              {t('guide_title')}
            </button>
            <button className="btn btn-accent" onClick={() => setShowUpload(true)}>
              {'\u{1F4C4}'} {t('doc_upload')}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left side: template list + placeholders */}
        <div style={{ width: selectedTemplate ? '40%' : '100%', borderRight: selectedTemplate ? '1px solid var(--color-border)' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.2s' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {templates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F4C2}'}</div>
                <p>{t('list_empty')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {templates.map(tmpl => (
                  <div
                    key={tmpl.id}
                    onClick={() => { setSelectedTemplate(tmpl); setSelectedParticipants(new Set()) }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 8,
                      border: selectedTemplate?.id === tmpl.id ? '2px solid var(--color-accent, #4f46e5)' : '1px solid var(--color-border)',
                      backgroundColor: selectedTemplate?.id === tmpl.id ? 'var(--color-bg-accent-light, #eef2ff)' : 'var(--color-bg-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{tmpl.name}</div>
                        {tmpl.description && (
                          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                            {tmpl.description}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary, #999)', marginTop: 6, display: 'flex', gap: 12 }}>
                          <span>{tmpl.file_name}</span>
                          {tmpl.created_at && (
                            <span>{new Date(tmpl.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={e => { e.stopPropagation(); handleDelete(tmpl) }}
                        title={t('btn_delete')}
                        style={{ marginLeft: 8, flexShrink: 0 }}
                      >
                        {'\u2715'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Placeholder Reference */}
            {renderPlaceholderReference()}
          </div>
        </div>

        {/* Right side: generation panel */}
        {selectedTemplate && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Template info */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{'\u{1F4C4}'}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{selectedTemplate.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                    {selectedTemplate.file_name}
                    {selectedTemplate.description && ` \u2014 ${selectedTemplate.description}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Participant selector */}
            <div style={{ padding: '16px 24px', flexShrink: 0 }}>
              <h3 className="hw-section-title" style={{ marginBottom: 12 }}>{t('doc_select_participants')}</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('list_search')}
                  value={participantSearch}
                  onChange={e => setParticipantSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary btn-sm" onClick={selectAll}>
                  {t('doc_generate_all')}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={clearAll}>
                  {'\u2715'}
                </button>
              </div>
              {selectedParticipants.size > 0 && (
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  {t('home_stats_total')}: {selectedParticipants.size}
                </div>
              )}
            </div>

            {/* Participant list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 16px' }}>
              {filteredParticipants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-secondary)' }}>
                  {t('doc_no_participants')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {filteredParticipants.map(p => (
                    <label
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        backgroundColor: selectedParticipants.has(p.id) ? 'var(--color-bg-accent-light, #eef2ff)' : 'transparent',
                        transition: 'background-color 0.1s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.has(p.id)}
                        onChange={() => toggleParticipant(p.id)}
                        style={{ flexShrink: 0 }}
                      />
                      <span style={{ fontWeight: 500, fontSize: 14 }}>
                        {p.surname} {p.name}
                      </span>
                      {p.mobility_typology && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: '1px 8px',
                            borderRadius: 10,
                            backgroundColor: p.mobility_typology === 'Incoming' ? '#dbeafe' : '#fef3c7',
                            color: p.mobility_typology === 'Incoming' ? '#1e40af' : '#92400e',
                          }}
                        >
                          {p.mobility_typology}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Generate button */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
              {progress && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{t('doc_generating')}</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--color-bg-tertiary, #e5e7eb)' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 3,
                        backgroundColor: 'var(--color-accent, #4f46e5)',
                        width: `${(progress.current / progress.total) * 100}%`,
                        transition: 'width 0.2s',
                      }}
                    />
                  </div>
                </div>
              )}
              <button
                className="btn btn-accent"
                style={{ width: '100%' }}
                disabled={selectedParticipants.size === 0 || generating}
                onClick={handleGenerate}
              >
                {generating ? (
                  <>
                    <span className="spinner-sm" style={{ marginRight: 8 }} />
                    {t('doc_generating')}
                  </>
                ) : (
                  <>
                    {t('doc_generate')} ({selectedParticipants.size})
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Default state: show hint when no template selected */}
        {!selectedTemplate && templates.length > 0 && (
          <div style={{ display: 'none' }}>
            {/* Placeholder reference is shown inline in the left panel */}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="hm-modal-overlay" onClick={() => !uploading && setShowUpload(false)}>
          <div className="hm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="hm-modal-header">
              <span className="hm-modal-header-icon">{'\u{1F4C4}'}</span>
              <h2 className="hm-modal-title">{t('doc_upload')}</h2>
              <button className="hm-modal-close" onClick={() => !uploading && setShowUpload(false)}>{'\u2715'}</button>
            </div>
            <div className="hm-modal-body">
              <div className="hm-field" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  {t('doc_name')} *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="hm-field" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  {t('doc_description')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={uploadDesc}
                  onChange={e => setUploadDesc(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="hm-field" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  File (.docx) *
                </label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  style={{ fontSize: 14 }}
                />
              </div>
            </div>
            <div className="hm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--color-border)' }}>
              <button className="btn btn-secondary" onClick={() => setShowUpload(false)} disabled={uploading}>
                {t('btn_cancel')}
              </button>
              <button
                className="btn btn-accent"
                onClick={handleUpload}
                disabled={uploading || !uploadName.trim() || !uploadFile}
              >
                {uploading ? t('btn_saving') : t('btn_save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
