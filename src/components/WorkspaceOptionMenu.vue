<template>
  <v-menu
    v-model="actionsMenu"
    max-width="275"
    offset-y
    origin="center center"
    transition="scale-transition"
    eager
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

        <!-- Add fork button -->
        <v-list-item @click="forkWorkspace(workspace)">
          <v-list-item-icon class="mr-3">
            <v-icon>mdi-source-branch</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            Fork Workspace
          </v-list-item-content>
        </v-list-item>

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
import { useRouter } from 'vue-router/composables';
import type { Workspace } from 'multinet';
import PermissionsDialog from '@/components/PermissionsDialog.vue';
import api from '@/api';
import store from '@/store';

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

  emits: ['loading'],

  setup(_, { emit }) {
    const actionsMenu = ref(false);
    const router = useRouter();

    // Fork the workspace, navigate to the new workspace, and refresh the workspace list
    // Emits loading event to parent component listener
    const forkWorkspace = async (workspace: string) => {
      try {
        emit('loading', true);
        const newWorkspace: Workspace = await api.forkWorkspace(workspace);
        emit('loading', false);

        // Close the actions menu
        actionsMenu.value = false;

        // Navigate to the new workspace and refresh the workspace list
        router.push(`/workspaces/${newWorkspace.name}`);
        store.dispatch.fetchWorkspaces();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error forking workspace:', error);
      }
    };

    return {
      actionsMenu,
      forkWorkspace,
    };
  },
});
</script>
