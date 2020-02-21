<template>
  <v-dialog
    class="ws-dialog"
    v-model="dialog"
    width="500"
    >
    <template v-slot:activator="{ on }">
      <v-btn
        class="mt-n1 ml-n1"
        icon
        small
        v-on="on"
      >
        <v-icon size="18">help</v-icon>
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
        Multinet is a system for storing and processing <a
          href="https://vdl.sci.utah.edu/mvnv/" rel="noopener
          noreferrer">multivariate networks</a>. Learn more and explore the code
        at <a href="https://github.com/multinet-app/multinet" rel="noopener
          noreferrer">GitHub</a>.
      </v-card-text>

      <v-card-text class="px-4 pt-4 pb-1">
        Check out the Multinet project <a-ext
          href="https://multinet-app.readthedocs.io">documentation</a-ext>, or
        the <a-ext href="/apidocs">API docs</a-ext>.
      </v-card-text>

      <v-card-text
        v-if="gitSha"
        class="px-4 pt-4 pb-1"
        >
        This instance of Multinet was built from Git SHA
        <a :href="gitShaURL" target="_blank" rel="noopener noreferrer">{{gitSha.slice(0, 6)}}</a>.
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

declare const GIT_SHA: string;

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

    gitShaURL(this: any): string {
      const {
        gitSha,
      } = this;

      return `https://github.com/multinet-app/multinet/tree/${gitSha}`;
    },
  },

});

</script>
