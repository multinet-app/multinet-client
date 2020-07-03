<template>
  <v-container>
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
        <v-expansion-panels
          accordion
          multiple
          class="mx-2"
          flat
          focusable
        >
          <v-expansion-panel
            v-for="{ title, data } in workspaceInfo"
            :key="title"
          >
            <v-expansion-panel-header>{{ title }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list
                dense
                nav
              >
                <v-list-item
                  v-for="name in data"
                  :key="name"
                  dense
                  style="min-height: 30px;"
                  @click="doNothing"
                >
                  {{ name }}
                </v-list-item>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
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
          @input="handleTextInput"
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="runQuery"
          >
            Run Query
          </v-btn>
          <v-btn color="success">
            Create Table
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
  data() {
    return {
      query: '',
      lastQueryResults: null as null | Array<JsonArray>,
      loading: false,
      queryErrorMessage: '',
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
        { title: 'Graphs', data: this.graphs },
      ];
    },
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeTables(this: any, val) {
      // Populate text area with example query
      if (val) {
        this.query = `FOR doc in ${this.nodeTables[0]} RETURN doc`;
      }
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  created(this: any) {
    store.dispatch.fetchWorkspace(this.workspace);
  },
  methods: {
    doNothing() {
      // TODO: Remove
      // Title says all.
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleTextInput(this: any) {
      if (this.queryErrorMessage) { this.queryErrorMessage = ''; }
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
