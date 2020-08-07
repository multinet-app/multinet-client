<template>
  <v-container fluid>
    <v-content>
      <v-app-bar app>
        <v-hover>
          <v-toolbar-title
            slot-scope="{ hover }"
            class="ws-detail-title"
          >
            <v-icon
              v-if="!hover && !editing"
              class="ml-4 mr-5"
              color="grey lighten-1"
            >
              library_books
            </v-icon>

            <v-tooltip
              v-if="!editing && hover"
              left
            >
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
                    >
                      edit
                    </v-icon>
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
              >
                close
              </v-icon>
            </v-btn>

            <v-text-field
              v-if="editing"
              v-model="localWorkspace"
              autofocus
              background-color="transparent"
              class="ws-rename"
              text
              solo
              flat
              dense
              :error-messages="nameErrorMessages"
              @focus="$event.target.select()"
              @keydown.enter="renameWorkspace"
              @keydown.esc="cancelRename"
            />

            <span v-else>{{ workspace }}</span>
          </v-toolbar-title>
        </v-hover>
        <v-progress-linear
          v-if="loading"
          indeterminate
          absolute
          bottom
        />
        <v-spacer />

        <v-menu
          v-model="actionsMenu"
          max-width="275"
          offset-y
          origin="center center"
          transition="scale-transition"
        >
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              v-on="on"
            >
              <v-icon>more_vert</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-list
              dense
              width="224"
            >
              <!-- Each listing here should contain a v-list-item -->
              <PermissionsDialog :workspace="workspace" />
            </v-list>
          </v-card>
        </v-menu>
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
            <network-panel
              :workspace="workspace"
              :items="graphs"
              :node-tables="nodeTables"
              :edge-tables="edgeTables"
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
            <table-panel
              :workspace="workspace"
              :items="tables"
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
import PermissionsDialog from '@/components/PermissionsDialog.vue';
import store from '@/store';

const surroundingWhitespace = /^\s+|\s+$/;
const workspaceNameRules: Array<(x: string) => string|boolean> = [
  (x: string) => !!x || 'Workspace name cannot be blank',
  (x: string) => !surroundingWhitespace.test(x) || 'Workspace name cannot begin or end with whitespace',
];

export default Vue.extend({
  name: 'WorkspaceDetail',
  components: {
    TablePanel,
    NetworkPanel,
    PermissionsDialog,
  },
  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    return {
      localWorkspace: null as string | null,
      editing: false,
      requestError: null as string | null,
      loading: false,
      actionsMenu: false,
    };
  },

  computed: {
    nodeTables: () => store.getters.nodeTables,
    edgeTables: () => store.getters.edgeTables,
    graphs: () => store.getters.graphs,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nameErrorMessages(this: any): string[] {
      const { requestError } = this;
      const errors = [
        ...workspaceNameRules.map((rule) => rule(this.localWorkspace as string)),
        requestError,
      ];

      return errors.filter((res): res is string => typeof res === 'string');
    },
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    localWorkspace(this: any) {
      // Once the user types, clears the error returned on sending the rename API call.
      this.requestError = null;
    },
  },
  created() {
    this.update();
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cancelRename(this: any) {
      this.requestError = null;
      this.localWorkspace = this.workspace;
      this.editing = false;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          const { data } = await api.renameWorkspace(this.workspace, this.localWorkspace);
          this.$router.push(`/workspaces/${data}`);
          this.editing = false;
          this.requestError = null;

          store.dispatch.fetchWorkspaces();
        } catch (err) {
          if (err.response.status === 409) {
            this.requestError = 'A workspace by that name already exists';
          } else {
            this.requestError = err.response.statusText;
          }
        }
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async update(this: any) {
      this.loading = true;

      this.localWorkspace = this.workspace;
      await store.dispatch.fetchWorkspace(this.workspace);

      this.loading = false;
    },
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
