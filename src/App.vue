<template>
  <v-app id="app">
    <sidebar />
    <router-view :apps="apps" />
  </v-app>
</template>

<script lang="ts">
import Sidebar from '@/components/Sidebar.vue';
import Vue from 'vue';

import apps from './appregistry.json';

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
