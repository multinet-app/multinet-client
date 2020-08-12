<template>
  <v-container fluid>
    <v-content>
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
          v-for="{ title, data, graph } in workspaceInfo"
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
                :to="detailLink(name, graph)"
              >
                <v-list-item-icon class="ma-0 mt-1">
                  <v-icon small>
                    {{ graph ? "timeline" : "table_chart" }}
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

          <v-menu
            v-model="createTableMenu"
            offset-y
            :close-on-content-click="false"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                class="ml-2"
                color="secondary"
                v-on="on"
              >
                Create Table
              </v-btn>
            </template>
            <v-card class="px-2 pt-2">
              <v-text-field
                v-model="createTableName"
                solo
                flat
                label="Table Name"
                append-icon="publish"
                :error-messages="createTableErrorMessage"
                :hide-details="!createTableErrorMessage"
                @input="createTableErrorMessage = null"
                @click:append="createTable"
                @keydown.enter="createTable"
              />
            </v-card>
          </v-menu>
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
    </v-content>
  </v-container>
</template>

<script lang="ts">

import api from '@/api';
import store from '@/store';
import { PropType } from 'vue';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import VueJsonPretty from 'vue-json-pretty';

type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap { [key: string]: AnyJson }
type JsonArray = Array<AnyJson>

export default {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data(this: any) {
    return {
      query: this.$route.query.query || '',
      lastQueryResults: null as null | Array<JsonArray>,
      loading: false,
      queryErrorMessage: '',
      createTableMenu: false,
      createTableErrorMessage: null as null | string,
      createTableName: null as null | string,
    };
  },
  computed: {
    nodeTables: () => store.getters.nodeTables,
    edgeTables: () => store.getters.edgeTables,
    graphs: () => store.getters.graphs,
    workspaceInfo() {
      return [
        { title: 'Node Tables', data: this.nodeTables },
        { title: 'Edge Tables', data: this.edgeTables },
        { title: 'Graphs', data: this.graphs, graph: true },
      ];
    },
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeTables(this: any, nodeTables: string[]) {
      // Populate text area with example query
      if (nodeTables.length && !this.query) {
        this.query = `FOR doc in ${nodeTables[0]} RETURN doc`;
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query(this: any, query: string) {
      if (this.queryErrorMessage) { this.queryErrorMessage = ''; }

      if (query !== this.$route.query) {
        const route = {
          ...this.$route,
          query: {
            ...this.$route.query,
            query: query || undefined,
          },
        };

        this.$router.replace(route);
      }
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  created(this: any) {
    store.dispatch.fetchWorkspace(this.workspace);
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detailLink(this: any, name: string, graph: boolean) {
      const { workspace } = this;
      const route = graph ? 'graphDetail' : 'tableDetail';

      return { name: route, params: { workspace, table: name, graph: name } };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createTable(this: any) {
      const { workspace, query, createTableName } = this;

      try {
        await api.createAQLTable(workspace, createTableName, query);
        this.createTableMenu = false;
        store.dispatch.fetchWorkspace(this.workspace);

        this.$router.push({ name: 'tableDetail', params: { workspace, table: createTableName } });
      } catch (error) {
        if (error.status === 409) {
          this.createTableErrorMessage = 'Table Already Exists';
        } else {
          this.createTableErrorMessage = error.data;
        }
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async runQuery(this: any) {
      const { workspace, query } = this;

      if (!query) {
        this.queryErrorMessage = 'Query cannot be empty.';
        return;
      }

      this.loading = true;

      try {
        const resp = await api.aql(workspace, query);
        this.lastQueryResults = resp;
        this.queryErrorMessage = '';
      } catch (error) {
        this.queryErrorMessage = error.data;
        this.lastQueryResults = null;
      }

      this.loading = false;
    },
  },
};
</script>
