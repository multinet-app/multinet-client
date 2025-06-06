<template>
  <v-container fluid>
    <v-main>
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
              mdi-text-box-multiple
            </v-icon>

            <v-tooltip
              v-if="!editing && hover"
              left
            >
              <template #activator="{ on }">
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
                      mdi-pencil
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
                mdi-close
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
          v-if="loading || childLoading"
          indeterminate
          absolute
          bottom
        />
        <v-spacer />

        <create-modify-dialog :workspace="workspace" @success="startChecking" />
        <workspace-option-menu :workspace="workspace" @loading="handleLoading" />
      </v-app-bar>

      <!-- Display upload status -->
      <v-row
        v-for="upload in uploads"
        :key="upload.id"
      >
        <v-col
          cols="12"
          class="ma-0"
        >
          <v-alert
            v-if="upload.status === 'FAILED'"
            border="left"
            color="red"
            type="error"
            class="mb-0"
          >
            Failed to upload {{ upload.blob.substring(upload.blob.indexOf('/') + 1) }} at {{ new Date(upload.created).toLocaleString() }} because: {{ upload.error_messages.join('. ') }}
          </v-alert>
          <v-alert
            v-else
            border="left"
            color="blue"
            type="info"
            class="mb-0"
          >
            <v-row align="center">
              <v-col class="grow">
                Uploading: {{ upload.blob.substring(upload.blob.indexOf('/') + 1) }}
              </v-col>
              <v-col class="shrink">
                <v-progress-circular
                  indeterminate
                  color="white"
                  size="26"
                />
              </v-col>
            </v-row>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Display network building status -->
      <v-alert
        v-if="networkBuildRequests.length > 0"
        border="left"
        color="blue"
        type="info"
        class="mb-0"
      >
        <v-row align="center">
          <v-col class="grow">
            Your network is being built
          </v-col>
          <v-col class="shrink">
            <v-progress-circular
              indeterminate
              color="white"
              size="26"
            />
          </v-col>
        </v-row>
      </v-alert>

      <session-panel :apps="apps" :workspace="workspace" :loading="loading || childLoading" />

      <v-row class="ma-0">
        <v-col
          cols="6"
          class="px-5"
        >
          <v-card
            color="transparent"
            flat
            text
          >
            <network-panel
              :workspace="workspace"
              :items="networks"
              :loading="loading || childLoading"
              :apps="apps"
            />
          </v-card>
        </v-col>

        <v-col
          cols="6"
          class="px-5"
        >
          <v-card
            color="transparent"
            flat
            text
          >
            <table-panel
              :workspace="workspace"
              :items="tables"
              :loading="loading || childLoading"
              :apps="apps"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-container>
</template>

<script setup lang="ts">
import {
  ref, computed, watch,
} from 'vue';

import { useRouter } from 'vue-router/composables';
import api from '@/api';
import TablePanel from '@/components/TablePanel.vue';
import NetworkPanel from '@/components/NetworkPanel.vue';
import SessionPanel from '@/components/SessionPanel.vue';
import store from '@/store';
import WorkspaceOptionMenu from '@/components/WorkspaceOptionMenu.vue';
import type { App } from '@/types';

const surroundingWhitespace = /^\s+|\s+$/;
const workspaceNameRules: Array<(x: string) => string|boolean> = [
  (x: string) => !!x || 'Workspace name cannot be blank',
  (x: string) => !surroundingWhitespace.test(x) || 'Workspace name cannot begin or end with whitespace',
];

const props = defineProps<{
    workspace: string
    apps: { network_visualizations: App[]; table_visualizations: App[] }
  }>();

const router = useRouter();

const localWorkspace = ref<string | null>(null);
const editing = ref(false);
const requestError = ref<string | null>(null);
const loading = ref(false);
const childLoading = ref(false);
const tables = computed(() => store.getters.tables);
const networks = computed(() => store.getters.networks);
const uploads = computed(() => store.state.uploads.filter(
  // Find uploads with PENDING, STARTED, or FAILED status and that are less than 15 minutes old
  (upload) => (upload.status === 'PENDING' || upload.status === 'STARTED' || upload.status === 'FAILED') && (new Date().getTime() - new Date(upload.created).getTime() < 15 * 60 * 1000),
));
const nameErrorMessages = computed(() => {
  const errors = [
    ...workspaceNameRules.map((rule) => rule(localWorkspace.value as string)),
    requestError,
  ];

  return errors.filter((res): res is string => typeof res === 'string');
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cancelRename() {
  requestError.value = null;
  localWorkspace.value = props.workspace;
  editing.value = false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renameWorkspace() {
  if (nameErrorMessages.value.length) {
    return;
  }

  if (localWorkspace.value === props.workspace) {
    editing.value = false;
    return;
  }

  if (localWorkspace.value !== null) {
    try {
      const { name } = await api.renameWorkspace(props.workspace, localWorkspace.value);
      router.push(`/workspaces/${name}`);
      editing.value = false;
      requestError.value = null;

      store.dispatch.fetchWorkspaces();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response.status === 409) {
        requestError.value = 'A workspace by that name already exists';
      } else {
        requestError.value = `${Object.values(err.response.data).flat()[0]}`;
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function update(this: any) {
  loading.value = true;

  localWorkspace.value = props.workspace;
  await store.dispatch.fetchWorkspace(props.workspace);
  loading.value = false;
}

// handle the loading state from child emits function
function handleLoading(newLoading: boolean) {
  childLoading.value = newLoading;
}

watch(() => props.workspace, () => update());
watch(localWorkspace, () => { requestError.value = null; });

const networkBuildRequests = ref<number[]>([]);
async function checkNetworkBuilds() {
  networkBuildRequests.value = await api.networkBuildRequests(props.workspace);

  if (networkBuildRequests.value.length === 0) {
    update();
    return true;
  }
  return false;
}

async function startCheckingNetworkBuilds() {
  let timeout = 30 * 1000;
  const interval = 3 * 1000;

  const checkUploadInterval = setInterval(async () => {
    if ((await checkNetworkBuilds()) || timeout <= 0) {
      clearInterval(checkUploadInterval);
    }

    timeout -= interval;
  }, interval);
}

async function checkUpload(upload: { id: number }) {
  const newUploadStatus = await api.uploads(props.workspace);
  store.commit.setUploads(newUploadStatus.results);

  const relevantUpload = uploads.value.find((u) => u.id === upload.id);
  if (relevantUpload === undefined || relevantUpload.status === 'FAILED') {
    update();
    return true;
  }
  return false;
}

async function startCheckingUpload(upload: { id: number }) {
  if (await checkUpload(upload)) {
    return;
  }

  let timeout = 30 * 1000;
  const interval = 3 * 1000;

  const checkUploadInterval = setInterval(async () => {
    if ((await checkUpload(upload)) || timeout <= 0) {
      clearInterval(checkUploadInterval);
    }

    timeout -= interval;
  }, interval);
}

function startChecking(upload: { id: number } | undefined) {
  if (upload !== undefined) {
    startCheckingUpload(upload);
  }
  startCheckingNetworkBuilds();
}

update();
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
