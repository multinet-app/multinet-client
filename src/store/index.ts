import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { createDirectStore } from 'direct-vuex';

import api from '@/api';
import { WorkspaceSpec } from '@/types';

Vue.use(Vuex);

interface State {
  workspaces: string[];
  currentWorkspace: WorkspaceSpec | null;
}

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext,
} = createDirectStore({
  state: {
    workspaces: [],
    currentWorkspace: null,
  } as State,
  getters: {
    nodeTables(state: State): string[] {
      if (state.currentWorkspace !== null && state.currentWorkspace.nodeTables) {
        return state.currentWorkspace.nodeTables;
      }
      return [];
    },
    edgeTables(state: State): string[] {
      if (state.currentWorkspace !== null && state.currentWorkspace.edgeTables) {
        return state.currentWorkspace.edgeTables;
      }
      return [];
    },
    graphs(state: State) {
      if (state.currentWorkspace !== null && state.currentWorkspace.graphs) {
        return state.currentWorkspace.graphs;
      }
      return [];
    },
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
      commit.setCurrentWorkspace({ name: workspace, nodeTables: [], edgeTables: [], graphs: [] });

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
