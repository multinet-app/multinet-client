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

    <about-text @toggle="dialog=false" />
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

import AboutText from '@/components/AboutText.vue';

export default Vue.extend({
  components: {
    AboutText,
  },

  data() {
    return {
      dialog: false,
    };
  },
});

</script>
