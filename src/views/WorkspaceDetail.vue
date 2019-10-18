<template>
  <v-container fluid>
    <v-content>
      <v-app-bar app>
        <v-hover>
          <v-toolbar-title
            class="ws-detail-title"
            slot-scope="{ hover }"
          >
            <v-fade-transition hide-on-leave>
              <v-icon
                class="ml-4 mr-5"
                color="grey lighten-1"
                v-if="!hover && !editing"
              >library_books</v-icon>
            </v-fade-transition>

            <v-tooltip left v-if="!editing">
              <template v-slot:activator="{ on }">
                <div>
                  <v-fade-transition hide-on-leave>
                    <v-btn
                      class="ml-1 mr-2"
                      icon
                      v-if="hover && !editing"
                      v-on="on"
                      @click="editing = !editing"
                    >
                      <v-icon
                        color="grey darken-3"
                        size="20px"
                      >edit</v-icon>
                    </v-btn>
                  </v-fade-transition>
                </div>
              </template>
              <span>Rename workspace</span>
            </v-tooltip>

            <v-fade-transition
              hide-on-leave
              v-if="editing"
            >
              <v-btn
                icon
                @click="editing = !editing"
              >
                <v-icon
                  color="grey darken-3"
                  size="20px"
                >close</v-icon>
              </v-btn>
            </v-fade-transition>

            <span v-if="!editing">{{workspace}}</span>

            <v-text-field
              autofocus
              background-color="transparent"
              class="ws-rename"
              text
              @focus="$event.target.select()"
              solo
              flat
              :value="workspace"
              v-if="editing"
            />

          </v-toolbar-title>
        </v-hover>

        <v-spacer />
        <v-btn icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
      </v-app-bar>

      <v-layout
        wrap
      >
        <v-flex
          md6
          px-5
          py-3
        >
          <v-card
            color="transparent"
            flat
            text
          >
            <item-panel
              title="Tables"
              :items="tables"
              :workspace="workspace"
              route-type="table"
              icon="table_chart"
            />

            <table-dialog
              :types="fileTypes"
              :workspace="workspace"
              @success="update"
            />

          </v-card>
        </v-flex>
        <v-flex
          md6
          px-5
          py-3
        >
          <v-card
            color="transparent"
            flat
            text
          >
            <item-panel
              title="Graphs"
              :items="graphs"
              :workspace="workspace"
              route-type="graph"
              icon="timeline"
              />

              <GraphDialog
                :node-tables="nodeTables"
                :edge-tables="edgeTables"
                :workspace="workspace"
                @success="update"
              />

          </v-card>
        </v-flex>
      </v-layout>
    </v-content>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';
import ItemPanel from '@/components/ItemPanel.vue';
import GraphDialog from '@/components/GraphDialog.vue';
import TableDialog from '@/components/TableDialog.vue';
import { FileTypeTable } from '@/types';

export default Vue.extend({
  name: 'WorkspaceDetail',
  components: {
    ItemPanel,
    GraphDialog,
    TableDialog,
  },
  props: ['workspace', 'title'],
  data() {
    return {
      editing: false,
      fileTypes: {
        csv: {extension: ['csv'], queryCall: 'csv'},
        newick: {extension: ['phy', 'tree'], queryCall: 'newick'},
        nested_json: {extension: ['json'], queryCall: 'nested_json'},
      } as FileTypeTable,
      tables: [],
      nodeTables: [],
      edgeTables: [],
      graphs: [],
    };
  },
  watch: {
    workspace() {
      this.update();
    },
  },
  methods: {
    async update() {
      // Get lists of node and edge tables.
      let response = await api().get(`workspaces/${this.workspace}/tables?type=node`);
      const nodeTables = response.data;

      response = await api().get(`workspaces/${this.workspace}/tables?type=edge`);
      const edgeTables = response.data;

      this.tables = nodeTables.concat(edgeTables);
      this.nodeTables = nodeTables;
      this.edgeTables = edgeTables;

      // Get list of graphs.
      response = await api().get(`workspaces/${this.workspace}/graphs`);
      const graphs = response.data;

      this.graphs = graphs;
    },
  },
  created() {
    this.update();
  },

});
</script>

<style scoped>
.help-icon {
  cursor: pointer;
  margin-left: 4px;
}

.list-link a {
  text-decoration: none;
  letter-spacing:1px;
  text-transform:uppercase;
  font-weight:bold;
  color:#7f9ba4;
}

.ws-detail-title {
  align-items: center;
  display: flex;
  letter-spacing: 0;
  width: 95%;
}
</style>

<style>
.ws-rename.v-text-field {
  height: 64px; /* match toolbar height */
}

.ws-rename.v-text-field.v-text-field--enclosed .v-input__slot {
  font-size: 20px;
  letter-spacing: 2px !important;
  padding-top: 14px;
}

.choose-tables.v-select .v-select__selections {
  min-height: auto !important;
}
</style>
