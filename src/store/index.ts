import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import { UserPermissionSpec, UserSpec } from 'multinet';

import api from '@/api';
import oauthClient from '@/oauth';

Vue.use(Vuex);

export interface WorkspaceState {
  name: string;
  nodeTables: string[];
  edgeTables: string[];
  networks: string[];
}

export interface State {
  workspaces: string[];
  currentWorkspace: WorkspaceState | null;
  userInfo: UserSpec | null;
  permissionInfo: UserPermissionSpec | null;
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
    permissionInfo: null,
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

    networks(state: State) {
      if (state.currentWorkspace !== null && state.currentWorkspace.networks) {
        return state.currentWorkspace.networks;
      }
      return [];
    },

    hasWriterAccess(state: State): boolean {
      if (!state.permissionInfo) {
        return false;
      }
      const { permission } = state.permissionInfo;
      if (permission === 'owner' || permission === 'maintainer' || permission === 'writer') {
        return true;
      }
      return false;
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

    setPermissionInfo(state, permissionInfo: UserPermissionSpec | null) {
      state.permissionInfo = permissionInfo;
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

      const networks = await api.networks(workspace);
      const tables = (await api.tables(workspace)).results;
      const nodeTables = tables.filter((table) => table.edge === false);
      const edgeTables = tables.filter((table) => table.edge === true);

      commit.setCurrentWorkspace({
        name: workspace,
        nodeTables: nodeTables.map((table) => table.name),
        edgeTables: edgeTables.map((table) => table.name),
        networks: networks.results.map((network) => network.name),
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

    async fetchPermissionsInfo(context, workspace: string) {
      const { commit } = rootActionContext(context);

      try {
        const info = await api.getCurrentUserWorkspacePermissions(workspace);
        commit.setPermissionInfo(info);
      } catch (error) {
        if (error.response.status === 401) {
          commit.setPermissionInfo(null);
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
