import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import { SingleUserWorkspacePermissionSpec, UserSpec } from 'multinet';

import api from '@/api';
import oauthClient from '@/oauth';
import { SingularRole, getRoleOrdinal } from '@/utils/permissions';

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
  currentWorkspacePermissionInfo: SingleUserWorkspacePermissionSpec | null;
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
    currentWorkspacePermissionInfo: null,
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

    hasRequiredPermission: (state: State) => (minimumPermission: SingularRole) => {
      if (!state.currentWorkspacePermissionInfo) {
        return false;
      }

      const { permission } = state.currentWorkspacePermissionInfo;
      return getRoleOrdinal(permission as SingularRole) >= getRoleOrdinal(minimumPermission);
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

    setPermissionInfo(state, permissionInfo: SingleUserWorkspacePermissionSpec | null) {
      state.currentWorkspacePermissionInfo = permissionInfo;
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

      const permissionsInfo = await api.getCurrentUserWorkspacePermissions(workspace);
      commit.setPermissionInfo(permissionsInfo);

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
