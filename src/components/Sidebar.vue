<template>
  <v-navigation-drawer
    app
    class="app-sidebar"
    fixed
    permanent
    value="true"
    :height="navHeight"
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
              <img
                src="../assets/logo/app_logo.svg"
                alt="Multinet"
                width="100%"
              >
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
      <login-menu />
    </v-toolbar>

    <WorkspaceDialog />

    <v-list subheader>
      <v-tabs
        v-model="tabSelected"
        fixed-tabs
      >
        <v-tab style="width: 126px;">
          Your workspaces
        </v-tab>
        <v-tab style="width: 126px;">
          Public workspaces
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-tabs-items v-model="tabSelected">
        <v-tab-item
          v-for="type of [false, true]"
          :key="type"
        >
          <v-list-item-group color="primary">
            <v-hover
              v-for="space in workspaces"
              :key="space.name"
            >
              <v-list-item
                slot-scope="{ hover }"
                ripple
                :to="`/workspaces/${space.name}/`"
              >
                <v-list-item-action @click.prevent>
                  <v-icon
                    v-if="!hover && !checkbox[space.name]"
                    class="workspace-icon"
                  >
                    library_books
                  </v-icon>

                  <v-checkbox
                    v-else
                    v-model="checkbox[space.name]"
                    class="ws-checkbox"
                  />
                </v-list-item-action>

                <v-list-item-content>
                  <v-list-item-title>{{ space.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-hover>
          </v-list-item-group>

          <delete-workspace-dialog
            ref="dws"
            :something-checked="somethingChecked"
            :selection="selection"
            @deleted="workspaceDeleted"
            @closed="singleSelected = null"
          />
        </v-tab-item>
      </v-tabs-items>

      <div v-if="loading">
        <v-skeleton-loader type="list-item" />
        <v-skeleton-loader type="list-item" />
        <v-skeleton-loader type="list-item" />
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';

import store from '@/store';

import WorkspaceDialog from '@/components/WorkspaceDialog.vue';
import DeleteWorkspaceDialog from '@/components/DeleteWorkspaceDialog.vue';
import AboutDialog from '@/components/AboutDialog.vue';
import LoginMenu from '@/components/LoginMenu.vue';

interface CheckboxTable {
  [index: string]: boolean;
}

export default Vue.extend({

  components: {
    DeleteWorkspaceDialog,
    WorkspaceDialog,
    AboutDialog,
    LoginMenu,
  },
  data() {
    return {
      newWorkspace: '',
      checkbox: {} as CheckboxTable,
      loading: true,
      singleSelected: null as string | null,
      tabSelected: 0,
    };
  },

  computed: {
    workspaces: () => store.state.workspaces,
    somethingChecked(): boolean {
      return Object.values(this.checkbox)
        .some(Boolean);
    },

    checked(): string[] {
      const {
        checkbox,
      } = this;

      return Object.keys(checkbox).filter((d) => !!checkbox[d]);
    },

    navHeight() {
      return this.$vuetify.breakpoint.height - 62; // 62 is height of footer
    },

    selection(): string[] {
      const {
        checked,
        singleSelected,
      } = this;

      if (singleSelected) {
        return [singleSelected];
      }

      return checked;
    },
  },

  async created() {
    try {
      await store.dispatch.fetchWorkspaces();
    } finally {
      this.loading = false;
    }
  },

  methods: {
    route(workspace: string) {
      this.$router.push(`/workspaces/${workspace}`);
    },

    workspaceDeleted() {
      this.checkbox = {};
      this.$router.replace({ name: 'home' });
    },

    deleteWorkspace(ws: string) {
      this.singleSelected = ws;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.$refs.dws as any).dialog = true;
    },
  },
});
</script>

<style scoped>
.app-logo {
  width: 48px;
}

.workspace-icon {
  opacity: .4;
}
</style>

<style>
.app-sidebar .v-navigation-drawer__content {
  overflow: hidden;
}
.v-tab {
  font-size: 10pt !important;
}
</style>
