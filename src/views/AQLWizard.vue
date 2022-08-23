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
                    {{ network ? "timeline" : "table_chart" }}
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
        <v-card-title>Run AQL Query</v-card-title>
        <!-- TODO: Replace with tiptap -->
        <v-divider />
        <v-row no-gutters>
          <v-col cols="8">
            <v-textarea
              v-model="query"
              height="500px"
              no-resize
              label="Enter AQL Query"
              solo
              :loading="loading"
              :error-messages="queryErrorMessage"
              style="font-family: monospace; font-size: 0.9em;"
            />
          </v-col>
          <v-col cols="4">
            <v-card
              height="500px"
              class="ml-2 overflow-y-auto"
            >
              <v-card-title>Bind Variables</v-card-title>
              <v-card-subtitle>Any values that must be bound can be input here (values must be strings)</v-card-subtitle>
              <v-list>
                <v-list-item
                  v-for="(key, index) in bind_var_keys"
                  :key="key"
                >
                  <v-row no-gutters>
                    <v-col cols="6">
                      <v-text-field
                        class="mx-1"
                        readonly
                        flat
                        solo
                        :value="key"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="bind_var_values[index]"
                        class="mx-1"
                        outlined
                      />
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-list>
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
            @click="runQuery"
          >
            Run Query
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card
        v-if="lastQueryResults !== null"
        class="mt-5"
      >
        <v-card-title>Query Results</v-card-title>
        <vue-json-pretty
          :data="lastQueryResults"
          highlight-mouseover-node
          collapsed-on-click-brackets
          virtual
        />
      </v-card>
    </v-main>
  </v-container>
</template>

<script lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

import {
  computed,
  defineComponent, PropType, Ref, ref, watch,
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
  name: 'AQLWizard',
  components: {
    VueJsonPretty,
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

    const query = ref('FOR doc IN @@TABLE RETURN doc');
    const default_query_finished = ref(false);
    watch(query, () => {
      if (queryErrorMessage.value) { queryErrorMessage.value = ''; }
    });

    const bind_var_values = ref([] as string[]);
    const bind_var_keys = computed(() => {
      const matches = [...query.value.matchAll(BIND_VAR_PATTERN)] as [string, string][];

      // Convert to obj then array to make unique
      return Object.keys(
        matches.reduce((obj, key) => ({ ...obj, [key[1]]: '' }), {}),
      );
    });
    watch(bind_var_keys, (val: string[], oldVal: string[]) => {
      if (val.length !== oldVal.length) {
        // Find differing index
        const index = findDifferenceIndex(val, oldVal);

        // New key was added
        if (val.length > oldVal.length) {
          bind_var_values.value.splice(index, 0, '');
        } else { // Key was removed
          bind_var_values.value.splice(index, 1);
        }
      }
    });

    const nodeTables = computed(() => store.getters.nodeTables.map((table) => table.name));
    watch(nodeTables, () => {
      if (nodeTables.value.length && !default_query_finished.value) {
        // eslint-disable-next-line prefer-destructuring
        bind_var_values.value[0] = nodeTables.value[0];
        default_query_finished.value = true;
      }
    });

    const edgeTables = computed(() => store.getters.edgeTables.map((table) => table.name));
    const networks = computed(() => store.getters.networks.map((network) => network.name));
    const workspaceInfo = computed(() => [
      { title: 'Node Tables', data: nodeTables.value },
      { title: 'Edge Tables', data: edgeTables.value },
      { title: 'Networks', data: networks.value, network: true },
    ]);

    function detailLink(name: string, network: boolean) {
      const routeName = network ? 'networkDetail' : 'tableDetail';

      return { name: routeName, params: { workspace: props.workspace, table: name, network: name } };
    }

    async function runQuery() {
      if (!query.value) {
        queryErrorMessage.value = 'Query cannot be empty.';
        return;
      }

      loading.value = true;

      // Create bind vars object
      const bind_vars = (bind_var_keys.value).reduce((obj, key, index) => ({ ...obj, [key]: bind_var_values.value[index] }), {});

      try {
        const resp = await api.aql(props.workspace, { query: query.value, bind_vars });
        lastQueryResults.value = resp;
        queryErrorMessage.value = '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        queryErrorMessage.value = error.response.data;
        lastQueryResults.value = null;
      }

      loading.value = false;
    }

    store.dispatch.fetchWorkspace(props.workspace);

    return {
      query,
      bind_var_keys,
      bind_var_values,
      lastQueryResults,
      loading,
      queryErrorMessage,
      createTableMenu,
      createTableErrorMessage,
      createTableName,
      workspaceInfo,
      detailLink,
      runQuery,
    };
  },
});
</script>
