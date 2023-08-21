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
            <v-col class="pb-1 px-0 ">
              <img
                id="multinet-logo"
                src="../assets/logo/app_logo.svg"
                alt="Multinet Logo"
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
      <login-menu
        :user-info="userInfo"
        :oauth-client="oauthClient"
        :logout="store.dispatch.logout"
        :fetch-user-info="store.dispatch.fetchUserInfo"
      />
    </v-toolbar>

    <WorkspaceDialog />

    <v-list subheader>
      <v-tabs
        v-model="tabSelected"
        fixed-tabs
        hide-slider
      >
        <v-tab
          v-show="userInfo !== null"
          style="width: 126px;"
        >
          Your workspaces
        </v-tab>
        <v-tab style="width: 126px;">
          Public workspaces
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-tabs-items v-model="tabSelected">
        <div
          v-for="publicSpace of [false, true]"
          :key="`${publicSpace}`"
        >
          <v-tab-item
            v-show="userInfo !== null || publicSpace"
          >
            <!-- Starred workspaces section of public -->
            <v-list-item-group v-if="publicSpace" color="primary">
              <v-subheader>
                <v-icon class="mr-2">
                  mdi-star-box-multiple
                </v-icon>
                Starred Workspaces
              </v-subheader>
              <v-hover
                v-for="space in publicWorkspaces.filter((w) => w.starred)"
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
                      mdi-star-box
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
              <v-divider class="mt-4" />
            </v-list-item-group>
            <v-list-item-group color="primary">
              <v-subheader v-if="publicSpace">
                <v-icon class="mr-2">
                  mdi-text-box-multiple
                </v-icon>
                Other Workspaces
              </v-subheader>
              <v-autocomplete
                v-model="singleSelected"
                :class="publicSpace ? 'px-4' : 'px-4 mt-4'"
                :items="(publicSpace ? publicWorkspaces.filter((w) => !w.starred) : personalWorkspaces).map((w) => w.name)"
                dense
                hide-no-data
                item-text="name"
                label="Search for a workspace"
                placeholder="Search for a workspace"
                return-object
                single-line
                auto-select-first
                @input="openWorkspace"
              />
              <v-hover
                v-for="space in (publicSpace ? publicWorkspaces.filter((w) => !w.starred) : personalWorkspaces)"
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
                      mdi-text-box
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
        </div>
      </v-tabs-items>

      <div v-if="loading">
        <v-skeleton-loader type="list-item" />
        <v-skeleton-loader type="list-item" />
        <v-skeleton-loader type="list-item" />
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import store from '@/store';

import WorkspaceDialog from '@/components/WorkspaceDialog.vue';
import DeleteWorkspaceDialog from '@/components/DeleteWorkspaceDialog.vue';
import AboutDialog from '@/components/AboutDialog.vue';
import { LoginMenu } from 'multinet-components';
import type { CheckboxTable } from '@/types';
import { useCurrentInstance } from '@/utils/use';
import oauthClient from '@/oauth';
import { useRouter } from 'vue-router/composables';

const checkbox: Ref<CheckboxTable> = ref({});
const loading = ref(true);
const singleSelected: Ref<string | null> = ref(null);
const tabSelected = ref(1);

const workspaces = computed(() => store.state.workspaces);
const publicWorkspaces = computed(() => workspaces.value.filter((d) => d.public));
const personalWorkspaces = computed(() => workspaces.value.filter((d) => !d.public));
const userInfo = computed(() => store.state.userInfo);
const somethingChecked = computed(() => Object.values(checkbox.value).some(Boolean));
const checked = computed(() => Object.keys(checkbox.value).filter((d) => !!checkbox.value[d]));
const currentInstance = useCurrentInstance();
const navHeight = computed(() => (currentInstance.proxy.$vuetify.breakpoint.height - 62));
const selection = computed(() => (singleSelected.value ? [singleSelected.value] : checked.value));

watch(userInfo, (newUserInfo) => {
  if (newUserInfo !== null) {
    tabSelected.value = 0;
  } else {
    tabSelected.value = 1;
  }
});

store.dispatch.fetchWorkspaces().then(() => { loading.value = false; });

const router = useRouter();

function workspaceDeleted() {
  checkbox.value = {};
  if (router !== null) {
    router.replace({ name: 'home' });
  }
}

const dws = ref(null);

function openWorkspace() {
  if (singleSelected.value !== null) {
    router.push(`/workspaces/${singleSelected.value}`);
  }
}
</script>

<style scoped>
#multinet-logo {
  height: 32px;
  width: 32px;
}

.workspace-icon {
  opacity: .4;
}
</style>

<style>
.v-tab {
  font-size: 10pt !important;
}

/* Stop tab carousel */
.v-tabs-bar__content {
  width: 100%;
}
</style>
