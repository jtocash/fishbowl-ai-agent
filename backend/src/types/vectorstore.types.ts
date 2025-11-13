export interface VectorStoreFile {
  id: string;
  object: string;
  created_at: number;
  vector_store_id: string;
}

export interface ListFilesResponse {
  object: string;
  data: VectorStoreFile[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}

export interface OpenAIFileResponse {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  expires_at: number;
  filename: string;
  purpose: string;
}
