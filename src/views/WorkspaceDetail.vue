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
                <v-btn @click="loadFile">create table</v-btn>
            </div>
          </div>
          <div class = "list-link-wrap">
          <div v-for="table in tables" :key="table" class="list-link">
            <router-link :to="`/workspaces/${workspace}/table/${table}`">{{table}}</router-link>
          </div>
        </div>
      </div>
      <div>
        <label>Graphs</label>
        <div>
          <input type="text" v-model="newGraph" placeholder="name your graph.." class="text-input">
        </div>
        <div class = "list-link-wrap">
          <div v-for="graph in graphs" :key="graph" class="list-link">
            <router-link :to="`/workspaces/${workspace}/graph/${graph}`">{{graph}}</router-link>
          </div>
        </div>
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
        csv: {extension: ['csv'], queryCall: 'csv'},
        newick: {extension: ['phy', 'tree'], queryCall: 'newick'}
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
      await api().post(`multinet/${queryType}/${this.workspace}/${this.newTable}`,
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
.list-link-wrap{
  text-align: left;
  padding:50px 0 0 0;
  
}

.list-link{
padding: 5px;
margin:3px 50px;
-webkit-transition:0.3s all ease;
transition:0.3s all ease;
}
.list-link:hover{
background-color: #bccace;
-webkit-transition:0.3s all ease;
transition:0.3s all ease;

}
.list-link:hover a{
  color:#fff;
}
.list-link a{
  text-decoration: none;
  letter-spacing:1px;
  text-transform:uppercase;
  font-weight:bold;
  color:#7f9ba4;
  
}
</style>
