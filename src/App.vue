<template>
  <v-app id="app">
    <!-- TODO: REMOVE THIS REF WHEN VUEX IS ADDED -->
    <sidebar ref="sidebar" />
    <!-- TODO: REMOVE THIS UPDATE WHEN VUEX IS ADDED -->
    <router-view
      :apps="apps"
      @update="update"
    />
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

  methods: {
    // TODO: REMOVE THIS REF AND METHOD WHEN VUEX IS ADDED
    update() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sidebar = this.$refs.sidebar as any;
      sidebar.refresh();
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
