-- Create document_templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage templates"
  ON document_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for document templates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'document-templates',
  'document-templates',
  false,
  10485760,
  ARRAY['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for authenticated users
CREATE POLICY "Authenticated users can upload templates"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'document-templates');

CREATE POLICY "Authenticated users can read templates"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'document-templates');

CREATE POLICY "Authenticated users can delete templates"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'document-templates');
