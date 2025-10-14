export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type Role = 'Admin' | 'Data Owner' | 'Contributor' | 'Viewer';
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
export interface Metadata {
  keywords: string[];
  categories: string[];
  publisher: string;
  contact_email: string;
  coverage_geographic: string;
  coverage_time: {
    start_date: string; // ISO 8601
    end_date: string;   // ISO 8601
  };
  methodology?: string;
  data_dictionary: string; // URL or inline JSON
  license: string; // SPDX id or text
  update_frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  version: string;
  data_quality_notes?: string;
}
export interface DatasetFile {
  name: string;
  url: string;
  type: 'CSV' | 'XLSX' | 'JSON';
}
export interface Dataset {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  contributorIds: string[];
  visibility: 'Public' | 'Private';
  metadata: Metadata;
  files: DatasetFile[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
export interface AccessRequest {
  id: string;
  datasetId: string;
  requestorId: string;
  status: 'Pending' | 'Approved' | 'Denied';
  purpose: string;
  organization?: string;
  expiresAt?: number; // timestamp
  createdAt: number; // timestamp
}
export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  entity: 'Dataset' | 'User' | 'Request' | 'File';
  entityId: string;
  details: object;
}
// PAYLOADS
export type CreateDatasetPayload = Omit<Dataset, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'contributorIds' | 'files'> & {
  metadata: Omit<Metadata, 'coverage_time'> & {
    coverage_time: { start_date: Date | string; end_date: Date | string };
  };
};
export type UserPayload = Omit<User, 'id'>;