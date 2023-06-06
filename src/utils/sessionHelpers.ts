import api from '@/api';
import store from '@/store';
import type { App } from '@/types';
import type { Network, Table } from 'multinet';

export async function visualizeWithNewSession(item: Network | Table, app: App, type: 'network' | 'table', workspace: string) {
  const session = await api.createSession(item.id, type, app.name, new Date().toISOString());
  window.open(`${app.url}/?workspace=${workspace}&${type}=${item.name}&sessionId=${session.id}`, '_blank');
  await store.dispatch.fetchWorkspace(workspace);
}

export async function visualizeWithExistingSession(item: Network | Table, app: App, type: 'network' | 'table', workspace: string, sessionId: string) {
  window.open(`${app.url}/?workspace=${workspace}&${type}=${item.name}&sessionId=${sessionId}`, '_blank');
}

export async function deleteSession(sessionId: string, type: 'network' | 'table') {
  await api.deleteSession(sessionId, type);
}
