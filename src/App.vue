<template>
  <v-app id="app">
    <sidebar />
    <router-view :apps="apps" />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';

import store from '@/store';
import Sidebar from '@/components/Sidebar.vue';
import api from '@/api';
import { saveLoginToken } from '@/utils/localStorage';
import apps from './appregistry.json';

const loginTokenRegex = /^#loginToken=(\S+)$/;
export default Vue.extend({
  name: 'App',

  components: {
    Sidebar,
  },

  data() {
    return {
      apps,
    };
  },

  created() {
    store.dispatch.fetchUserInfo();
    this.checkUrlForLogin();
  },
  methods: {
    /**
     * When login is completed, the server will redirect the browser back here,
     * with an appended url fragment of `loginToken=<token>`. This function checks
     * for this fragment, and if it exists, it pops that token from the URL, saves
     * it in localStorage, and re-fetches app info, using this new token.
     */
    checkUrlForLogin() {
      if (this.$route.hash) {
        const result = this.$route.hash.match(loginTokenRegex);

        if (result && result.length >= 2) {
          const loginToken = result[1];
          api.client.setAuthToken(loginToken);

          const currentRouteName = this.$route.name;
          const name = currentRouteName || 'home';

          this.$router.replace({ name });
          saveLoginToken(loginToken);
          store.dispatch.fetchUserInfo();
          store.dispatch.fetchWorkspaces();
        }
      }
    },
  },
});
</script>

<style>
html {
  overflow-y: auto !important;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
