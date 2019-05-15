<template>
  <div>
    <h1>Graph: {{`${this.workspace}/${this.graph}`}}</h1>
    <div id="graph-details">
      <div style="border-style: solid; width: 100%;">
        <label>Node Types</label>
        <ul>
          <li v-for="table in nodeTypes" :key="table">
            <router-link :to="`/${workspace}/table/${table}`">{{table}}</router-link>
          </li>
        </ul>
      </div>
      <div style="border-style: solid; width: 100%">
        <label>Edge Types</label>
        <ul>
          <li v-for="table in edgeTypes" :key="table">
            <router-link :to="`/workspaces/${workspace}/table/${table}`">{{table}}</router-link>
          </li>
        </ul>
      </div>
      <div style="border-style: solid; width: 100%">
        <label>Apps</label>
        <ul>
          <li v-for="app in apps" :key="app">
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
          <router-link :to="`/${workspace}/graph/${graph}/node/${node}`">{{node}}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'GraphDetail',
  filters: {
    appendArgs (url) {
      return `${url}/?workspace=${this.workspace}&graph=${this.graph}`;
    },
  },
  props: ['workspace', 'graph', 'apps'],
  data () {
    return {
      nodeTypes: [],
      edgeTypes: [],
      nodes: [],
      offset: 0,
      limit: 20,
      total: 0
    }
  },
  computed: {
    highestOffset () {
      return (
        this.total % this.limit
          ? Math.floor(this.total/this.limit)
          : this.total/this.limit-1
      ) * this.limit
    },
    next () {
      return this.highestOffset !== this.offset
    },
    prev () {
      return 0 !== this.offset
    }
  },
  methods: {
    async update () {
      const response = await api().post('multinet/graphql', {query: `query {
        graphs (workspace: "${this.workspace}", name: "${this.graph}") {
          nodeTypes
          edgeTypes
          nodes {
            total
            nodes (offset: ${this.offset} limit: ${this.limit}) {
              key
            }
          }
        }
      }`});

      this.nodeTypes = response.data.data.graphs[0].nodeTypes;
      this.edgeTypes = response.data.data.graphs[0].edgeTypes;
      this.nodes = response.data.data.graphs[0].nodes.nodes.map(node => node.key);
      this.total = response.data.data.graphs[0].nodes.total;
    },
    turnPage (forward) {
      this.offset += forward ? this.limit : -this.limit
    },
    lastPage () {
      this.offset = this.highestOffset
    },
    firstPage () {
      this.offset = 0
    }
  },
  watch: {
    offset () {
      this.update()
    },
    limit () {
      this.update()
    },
    workspace () {
      this.update()
    },
    graph () {
      this.update()
    }
  },
  created () {
    this.update()
  }
}
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
