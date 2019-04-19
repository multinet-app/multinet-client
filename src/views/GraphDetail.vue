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
            <router-link :to="`/${workspace}/table/${table}`">{{table}}</router-link>
          </li>
        </ul>
      </div>
    </div>
    <div style="border-style: solid;">
      <label>Nodes</label>
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
  props: ['workspace', 'graph'],
  data () {
    return {
      nodeTypes: [],
      edgeTypes: [],
      nodes: [],
      offset: 0,
      limit: 20,
      total: 20
    }
  },
  created () {
    api().post('multinet/graphql', {query: `query {
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
    }`}).then(response => {
      this.nodeTypes = response.data.data.graphs[0].nodeTypes
      this.edgeTypes = response.data.data.graphs[0].edgeTypes
      this.nodes = response.data.data.graphs[0].nodes.nodes.map(node => node.key)
      this.total = response.data.data.graphs[0].nodes.total
    })
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
