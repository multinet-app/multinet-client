import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import { SingleUserWorkspacePermissionSpec, UserSpec } from 'multinet';

import api from '@/api';
import oauthClient from '@/oauth';
import { RoleLevel } from '@/utils/permissions';
import { Upload } from '@/types';

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
  currentWorkspacePermission: SingleUserWorkspacePermissionSpec | null;
  uploads: Upload[];
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
    currentWorkspacePermission: null,
    uploads: [],
  } as State,
  getters: {
    tables(state: State, getters): string[] {
      if (state.currentWorkspace !== null && state.currentWorkspace.nodeTables && state.currentWorkspace.edgeTables) {
        return getters.nodeTables.concat(getters.edgeTables).sort();
      }
      return [];
    },

    nodeTables(state: State): string[] {
      if (state.currentWorkspace !== null && state.currentWorkspace.nodeTables) {
        return state.currentWorkspace.nodeTables.sort();
      }
      return [];
    },

    edgeTables(state: State): string[] {
      if (state.currentWorkspace !== null && state.currentWorkspace.edgeTables) {
        return state.currentWorkspace.edgeTables.sort();
      }
      return [];
    },

    networks(state: State) {
      if (state.currentWorkspace !== null && state.currentWorkspace.networks) {
        return state.currentWorkspace.networks.sort();
      }
      return [];
    },

    permissionLevel(state: State): RoleLevel {
      if (!state.currentWorkspacePermission) {
        return RoleLevel.none;
      }
      const { permission } = state.currentWorkspacePermission;
      if (!permission) {
        return RoleLevel.none;
      }
      return permission as RoleLevel;
    },

    userCanEdit(state, getters) {
      return getters.permissionLevel >= RoleLevel.writer;
    },
  },
  mutations: {
    setWorkspaces(state, workspaces: string[]) {
      state.workspaces = workspaces.sort();
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
      state.currentWorkspacePermission = permissionInfo;
    },

    setUploads(state, uploads: Upload[]) {
      state.uploads = uploads;
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

      const uploads = await api.uploads(workspace);
      commit.setUploads(uploads.results);

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
