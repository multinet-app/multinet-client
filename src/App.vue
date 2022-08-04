<template>
  <v-app id="app">
    <sidebar />
    <router-view :apps="apps" />
    <v-footer
      app
      style="z-index: 10"
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
            :max-width="index==1 ? 100 : 200"
            :style="index==1 ? 'margin-top: 10px;' : ''"
          />
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Sidebar from '@/components/Sidebar.vue';
import apps from '@/assets/appregistry.json';

export default defineComponent({
  name: 'App',

  components: {
    Sidebar,
  },

  setup() {
    const collabs = [
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
    ];

    return {
      apps,
      collabs,
    };
  },
});
</script>

<style lang="scss">
$font-family: 'Avenir', Helvetica, Arial, sans-serif;

html {
  overflow-y: auto !important;
}

.v-application {
  [class*='text-'] {
    font-family: $font-family !important;
  }
  .material-icons {
    font-family: 'Material Icons' !important;
  }

  font-family: $font-family !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.v-main__wrap {
  margin-bottom: 40px; /* Extra margin for toolbar */
}
</style>
