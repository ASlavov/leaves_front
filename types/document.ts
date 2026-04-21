export type DocumentSourceType = 'google_doc' | 'sharepoint' | 'file';
export type DocumentTargetType = 'all' | 'user';

export interface DocumentTargetUser {
  id: number;
  name: string;
  profile_image_base64: string | null;
}

export interface CompanyDocument {
  id: number;
  title: string;
  description: string | null;
  source_type: DocumentSourceType;
  url: string | null;
  original_filename: string | null;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: number;
  uploader?: DocumentTargetUser;
  target_type: DocumentTargetType;
  target_user_id: number | null;
  target_user?: DocumentTargetUser | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentPayload {
  title: string;
  description?: string;
  source_type: DocumentSourceType;
  url?: string;
  file_base64?: string;
  original_filename?: string;
  mime_type?: string;
  target_type: DocumentTargetType;
  target_user_id?: number | null;
}
