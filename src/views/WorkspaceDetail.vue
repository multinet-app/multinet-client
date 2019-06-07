<template>
  <v-container>
    <h1 class="text-md-center">Workspace: {{this.workspace}}</h1>

    <v-layout row wrap>
      <v-flex>
        <h2 class="text-md-center">Tables</h2>

        <v-layout justify-center row wrap>
          <v-flex md6>
            <v-text-field v-model="newTable" placeholder="name your table" solo />
          </v-flex>
        </v-layout>

        <v-layout justify-center row wrap>
          <v-flex md6>
            <file-input @handle-file-input="handleFileInput" v-bind:types="fileTypes"/>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex class="text-md-center">
            <v-btn :disabled="tableCreateDisabled" @click="createTable">create table</v-btn>
          </v-flex>
        </v-layout>

        <div class="text-md-center">
          <div v-for="table in tables" :key="table" class="list-link">
            <router-link :to="`/workspaces/${workspace}/table/${table}`">{{table}}</router-link>
          </div>
        </div>
      </v-flex>

      <v-flex>
        <h2 class="text-md-center">Graphs</h2>

        <v-layout justify-center row wrap>
          <v-flex md6>
            <v-text-field v-model="newGraph" placeholder="name your graph" solo />
          </v-flex>
        </v-layout>

        <v-layout justify-center row wrap>
          <v-flex md6>
            <v-select
              v-model="nodeTables"
              :items="tables"
              chips
              deletable-chips
              clearable
              solo
              multiple
            />
          </v-flex>
        </v-layout>

        <v-layout justify-center row wrap>
          <v-flex class="text-md-center">
            <v-btn :disabled="graphCreateDisabled" @click="createGraph">create graph</v-btn>
          </v-flex>
        </v-layout>

        <div class = "text-md-center">
          <div v-for="graph in graphs" :key="graph" class="list-link">
            <router-link :to="`/workspaces/${workspace}/graph/${graph}`">{{graph}}</router-link>
          </div>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
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
      nodeTables: [],
      fileList: [],
      fileTypes: {
        csv: {extension: ['csv'], queryCall: 'csv'},
        newick: {extension: ['phy', 'tree'], queryCall: 'newick'}
      },
      selectedType: null,
    }
  },
  computed: {
    graphCreateDisabled () {
      return this.nodeTables.length == 0 || !this.newGraph;
    },
    tableCreateDisabled () {
      return this.fileList.length == 0 || !this.selectedType || !this.newTable;
    },
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

    async createTable(){
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
    createGraph () {
      if (!this.newGraph) {
        return;
      }

      console.log(this.newGraph);
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
.list-link a{
  text-decoration: none;
  letter-spacing:1px;
  text-transform:uppercase;
  font-weight:bold;
  color:#7f9ba4;
}
</style>
