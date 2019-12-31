<template>
  <v-container
    class="node-container"
    fluid
  >
    <v-content>
      <v-app-bar app>
        <v-toolbar-title class="ws-detail-title">
          <v-icon
            class="ml-4 mr-5"
            color="grey lighten-1"
          >library_books</v-icon>

          <span class="breadcrumbs">
            <router-link
              :to="{
                name: 'workspaceDetail',
                params: { workspace }
              }"
            >{{workspace}}</router-link>
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
                name: 'graphDetail',
                params: { graph }
              }"
            >
              {{graph}}
            </router-link>
            <v-icon
              class="mx-4"
              color="grey lighten-2"
            >
              chevron_right
            </v-icon>
            {{type}}
            <v-icon
              class="mx-4"
              color="grey lighten-2"
            >
              chevron_right
            </v-icon>
            {{node}}
          </span>

        </v-toolbar-title>

        <v-spacer />

        <v-btn icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
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
            <v-card
              color="primary"
              dark
            >
              <v-card-title>
                Attributes
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
                    <v-container fluid pa-0>
                      <v-row>
                        <v-col
                          class="py-0"
                          cols="3"
                          v-for="field in attributes"
                          :key="field.key"
                        >
                          <v-list-item style="display: block;">
                            <v-list-item-subtitle
                              class="pt-3 pb-1"
                              style="font-size: 11px;"
                            >
                              {{field.key}}
                            </v-list-item-subtitle>
                            <v-list-item-title class="pb-3">
                              {{field.value}}
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
                    :disabled="!prev"
                    v-on:click="firstPage()"
                  >
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!prev"
                    v-on:click="turnPage(false)"
                  >
                    <v-icon>chevron_left</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!next"
                    v-on:click="turnPage(true)"
                  >
                    <v-icon>chevron_right</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!next"
                    v-on:click="lastPage()"
                  >
                    <v-icon>skip_next</v-icon>
                  </v-btn>
                </div>
              </v-card-title>
              <v-card-text>
                <v-list dense>
                  <v-list-item
                    v-for="(edge, index) in incoming"
                    :key="index"
                    :to="`/workspaces/${workspace}/graph/${graph}/node/${edge.airport}`"
                  >
                    <v-list-item-content>
                      {{edge.airport}}
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
                    :disabled="!prev"
                    v-on:click="firstPage()"
                  >
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!prev"
                    v-on:click="turnPage(false)"
                  >
                    <v-icon>chevron_left</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!next"
                    v-on:click="turnPage(true)"
                  >
                    <v-icon>chevron_right</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="!next"
                    v-on:click="lastPage()"
                  >
                    <v-icon>skip_next</v-icon>
                  </v-btn>
                </div>
              </v-card-title>
              <v-card-text>
                <v-list dense>
                  <v-list-item
                    v-for="(edge, index) in outgoing"
                    :key="index"
                    :to="`/workspaces/${workspace}/graph/${graph}/node/${edge.airport}`"
                  >
                    <v-list-item-content>
                      {{edge.airport}}
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

        </v-row>

      </v-container>
    </v-content>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Edge } from 'multinet';

import api from '@/api';
import { KeyValue } from '@/types';

interface EdgeRecord {
  id: string;
  from: string;
  to: string;
}

interface Connection {
  id: string;
  airport: string;
}

type EdgeType = 'incoming' | 'outgoing';

export default Vue.extend({
  name: 'NodeDetail',
  props: ['workspace', 'graph', 'type', 'node'],
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
    };
  },
  computed: {
    lastIncomingPage(): number {
      return (
        this.totalIncoming % this.pageCount
          ? Math.floor(this.totalIncoming / this.pageCount)
          : this.totalIncoming / this.pageCount - 1
      ) * this.pageCount;
    },
    lastOutgoingPage(): number {
      return (
        this.totalOutgoing % this.pageCount
          ? Math.floor(this.totalOutgoing / this.pageCount)
          : this.totalOutgoing / this.pageCount - 1
      ) * this.pageCount;
    },
    nextIncoming(): boolean {
      return this.lastIncomingPage !== this.offsetIncoming;
    },
    nextOutgoing(): boolean {
      return this.lastOutgoingPage !== this.offsetOutgoing;
    },
    prevIncoming(): boolean {
      return 0 !== this.offsetIncoming;
    },
    prevOutgoing(): boolean {
      return 0 !== this.offsetOutgoing;
    },
  },
  methods: {
    async update() {
      const attributes = await api.attributes(this.workspace, this.graph, `${this.type}/${this.node}`);
      const incoming = await api.edges(this.workspace, this.graph, `${this.type}/${this.node}`, {
        direction: 'incoming',
        offset: this.offsetIncoming,
        limit: this.pageCount,
      });
      const outgoing = await api.edges(this.workspace, this.graph, `${this.type}/${this.node}`, {
        direction: 'outgoing',
        offset: this.offsetOutgoing,
        limit: this.pageCount,
      });

      this.attributes = Object.entries(attributes).map(([key, value]) => ({
        key,
        value,
      }));

      this.incoming = incoming.edges.map((edge: Edge) => ({id: edge.edge, airport: edge.from}));
      this.outgoing = outgoing.edges.map((edge: Edge) => ({id: edge.edge, airport: edge.to}));
      this.totalIncoming = incoming.count;
      this.totalOutgoing = outgoing.count;
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
  },
  watch: {
    workspace() {
      this.update();
    },
    graph() {
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
