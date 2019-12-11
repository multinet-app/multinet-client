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
      <v-toolbar-title>multinet</v-toolbar-title>
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

export default Vue.extend({
  data() {
    return {
      newWorkspace: '',
      workspaces: [] as string[],
      checkbox: {},
    };
  },

  components: {
    DeleteWorkspaceDialog,
    WorkspaceDialog,
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

    delayedRefresh(ms) {
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
</style>
