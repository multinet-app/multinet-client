<template>
  <div id="app">
    <button @click="loadData">Load Data</button>
    <button @click="clearData">Clear Data</button>
    <demo-nodes :nodes="nodes" />
  </div>
</template>

<script>
import DemoNodes from './components/DemoNodes.vue'
import api from './api'

export default {
  name: 'app',
  components: {
    DemoNodes
  },
  methods: {
    async loadData () {
      const response = await api().post('multinet/graphql', {query: `query {
        nodes(graph: "skyways/skyways", type: "airports") {
          attributes(source: "airports", keys: ["_key", "name", "city", "state", "country", "lat", "long", "vip"]) {
            key
            value
          }
        }
      }`})
      const nodes = response.data.data.nodes
      this.nodes = nodes.map(node => {
        let n = {}
        node.attributes.forEach(attr => {
          n[attr.key] = attr.value
        })
        return n
      });
    },

    clearData () {
      this.nodes = [];
    }
  },
  data () {
    return {
      nodes: [],
    };
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
