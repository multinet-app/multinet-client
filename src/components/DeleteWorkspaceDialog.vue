<template>
  <v-dialog
    v-model="dialog"
    width="700"
  >
    <template #activator="{ on: button }">
      <v-tooltip left>
        <template #activator="{ on: tooltip }">
          <v-fade-transition>
            <v-btn
              v-if="somethingChecked"
              id="delete-workspaces"
              block
              tile
              dark
              color="red accent-3"
              @click="button.click"
              v-on="tooltip"
            >
              Delete Selected
              <v-icon
                right
              >
                mdi-delete-sweep
              </v-icon>
            </v-btn>
          </v-fade-transition>
        </template>
        <span>Delete selected</span>
      </v-tooltip>
    </template>

    <v-card>
      <v-card-title
        class="headline pb-0 pt-3 px-5"
        primary-title
      >
        Delete Workspaces
      </v-card-title>

      <v-card-text class="px-5 py-4">
        You are about to delete {{ selection.length }}
        workspace{{ plural }}{{ detail }}. Type the following phrase to confirm:
        <strong>{{ confirmationPhrase }}</strong>
      </v-card-text>

      <v-card-text>
        <v-text-field
          v-model="confirmation"
          autofocus
          dense
          outlined
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />
        <v-btn
          id="delete-workspace-yes"
          depressed
          color="error"
          :disabled="confirmation !== confirmationPhrase"
          @click="execute"
        >
          yes
        </v-btn>

        <v-btn
          depressed
          @click="dialog = false"
        >
          cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref, watch,
} from 'vue';

import api from '@/api';
import store from '@/store';

import { randomPhrase } from '@/utils/randomPhrase';

export default defineComponent({
  props: {
    somethingChecked: {
      type: Boolean as PropType<boolean>,
      required: true,
    },

    selection: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },

  setup(props, { emit }) {
    const dialog = ref(false);
    const confirmationPhrase = ref('');
    const confirmation = ref('');

    const plural = computed(() => (props.selection.length > 1 ? 's' : ''));
    const detail = computed(() => (props.selection.length === 1 ? ` (${props.selection[0]})` : ''));

    async function execute() {
      await Promise.all(props.selection.map((ws) => api.deleteWorkspace(ws)));

      store.dispatch.fetchWorkspaces();
      emit('deleted');

      dialog.value = false;
    }

    function clear() {
      confirmationPhrase.value = '';
      confirmation.value = '';
    }

    watch(dialog, () => {
      if (dialog.value) {
        clear();
        confirmationPhrase.value = randomPhrase();
      } else {
        emit('closed');
      }
    });

    return {
      dialog,
      confirmationPhrase,
      confirmation,
      plural,
      detail,
      execute,
    };
  },
});
</script>
