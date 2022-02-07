<template>
  <v-app id="app">
    <sidebar />
    <router-view :apps="apps" />
    <v-footer
      app
      style="z-index: 7;"
    >
      <v-row class="flex-nowrap">
        <v-col
          v-for="collab, index in collabs"
          :key="index"
        >
          <v-img
            :src="collab.logo"
            class="logo mx-auto"
            contain
            max-height="50"
            max-width="200"
          />
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';

import Sidebar from '@/components/Sidebar.vue';
import apps from '@/assets/appregistry.json';

export default Vue.extend({
  name: 'App',

  components: {
    Sidebar,
  },

  data() {
    return {
      apps,
      collabs: [
        {
          // eslint-disable-next-line global-require
          logo: require('./assets/logo/utah_logo.png'),
        },
        {
          // eslint-disable-next-line global-require
          logo: require('./assets/logo/Kitware_Logo.png'),
        },
        {
          // eslint-disable-next-line global-require
          logo: require('./assets/logo/vdl_logo.png'),
        },
        {
          // eslint-disable-next-line global-require
          logo: require('./assets/logo/nsf_logo.png'),
        },
      ],
    };
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
