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
        Multinet is a system for storing and processing <a-ext
          href="https://vdl.sci.utah.edu/mvnv/">multivariate networks</a-ext>. Learn more and explore the code
        at <a-ext href="https://github.com/multinet-app/multinet">GitHub</a-ext>.
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
        <a-ext :href="gitShaURL">{{gitSha.slice(0, 6)}}</a-ext>.
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

const GIT_SHA: string = process.env.VUE_APP_GIT_SHA || '';

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
