<template>
  <div>
    <h1>Workspace: {{this.workspace}}</h1>
    <div id="workspace-details">
      <div>
        <label>Tables</label>
        <br/>
        <br/>
        <div>
          <input type="text" v-model="newTable" placeholder="new table name">
        </div>
        <ul>
          <li v-for="table in tables" :key="table">
            <router-link :to="`/${workspace}/table/${table}`">{{table}}</router-link>
          </li>
        </ul>
      </div>
      <div>
        <label>Graphs</label>
        <br/>
        <br/>
        <div>
          <input type="text" v-model="newGraph" placeholder="new graph name">
        </div>
        <ul>
          <li v-for="graph in graphs" :key="graph">
            <router-link :to="`/${workspace}/graph/${graph}`">{{graph}}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'WorkspaceDetail',
  props: ['workspace'],
  data () {
    return {
      newTable: '',
      newGraph: '',
      tables: [],
      graphs: []
    }
  },
  created () {
    api().post('multinet/graphql', {query: `query {
      workspaces (name: "${this.workspace}") {
        tables { name }
        graphs { name }
      }
    }`}).then(response => {
      this.tables = response.data.data.workspaces[0].tables.map(table => table.name)
      this.graphs = response.data.data.workspaces[0].graphs.map(graph => graph.name)
    })
  }
}
</script>

<style scoped>
#workspace-details {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
}

ul {
  padding: 0px;
  list-style-type: none;
  text-align: left;
}
</style>
