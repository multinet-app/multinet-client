<template>
  <div>
    <h1>Workspaces</h1>
    <div id="workspace-create">
      <input type="text" v-model="newWorkspace">
      <div class="create-button" v-on:click="create">Create</div>
    </div>
    <div v-for="space in workspaces" :key="space">
      <router-link :to="`/${space}`">{{space}}</router-link>
    </div>
  </div>
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
          this.$router.push(`/${this.newWorkspace}`);
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

<style>
#workspace-create {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
}

.create-button {
  border-style: solid;
  width: 100px;
  height: 20px;
  background-color: green;
  color: white;
  border-color: black;
  border-radius: 5px;
  margin: 5px;
  cursor: pointer;
}
</style>
