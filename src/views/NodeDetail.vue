<template>
  <v-container
    class="node-container"
    fluid
  >
    <v-main>
      <v-app-bar app>
        <v-toolbar-title class="ws-detail-title">
          <v-icon
            class="ml-4 mr-5"
            color="grey lighten-1"
          >
            mdi-text-box-multiple
          </v-icon>

          <span class="breadcrumbs">
            <router-link
              :to="{
                name: 'workspaceDetail',
                params: { workspace },
              }"
            >{{ workspace }}</router-link>
            <v-icon
              class="mx-4"
              color="grey lighten-2"
            >
              mdi-chevron-right
            </v-icon>
            <v-icon
              class="mr-3"
              color="grey lighten-1"
            >
              mdi-chart-timeline-variant
            </v-icon>
            <router-link
              :to="{
                name: 'networkDetail',
                params: { network },
              }"
            >
              {{ network }}
            </router-link>
            <v-icon
              class="mx-4"
              color="grey lighten-2"
            >
              mdi-chevron-right
            </v-icon>
            {{ type }}/{{ node }}
          </span>
        </v-toolbar-title>

        <v-spacer />

        <workspace-option-menu :workspace="workspace" />
      </v-app-bar>

      <v-container
        id="node-details"
        fluid
      >
        <v-row>
          <v-col
            class="pa-4"
            cols="12"
          >
            <v-skeleton-loader
              v-if="loading"
              type="image"
            />

            <v-card
              v-else
              color="primary"
              dark
            >
              <v-card-title>
                Attributes: {{ attributeTable._id }}
              </v-card-title>
              <v-divider />
              <v-card-text pa-0>
                <v-container
                  class="pa-0"
                  fluid
                >
                  <v-list
                    class="pt-0"
                    color="transparent"
                  >
                    <v-container
                      class="pa-0"
                      fluid
                    >
                      <v-row>
                        <v-col
                          v-for="field in attributes"
                          :key="field.key"
                          class="py-0"
                          cols="3"
                        >
                          <v-list-item style="display: block;">
                            <v-list-item-subtitle
                              class="pt-3 pb-1"
                              style="font-size: 11px;"
                            >
                              {{ field.key }}
                            </v-list-item-subtitle>
                            <v-list-item-title class="pb-3">
                              {{ field.value }}
                            </v-list-item-title>
                            <v-divider />
                          </v-list-item>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-list>
                </v-container>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col class="pa-4">
            <v-card height="100%">
              <v-card-title class="pag-title">
                Incoming Edges
                <div class="pagination">
                  <v-btn
                    icon
                    :disabled="!prevIncoming"
                    @click="firstPage('incoming')"
                  >
                    <v-icon>mdi-skip-previous</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!prevIncoming"
                    @click="turnPage('incoming', false)"
                  >
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>

                  <span
                    class="text-overline"
                    style="vertical-align: middle;"
                  >
                    {{ currentIncomingPageNumber }} of {{ lastIncomingPageNumber }}
                  </span>

                  <v-btn
                    icon
                    :disabled="!nextIncoming"
                    @click="turnPage('incoming', true)"
                  >
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!nextIncoming"
                    @click="lastPage('incoming')"
                  >
                    <v-icon>mdi-skip-next</v-icon>
                  </v-btn>
                </div>
              </v-card-title>
              <v-card-text>
                <v-list dense>
                  <div v-if="loading">
                    <v-skeleton-loader type="list-item" />
                    <v-skeleton-loader type="list-item" />
                    <v-skeleton-loader type="list-item" />
                  </div>

                  <v-list-item
                    v-for="(edge, index) in incoming"
                    :key="index"
                    :to="`/workspaces/${workspace}/network/${network}/node/${edge.node}`"
                  >
                    <v-list-item-content>
                      {{ edge.node }}
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col class="pa-4">
            <v-card height="100%">
              <v-card-title class="pag-title">
                Outgoing Edges
                <div class="pagination">
                  <v-btn
                    icon
                    :disabled="!prevOutgoing"
                    @click="firstPage('outgoing')"
                  >
                    <v-icon>mdi-skip-previous</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!prevOutgoing"
                    @click="turnPage('outgoing', false)"
                  >
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>

                  <span
                    class="text-overline"
                    style="vertical-align: middle;"
                  >
                    {{ currentOutgoingPageNumber }} of {{ lastOutgoingPageNumber }}
                  </span>

                  <v-btn
                    icon
                    :disabled="!nextOutgoing"
                    @click="turnPage('outgoing', true)"
                  >
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!nextOutgoing"
                    @click="lastPage('outgoing')"
                  >
                    <v-icon>mdi-skip-next</v-icon>
                  </v-btn>
                </div>
              </v-card-title>
              <v-card-text>
                <v-list dense>
                  <div v-if="loading">
                    <v-skeleton-loader type="list-item" />
                    <v-skeleton-loader type="list-item" />
                    <v-skeleton-loader type="list-item" />
                  </div>

                  <v-list-item
                    v-for="(edge, index) in outgoing"
                    :key="index"
                    :to="`/workspaces/${workspace}/network/${network}/node/${edge.node}`"
                  >
                    <v-list-item-content>
                      {{ edge.node }}
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-container>
</template>

<script lang="ts">
import type { PropType, Ref } from 'vue';
import {
  computed,
  defineComponent, ref, watch,
} from 'vue';
import type { EdgesSpec } from 'multinet';

import api from '@/api';
import type { KeyValue } from '@/types';
import WorkspaceOptionMenu from '@/components/WorkspaceOptionMenu.vue';

// interface EdgeRecord {
//   id: string;
//   from: string;
//   to: string;
// }

