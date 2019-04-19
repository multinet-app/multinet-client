<template>
  <div>
    <h1>Node: {{`${this.workspace}/${this.graph}/${this.node}`}}</h1>
    <div style="border-style: solid;">
      <label>Attributes</label>
      <table>
        <tr v-for="field in attributes" :key="field.key">
          <td class="key"><b>{{field.key}}:</b></td>
          <td class="value">{{field.value}}</td>
        </tr>
      </table>
    </div>
    <div id="node-details">
      <div style="border-style: solid; width: 100%;">
        <label>Incoming Edges</label>
        <ul>
          <li v-for="edge, index in incoming" :key="index">
            <router-link :to="`/${workspace}/graph/${graph}/node/${edge.airport}`">{{edge.airport}}</router-link>
          </li>
        </ul>
      </div>
      <div style="border-style: solid; width: 100%;">
        <label>Outgoing Edges</label>
        <ul>
          <li v-for="edge, index in outgoing" :key="index">
            <router-link :to="`/${workspace}/graph/${graph}/node/${edge.airport}`">{{edge.airport}}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'NodeDetail',
  props: ['workspace', 'graph', 'type', 'node'],
  data () {
    return {
      incoming: [],
      outgoing: [],
      attributes: []
    }
  },
  methods: {
    update () {
      api().post('multinet/graphql', {query: `query {
        nodes (workspace: "${this.workspace}", graph: "${this.graph}", nodeType: "${this.type}" key: "${this.node}") {
          nodes {
            key
            incoming { edges { key source {key} } }
            outgoing { edges { key target {key} } }
            properties { key value }
          }
        }
      }`}).then(response => {
        this.attributes = response.data.data.nodes.nodes[0].properties
        this.incoming = response.data.data.nodes.nodes[0].incoming.edges.map(edge => ({id: edge.key, airport: edge.source.key}))
        this.outgoing = response.data.data.nodes.nodes[0].outgoing.edges.map(edge => ({id: edge.key, airport: edge.target.key}))
      })
    }
  },
  created () {
    this.update()
  },
  updated () {
    this.update()
  }
}
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
</style>
