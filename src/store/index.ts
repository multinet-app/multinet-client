import Vue from 'vue';
import Vuex from 'vuex';

import { createDirectStore } from 'direct-vuex';

import api from '@/api';

Vue.use(Vuex);

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext,
} = createDirectStore({
  state: {
    workspaces: [] as string[],
  },
  mutations: {
    setWorkspaces(state, workspaces) {
      state.workspaces = workspaces;
    },
  },
  actions: {
    async fetchWorkspaces({ commit }) {
      const workspaces = await api.workspaces();
      commit('setWorkspaces', workspaces);
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
