<template>
  <v-dialog
    v-model="dialog"
    class="ws-dialog"
    width="500"
  >
    <template #activator="{ on }">
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
import { defineComponent, ref } from 'vue';

import AboutText from '@/components/AboutText.vue';

export default defineComponent({
  components: {
    AboutText,
  },

  setup() {
    const dialog = ref(false);
    return {
      dialog,
    };
  },
});

</script>
