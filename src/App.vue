<template>
  <div id="app">
    <router-view :apps='apps' />
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      apps: [],
    };
  },
  created () {
    this.apps = require('./appregistry.json');
  },
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
