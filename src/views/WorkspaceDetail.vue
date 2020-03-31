<template>
  <v-container fluid>
    <v-content>
      <v-app-bar app>
        <v-hover>
          <v-toolbar-title
            class="ws-detail-title"
            slot-scope="{ hover }"
          >
            <v-icon
              class="ml-4 mr-5"
              color="grey lighten-1"
              v-if="!hover && !editing"
            >library_books</v-icon>

            <v-tooltip left v-if="!editing && hover">
              <template v-slot:activator="{ on }">
                <div>
                  <v-btn
                    class="ml-1 mr-2"
                    icon
                    v-on="on"
                    @click="editing = !editing"
                  >
                    <v-icon
                      color="grey darken-3"
                      size="20px"
                    >edit</v-icon>
                  </v-btn>
                </div>
              </template>
              <span>Rename workspace</span>
            </v-tooltip>

            <v-btn
              v-if="editing"
              icon
              @click="editing = !editing"
            >
              <v-icon
                color="grey darken-3"
                size="20px"
              >close</v-icon>
            </v-btn>

            <v-text-field
              v-if="editing"
              autofocus
              background-color="transparent"
              class="ws-rename"
              text
              @focus="$event.target.select()"
              solo
              flat
              :value="workspace"
            />

            <span v-else>{{workspace}}</span>

          </v-toolbar-title>
        </v-hover>
        <v-progress-linear v-if="loading" indeterminate absolute bottom/>
        <v-spacer />
        <v-btn icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
      </v-app-bar>

      <v-layout
        wrap
      >
        <v-flex md6 px-5 py-3>
          <v-card color="transparent" flat text>
            <network-panel
              :workspace="workspace"
              :items="graphs"
              :node-tables="nodeTables"
              :edge-tables="edgeTables"
              @update="update"
            />
          </v-card>
        </v-flex>

        <v-flex md6 px-5 py-3>
          <v-card color="transparent" flat text>
            <table-panel
              :workspace="workspace"
              :items="tables"
              @update="update"
            />
          </v-card>
        </v-flex>

      </v-layout>
    </v-content>
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import api from '@/api';
import TablePanel from '@/components/TablePanel.vue';
import NetworkPanel from '@/components/NetworkPanel.vue';
import GraphDialog from '@/components/GraphDialog.vue';
import DeleteGraphDialog from '@/components/DeleteGraphDialog.vue';
import TableDialog from '@/components/TableDialog.vue';
import DeleteTableDialog from '@/components/DeleteTableDialog.vue';
import DownloadDialog from '@/components/DownloadDialog.vue';

export default Vue.extend({
  name: 'WorkspaceDetail',
  components: {
    TablePanel,
    NetworkPanel,
    GraphDialog,
    DeleteGraphDialog,
    TableDialog,
    DeleteTableDialog,
    DownloadDialog,
  },
  props: {
    workspace: String as PropType<string>,
  },
  data() {
    return {
      editing: false,
      nodeTables: [] as string[],
      edgeTables: [] as string[],
      graphs: [] as string[],
      loading: false,
    };
  },

  computed: {
    tables(): string[] {
      const {
        nodeTables,
        edgeTables,
      } = this;

      return nodeTables.concat(edgeTables);
    },
  },

  watch: {
    workspace() {
      this.update();
    },
  },
  methods: {
    async update(this: any) {
      // Get lists of node and edge tables.
      let nodeTables;
      let edgeTables;

      try {
        this.loading = true;
        nodeTables = await api.tables(this.workspace, { type: 'node' });
        edgeTables = await api.tables(this.workspace, { type: 'edge' });
      } catch (err) {
        this.loading = false;
        if (err.status === 404 && err.statusText === 'Workspace Not Found') {
          this.$router.replace({name: 'home'});
        } else {
          throw err;
        }

        return;
      }

      this.nodeTables = nodeTables;
      this.edgeTables = edgeTables;

      // Get list of graphs.
      this.graphs = await api.graphs(this.workspace);

      this.loading = false;
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
