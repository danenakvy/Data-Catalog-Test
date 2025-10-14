import { IndexedEntity } from "./core-utils";
import type { User, Dataset, AccessRequest, AuditLog } from "@shared/types";
import { MOCK_USERS, MOCK_DATASETS } from "@shared/mock-data";
// USER ENTITY
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", email: "", role: "Viewer" };
  static seedData = MOCK_USERS;
}
// DATASET ENTITY
export class DatasetEntity extends IndexedEntity<Dataset> {
  static readonly entityName = "dataset";
  static readonly indexName = "datasets";
  static readonly initialState: Dataset = {
    id: '',
    title: '',
    description: '',
    ownerId: '',
    contributorIds: [],
    visibility: 'Private',
    metadata: {
      keywords: [],
      categories: [],
      publisher: '',
      contact_email: '',
      coverage_geographic: '',
      coverage_time: { start_date: '', end_date: '' },
      license: '',
      update_frequency: 'one-time',
      version: '1.0.0',
      data_dictionary: '',
    },
    files: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  static seedData = MOCK_DATASETS;
}
// ACCESS REQUEST ENTITY
export class AccessRequestEntity extends IndexedEntity<AccessRequest> {
  static readonly entityName = "accessRequest";
  static readonly indexName = "accessRequests";
  static readonly initialState: AccessRequest = {
    id: '',
    datasetId: '',
    requestorId: '',
    status: 'Pending',
    purpose: '',
    createdAt: 0,
  };
}
// AUDIT LOG ENTITY
export class AuditLogEntity extends IndexedEntity<AuditLog> {
  static readonly entityName = "auditLog";
  static readonly indexName = "auditLogs";
  static readonly initialState: AuditLog = {
    id: '',
    timestamp: 0,
    userId: '',
    action: '',
    entity: 'Dataset',
    entityId: '',
    details: {},
  };
  static seedData = [];
}