interface Connection {
  id: string;
  node: string;
}

type EdgeType = 'incoming' | 'outgoing';

export default defineComponent({
  name: 'NodeDetail',

  components: {
    WorkspaceOptionMenu,
  },

  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },

    network: {
      type: String as PropType<string>,
      required: true,
    },

    type: {
      type: String as PropType<string>,
      required: true,
    },

    node: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props) {
    const incoming: Ref<Connection[]> = ref([]);
    const outgoing: Ref<Connection[]> = ref([]);
    const attributes: Ref<KeyValue[]> = ref([]);
    const offsetIncoming = ref(0);
    const offsetOutgoing = ref(0);
    const pageCount = ref(20);
    const totalIncoming = ref(0);
    const totalOutgoing = ref(0);
    const loading = ref(true);

    function computePageNumber(offset: number) {
      return Math.floor(offset / pageCount.value);
    }

    const lastIncomingPage = computed(() => computePageNumber(totalIncoming.value) * pageCount.value);
    const lastOutgoingPage = computed(() => computePageNumber(totalOutgoing.value) * pageCount.value);
    const nextIncoming = computed(() => lastIncomingPage.value !== offsetIncoming.value);
    const nextOutgoing = computed(() => lastOutgoingPage.value !== offsetOutgoing.value);
    const prevIncoming = computed(() => offsetIncoming.value !== 0);
    const prevOutgoing = computed(() => offsetOutgoing.value !== 0);
    const currentIncomingPageNumber = computed(() => computePageNumber(offsetIncoming.value) + 1);
    const lastIncomingPageNumber = computed(() => computePageNumber(totalIncoming.value) + 1);
    const currentOutgoingPageNumber = computed(() => computePageNumber(offsetOutgoing.value) + 1);
    const lastOutgoingPageNumber = computed(() => computePageNumber(totalOutgoing.value) + 1);
    const attributeTable = computed(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table: { [key: string]: any } = {};
      attributes.value.forEach((entry) => {
        table[entry.key] = entry.value;
      });

      return table;
    });

    async function update() {
      loading.value = true;
      const nodeTable = (await api.table(props.workspace, props.type, {})).results;
      // eslint-disable-next-line no-underscore-dangle
      const newNode = nodeTable.find((table) => table._key === props.node);
      const newIncoming = (await api.edges(props.workspace, props.network, {
        direction: 'incoming',
        offset: offsetIncoming.value,
        limit: pageCount.value,
      // eslint-disable-next-line no-underscore-dangle
      })).results.filter((edge) => edge._to === `${props.type}/${props.node}`);
      const newOutgoing = (await api.edges(props.workspace, props.network, {
        direction: 'outgoing',
        offset: offsetOutgoing.value,
        limit: pageCount.value,
      // eslint-disable-next-line no-underscore-dangle
      })).results.filter((edge) => edge._from === `${props.type}/${props.node}`);

      // eslint-disable-next-line no-underscore-dangle
      if (newNode) {
        attributes.value = Object.entries(newNode).filter(([key]) => key !== '_rev').map(([key, value]) => ({
          key,
          value,
        }));
      }

      // eslint-disable-next-line no-underscore-dangle
      incoming.value = newIncoming.map((edge: EdgesSpec) => ({ id: edge._id, node: edge._from }));
      // eslint-disable-next-line no-underscore-dangle
      outgoing.value = newOutgoing.map((edge: EdgesSpec) => ({ id: edge._id, node: edge._to }));
      totalIncoming.value = incoming.value.length;
      totalOutgoing.value = outgoing.value.length;

      loading.value = false;
    }
    function turnPage(edgeType: EdgeType, forward: number) {
      if (edgeType === 'incoming') {
        offsetIncoming.value += forward ? pageCount.value : -pageCount.value;
      } else if (edgeType === 'outgoing') {
        offsetOutgoing.value += forward ? pageCount.value : -pageCount.value;
      }
    }
    function lastPage(edgeType: EdgeType) {
      if (edgeType === 'incoming') {
        offsetIncoming.value = lastIncomingPage.value;
      } else if (edgeType === 'outgoing') {
        offsetOutgoing.value = lastOutgoingPage.value;
      }
    }
    function firstPage(edgeType: EdgeType) {
      if (edgeType === 'incoming') {
        offsetIncoming.value = 0;
      } else if (edgeType === 'outgoing') {
        offsetOutgoing.value = 0;
      }
    }

    watch([() => props.workspace, () => props.network, () => props.type, () => props.node, offsetIncoming, offsetOutgoing, pageCount], () => update());

    update();

    return {
      incoming,
      outgoing,
      attributes,
      offsetIncoming,
      offsetOutgoing,
      pageCount,
      totalIncoming,
      totalOutgoing,
      loading,
      attributeTable,
      nextIncoming,
      nextOutgoing,
      prevIncoming,
      prevOutgoing,
      lastIncomingPageNumber,
      lastOutgoingPageNumber,
      currentIncomingPageNumber,
      currentOutgoingPageNumber,
      turnPage,
      firstPage,
      lastPage,
    };
  },
});
</script>

<style scoped>
#node-details {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
}

ul {
  padding: 10px;
  list-style-type: none;
  text-align: left;
}

td.key {
  text-align: right;
  padding-right: 20px;
  padding-left: 10px;
}

td.value {
  text-align: left;
}

.ws-detail-title {
  align-items: center;
  display: flex;
  letter-spacing: 0;
  width: 95%;
}
.ws-detail-title a {
  text-decoration: none;
}
.ws-detail-title a:hover {
  text-decoration: underline;
}

.pag-title {
  display: flex;
  justify-content: space-between;
}
</style>
