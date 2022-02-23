<template>
  <v-menu
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
          <!-- See
            https://github.com/vuetifyjs/vuetify/issues/4482#issuecomment-476689473
            for why the `dark` prop is tied to the disabled state of the button.
          -->
          <v-btn
            v-show="userInfo !== null"
            id="add-workspace"
            class="ws-btn ma-0 px-4 py-5"
            block
            color="grey darken-3"
            :dark="!!userInfo"
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
      error: '',
    };
  },

  computed: {
    userInfo: () => store.state.userInfo,
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
