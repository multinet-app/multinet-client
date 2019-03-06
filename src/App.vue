<template>
  <div id="app">
    <button @click="loadData">Load Data</button>
    <button @click="clearData">Clear Data</button>
    <demo-nodes :nodes="nodes" />
  </div>
</template>

<script>
import DemoNodes from './components/DemoNodes.vue'
import { restRequest } from '@girder/core/rest';

export default {
  name: 'app',
  components: {
    DemoNodes
  },
  methods: {
    async loadData () {
      const nodes = await restRequest({
        url: 'multinet/vertices',
        data: {
          db: 'skyways',
          collection: 'airports'
        },
      });

      this.nodes = nodes;
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
