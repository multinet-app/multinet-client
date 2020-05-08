<template>
  <v-dialog
    v-model="dialog"
    class="ws-dialog"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        class="mt-n1 ml-n1"
        icon
        small
        v-on="on"
      >
        <v-icon size="18">
          help
        </v-icon>
      </v-btn>
    </template>

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
        <a-ext href="https://github.com/multinet-app/multinet">GitHub</a-ext>.
      </v-card-text>

      <v-card-text class="px-4 pt-4 pb-1">
        Check out the Multinet project
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
        <a-ext href="https://multinet-app.readthedocs.io">documentation</a-ext>,
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
        or the <a-ext href="/apidocs">API docs</a-ext>.
      </v-card-text>

      <v-card-text
        v-if="gitSha"
        class="px-4 pt-4 pb-1"
      >
        This instance of Multinet was built from Git SHA
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
        <a-ext :href="gitShaURL">{{ gitSha.slice(0, 6) }}</a-ext>.
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />

        <v-btn
          color="grey darken-3"
          dark
          depressed
          @click="dialog = false"
        >
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

import AExt from '@/components/AExt.vue';
import { gitSha as GIT_SHA } from '@/environment';

export default Vue.extend({
  components: {
    AExt,
  },

  data() {
    return {
      dialog: false,
    };
  },

  computed: {
    gitSha(): string {
      return GIT_SHA;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gitShaURL(this: any): string {
      const {
        gitSha,
      } = this;

      return `https://github.com/multinet-app/multinet/tree/${gitSha}`;
    },
  },

});

</script>
