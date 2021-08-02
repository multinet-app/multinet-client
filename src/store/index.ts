import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import { UserSpec } from 'multinet';

import api from '@/api';
import oauthClient from '@/oauth';

Vue.use(Vuex);

export interface WorkspaceState {
  name: string;
  nodeTables: string[];
  edgeTables: string[];
  graphs: string[];
}

export interface State {
  workspaces: string[];
  currentWorkspace: WorkspaceState | null;
  userInfo: UserSpec | null;
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
    userInfo: null,
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

    setCurrentWorkspace(state, workspace: WorkspaceState) {
      state.currentWorkspace = workspace;
    },

    unsetCurrentWorkspace(state) {
      state.currentWorkspace = null;
    },

    setUserInfo(state, userInfo: UserSpec | null) {
      state.userInfo = userInfo;
    },
  },
  actions: {
    async fetchWorkspaces(context) {
      const { commit } = rootActionContext(context);
      const workspaces = await api.workspaces();
      commit.setWorkspaces(workspaces.results.map((w) => w.name));
    },

    async fetchWorkspace(context, workspace: string) {
      const { commit } = rootActionContext(context);
      commit.unsetCurrentWorkspace();

      const graphs = await api.graphs(workspace);
      const tables = (await api.tables(workspace)).results;
      const nodeTables = tables.filter((table) => table.edge === false);
      const edgeTables = tables.filter((table) => table.edge === true);

      commit.setCurrentWorkspace({
        name: workspace,
        nodeTables: nodeTables.map((table) => table.name),
        edgeTables: edgeTables.map((table) => table.name),
        graphs: graphs.results.map((graph) => graph.name),
      });
    },

    async fetchUserInfo(context) {
      const { commit } = rootActionContext(context);

      try {
        const info = await api.userInfo();
        commit.setUserInfo(info);
      } catch (error) {
        if (error.response.status === 401) {
          commit.setUserInfo(null);
        } else {
          throw new Error(error);
        }
      }
    },

    async logout(context) {
      const { commit, dispatch } = rootActionContext(context);

      // Perform the server logout.
      await oauthClient.logout();
      commit.setUserInfo(null);

      // Refresh the workspace list to account for lost privileges upon logout.
      await dispatch.fetchWorkspaces();
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

// The following lines enable types in the injected store '$store'.
export type ApplicationStore = typeof store;
declare module 'vuex' {
  interface Store<S> {
    direct: ApplicationStore;
  }
}
