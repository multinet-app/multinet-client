<template>
  <v-dialog
    v-if="nonZeroSelection"
    v-model="dialog"
    width="700"
  >
    <template #activator="{ on: button }">
      <v-tooltip left>
        <template #activator="{ on: tooltip }">
          <v-scroll-x-transition>
            <v-btn
              class="ml-1"
              icon
              small
              @click="button.click"
              v-on="tooltip"
            >
              <v-icon
                color="red accent-3"
                size="20px"
              >
                mdi-delete-sweep
              </v-icon>
            </v-btn>
          </v-scroll-x-transition>
        </template>
        <span>Delete selected</span>
      </v-tooltip>
    </template>

    <v-card>
      <v-card-title
        class="headline pb-0 pt-3 px-5"
        primary-title
      >
        Delete Networks
      </v-card-title>

      <v-card-text class="px-5 py-4">
        You are about to delete {{ selection.length }} network{{ plural }}. Type
        the following phrase to confirm: <strong>{{ confirmationPhrase }}</strong>
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
import { randomPhrase } from '@/utils/randomPhrase';

export default defineComponent({
  props: {
    selection: {
      type: Array as PropType<string[]>,
      required: true,
    },

    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },

  setup(props, { emit }) {
    const dialog = ref(false);
    const confirmation = ref('');
    const confirmationPhrase = ref('');

    const plural = computed(() => (props.selection.length > 1 ? 's' : ''));
    const nonZeroSelection = computed(() => props.selection.length > 0);

    async function execute() {
      await Promise.all(props.selection.map((network) => api.deleteNetwork(props.workspace, network)));
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
      confirmation,
      confirmationPhrase,
      plural,
      nonZeroSelection,
      execute,
    };
  },
});
</script>
