<template>
  <v-navigation-drawer
    app
    fixed
    permanent
    stateless
    value="true"
  >
    <v-toolbar
      color="grey lighten-2"
    >
      <v-toolbar-title class="d-flex align-center">
        <router-link
          :to="{
            name: 'home',
          }"
          tag="button"
        >
          <v-row class="mx-0 align-center">
            <v-col class="app-logo pb-0 pt-2 px-0">
              <img src="../assets/logo/app_logo.svg" alt="Multinet" width="100%">
            </v-col>
            <v-col class="text-left">
              Multinet
            </v-col>
            <v-col class="pa-0">
              <about-dialog />
            </v-col>
          </v-row>
        </router-link>
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon>
        <v-avatar
          color="grey lighten-4"
          size="36px"
        >
          <v-icon color="grey">account_circle</v-icon>
        </v-avatar>
      </v-btn>
    </v-toolbar>

    <WorkspaceDialog
      @created="addWorkspace"
    />

    <v-list subheader>
      <v-subheader class="pr-2">
        Your Workspaces
        <v-spacer />

          <delete-workspace-dialog
            :somethingChecked="somethingChecked"
            :selection="selection"
            @deleted="delayedRefresh(1000)"
            />

      </v-subheader>

      <v-divider></v-divider>

      <v-hover
        v-for="space in workspaces"
        :key="space"
      >
        <v-list-item
          ripple
          slot-scope="{ hover }"
          :to="`/workspaces/${space}/`"
        >
          <v-list-item-action @click.prevent>
            <v-icon
              color="primary"
              v-if="!hover && !checkbox[space]"
            >library_books</v-icon>

            <v-checkbox
              class="ws-checkbox"
              v-else
              v-model="checkbox[space]"
            ></v-checkbox>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{space}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-hover>
    </v-list>

  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';
import WorkspaceDialog from '@/components/WorkspaceDialog.vue';
import DeleteWorkspaceDialog from '@/components/DeleteWorkspaceDialog.vue';
import AboutDialog from '@/components/AboutDialog.vue';

interface CheckboxTable {
  [index: string]: boolean;
}

export default Vue.extend({
  data() {
    return {
      newWorkspace: '',
      workspaces: [] as string[],
      checkbox: {} as CheckboxTable,
    };
  },

  components: {
    DeleteWorkspaceDialog,
    WorkspaceDialog,
    AboutDialog,
  },

  computed: {
    somethingChecked(): boolean {
      return Object.values(this.checkbox)
        .some((d) => !!d);
    },

    selection(): string[] {
      const {
        checkbox,
      } = this;

      return Object.keys(checkbox).filter((d) => !!checkbox[d]);
    },
  },

  methods: {
    route(workspace: string) {
      this.$router.push(`/workspaces/${workspace}`);
    },

    unroute() {
      this.$router.replace('/');
    },

    addWorkspace(workspace: string) {
      const workspaces = this.workspaces.concat([workspace]);
      this.workspaces = workspaces.sort();
    },

    delayedRefresh(ms: number) {
      this.checkbox = {};
      this.unroute();
      window.setTimeout(() => this.refresh(), ms);
    },

    async refresh() {
      this.workspaces = await api.workspaces();
    },
  },

  async created() {
    this.refresh();
  },
});
</script>

<style scoped>
.app-logo {
  width: 48px;
}
</style>
