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
          <v-flex md3>
            <v-select
              v-model="graphNodeTables"
              :items="nodeTables"
              chips
              deletable-chips
              clearable
              solo
              multiple
            />
          </v-flex>

          <v-flex md3>
            <v-select
              v-model="graphEdgeTable"
              :items="edgeTables"
              solo
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
      nodeTables: [],
      edgeTables: [],
      graphs: [],
      fileList: [],
      fileTypes: {
        csv: {extension: ['csv'], queryCall: 'csv'},
        newick: {extension: ['phy', 'tree'], queryCall: 'newick'}
      },
      selectedType: null,
      graphNodeTables: [],
      graphEdgeTable: null,
    }
  },
  computed: {
    graphCreateDisabled () {
      return this.graphNodeTables.length == 0 || !this.graphEdgeTable || !this.newGraph;
    },
    tableCreateDisabled () {
      return this.fileList.length == 0 || !this.selectedType || !this.newTable;
    },
  },
  watch: {
    workspace () {
      this.update()
    },
  },
  methods: {
    async update () {
      const response = await api().post('multinet/graphql', {query: `query {
        workspaces (name: "${this.workspace}") {
          tables {
            name
            fields
          }
          graphs { name }
        }
      }`});
      const workspace = response.data.data.workspaces[0];

      const getName = (obj) => obj.name;

      this.tables = workspace.tables.map(getName);

      this.nodeTables = workspace.tables
        .filter(table => table.fields.indexOf('_from') === -1 || table.fields.indexOf('_to') === -1)
        .map(getName);

      this.edgeTables = workspace.tables
        .filter(table => table.fields.indexOf('_from') > -1 && table.fields.indexOf('_to') > -1)
        .map(getName);

      this.graphs = workspace.graphs.map(getName);
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

    async createGraph () {
      const response = await api().post('multinet/graphql', {query: `mutation {
        graph (workspace: "${this.workspace}", name: "${this.newGraph}", node_tables: ${JSON.stringify(this.graphNodeTables)}, edge_table: "${this.graphEdgeTable}") {
          name
        }
      }`});

      if (response.data.errors.length > 0) {
        console.error(response.data.errors);
        return;
      }

      if (!response.data.data.graph) {
        console.error(`Graph "${this.newGraph}" already exists.`);
        return;
      }

      this.update();
    },

    handleFileInput(newFiles){
      this.fileList = newFiles[0]
      this.selectedType = newFiles[1]
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
