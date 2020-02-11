<template>
  <v-menu
    class="get-started"
    :close-on-content-click="false"
    max-width="275"
    offset-x
    origin="center center"
    transition="scale-transition"
    v-model="popover"
  >
    <template v-slot:activator="{ on }">
      <v-dialog
        class="ws-dialogue"
        v-model="dialog"
        width="500"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            class="ws-btn ma-0 px-4 py-5"
            block
            color="grey darken-3"
            dark
            depressed
            large
            v-on="on"
            id="add-workspace"
          >
            New Workspace
            <v-spacer />
            <v-icon
              right
              dark
              size="20px"
            >add_circle</v-icon>
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
              autofocus
              filled
              label="Workspace name"
              v-model="newWorkspace"
            />
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="px-4 py-3">
            <v-spacer></v-spacer>
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
      <v-card-title class="get-started-title pb-2">Getting Started</v-card-title>
      <v-card-text class="pb-5">
        Click <strong>NEW WORKSPACE</strong> to create a workspace or select an existing one from the Workpaces list.
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          id="got-it"
          color="primary"
          @click="popover = false"
          small
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

export default Vue.extend({
  data() {
    const dialog: boolean = false;
    const newWorkspace: string = '';

    return {
      dialog,
      newWorkspace,
      popover: true,
    };
  },
  methods: {
    async create() {
      if (this.newWorkspace) {
        const response = await api.createWorkspace(this.newWorkspace);

        if (response) {
          this.$router.push(`/workspaces/${this.newWorkspace}`);
          this.$emit('created', this.newWorkspace);
          this.newWorkspace = '';
          this.dialog = false;
        }
      }
    },
  },
});
</script>

<style scoped>

.v-btn.ws-btn {
  border-radius: 0;
  height: auto !important;
}

.get-started {
  position: relative;
}
</style>
