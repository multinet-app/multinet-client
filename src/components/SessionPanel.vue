<template>
  <div class="px-5">
    <v-subheader class="px-0">
      <h2 class="black--text">
        Sessions
      </h2>
    </v-subheader>

    <v-divider />

    <v-row v-if="sessions.length > 0" class="px-16 mx-16 mt-2" :style="{ height: '160px', maxHeight: '160px', overflowY: 'scroll' }">
      <v-col v-for="session, idx in sessions" :key="`session-${session.visapp}-${idx}-${session.id}`" cols="4">
        <v-skeleton-loader v-if="session.id === '_skeleton'" type="card" height="120" />
        <v-card
          v-else
          color="grey lighten-3"
          height="120"
          hover
          @click="openSession(session)"
          @contextmenu="showContextMenu($event, session)"
        >
          <v-card-text class="pa-6 pt-7 dont-wrap">
            <v-tooltip right open-delay="500">
              <template #activator="{ on, attrs }">
                <p
                  v-bind="attrs"
                  class="mb-0 dont-wrap"
                  v-on="on"
                >
                  <strong class="black--text">Name:</strong> {{ session.name }}
                </p>
              </template>
              <span>{{ session.name }}</span>
            </v-tooltip>
            <strong class="black--text">App:</strong> {{ session.visapp }} <br />
            <v-tooltip right open-delay="500">
              <template #activator="{ on, attrs }">
                <p
                  v-bind="attrs"
                  class="mb-0 dont-wrap"
                  v-on="on"
                >
                  <strong class="black--text">{{ session.network !== undefined ? 'Network' : 'Table' }}:</strong> {{ networks.find((network) => network.id === session.network)?.name || tables.find((table) => table.id === session.table)?.name }}
                </p>
              </template>
              <span>{{ networks.find((network) => network.id === session.network)?.name || tables.find((table) => table.id === session.table)?.name }}</span>
            </v-tooltip>

            <v-btn
              v-if="session.starred"
              fab
              tile
              color="grey lighten-3"
              top
              left
              absolute
              x-small
              depressed
              :style="{
                top: '0px', left: '0px', pointerEvents: 'none', backgroundColor: 'transparent !important',
              }"
              v-bind="attrs"
              v-on="on"
              @click.prevent
            >
              <v-icon>mdi-star</v-icon>
            </v-btn>

            <v-tooltip top color="error">
              <template #activator="{ on, attrs }">
                <v-btn
                  fab
                  tile
                  top
                  right
                  z
                  absolute
                  x-small
                  elevation="0"
                  :style="{ top: '0px', right: '0px' }"
                  v-bind="attrs"
                  v-on="on"
                  @click="deleteClicked(session)"
                  @click.stop
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
              <span>Delete Session</span>
            </v-tooltip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div v-else class="my-4 text-center">
      <v-icon color="blue lighten-1">
        mdi-information
      </v-icon> Click on the <strong>Visualize in &lt;vis app&gt;</strong> button in the <strong>Network</strong> or <strong>Table</strong> panel to create a new session.
    </div>

    <v-menu
      v-model="contextMenu.show"
      :position-x="contextMenu.left"
      :position-y="contextMenu.top"
    >
      <v-list>
        <v-list-item @click="openRenamingDialog">
          Rename Session
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog v-model="showRenamingDialog">
      <v-card>
        <v-card-title>
          Rename Session
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newSessionName"
            label="New Session Name"
            outlined
            dense
            clearable
            :rules="[() => !!newSessionName || 'Name is required']"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="showRenamingDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" text @click="renameSession">
            Rename
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import store from '@/store';
import type { App } from '@/types';
import type { Session } from 'multinet';
import { computed, ref } from 'vue';
import { deleteSession, visualizeWithExistingSession } from '@/utils/sessionHelpers';
import api from '@/api';

const props = defineProps<{
  apps: { network_visualizations: App[]; table_visualizations: App[] };
  workspace: string;
  loading: boolean;
}>();

const sessions = computed(() => (props.loading ? Array(3).fill({ id: '_skeleton' }) : store.getters.sessions));
const networks = computed(() => store.getters.networks);
const tables = computed(() => store.getters.tables);

function openSession(session: Session) {
  const type = session.network !== undefined ? 'network' : 'table';
  const visapp = props.apps[`${type}_visualizations`].find((app) => app.name === session.visapp);
  const item = type === 'table' ? tables.value.find((table) => table.id === session.table) : networks.value.find((network) => network.id === session.network);

  if (visapp === undefined || item === undefined) {
    return;
  }

  visualizeWithExistingSession(item, visapp, type, props.workspace, session.id);
}

async function deleteClicked(session: Session) {
  if (session.starred) {
    return;
  }

  const type = session.network !== undefined ? 'network' : 'table';
  store.commit.deleteSessionFromStore(session.id);
  await deleteSession(props.workspace, session.id, type);
}

const contextMenu = ref({
  show: false, top: 0, left: 0, session: null as Session | null,
});

function showContextMenu(event: MouseEvent, session: Session) {
  contextMenu.value = {
    show: true,
    top: event?.clientY,
    left: event?.clientX,
    session,
  };
  event.preventDefault();
}

const showRenamingDialog = ref(false);
const newSessionName = ref('');
function openRenamingDialog() {
  showRenamingDialog.value = true;
  if (contextMenu.value.session !== null) {
    newSessionName.value = contextMenu.value.session.name;
  }
}
function renameSession() {
  if (contextMenu.value.session !== null) {
    contextMenu.value.session.name = newSessionName.value;
    const type = contextMenu.value.session.network !== undefined ? 'network' : 'table';
    api.renameSession(props.workspace, contextMenu.value.session.id, type, newSessionName.value);
  }
  showRenamingDialog.value = false;
}
</script>

<style>
.v-carousel {
  overflow: visible;
}

.v-carousel__item {
  overflow: visible;
}

.dont-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
