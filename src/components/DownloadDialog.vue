<template>
  <v-dialog
    v-if="nonZeroSelection"
    v-model="dialog"
    width="400"
  >
    <template #activator="{ on: button }">
      <v-tooltip left>
        <template #activator="{ on: tooltip }">
          <v-scroll-x-transition>
            <v-btn
              icon
              small
              @click="button.click"
              v-on="tooltip"
            >
              <v-icon
                color="primary"
                size="20px"
              >
                mdi-tray-arrow-down
              </v-icon>
            </v-btn>
          </v-scroll-x-transition>
        </template>
        <span>Download selected</span>
      </v-tooltip>
    </template>

    <v-card class="pa-0">
      <v-card-title
        class="pa-4"
        primary-title
      >
        Download the following
        {{ selection.length > 1 ? selection.length : '' }}
        {{ downloadType }}{{ plural }}?
      </v-card-title>

      <v-card-text class="pa-0">
        <v-list
          class="pa-0"
          color="grey lighten-5"
          dense
        >
          <template v-for="item in selection">
            <v-divider :key="`${item}-divider`" />
            <v-list-item :key="item">
              <v-list-item-icon>
                <v-icon
                  color="green accent-4"
                  size="18"
                >
                  mdi-check
                </v-icon>
              </v-list-item-icon>
              {{ item }}
            </v-list-item>
          </template>
        </v-list>
      </v-card-text>

      <v-divider />
      <v-progress-linear
        indeterminate
        :active="loading"
      />

      <v-card-actions class="px-4 py-3">
        <v-spacer />
        <v-btn
          depressed
          color="primary"
          :disabled="disabled"
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
import type { PropType, Ref } from 'vue';
import {
  computed, defineComponent, ref, watch,
} from 'vue';

import api from '@/api';

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

    downloadType: {
      type: String as PropType<string>,
      required: true,
    },
  },

  setup(props, { emit }) {
    const dialog = ref(false);
    const disabled = ref(false);
    const timeout: Ref<number | undefined> = ref(undefined);
    const loading = ref(false);

    const plural = computed(() => (props.selection.length > 1 ? 's' : ''));
    const nonZeroSelection = computed(() => props.selection.length > 0);
    const downloadEndpoint = computed(() => {
      switch (props.downloadType) {
        case 'table':
          return api.downloadTable.bind(api);
        case 'network':
        default:
          return api.downloadNetwork.bind(api);
      }
    });

    watch(dialog, () => {
      if (!dialog.value) {
        emit('closed');
      }
    });

    async function execute() {
      loading.value = true;

      const downloads = await Promise.all(props.selection.map(async (name) => {
        const { data, headers: { 'content-type': contentType } } = await downloadEndpoint.value(props.workspace, name);
        const blobData = data instanceof Object ? JSON.stringify(data, null, 2) : data;
        const blob = new Blob([blobData], { type: contentType });

        const extension = contentType.split('/')[1];
        const filename = `${name}.${extension}`;
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = filename;

        return link;
      }));

      downloads.forEach((link) => {
        link.click();
        URL.revokeObjectURL(link.href);
      });

      emit('downloaded', props.selection);
      loading.value = false;
      dialog.value = false;
    }

    return {
      dialog,
      disabled,
      timeout,
      loading,
      plural,
      nonZeroSelection,
      execute,
    };
  },
});
</script>
