<template>
  <v-menu
    v-model="popover"
    class="get-started"
    :close-on-content-click="false"
    max-width="275"
    offset-x
    origin="center center"
    transition="scale-transition"
  >
    <template v-slot:activator="{ }">
      <v-dialog
        v-model="dialog"
        class="ws-dialogue"
        width="500"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            id="add-workspace"
            class="ws-btn ma-0 px-4 py-5"
            block
            color="grey darken-3"
            dark
            depressed
            large
            v-on="on"
          >
            New Workspace
            <v-spacer />
            <v-icon
              right
              dark
              size="20px"
            >
              add_circle
            </v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title
            class="headline pb-0 pt-3"
            primary-title
          >
            Create Workspace
          </v-card-title>

          <v-card-text class="px-4 pt-4 pb-1">
            <v-text-field
              id="workspace-name"
              v-model="newWorkspace"
              autofocus
              dense
              outlined
              label="Workspace name"
              :error-messages="error ? [error] : []"
            />
          </v-card-text>

          <v-divider />

          <v-card-actions class="px-4 py-3">
            <v-spacer />
            <v-btn
              id="create-workspace"
              color="grey darken-3"
              dark
              depressed
              @click="create"
            >
              Create Workspace
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
    <v-card>
      <v-card-title class="get-started-title pb-2">
        Getting Started
      </v-card-title>
      <v-card-text class="pb-5">
        Click <strong>NEW WORKSPACE</strong> to create a workspace or select an existing one from the Workpaces list.
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          id="got-it"
          color="primary"
          small
          @click="popover = false"
        >
          Got it!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';
import store from '@/store';

export default Vue.extend({
  data() {
    return {
      dialog: false,
      newWorkspace: '',
      popover: true,
      error: '',
    };
  },

  watch: {
    dialog() {
      if (this.dialog) {
        this.error = '';
      }
    },
  },

  methods: {
    async create() {
      if (this.newWorkspace) {
        try {
          const response = await api.createWorkspace(this.newWorkspace);

          if (response) {
            store.dispatch.fetchWorkspaces();

            this.$router.push(`/workspaces/${this.newWorkspace}`);
            this.newWorkspace = '';
            this.dialog = false;
          }
        } catch (err) {
          if (err.status === 409) {
            this.error = `Workspace "${err.data}" already exists!`;
          } else {
            this.error = `Error creating workspace: ${err.status}`;
          }
        }
      }
    },
  },
});
</script>

<style scoped>

.v-btn.ws-btn {
  border-radius: 0;
  height: 59px !important;
}

.get-started {
  position: relative;
}
</style>
