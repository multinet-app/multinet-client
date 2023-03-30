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

    <v-card v-if="!dependentNetworks">
      <v-card-title
        class="text-h5 pb-0 pt-3 px-5"
        primary-title
      >
        Delete Tables
      </v-card-title>

      <v-card-text class="px-5 py-4">
        You are about to delete {{ selection.length }} table{{ plural }}. Type the
        following phrase to confirm: <strong>{{ confirmationPhrase }}</strong>
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
    <v-card v-else>
      <v-card-title
        class="text-h5 pb-0 pt-3 px-5"
        primary-title
      >
        Delete Tables
      </v-card-title>

      <v-card-text class="px-5 py-4">
        The following networks are using these tables:
        <ul>
          <li
            v-for="(network, index) in using"
            :key="index"
          >
            {{ network.network }} ({{ network.tables.join(', ') }})
          </li>
        </ul>
      </v-card-text>

      <v-card-text class="px-5 py-4">
        You must delete these networks before you can delete the tables.
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />

        <v-btn
          depressed
          @click="dialog = false"
        >
          ok
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
import type { TableRow } from 'multinet';

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
    const confirmationPhrase = ref('');
    const confirmation = ref('');
    const using: Ref<Array<{network: string; tables: string[]}>> = ref([]);

    const plural = computed(() => (props.selection.length > 1 ? 's' : ''));
    const nonZeroSelection = computed(() => props.selection.length > 0);
    const dependentNetworks = computed(() => using.value.length > 0);

    async function execute() {
      await Promise.all(props.selection.map((table) => api.deleteTable(props.workspace, table)));
      dialog.value = false;
    }

    async function findDependentNetworks() {
      function tableName(tableRow: TableRow) {
        // eslint-disable-next-line no-underscore-dangle
        return tableRow._id.split('/')[0];
      }

      const networkNames = (await api.networks(props.workspace)).results.map((network) => network.name);
      const dependents = [] as Array<{network: string; tables: string[]}>;
      networkNames.forEach(async (network) => {
        const nodes = await api.nodes(props.workspace, network, {});
        const edges = await api.edges(props.workspace, network, {
          direction: 'all',
        });

        const prelimNodes = nodes.results.map((node) => tableName(node));
        const nodeTables: string[] = [];
        prelimNodes.forEach((table) => {
          if (!nodeTables.includes(table)) {
            nodeTables.push(table);
          }
        });
        const edgeTable = edges.results.length > 0 ? tableName(edges.results[0]) : '';
        const tables: string[] = [];
        props.selection.forEach((table) => {
          if (table === edgeTable || nodeTables.includes(table)) {
            tables.push(table);
          }
        });

        if (tables.length > 0) {
          dependents.push({
            network,
            tables,
          });
        }
      });

      return dependents;
    }

    function clear() {
      confirmationPhrase.value = '';
      confirmation.value = '';
    }

    watch(dialog, async () => {
      if (dialog.value) {
        using.value = [];
        const dependents = await findDependentNetworks();
        if (dependents.length > 0) {
          using.value = dependents;
        } else {
          clear();
          confirmationPhrase.value = randomPhrase();
        }
      } else {
        emit('closed');
      }
    });

    return {
      dialog,
      confirmationPhrase,
      confirmation,
      using,
      plural,
      nonZeroSelection,
      dependentNetworks,
      execute,
    };
  },
});
</script>
