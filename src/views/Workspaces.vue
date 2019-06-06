<template>
  <v-container grid-list-md id="workspace-create">
    <h1 class="text-md-center">Workspaces</h1>

    <v-layout row wrap>
      <v-flex md4 offset-md3>
        <v-text-field v-model="newWorkspace" solo />
      </v-flex>
      <v-btn @click="create">New Workspace</v-btn>
    </v-layout>

    <h2 class="text-md-center">Your Workspaces</h2>

    <div v-for="space in workspaces" :key="space" class="workspace text-md-center">
      <router-link :to="`/workspaces/${space}`">{{space}}</router-link>
    </div>
  </v-container>
</template>

<script>
import api from '@/api'

export default {
  name: 'Workspaces',
  data () {
    return {
      newWorkspace: '',
      workspaces: []
    }
  },
  methods: {
    async create () {
      if (this.newWorkspace) {
        const response = await api().post('multinet/graphql', {query: `mutation {
          workspace (name: "${this.newWorkspace}" )
        }`});

        if (response.data.data) {
          this.$router.push(`workspaces/${this.newWorkspace}`);
        }
      }
    }
  },
  async created () {
    const response = await api().post('multinet/graphql', {query: `query {
      workspaces { name }
    }`});

    this.workspaces = response.data.data.workspaces.map(space => space.name);
  }
}
</script>

<style scoped>
.workspace a{
  text-decoration: none;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: bold;
  color: #7f9ba4;
}
</style>
