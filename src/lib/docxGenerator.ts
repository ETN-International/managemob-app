import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'
import type { Participant } from '../types'
import { flattenParticipant } from './templateVariables'

/**
 * Generate a filled .docx from a template ArrayBuffer and participant data.
 * Returns the output Blob.
 */
export function generateDocument(
  templateBuffer: ArrayBuffer,
  data: Record<string, string>,
): Blob {
  const zip = new PizZip(templateBuffer)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // Don't throw on unknown tags — just leave them blank
    nullGetter: () => '',
  })
  doc.render(data)
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
