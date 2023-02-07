<template>
  <v-menu
    v-model="actionsMenu"
    max-width="275"
    offset-y
    origin="center center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-btn
        icon
        v-on="on"
      >
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-list
        dense
        width="224"
      >
        <!-- Each listing here should contain a v-list-item -->
        <PermissionsDialog :workspace="workspace" />
        <v-list-item :to="{ name: 'aqlWizard' }">
          <v-list-item-icon class="mr-3">
            <v-icon>mdi-magnify</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            AQL Wizard
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import PermissionsDialog from '@/components/PermissionsDialog.vue';

export default defineComponent({
  components: {
    PermissionsDialog,
  },

  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },

  setup() {
    const actionsMenu = ref(false);

    return {
      actionsMenu,
    };
  },
});
</script>
