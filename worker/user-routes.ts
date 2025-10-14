import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, DatasetEntity, AccessRequestEntity, AuditLogEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { CreateDatasetPayload, UserPayload } from "@shared/types";
// In a real app, you'd get this from the auth context
const MOCK_CURRENT_USER_ID = 'user-4'; // Diana (Viewer)
const MOCK_ADMIN_USER_ID = 'user-1'; // Alice (Admin)
async function createAuditLog(env: Env, userId: string, action: string, entity: 'Dataset' | 'User' | 'Request' | 'File', entityId: string, details: object) {
  await AuditLogEntity.create(env, {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    userId,
    action,
    entity,
    entityId,
    details,
  });
}
export function userRoutes(app: Hono<{Bindings: Env;}>) {
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      UserEntity.ensureSeed(c.env),
      DatasetEntity.ensureSeed(c.env)
    ]);
    await next();
  });
  // DATASET ROUTES
  app.get('/api/datasets', async (c) => {
    const page = await DatasetEntity.list(c.env);
    return ok(c, page.items);
  });
  app.get('/api/datasets/:id', async (c) => {
    const { id } = c.req.param();
    const dataset = new DatasetEntity(c.env, id);
    if (!(await dataset.exists())) return notFound(c, 'Dataset not found');
    return ok(c, await dataset.getState());
  });
  app.post('/api/datasets', async (c) => {
    const body = await c.req.json<CreateDatasetPayload>();
    if (!body.title || !body.description) return bad(c, 'Title and description are required');
    const newDataset = {
      id: crypto.randomUUID(),
      ...body,
      ownerId: 'user-2', // Mock owner
      contributorIds: [],
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const created = await DatasetEntity.create(c.env, newDataset);
    await createAuditLog(c.env, MOCK_ADMIN_USER_ID, 'dataset_create', 'Dataset', created.id, { title: created.title });
    return ok(c, created);
  });
  app.put('/api/datasets/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<CreateDatasetPayload>>();
    const dataset = new DatasetEntity(c.env, id);
    if (!(await dataset.exists())) return notFound(c, 'Dataset not found');
    await dataset.mutate((current) => ({
      ...current,
      ...body,
      metadata: { ...current.metadata, ...body.metadata },
      updatedAt: new Date().toISOString()
    }));
    const updated = await dataset.getState();
    await createAuditLog(c.env, MOCK_ADMIN_USER_ID, 'dataset_update', 'Dataset', id, { changes: Object.keys(body) });
    return ok(c, updated);
  });
  app.get('/api/datasets/:id/download', async (c) => {
    const { id } = c.req.param();
    const dataset = new DatasetEntity(c.env, id);
    if (!(await dataset.exists())) return notFound(c, 'Dataset not found');
    await createAuditLog(c.env, MOCK_CURRENT_USER_ID, 'file_download', 'File', id, { datasetId: id });
    return ok(c, { url: `/mock-download/${id}.zip` });
  });
  // ACCESS REQUEST ROUTES
  app.post('/api/datasets/:id/request-access', async (c) => {
    const { id: datasetId } = c.req.param();
    const { purpose, organization } = await c.req.json<{purpose: string;organization: string;}>();
    if (!purpose || !organization) return bad(c, 'Purpose and organization are required');
    const newRequest = {
      id: crypto.randomUUID(),
      datasetId,
      requestorId: MOCK_CURRENT_USER_ID,
      status: 'Pending' as const,
      purpose,
      organization,
      createdAt: Date.now()
    };
    const created = await AccessRequestEntity.create(c.env, newRequest);
    await createAuditLog(c.env, created.requestorId, 'access_request_create', 'Request', created.id, { datasetId });
    return ok(c, { message: 'Request submitted successfully' });
  });
  app.get('/api/access-requests', async (c) => {
    const { items } = await AccessRequestEntity.list(c.env);
    const pending = items.filter((r) => r.status === 'Pending');
    const users = await UserEntity.list(c.env);
    const usersById = new Map(users.items.map((u) => [u.id, u]));
    const populatedRequests = pending.map((r) => ({ ...r, requestor: usersById.get(r.requestorId) }));
    return ok(c, populatedRequests);
  });
  app.get('/api/my-requests', async (c) => {
    const { items } = await AccessRequestEntity.list(c.env);
    const myRequests = items.filter((r) => r.requestorId === MOCK_CURRENT_USER_ID);
    const datasets = await DatasetEntity.list(c.env);
    const datasetsById = new Map(datasets.items.map((d) => [d.id, d]));
    const populatedRequests = myRequests.map((r) => ({ ...r, dataset: datasetsById.get(r.datasetId) }));
    return ok(c, populatedRequests);
  });
  app.post('/api/access-requests/:reqId/approve', async (c) => {
    const { reqId } = c.req.param();
    const request = new AccessRequestEntity(c.env, reqId);
    if (!(await request.exists())) return notFound(c, 'Request not found');
    await request.patch({ status: 'Approved' });
    await createAuditLog(c.env, MOCK_ADMIN_USER_ID, 'access_request_approve', 'Request', reqId, {});
    return ok(c, { message: 'Request approved' });
  });
  app.post('/api/access-requests/:reqId/deny', async (c) => {
    const { reqId } = c.req.param();
    const request = new AccessRequestEntity(c.env, reqId);
    if (!(await request.exists())) return notFound(c, 'Request not found');
    await request.patch({ status: 'Denied' });
    await createAuditLog(c.env, MOCK_ADMIN_USER_ID, 'access_request_deny', 'Request', reqId, {});
    return ok(c, { message: 'Request denied' });
  });
  // USER MANAGEMENT ROUTES
  app.get('/api/users', async (c) => {
    const page = await UserEntity.list(c.env);
    return ok(c, page.items);
  });
  app.post('/api/users', async (c) => {
    const body = await c.req.json<UserPayload>();
    if (!body.name || !body.email || !body.role) return bad(c, 'Name, email, and role are required');
    const newUser = { id: crypto.randomUUID(), ...body };
    const created = await UserEntity.create(c.env, newUser);
    await createAuditLog(c.env, MOCK_ADMIN_USER_ID, 'user_create', 'User', created.id, { email: created.email, role: created.role });
    return ok(c, created);
  });
  app.put('/api/users/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<UserPayload>();
    const user = new UserEntity(c.env, id);
    if (!(await user.exists())) return notFound(c, 'User not found');
    await user.patch(body);
    const updated = await user.getState();
    await createAuditLog(c.env, MOCK_ADMIN_USER_ID, 'user_update', 'User', id, { changes: Object.keys(body) });
    return ok(c, updated);
  });
  app.delete('/api/users/:id', async (c) => {
    const { id } = c.req.param();
    const existed = await UserEntity.delete(c.env, id);
    if (!existed) return notFound(c, 'User not found');
    await createAuditLog(c.env, MOCK_ADMIN_USER_ID, 'user_delete', 'User', id, {});
    return ok(c, { message: 'User deleted' });
  });
  // AUDIT LOG ROUTES
  app.get('/api/audit-logs', async (c) => {
    const { items } = await AuditLogEntity.list(c.env);
    const users = await UserEntity.list(c.env);
    const usersById = new Map(users.items.map((u) => [u.id, u]));
    const populatedLogs = items.map((log) => ({ ...log, user: usersById.get(log.userId) }));
    // sort descending by timestamp
    populatedLogs.sort((a, b) => b.timestamp - a.timestamp);
    return ok(c, populatedLogs);
  });
}