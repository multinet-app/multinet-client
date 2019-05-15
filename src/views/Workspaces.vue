<template>
  <div>
    <h1>Workspaces</h1>
    <div id="workspace-create">
      <input type="text" v-model="newWorkspace">
      <v-button :onClick="create">New Workspace</v-button>
    </div>
    <div class="workspace-wrapper">
      <h2>Your Workspaces:</h2>
      <div v-for="space in workspaces" :key="space" class="workspace">
        <router-link :to="`/workspaces/${space}`">{{space}}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import Button from '@/components/Button'

export default {
  name: 'Workspaces',
  components: {
    'v-button':Button,
  },
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

<style scoped>
#workspace-create {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
}
.workspace-wrapper{
  margin: auto;
  padding: 10px 0 0 0;
  width:220px;
}
.workspace{
padding: 5px;
margin:3px;
-webkit-transition:0.3s all ease;
transition:0.3s all ease;
}
.workspace:hover{
background-color: #bccace;
-webkit-transition:0.3s all ease;
transition:0.3s all ease;

}
.workspace:hover a{
  color:#fff;
}
.workspace a{
  text-decoration: none;
  letter-spacing:1px;
  text-transform:uppercase;
  font-weight:bold;
  color:#7f9ba4;
  
}
</style>
