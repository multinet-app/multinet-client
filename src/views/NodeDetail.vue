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
            library_books
          </v-icon>

          <span class="breadcrumbs">
            <router-link
              :to="{
                name: 'workspaceDetail',
                params: { workspace }
              }"
            >{{ workspace }}</router-link>
            <v-icon
              class="mx-4"
              color="grey lighten-2"
            >
              chevron_right
            </v-icon>
            <v-icon
              class="mr-3"
              color="grey lighten-1"
            >
              timeline
            </v-icon>
            <router-link
              :to="{
                name: 'networkDetail',
                params: { network }
              }"
            >
              {{ network }}
            </router-link>
            <v-icon
              class="mx-4"
              color="grey lighten-2"
            >
              chevron_right
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
            cols="12"
            pa-4
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
                  fluid
                  pa-0
                >
                  <v-list
                    class="pt-0"
                    color="transparent"
                  >
                    <v-container
                      fluid
                      pa-0
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

          <v-col pa-4>
            <v-card height="100%">
              <v-card-title class="pag-title">
                Incoming Edges
                <div class="pagination">
                  <v-btn
                    icon
                    :disabled="!prevIncoming"
                    @click="firstPage('incoming')"
                  >
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!prevIncoming"
                    @click="turnPage('incoming', false)"
                  >
                    <v-icon>chevron_left</v-icon>
                  </v-btn>

                  <span
                    class="overline"
                    style="vertical-align: middle;"
                  >
                    {{ currentIncomingPageNumber }} of {{ lastIncomingPageNumber }}
                  </span>

                  <v-btn
                    icon
                    :disabled="!nextIncoming"
                    @click="turnPage('incoming', true)"
                  >
                    <v-icon>chevron_right</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!nextIncoming"
                    @click="lastPage('incoming')"
                  >
                    <v-icon>skip_next</v-icon>
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

          <v-col pa-4>
            <v-card height="100%">
              <v-card-title class="pag-title">
                Outgoing Edges
                <div class="pagination">
                  <v-btn
                    icon
                    :disabled="!prevOutgoing"
                    @click="firstPage('outgoing')"
                  >
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!prevOutgoing"
                    @click="turnPage('outgoing', false)"
                  >
                    <v-icon>chevron_left</v-icon>
                  </v-btn>

                  <span
                    class="overline"
                    style="vertical-align: middle;"
                  >
                    {{ currentOutgoingPageNumber }} of {{ lastOutgoingPageNumber }}
                  </span>

                  <v-btn
                    icon
                    :disabled="!nextOutgoing"
                    @click="turnPage('outgoing', true)"
                  >
                    <v-icon>chevron_right</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!nextOutgoing"
                    @click="lastPage('outgoing')"
                  >
                    <v-icon>skip_next</v-icon>
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
import Vue, { PropType } from 'vue';
import { EdgesSpec } from 'multinet';

import api from '@/api';
import { KeyValue } from '@/types';
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

export default Vue.extend({
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
  data() {
    return {
      incoming: [] as Connection[],
      outgoing: [] as Connection[],
      attributes: [] as KeyValue[],
      offsetIncoming: 0,
      offsetOutgoing: 0,
      pageCount: 20,
      totalIncoming: 0,
      totalOutgoing: 0,
      loading: true,
    };
  },
  computed: {
    lastIncomingPage(): number {
      return this.computePageNumber(this.totalIncoming) * this.pageCount;
    },
    lastOutgoingPage(): number {
      return this.computePageNumber(this.totalOutgoing) * this.pageCount;
    },
    nextIncoming(): boolean {
      return this.lastIncomingPage !== this.offsetIncoming;
    },
    nextOutgoing(): boolean {
      return this.lastOutgoingPage !== this.offsetOutgoing;
    },
    prevIncoming(): boolean {
      return this.offsetIncoming !== 0;
    },
    prevOutgoing(): boolean {
      return this.offsetOutgoing !== 0;
    },

    currentIncomingPageNumber(): number {
      return this.computePageNumber(this.offsetIncoming) + 1;
    },

    lastIncomingPageNumber(): number {
      return this.computePageNumber(this.totalIncoming) + 1;
    },

    currentOutgoingPageNumber(): number {
      return this.computePageNumber(this.offsetOutgoing) + 1;
    },

    lastOutgoingPageNumber(): number {
      return this.computePageNumber(this.totalOutgoing) + 1;
    },

    attributeTable() {
      const {
        attributes,
      } = this;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table: { [key: string]: any } = {};
      attributes.forEach((entry) => {
        table[entry.key] = entry.value;
      });

      return table;
    },
  },
  watch: {
    workspace() {
      this.update();
    },
    network() {
      this.update();
    },
    type() {
      this.update();
    },
    node() {
      this.update();
    },
    offsetIncoming() {
      this.update();
    },
    offsetOutgoing() {
      this.update();
    },
    pageCount() {
      this.update();
    },
  },
  created() {
    this.update();
  },
  methods: {
    async update() {
      this.loading = true;
      const nodeTable = (await api.table(this.workspace, this.type, {})).results;
      // eslint-disable-next-line no-underscore-dangle
      const node = nodeTable.find((table) => table._key === this.node);
      const incoming = (await api.edges(this.workspace, this.network, {
        direction: 'incoming',
        offset: this.offsetIncoming,
        limit: this.pageCount,
      // eslint-disable-next-line no-underscore-dangle
      })).results.filter((edge) => edge._to === `${this.type}/${this.node}`);
      const outgoing = (await api.edges(this.workspace, this.network, {
        direction: 'outgoing',
        offset: this.offsetOutgoing,
        limit: this.pageCount,
      // eslint-disable-next-line no-underscore-dangle
      })).results.filter((edge) => edge._from === `${this.type}/${this.node}`);

      // eslint-disable-next-line no-underscore-dangle
      if (node) {
        this.attributes = Object.entries(node).filter(([key]) => key !== '_rev').map(([key, value]) => ({
          key,
          value,
        }));
      }

      // eslint-disable-next-line no-underscore-dangle
      this.incoming = incoming.map((edge: EdgesSpec) => ({ id: edge._id, node: edge._from }));
      // eslint-disable-next-line no-underscore-dangle
      this.outgoing = outgoing.map((edge: EdgesSpec) => ({ id: edge._id, node: edge._to }));
      this.totalIncoming = this.incoming.length;
      this.totalOutgoing = this.outgoing.length;

      this.loading = false;
    },
    turnPage(edgeType: EdgeType, forward: number) {
      if (edgeType === 'incoming') {
        this.offsetIncoming += forward ? this.pageCount : -this.pageCount;
      } else if (edgeType === 'outgoing') {
        this.offsetOutgoing += forward ? this.pageCount : -this.pageCount;
      }
    },
    lastPage(edgeType: EdgeType) {
      if (edgeType === 'incoming') {
        this.offsetIncoming = this.lastIncomingPage;
      } else if (edgeType === 'outgoing') {
        this.offsetOutgoing = this.lastOutgoingPage;
      }
    },
    firstPage(edgeType: EdgeType) {
      if (edgeType === 'incoming') {
        this.offsetIncoming = 0;
      } else if (edgeType === 'outgoing') {
        this.offsetOutgoing = 0;
      }
    },

    computePageNumber(offset: number) {
      return Math.floor(offset / this.pageCount);
    },
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
