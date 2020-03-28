import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { createDirectStore } from 'direct-vuex';

import api from '@/api';

Vue.use(Vuex);

interface WorkspaceSpec {
  name: string;
  nodeTables?: string[];
  edgeTables?: string[];
  graphs?: string[];
}

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext,
} = createDirectStore({
  state: {
    workspaces: [] as string[],
    currentWorkspace: null as WorkspaceSpec | null,
  },
  mutations: {
    setWorkspaces(state, workspaces: string[]) {
      state.workspaces = workspaces;
    },
    setCurrentWorkspace(state, workspace: WorkspaceSpec) {
      state.currentWorkspace = workspace;
    },
  },
  actions: {
    async fetchWorkspaces(context) {
      const { commit } = rootActionContext(context);
      const workspaces = await api.workspaces();
      commit.setWorkspaces(workspaces);
    },
    async fetchWorkspace(context, workspace: string) {
      const { commit } = rootActionContext(context);
      const nodeTables = await api.tables(workspace, { type: 'node' });
      const edgeTables = await api.tables(workspace, { type: 'edge' });
      const graphs = await api.graphs(workspace);

      commit.setCurrentWorkspace({ name: workspace, nodeTables, edgeTables, graphs });
    },
  },
});


export default store;
export {
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext,
};

export type AppStore = typeof store;
declare module 'vuex' {
  interface Store<S> {
    direct: AppStore;
  }
}
