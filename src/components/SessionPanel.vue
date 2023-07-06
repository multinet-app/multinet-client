<template>
  <div class="px-5">
    <v-subheader class="px-0">
      <h2 class="black--text">
        Sessions
      </h2>
    </v-subheader>

    <v-divider />

    <v-row v-if="sessions.length > 0" class="px-16 mx-16 mt-2" :style="{ height: '160px', maxHeight: '160px', overflow: 'scroll' }">
      <v-col v-for="session, idx in sessions" :key="`session-${session.visapp}-${idx}-${session.id}`" cols="4">
        <v-skeleton-loader v-if="session.id === '_skeleton'" type="card" height="120" />
        <v-card v-else color="grey lighten-3" height="120" hover @click="openSession(session)">
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
            <v-tooltip top color="error">
              <template #activator="{ on, attrs }">
                <v-btn
                  fab
                  tile
                  color="grey lighten-3"
                  top
                  right
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
      </v-icon> Click on the <strong>Visualize</strong> button in the <strong>Network</strong> or <strong>Table</strong> panel to create a new session.
    </div>
  </div>
</template>

<script setup lang="ts">
import store from '@/store';
import type { App } from '@/types';
import type { Session } from 'multinet';
import { computed } from 'vue';
import { deleteSession, visualizeWithExistingSession } from '@/utils/sessionHelpers';

const props = defineProps<{
  apps: { network_visualizations: App[]; table_visualizations: App[] };
  workspace: string;
  loading: boolean;
}>();

const sessions = computed(() => {
  const storeSessions = store.getters.sessions;
  if (storeSessions.length > 0) {
    return storeSessions;
  }
  return Array(3).fill({ id: '_skeleton' });
});
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
  const type = session.network !== undefined ? 'network' : 'table';
  store.commit.deleteSessionFromStore(session.id);
  await deleteSession(session.id, type);
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
