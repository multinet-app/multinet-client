<template>
  <div id="app">
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
  async mounted () {
    const nodes = await restRequest({
      url: 'multinet/vertices',
      data: {
        db: 'skyways',
        collection: 'airports'
      },
    });

    this.nodes = nodes;
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
