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
      <v-card flat>
        <v-card-title>Run AQL Query</v-card-title>
        <!-- TODO: Replace with tiptap -->
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
        <v-card-actions>
          <v-btn
            color="error"
            text
            @click="query=''"
          >
            Clear
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
        />
      </v-card>
    </v-main>
  </v-container>
</template>

<script lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import VueJsonPretty from 'vue-json-pretty';
import {
  computed,
  defineComponent, PropType, Ref, ref, watch,
} from 'vue';
import api from '@/api';
import store from '@/store';
import { Location } from 'vue-router';
import { useCurrentInstance } from '@/utils/use';

// eslint-disable-next-line no-use-before-define
type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap { [key: string]: AnyJson }
type JsonArray = Array<AnyJson>

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

    const router = useCurrentInstance().proxy.$router;
    const route = router !== null ? router.currentRoute : null;

    const query = ref(route === null ? '' : route.query.query as string);
    watch(query, () => {
      if (queryErrorMessage.value) { queryErrorMessage.value = ''; }

      if (route !== null && query.value !== route.query.query) {
        const newRoute: Location = {
          ...route,
          name: route.name === null ? undefined : route.name,
          query: {
            ...route.query,
            query: query.value || undefined,
          },
        };

        if (router !== null) {
          router.replace(newRoute);
        }
      }
    });

    const nodeTables = computed(() => store.getters.nodeTables);
    watch(nodeTables, () => {
      if (nodeTables.value.length && !query.value) {
        query.value = `FOR doc in ${nodeTables.value[0]} RETURN doc`;
      }
    });

    const edgeTables = computed(() => store.getters.edgeTables);
    const networks = computed(() => store.getters.networks);
    const workspaceInfo = computed(() => [
      { title: 'Node Tables', data: nodeTables.value },
      { title: 'Edge Tables', data: edgeTables.value },
      { title: 'Networks', data: networks.value, network: true },
    ]);

    function detailLink(name: string, network: boolean) {
      const routeName = network ? 'networkDetail' : 'tableDetail';

      return { name: routeName, params: { workspace: props.workspace, table: name, network: name } };
    }
    async function createTable() {
      if (createTableName.value === null) {
        return;
      }
      try {
        await api.createAQLTable(props.workspace, createTableName.value, query.value);
        createTableMenu.value = false;
        store.dispatch.fetchWorkspace(props.workspace);

        if (router !== null) {
          router.push({ name: 'tableDetail', params: { workspace: props.workspace, table: createTableName.value } });
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.status === 409) {
          createTableErrorMessage.value = 'Table Already Exists';
        } else {
          createTableErrorMessage.value = error.data;
        }
      }
    }
    async function runQuery() {
      if (!query.value) {
        queryErrorMessage.value = 'Query cannot be empty.';
        return;
      }

      loading.value = true;

      try {
        const resp = await api.aql(props.workspace, query.value);
        lastQueryResults.value = resp;
        queryErrorMessage.value = '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        queryErrorMessage.value = error.data;
        lastQueryResults.value = null;
      }

      loading.value = false;
    }

    store.dispatch.fetchWorkspace(props.workspace);

    return {
      query,
      lastQueryResults,
      loading,
      queryErrorMessage,
      createTableMenu,
      createTableErrorMessage,
      createTableName,
      workspaceInfo,
      detailLink,
      createTable,
      runQuery,
    };
  },
});
</script>
