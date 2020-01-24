<template>
  <v-dialog
    class="ws-dialog"
    v-model="dialog"
    width="500"
    >
    <template v-slot:activator="{ on }">
      <v-btn
        class="ws-btn"
        block
        color="blue darken-3"
        dark
        depressed
        large
        v-on="on"
        >
        About Multinet
      </v-btn>
    </template>

    <v-card>

      <v-card-title
        class="headline pb-0 pt-3"
        primary-title
        >
        About Multinet
      </v-card-title>

      <v-card-text class="px-4 pt-4 pb-1">
        Hello.
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

export default Vue.extend({
  data() {
    return {
      dialog: false,
    };
  },
});

</script>
