import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'
import type { Participant } from '../types'
import { flattenParticipant } from './templateVariables'

/**
 * Turn a docxtemplater error (or any error) into a readable, user-facing message.
 * docxtemplater throws a multi-error whose `.properties.errors` lists each bad tag.
 */
export function describeTemplateError(error: any): string {
  const errs = error?.properties?.errors
  if (Array.isArray(errs) && errs.length) {
    const details = errs
      .map((e: any) => {
        const p = e?.properties || {}
        const tag = p.xtag ? `{${p.xtag}}` : ''
        return [p.explanation || e?.message, tag].filter(Boolean).join(' ')
      })
      .filter(Boolean)
    // De-duplicate identical explanations
    return [...new Set(details)].join('\n')
  }
  return error?.message || String(error)
}

/**
 * Generate a filled .docx from a template ArrayBuffer and participant data.
 * Returns the output Blob. Throws an Error with a readable message if the
 * template is malformed (e.g. an unclosed or mistyped {tag}).
 */
export function generateDocument(
  templateBuffer: ArrayBuffer,
  data: Record<string, string>,
): Blob {
  let zip: PizZip
  try {
    zip = new PizZip(templateBuffer)
  } catch {
    throw new Error('The uploaded file is not a valid .docx document.')
  }
  let doc: Docxtemplater
  try {
    doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // Don't throw on unknown tags — just leave them blank
      nullGetter: () => '',
    })
  } catch (error) {
    throw new Error(describeTemplateError(error))
  }
  try {
    doc.render(data)
  } catch (error) {
    throw new Error(describeTemplateError(error))
  }
  const out = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  return out
}

/**
 * Generate and download a single document for one participant.
 */
export function generateAndDownload(
  templateBuffer: ArrayBuffer,
  participant: Participant,
  templateName: string,
): void {
  const data = flattenParticipant(participant)
  const blob = generateDocument(templateBuffer, data)
  const fileName = `${templateName}_${participant.surname || 'unknown'}_${participant.name || ''}.docx`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
  saveAs(blob, fileName)
}

/**
 * Generate documents for multiple participants and download as a ZIP.
 */
export async function generateBatchAndDownloadAsync(
  templateBuffer: ArrayBuffer,
  participants: Participant[],
  templateName: string,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const zipOut = new PizZip()

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i]
    const data = flattenParticipant(p)
    const blob = generateDocument(templateBuffer, data)
    const fileName = `${templateName}_${p.surname || 'unknown'}_${p.name || ''}.docx`
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '')

    // Read blob as ArrayBuffer
    const ab = await blob.arrayBuffer()
    zipOut.file(fileName, ab)

    if (onProgress) onProgress(i + 1, participants.length)
  }

  const zipBlob = zipOut.generate({
    type: 'blob',
    mimeType: 'application/zip',
  })
  const zipName = `${templateName}_batch_${participants.length}.zip`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
  saveAs(zipBlob, zipName)
}
