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
          class="actions-menu"
          max-width="275"
          offset-y
          origin="center center"
          transition="scale-transition"
        >
          <template v-slot:activator="{ }">
            <v-btn
              icon
              @click="actionsMenu = true"
            >
              <v-icon>more_vert</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-list
              dense
              width="224"
            >
              <v-list-item
                ripple
                @click.stop="permDialog = true"
              >
                <v-list-item-icon class="mr-3">
                  <v-icon>vpn_key</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  Permissions
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-app-bar>

      <v-dialog
        v-model="permDialog"
        max-width="600"
      >
        <v-card>
          <v-card-title class="perm-title">
            <v-row
              align="center"
              justify="space-between"
            >
              <v-col cols="8">
                Permissions for&nbsp;<strong>{{ workspace }}</strong>
              </v-col>
              <v-col
                cols="3"
              >
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-switch
                      v-model="privacyToggle"
                      :append-icon="swapPermIcon"
                      class="no-label ma-0 pa-0 ml-2"
                      hide-details
                      inset
                      v-on="on"
                    />
                  </template>
                  <span v-if="privacyToggle">Make public</span>
                  <span v-else>Make private</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-content>
            <v-card
              class="global-perm grey darken-3 pa-5"
              dark
              flat
              tile
            >
              <v-row>
                <v-spacer />
                <v-col
                  class="py-0"
                  cols="10"
                >
                  <v-autocomplete
                    :items="['jarred.tomatoes@kitware.com', 'jakey.nesby@kitware.com', 'maca_roni.chowdery@kitware.com']"
                    append-icon=""
                    chips
                    class="px-0"
                    deletable-chips
                    label="Give permissions by email"
                    full-width
                    hide-details
                    hide-no-data
                    hide-selected
                    multiple
                    outlined
                  />
                </v-col>
                <v-col class="py-0">
                  <v-tooltip right>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        color="grey"
                        dark
                        fab
                        medium
                        outlined
                        v-on="on"
                      >
                        <v-icon>add</v-icon>
                      </v-btn>
                    </template>
                    <span>Add selected</span>
                  </v-tooltip>
                </v-col>
                <v-spacer />
              </v-row>
            </v-card>
            <v-card
              class="pa-5"
              flat
            >
              <v-card-content>
                <v-list>
                  <v-subheader class="pa-3">
                    <v-row align-items="center">
                      <v-col
                        class="user-list-heading pa-1"
                        cols="8"
                      >
                        Set individual permissions:
                      </v-col>
                      <v-col class="user-list-all-select pa-0">
                        <v-select
                          :items="['owner','maintainer','writer','reader']"
                          class="no-border ma-0 pa-0"
                          hide-details
                          dense
                          placeholder="change all to"
                          prepend-icon="more_horiz"
                        />
                      </v-col>
                    </v-row>
                  </v-subheader>
                  <v-divider />
                  <v-list-item class="px-0">
                    <v-list-item-avatar>
                      <v-icon>account_circle</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="blue--text text--darken-2">
                        jakey.nesby@kitware.com
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action class="user-list-individual-select">
                      <v-select
                        :items="['owner','maintainer','writer','reader']"
                        class="no-border ma-0 pa-0"
                        hide-details
                        dense
                        value="owner"
                        prepend-icon="lock"
                      />
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider />
                  <v-list-item class="px-0">
                    <v-list-item-avatar>
                      <v-icon>account_circle</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="blue--text text--darken-2">
                        maca_roni.chowdery@kitware.com
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action class="user-list-individual-select">
                      <v-select
                        :items="['owner','maintainer','writer','reader']"
                        class="no-border ma-0 pa-0"
                        hide-details
                        dense
                        value="maintainer"
                        prepend-icon="lock"
                      />
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider />
                  <v-list-item class="px-0">
                    <v-list-item-avatar>
                      <v-icon>account_circle</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="blue--text text--darken-2">
                        jarred.tomatoes@kitware.com
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action class="user-list-individual-select">
                      <v-select
                        :items="['owner','maintainer','writer','reader']"
                        class="no-border ma-0 pa-0"
                        hide-details
                        dense
                        value="reader"
                        prepend-icon="lock"
                      />
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider />
                </v-list>
              </v-card-content>
              <v-card-actions class="pt-4">
                <v-spacer />
                <v-btn
                  color="grey darken-2"
                  large
                  text
                  @click="permDialog = false"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="primary"
                  depressed
                  large
                >
                  Save Permissions
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-card-content>
        </v-card>
      </v-dialog>

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
      permDialog: false,
      privacyToggle: true,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    swapPermIcon(this: any) {
      return this.privacyToggle ? 'lock' : 'lock_open';
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

.user-list-heading {
  font-size: 14px !important;
}

.user-list-individual-select {
  max-width: 175px;
}

.v-dialog > .v-card > .v-card__title.perm-title {
  font-size: 24px;
  font-weight: 400;
}

.v-dialog > .v-card > .v-card__title.perm-title strong {
  font-weight: 600;
}

.ws-detail-title {
  align-items: center;
  display: flex;
  letter-spacing: 0;
  width: 95%;
}
</style>

<style>
.v-text-field.no-border > .v-input__control > .v-input__slot:before,
.v-text-field.no-border > .v-input__control > .v-input__slot:after {
  display: none;
}

.v-application--is-ltr .no-label .v-input__append-outer,
.v-application--is-ltr .no-label .v-input__prepend-outer {
  margin: 0;
}

.no-label {
  justify-content: flex-end;
}

.user-list-all-select .v-select__selections,
.user-list-individual-select .v-select__selections {
  font-size: 14px;
}

.v-application--is-ltr .no-label .v-input--selection-controls__input {
  margin: 0;
}

.v-application--is-ltr .no-label .v-input__control {
  flex-grow: 0;
  width: unset;
}

.global-perm-select.v-text-field > .v-input__control > .v-input__slot:before,
.global-perm-select.v-text-field > .v-input__control > .v-input__slot:after {
    border-width: 0;
    border-color: transparent;
}

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
