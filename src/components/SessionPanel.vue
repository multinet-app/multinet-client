<template>
  <div class="px-5">
    <v-subheader class="px-0">
      <h2 class="black--text">
        Sessions
      </h2>
    </v-subheader>

    <v-divider />

    <v-carousel v-if="sessionPages.length > 0 || loading" height="90" class="mt-4" continuous hide-delimiters>
      <v-carousel-item v-for="sessionPage, pageIndex in sessionPages" :key="`page${pageIndex}`">
        <v-row class="px-16 mx-16">
          <v-col v-for="session, idx in sessionPage" :key="`session-${session.visapp}-${idx}-${session.id}`" :cols="12 / sessionsPerPage">
            <v-skeleton-loader v-if="session.id === '_skeleton'" type="card" height="90" />
            <v-card v-else color="grey lighten-3" height="90" hover @click="openSession(session)">
              <v-card-text class="pt-3 dont-wrap">
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
                  fab
                  color="red"
                  top
                  right
                  absolute
                  x-small
                  :style="{ right: '-16px' }"
                  @click="deleteClicked(session)"
                  @click.stop
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-carousel-item>
    </v-carousel>

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

const sessions = computed(() => store.getters.sessions);
const networks = computed(() => store.getters.networks);
const tables = computed(() => store.getters.tables);

const sessionsPerPage = 3;
const sessionPages = computed(() => {
  const pages = [];
  if (props.loading) {
    pages.push(Array(sessionsPerPage).fill({ id: '_skeleton' }));
  } else {
    for (let i = 0; i < sessions.value.length; i += sessionsPerPage) {
      pages.push(sessions.value.slice(i, i + sessionsPerPage));
    }
  }
  return pages;
});

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
