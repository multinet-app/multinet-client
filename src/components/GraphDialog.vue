<template>
  <v-dialog
    v-model="graphDialog"
    width="700"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        class="new-button"
        color="blue darken-2"
        fab
        dark
        medium
        v-on="on"
      >
        <v-icon dark>add</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card>
        <v-card-title
          class="headline pb-0 pt-3"
          primary-title
        >
          Create Graph
        </v-card-title>

        <v-card-text class="px-4 pt-4 pb-1">
          <v-layout wrap>
            <v-flex>
              <v-text-field
                filled
                label="Graph name"
                v-model="newGraph"
                :error-messages="graphCreationErrors"
              />
            </v-flex>
          </v-layout>

          <v-layout wrap>
            <v-flex>
              <v-select
                filled
                chips
                class="choose-tables"
                clearable
                deletable-chips
                label="Choose node tables"
                multiple
                v-model="graphNodeTables"
                :items="nodeTables"
              />
            </v-flex>
          </v-layout>

          <v-layout wrap>
            <v-flex>
              <v-select
                filled
                label="Choose edge table"
                v-model="graphEdgeTable"
                :items="edgeTables"
              />
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn
            depressed
            :disabled="graphCreateDisabled"
            @click="createGraph"
          >create graph</v-btn>
        </v-card-actions>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';

export default Vue.extend({
  name: 'GraphDialog',
  props: {
    nodeTables: Array,
    edgeTables: Array,
    workspace: String,
  },
  data() {
    return {
      graphCreationErrors: [] as string[],
      graphDialog: false,
      graphEdgeTable: null as string | null,
      graphNodeTables: [] as string[],
      newGraph: '',
    };
  },
  computed: {
    graphCreateDisabled(): boolean {
      return this.graphNodeTables.length === 0 || !this.graphEdgeTable || !this.newGraph;
    },

  },
  methods: {
    async createGraph() {
      const { workspace, newGraph } = this;
      const response = await api().post(`/workspaces/${workspace}/graph/${newGraph}`, {
        node_tables: this.graphNodeTables,
        edge_table: this.graphEdgeTable,
      });

      if (!response) {
        const message = `Graph "${this.newGraph}" already exists.`;

        this.graphCreationErrors = [message];
        throw new Error(message);
      }

      this.graphCreationErrors = [];

      this.$emit('success');
      this.graphDialog = false;
    },
  },
});
</script>

<style scoped>
.new-button {
  margin: 49px 10px 0 0;
  z-index: 100;
}
</style>
