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
import { EdgesSpec, TableRow } from 'multinet';

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
      type: String as PropType<'table' | 'network'>,
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

    watch(dialog, () => {
      if (!dialog.value) {
        emit('closed');
      }
    });

    async function execute() {
      loading.value = true;

      const downloads = await Promise.all(props.selection.map(async (name) => {
        let data;
        const offsetLimit = { offset: 0, limit: 10000 };

        if (props.downloadType === 'table') {
          // Make first request for data
          const rows = [];
          const download = await api.table(props.workspace, name, offsetLimit);
          rows.push(...download.results);

          // Async request all other data if there is more to grab
          if (download.next !== null) {
            const additionalRequests = Math.ceil(download.count / offsetLimit.limit) - 1;
            const downloadPromises = Array(additionalRequests).fill(null).map((value, index) => api.table(props.workspace, name, { offset: (index + 1) * offsetLimit.limit, limit: offsetLimit.limit }));
            const finishedRequests = await Promise.all(downloadPromises);
            finishedRequests.forEach((request) => rows.push(...request.results));
          }

          data = rows;
        } else {
          const nodes: TableRow[] = [];
          const edges: EdgesSpec[] = [];
          const nodeRequest = await api.nodes(props.workspace, name, offsetLimit);
          nodes.push(...nodeRequest.results);
          const edgeRequest = await api.edges(props.workspace, name, offsetLimit);
          edges.push(...edgeRequest.results);

          // Async request all other data if there is more to grab

          if (nodeRequest.next !== null) {
            const additionalRequests = Math.ceil(nodeRequest.count / offsetLimit.limit) - 1;
            const downloadPromises = Array(additionalRequests).fill(null).map((value, index) => api.nodes(props.workspace, name, { offset: (index + 1) * offsetLimit.limit, limit: offsetLimit.limit }));
            const finishedRequests = await Promise.all(downloadPromises);
            finishedRequests.forEach((request) => nodes.push(...request.results));
          }

          if (edgeRequest.next !== null) {
            const additionalRequests = Math.ceil(edgeRequest.count / offsetLimit.limit) - 1;
            const downloadPromises = Array(additionalRequests).fill(null).map((value, index) => api.edges(props.workspace, name, { offset: (index + 1) * offsetLimit.limit, limit: offsetLimit.limit }));
            const finishedRequests = await Promise.all(downloadPromises);
            finishedRequests.forEach((request) => edges.push(...request.results));
          }

          data = { nodes, edges };
        }

        const blobData = JSON.stringify(data, null, 2);
        const blob = new Blob([blobData], { type: 'application/json' });

        const filename = `${name}.json`;
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
