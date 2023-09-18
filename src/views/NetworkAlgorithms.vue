<template>
  <v-container fluid>
    <v-main>
      <v-navigation-drawer
        right
        app
        :width="300"
      >
        <h2 class="ma-2">
          {{ workspace }}
        </h2>
        <v-divider />
        <v-card
          v-for="{ title, data, network } in workspaceInfo"
          :key="title"
          flat
        >
          <v-card-title>
            {{ title }}
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-list
              nav
              max-height="20vh"
              style="overflow-y: auto;"
            >
              <v-list-item
                v-for="name in data"
                :key="name"
                dense
                style="min-height: 30px;"
                :to="detailLink(name, network)"
              >
                <v-list-item-icon class="ma-0 mt-1">
                  <v-icon small>
                    {{ network ? "mdi-chart-timeline-variant" : "mdi-table" }}
                  </v-icon>
                </v-list-item-icon>
                {{ name }}
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-navigation-drawer>
      <v-card
        flat
        outlined
      >
        <v-card-title>Network Algorithms</v-card-title>
        <!-- TODO: Replace with tiptap -->
        <v-divider />
        <v-row no-gutters>
          <v-col cols="8">
            <v-radio-group
              column
            >
              <v-radio label="Centrality" color="primary" value="centrality" />
              <v-radio label="Pagerank" color="rprimary" value="pagerank" />
              <v-radio label="Community Detection (Label Propagation)" color="indigo" value="LP" />
              <v-radio label="Community Detection (Speaker Listener)" color="indigo" value="SL" />
              <v-radio label="Calculate Node Degree" color="indigo" value="degree" />
            </v-radio-group>
          </v-col>
          <v-col cols="4">
            <v-card
              height="500px"
              class="ml-2 overflow-y-auto"
            >
              <v-card-title>Algorithm Parameters</v-card-title>
              <v-card-subtitle>Any algorithm parameters can be input here</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-btn
            color="error"
            text
            @click="lastQueryResults = null"
          >
            Clear Results
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            @click="runAlgorithm"
          >
            Run Algorithm
          </v-btn>
        </v-card-actions>
      </v-card>

    </v-main>
  </v-container>
</template>

<script lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import type { PropType, Ref } from 'vue';
import {
  computed,
  defineComponent, ref, watch,
} from 'vue';

import api from '@/api';
import store from '@/store';

// eslint-disable-next-line no-use-before-define
type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap { [key: string]: AnyJson }
type JsonArray = Array<AnyJson>

const BIND_VAR_PATTERN = /@(@?[a-zA-Z0-9]+)/g;

/**
 * Returns the first index at which these arrays differ.
 * Assumes the length of the arrays differ by exactly one.
 */
function findDifferenceIndex<T = unknown>(arr1: T[], arr2: T[]) {
  if (arr1.length === arr2.length) {
    throw new Error('Arrays have the same length!');
  }

  let smaller: T[];
  let larger: T[];
  if (arr1.length < arr2.length) {
    smaller = arr1;
    larger = arr2;
  } else {
    smaller = arr2;
    larger = arr1;
  }

  // Iterate, return first differing
  let i = 0;
  while (i < smaller.length) {
    if (smaller[i] !== larger[i]) {
      break;
    }
    i += 1;
  }

  return i;
}

export default defineComponent({
  name: 'NewtorkAlgorithm',
  components: {
  },
  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props) {
    const lastQueryResults: Ref<null | Array<JsonArray>> = ref(null);
    const loading = ref(false);
    const queryErrorMessage = ref('');
    const createTableMenu = ref(false);
    const createTableErrorMessage: Ref<null | string> = ref(null);
    const createTableName: Ref<null | string> = ref(null);
    const default_query_finished = ref(false);
    const networks = computed(() => store.getters.networks.map((network) => network.name));
    const workspaceInfo = computed(() => [
      { title: 'Networks', data: networks.value, network: true },
    ]);

    function detailLink(name: string, network: boolean) {
      const routeName = network ? 'networkDetail' : 'tableDetail';

      return { name: routeName, params: { workspace: props.workspace, table: name, network: name } };
    }

    async function runAlgorithm() {
      // put this to pass lint and avoid empty function error
      let dummy = 0;
      dummy += 1;
    }

    store.dispatch.fetchWorkspace(props.workspace);

    return {
      loading,
      createTableMenu,
      createTableErrorMessage,
      createTableName,
      workspaceInfo,
      detailLink,
      runAlgorithm,
    };
  },
});
</script>
