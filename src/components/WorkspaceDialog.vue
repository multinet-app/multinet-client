<template>
  <!-- eslint-disable vuejs-accessibility/no-autofocus -->
  <v-dialog
    v-model="dialog"
    class="ws-dialogue"
    width="500"
  >
    <template #activator="{ on }">
      <!-- See
            https://github.com/vuetifyjs/vuetify/issues/4482#issuecomment-476689473
            for why the `dark` prop is tied to the disabled state of the button.
          -->
      <v-btn
        v-show="userInfo !== null"
        id="add-workspace"
        class="ws-btn ma-0 px-4 py-5"
        block
        color="grey darken-3"
        :dark="!!userInfo"
        depressed
        large
        v-on="on"
      >
        New Workspace
        <v-spacer />
        <v-icon
          right
          dark
          size="20px"
        >
          add_circle
        </v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline pb-0 pt-3"
        primary-title
      >
        Create Workspace
      </v-card-title>

      <v-card-text class="px-4 pt-4 pb-1">
        <v-text-field
          id="workspace-name"
          v-model="newWorkspace"
          autofocus
          dense
          outlined
          label="Workspace name"
          :error-messages="error ? [error] : []"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />
        <v-btn
          id="create-workspace"
          color="grey darken-3"
          dark
          depressed
          @click="create"
        >
          Create Workspace
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
// import { useRouter } from 'vue-router';

import api from '@/api';
import store from '@/store';
import { useCurrentInstance } from '@/utils/use';

export default defineComponent({
  setup() {
    const dialog = ref(false);
    const newWorkspace = ref('');
    const error = ref('');

    const userInfo = computed(() => store.state.userInfo);

    watch(dialog, () => {
      if (dialog.value) {
        error.value = '';
      }
    });

    const router = useCurrentInstance().proxy.$router;
    async function create() {
      if (newWorkspace.value) {
        try {
          const response = await api.createWorkspace(newWorkspace.value);

          if (response) {
            store.dispatch.fetchWorkspaces();

            router.push(`/workspaces/${newWorkspace.value}`);

            newWorkspace.value = '';
            dialog.value = false;
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          if (err.status === 409) {
            error.value = `Workspace "${err.data}" already exists!`;
          } else {
            error.value = `Error creating workspace: ${err.status}`;
          }
        }
      }
    }

    return {
      dialog,
      newWorkspace,
      error,
      userInfo,
      create,
    };
  },
});
</script>

<style scoped>

.v-btn.ws-btn {
  border-radius: 0;
  height: 59px !important;
}

.get-started {
  position: relative;
}
</style>
