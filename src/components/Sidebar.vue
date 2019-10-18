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

          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <div>
                <v-scroll-x-transition>
                  <v-btn
                    icon
                    small
                    text
                    v-if="somethingChecked"
                    v-on="on"
                  >
                    <v-icon color="red accent-3" size="22px">delete_sweep</v-icon>
                  </v-btn>
                </v-scroll-x-transition>
              </div>
            </template>
            <span>Delete selected</span>
          </v-tooltip>
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
            <v-fade-transition hide-on-leave>
              <v-icon
                color="primary"
                v-if="!hover && !checkbox[space]"
              >library_books</v-icon>

              <v-checkbox
                class="ws-checkbox"
                v-else
                v-model="checkbox[space]"
              ></v-checkbox>
            </v-fade-transition>
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

export default Vue.extend({
  data() {
    return {
      newWorkspace: '',
      workspaces: [] as string[],
      checkbox: {},
    };
  },
  components: {
    WorkspaceDialog,
  },
  computed: {
    somethingChecked(): boolean {
      return Object.values(this.checkbox)
        .some((d) => !!d);
    },
  },
  methods: {
    route(workspace: string) {
      this.$router.push(`/workspaces/${workspace}`);
    },
    addWorkspace(workspace: string) {
      const workspaces = this.workspaces.concat([workspace]);
      this.workspaces = workspaces.sort();
    },
  },
  async created() {
    const response = await api().get('/workspaces');
    this.workspaces = response.data;
  },
});
</script>

<style scoped>
</style>
