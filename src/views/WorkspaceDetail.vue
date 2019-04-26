<template>
  <div>
    <h1>Workspace: {{this.workspace}}</h1>
    <div id="workspace-details">
      <div>
        <label>Tables</label>
        <br/>
        <br/>
        <div class="row">
          <input type="text" v-model="newTable" placeholder="new table name">
        </div>
        <ul>
          <li v-for="table in tables" :key="table">
            <router-link :to="`/${workspace}/table/${table}`">{{table}}</router-link>
          </li>
        </ul>

        <!---  Adding the file iput -->
          <div class="file-upload">
            <div >
              <label>File

                <!-- <input type="file" id="file" ref="file" placeholder="Upload File" v-on:change="handleFileInput"/> -->
                <file-input @handleFileInput="handleFileInput" v-bind:types="fileTypes"/>

              </label>
                <button v-on:click="loadFile" >Submit</button>
            </div>
          </div>
        <!---  end file input addition -->
         <div class="create-button" v-on:click="create">Create</div>
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
import api from '@/api';
import FileInput from '@/components/FileInput'

export default {
  name: 'WorkspaceDetail',
  components: {
    'file-input': FileInput,
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
        csv: ['csv'],
        newick: ['phy']
      }
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

    async create() {

      /*
      const response = await api().post('multinet/graphql', {query: `mutation {
        table (workspace: "${this.workspace}", name: "${this.newTable}", fields: []) {
          name
        }
      }`});

      let tableName = response.data.data.table.name;
      this.$router
      */
    },
    async loadFile(){
      console.log(this.fileTypes)
      console.log(this.fileList)
      const response = await api().post(`multinet/tree/${this.workspace}/${this.newTable}`,
      this.fileList[0], 
      {
        headers: {
        'Content-Type': 'text/plain'
        },
      }
      )
     
    },
    handleFileInput(newFiles){
      this.fileList = newFiles
   
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
#workspace-details, .row {
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
