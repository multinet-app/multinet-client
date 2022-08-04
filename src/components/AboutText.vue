<template>
  <v-card>
    <v-card-title
      class="headline pb-0 pt-3"
      primary-title
    >
      About Multinet
    </v-card-title>

    <v-card-text
      class="px-4 pt-4 pb-1"
    >
      Multinet is a system for storing and processing
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      <a-ext href="https://vdl.sci.utah.edu/mvnv/">multivariate networks</a-ext>.
      Learn more and explore the code at
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      <a-ext href="https://github.com/multinet-app/multinet-api">GitHub</a-ext>.
    </v-card-text>

    <v-card-text class="px-4 pt-4 pb-1">
      Check out the Multinet project
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      <a-ext href="https://multinet-app.readthedocs.io">documentation</a-ext>,
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      or the <a-ext href="https://api.multinet.app/swagger">API docs</a-ext>.
    </v-card-text>

    <v-divider />

    <v-card-actions class="px-4 py-3">
      <v-spacer />

      <v-btn
        color="grey darken-3"
        dark
        depressed
        @click="$emit('toggle')"
      >
        OK
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import AExt from '@/components/AExt.vue';

export default defineComponent({
  components: {
    AExt,
  },
});
</script>
