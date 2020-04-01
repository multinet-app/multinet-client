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
                @click="cancelRename"
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
              dense
              v-model="localWorkspace"
              @keydown.enter="renameWorkspace"
              @keydown.esc="cancelRename"
              :error-messages="nameErrorMessages"
            >
            </v-text-field>

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
              ref="graphPanel"
              title="Networks"
              :items="graphs"
              :workspace="workspace"
              route-type="graph"
              icon="timeline"
            >
              <graph-dialog
                :node-tables="nodeTables"
                :edge-tables="edgeTables"
                :workspace="workspace"
                @success="update"
              />
              <template v-slot:deleter="deleter">
                <delete-graph-dialog
                  :selection="deleter.selection"
                  :workspace="deleter.workspace"
                  @deleted="update"
                />
              </template>
              <template v-slot:downloader="downloader">
                <download-dialog
                  :selection="downloader.selection"
                  :workspace="downloader.workspace"
                  downloadType="network"
                  @downloaded="update"
                />
              </template>
            </item-panel>
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
              ref="tablePanel"
              title="Tables"
              :items="tables"
              :workspace="workspace"
              route-type="table"
              icon="table_chart"
              >
                <table-dialog
                  :workspace="workspace"
                  @success="update"
                />
                <template v-slot:deleter="deleter">
                  <delete-table-dialog
                    :selection="deleter.selection"
                    :workspace="deleter.workspace"
                    @deleted="update"
                  />
                </template>
                <template v-slot:downloader="downloader">
                  <download-dialog
                    :selection="downloader.selection"
                    :workspace="downloader.workspace"
                    downloadType="table"
                    @downloaded="update"
                  />
                </template>
            </item-panel>
          </v-card>
        </v-flex>
      </v-layout>
    </v-content>
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters } from 'vuex';

import api from '@/api';
import ItemPanel from '@/components/ItemPanel.vue';
import GraphDialog from '@/components/GraphDialog.vue';
import DeleteGraphDialog from '@/components/DeleteGraphDialog.vue';
import TableDialog from '@/components/TableDialog.vue';
import DeleteTableDialog from '@/components/DeleteTableDialog.vue';
import DownloadDialog from '@/components/DownloadDialog.vue';
import store from '@/store';

const surroundingWhitespace = /^\s+|\s+$/;
const workspaceNameRules: Array<(x: string) => string|boolean> = [
  (x: string) => !!x || 'Workspace name cannot be blank',
  (x: string) => !surroundingWhitespace.test(x) || 'Workspace name cannot begin or end with whitespace',
];

export default Vue.extend({
  name: 'WorkspaceDetail',
  components: {
    ItemPanel,
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
      localWorkspace: null as string | null,
      editing: false,
      requestError: null as string | null,
      loading: false,
    };
  },

  computed: {
    // ...mapGetters(['nodeTables, edgeTables, graphs']),
    nodeTables(): string[] {
      return this.currentWorkspace && this.currentWorkspace.nodeTables
        ? this.currentWorkspace.nodeTables
        : [];
    },
    edgeTables(): string[] {
      return this.currentWorkspace && this.currentWorkspace.edgeTables
        ? this.currentWorkspace.edgeTables
        : [];
    },
    graphs(): string[] {
      return this.currentWorkspace && this.currentWorkspace.graphs
        ? this.currentWorkspace.graphs
        : [];
    },
    nameErrorMessages(this: any): string[] {
      const { requestError } = this;
      const errors = [
        ...workspaceNameRules.map((rule) => rule(this.localWorkspace as string)),
        requestError,
      ];

      return errors.filter((res): res is string => typeof res === 'string');
    },
    tables(this: any): string[] {
      const {
        nodeTables,
        edgeTables,
      } = this;

      return nodeTables.concat(edgeTables);
    },
    currentWorkspace: () => store.state.currentWorkspace,
  },

  watch: {
    workspace(this: any) {
      this.update();
    },
    localWorkspace(this: any) {
      // Once the user types, clears the error returned on sending the rename API call.
      this.requestError = null;
    },
  },
  methods: {
    cancelRename(this: any) {
      this.requestError = null;
      this.localWorkspace = this.workspace;
      this.editing = false;
    },
    async renameWorkspace(this: any) {
      if (this.nameErrorMessages.length) {
        return;
      }

      if (this.localWorkspace === this.workspace) {
        this.editing = false;
        return;
      }

      if (this.localWorkspace !== null) {
        try {
          const { status, data } = await api.renameWorkspace(this.workspace, this.localWorkspace);
          this.$router.push(`/workspaces/${data}`);
          this.editing = false;
          this.requestError = null;

          // TODO: REMOVE THIS REF WHEN VUEX IS ADDED
          this.$emit('update');
        } catch (err) {
          if (err.response.status === 409) {
            this.requestError = 'A workspace by that name already exists';
          } else {
            this.requestError = err.response.statusText;
          }
        }
      }
    },
    async update(this: any) {
      this.loading = true;

      store.dispatch.fetchWorkspace(this.workspace);
      if (Object.keys(this.$refs).length) {
        this.$refs.graphPanel.clearCheckboxes();
        this.$refs.tablePanel.clearCheckboxes();
      }

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

.ws-rename.v-text-field.v-text-field--enclosed:not(.v-text-field--rounded) > .v-input__control > .v-input__slot {
  font-size: 20px;
  letter-spacing: 2px;
  padding-top: 15px;
}

.ws-rename.v-text-field.v-text-field--enclosed .v-text-field__details .error--text {
  background: rgba(255, 23, 68, 0.9);
  border-radius: 3px;
  color: #fff !important;
  padding: 7px 10px;
  position: absolute;
  top: 54px;
}

.ws-rename.v-text-field.v-text-field--enclosed .v-text-field__details .error--text:before {
  border-style: solid;
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent rgba(255, 23, 68, 0.9) transparent;
  content:'';
  height: 0;
  position: absolute;
  bottom: 100%;
  left: 9px;
  width: 0;
}

.choose-tables.v-select .v-select__selections {
  min-height: auto !important;
}
</style>
