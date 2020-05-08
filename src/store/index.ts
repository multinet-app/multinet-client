import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { createDirectStore } from 'direct-vuex';

import api, { getUserInfo, logout } from '@/api';
import { UserInfo } from '@/types';

Vue.use(Vuex);

export interface WorkspaceState {
  name: string;
  nodeTables: string[];
  edgeTables: string[];
  graphs: string[];
}

interface State {
  workspaces: string[];
  currentWorkspace: WorkspaceState | null;
  userInfo: UserInfo | null;
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

    setUserInfo(state, userInfo: UserInfo | null) {
      state.userInfo = userInfo;
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
      commit.unsetCurrentWorkspace();

      const nodeTables = await api.tables(workspace, { type: 'node' });
      const edgeTables = await api.tables(workspace, { type: 'edge' });
      const graphs = await api.graphs(workspace);

      commit.setCurrentWorkspace({
        name: workspace, nodeTables, edgeTables, graphs,
      });
    },

    async fetchUserInfo(context) {
      const { commit } = rootActionContext(context);

      const info = await getUserInfo();
      commit.setUserInfo(info);
    },

    async logout(context) {
      const { commit } = rootActionContext(context);

      await logout();
      commit.setUserInfo(null);
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
