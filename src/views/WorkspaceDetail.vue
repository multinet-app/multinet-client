<template>
  <div>
    <h1>Workspace: {{this.workspace}}</h1>
    <div id="workspace-details">
      <div>
        <label>Tables</label>
        <div class="row">
          <input type="text" v-model="newTable" placeholder="name your table.." class="text-input">
        </div>
       
          <div class="file-upload">
            <div >
                <file-input @handle-file-input="handleFileInput" v-bind:types="fileTypes"/>
                <v-button :onClick="loadFile">create table</v-button>
            </div>
          </div>
          <ul>
          <li v-for="table in tables" :key="table">
            <router-link :to="`/workspaces/${workspace}/table/${table}`">{{table}}</router-link>
          </li>
        </ul>
      </div>
      <div>
        <label>Graphs</label>
        <div>
          <input type="text" v-model="newGraph" placeholder="name your graph.." class="text-input">
        </div>
        <ul>
          <li v-for="graph in graphs" :key="graph">
            <router-link :to="`/workspaces/${workspace}/graph/${graph}`">{{graph}}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import FileInput from '@/components/FileInput'
import Button from '@/components/Button'

export default {
  name: 'WorkspaceDetail',
  components: {
    'file-input': FileInput,
    'v-button':Button,
  },
  props: ['workspace'],
  data () {
    return {
      newTable: '',
      newGraph: '',
      tables: [],
      graphs: [],
      fileList : null,
      fileTypes: {
        csv: {extension: ['csv'], queryCall: 'bulk'},
        newick: {extension: ['phy'], queryCall: 'newick'}
      },
      selectedType: null,
    }
  },
  methods: {
    async update () {
      const response = await api().post('multinet/graphql', {query: `query {
        workspaces (name: "${this.workspace}") {
          tables { name }
          graphs { name }
        }
      }`});
      this.tables = response.data.data.workspaces[0].tables.map(table => table.name);
      this.graphs = response.data.data.workspaces[0].graphs.map(graph => graph.name);
    },

    async loadFile(){
      let queryType = this.fileTypes[this.selectedType].queryCall;
      const response = await api().post(`multinet/${queryType}/${this.workspace}/${this.newTable}`,
      this.fileList[0], 
      {
        headers: {
        'Content-Type': 'text/plain'
        },
      }
      )
      this.update()
    },
    handleFileInput(newFiles){
      this.fileList = newFiles[0]
      this.selectedType = newFiles[1]
    }
  },
  watch: {
    workspace () {
      this.update()
    }
  },
  created () {
    this.update()
  }

}
</script>

<style scoped>
ul {
  padding: 0px;
  list-style-type: none;
  text-align: left;
}
#workspace-details, .row {
 display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
}
.text-input{
  padding:5px;
  border: .5px solid #648189;
  width: 200px;

}
</style>
