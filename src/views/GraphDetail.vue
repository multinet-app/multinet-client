<template>
  <v-container
    class="graph-container"
    fill-height
    fluid
    pa-0
  >
    <v-app-bar
      app
      clipped-right
    >
      <v-toolbar-title
        class="ws-detail-title"
      >
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
          <v-icon class="mx-4" color="grey lighten-2">chevron_right</v-icon>
          <v-icon class="mr-3" color="grey lighten-1">timeline</v-icon>
          {{graph}}
        </span>

      </v-toolbar-title>

      <v-spacer />

      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-app-bar>
    <v-content class="fill-height">
      <v-container
        fluid
        id="graph-details"
      >
        <v-layout row>
          <v-flex pa-4>
            <v-card height="100%">
              <v-card-title class="pb-0">
                Node Types
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list>
                  <v-list-item
                    class="pl-2"
                    :key="table.name"
                    :to="`/workspaces/${workspace}/table/${table}`"
                    v-for="table in nodeTypes"
                  >
                    <v-list-item-avatar class="mr-3">
                      <v-icon color="grey lighten-1">scatter_plot</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      {{table}}
                    </v-list-item-title>
                    <v-list-item-icon>
                      <v-icon color="grey lighten-1">chevron_right</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex pa-4>
            <v-card height="100%">
              <v-card-title class="pb-0">
                Edge Types
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list>
                  <v-list-item
                    class="pl-2"
                    :key="table.name"
                    :to="`/workspaces/${workspace}/table/${table}`"
                    v-for="table in edgeTypes"
                  >
                    <v-list-item-avatar class="mr-3">
                      <v-icon color="grey lighten-1">device_hub</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      {{table}}
                    </v-list-item-title>
                    <v-list-item-icon>
                      <v-icon color="grey lighten-1">chevron_right</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex pa-4>
            <v-card
              color="blue darken-2"
              dark
              height="100%"
            >
              <v-card-title class="pb-0">
                Apps to visualize this data
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list color="blue darken-2">
                  <v-list-item
                    class="pl-2"
                    :key="app.name"
                    :href="`${app.url}/?workspace=${workspace}&graph=${graph}`"
                    v-for="app in apps"
                    target="_blank"
                  >
                    <v-list-item-avatar class="mr-3">
                      <v-icon color="blue lighten-3">exit_to_app</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      {{app.name}}
                    </v-list-item-title>
                    <v-list-item-icon>
                      <v-icon color="blue lighten-3">chevron_right</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container
        id="node-details"
        fluid
        pb-4
        pt-0
        py-4
      >
        <v-card height="100%">
          <v-card-title style="display: flex; justify-content: space-between;">
            Nodes
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
            <v-list
              class="node-list"
              color="transparent"
              dense
            >
              <v-list-item
                v-for="node in nodes"
                :key="node"
                :to="`/workspaces/${workspace}/graph/${graph}/node/${node}`"
              >
                {{node}}
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </v-content>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';

import api from '@/api';

export default Vue.extend({
  name: 'GraphDetail',
  filters: {
    appendArgs(url: string) {
      return `${url}/?workspace=${this.workspace}&graph=${this.graph}`;
    },
  },
  props: ['workspace', 'graph', 'apps'],
  data() {
    return {
      nodeTypes: [] as string[],
      edgeTypes: [] as string[],
      nodes: [] as string[],
      offset: 0,
      limit: 10,
      total: 0,
    };
  },
  computed: {
    highestOffset(): number {
      return (
        this.total % this.limit
          ? Math.floor(this.total / this.limit)
          : this.total / this.limit - 1
      ) * this.limit;
    },
    next(): boolean {
      return this.highestOffset !== this.offset;
    },
    prev(): boolean {
      return 0 !== this.offset;
    },
  },
  methods: {
    async update() {
      const graph = await api.graph(this.workspace, this.graph);
      const nodes = await api.nodes(this.workspace, this.graph, {
        offset: this.offset,
        limit: this.limit,
      });

      this.nodeTypes = graph.nodeTables;
      this.edgeTypes = [graph.edgeTable];
      this.nodes = nodes.nodes.map((d) => d._id);
      this.total = nodes.count;
    },
    turnPage(forward: number) {
      this.offset += forward ? this.limit : -this.limit;
    },
    lastPage() {
      this.offset = this.highestOffset;
    },
    firstPage() {
      this.offset = 0;
    },
  },
  watch: {
    offset() {
      this.update();
    },
    limit() {
      this.update();
    },
    workspace() {
      this.update();
    },
    graph() {
      this.update();
    },
  },
  created() {
    this.update();
  },
});
</script>

<style scoped>
ul {
  padding: 10px;
  list-style-type: none;
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
</style>
