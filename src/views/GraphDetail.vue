<template>
  <v-container fluid>
    <v-content>
      <h1>Graph: {{`${this.workspace}/${this.graph}`}}</h1>
      <div id="graph-details">
        <div style="border-style: solid; width: 100%;">
          <label>Node Types</label>
          <ul>
            <li v-for="table in nodeTypes" :key="table.name">
              <router-link :to="`/workspaces/${workspace}/table/${table}`">{{table}}</router-link>
            </li>
          </ul>
        </div>
        <div style="border-style: solid; width: 100%">
          <label>Edge Types</label>
          <ul>
            <li v-for="table in edgeTypes" :key="table.name">
              <router-link :to="`/workspaces/${workspace}/table/${table}`">{{table}}</router-link>
            </li>
          </ul>
        </div>
        <div style="border-style: solid; width: 100%">
          <label>Apps</label>
          <ul>
            <li v-for="app in apps" :key="app.name">
              <a :href="`${app.url}/?workspace=${workspace}&graph=${graph}`" target="_blank">{{app.name}}</a>
            </li>
          </ul>
        </div>
      </div>
      <div style="border-style: solid;">
        <label>Nodes</label>
        <br/>
        <br/>
        <div style="display: flex; flex-flow: row nowrap; justify-content: space-around">
          <div v-if="prev" v-on:click="firstPage()">first</div>
          <div v-if="prev" v-on:click="turnPage(false)">previous</div>
          <div v-if="next" v-on:click="turnPage(true)">next</div>
          <div v-if="next" v-on:click="lastPage()">last</div>
        </div>
        <ul>
          <li v-for="node in nodes" :key="node">
            <router-link :to="`/workspaces/${workspace}/graph/${graph}/node/${node}`">{{node}}</router-link>
          </li>
        </ul>
      </div>
    </v-content>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';

import api, { apix } from '@/api';

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
      limit: 20,
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
      const graph = await apix.graph(this.workspace, this.graph);
      const nodes = await apix.nodes(this.workspace, this.graph, this.offset, this.limit);

      this.nodeTypes = graph.nodeTables;
      this.edgeTypes = [graph.edgeTable];
      this.nodes = nodes.nodes;
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
#graph-details {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
}

ul {
  padding: 10px;
  list-style-type: none;
  text-align: left;
}
</style>
