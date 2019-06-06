<template>
  <v-app id="app">
    <router-view :apps='apps' />
  </v-app>
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
