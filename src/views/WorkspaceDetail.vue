<template>
  <v-container fluid>
    <sidebar />

    <v-content>
      <v-toolbar app>
        <v-hover>
          <v-toolbar-title
            class="ws-detail-title"
            slot-scope="{ hover }"
          >
            <v-fade-transition hide-on-leave>
              <v-icon
                class="ml-2 mr-3"
                color="grey lighten-1"
                v-if="!hover && !editing"
              >library_books</v-icon>
            </v-fade-transition>

            <v-tooltip left v-if="!editing">
              <template v-slot:activator="{ on }">
                <v-fade-transition hide-on-leave>
                  <v-btn
                    class="ml-1 mr-2"
                    icon
                    v-if="hover && !editing"
                    v-on="on"
                    @click="editing = !editing"
                  >
                    <v-icon
                      color="grey darken-3"
                      size="20px"
                    >edit</v-icon>
                  </v-btn>
                </v-fade-transition>
              </template>
              <span>Rename workspace</span>
            </v-tooltip>

            <v-fade-transition
              hide-on-leave
              v-if="editing"
            >
              <v-btn
                icon
                @click="editing = !editing"
              >
                <v-icon
                  color="grey darken-3"
                  size="20px"
                >close</v-icon>
              </v-btn>
            </v-fade-transition>

            <span v-if="!editing">{{workspace}}</span>
            
            <v-text-field
              autofocus
              background-color="transparent"
              class="ws-rename"
              flat
              @focus="$event.target.select()"
              solo
              :value="workspace"
              v-if="editing"
            />

          </v-toolbar-title>
        </v-hover>

        <v-spacer />
        <v-btn icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
      </v-toolbar>

      <v-layout
        row
        wrap
      >
        <v-flex
          md6
          px-5
          py-3
        >
          <v-card
            color="transparent"
            flat
          >
            <v-card-title>
              <h2>Create Tables</h2>
            </v-card-title>

            <v-card-text>
              <v-layout row wrap>
                <v-flex>
                  <v-text-field v-model="newTable" placeholder="name your table" solo />
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex>
                  <file-input @handle-file-input="handleFileInput" v-bind:types="fileTypes"/>
                </v-flex>
              </v-layout>
              <v-btn :disabled="tableCreateDisabled" @click="createTable">create table</v-btn>
            </v-card-text>

            <v-list
              dark
              subheader
            >
              <v-subheader class="pr-2">
                Your Tables
                <v-spacer />

                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-scroll-x-transition>
                        <v-btn
                          flat
                          icon
                          v-if="somethingCheckedTable"
                          v-on="on"
                        >
                          <v-icon color="red accent-2">delete_sweep</v-icon>
                        </v-btn>
                      </v-scroll-x-transition>
                    </template>
                    <span>Delete selected</span>
                  </v-tooltip>
              </v-subheader>

              <v-divider></v-divider>

              <template v-if="tables.length > 0">
                <v-hover
                  v-for="table in tables"
                  :key="table"
                >
                  <v-list-tile
                    active-class="grey lighten-4"
                    avatar
                    ripple
                    slot-scope="{ hover }"
                    :to="`/workspaces/${workspace}/table/${table}`"
                  >
                    <v-list-tile-avatar @click.prevent>
                      <v-fade-transition hide-on-leave>
                        <v-icon
                          color="blue lighten-1"
                          v-if="!hover && !checkboxTable[table]"
                        >table_chart</v-icon>

                        <v-checkbox
                          class="ws-detail-checkbox"
                          v-else
                          v-model="checkboxTable[table]"
                        ></v-checkbox>
                      </v-fade-transition>
                    </v-list-tile-avatar>

                    <v-list-tile-content>
                      <v-list-tile-title>{{table}}</v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-hover>
              </template>
              <div
                class="ws-detail-empty-list"
                v-else
              >
                <v-icon color="blue lighten-1">info</v-icon> There are no tables yet...
              </div>
            </v-list>
          </v-card>
        </v-flex>
        <v-flex
          md6
          px-5
          py-3
        >
          <v-card
            color="transparent"
            flat
          >
            <v-card-title>
              <h2>Create Graphs</h2>
            </v-card-title>

            <v-card-text>
              <v-layout row wrap>
                <v-flex>
                  <v-text-field v-model="newGraph" placeholder="name your graph" solo />
                </v-flex>
              </v-layout>

              <v-layout row wrap>
                <v-flex md6>
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

                <v-flex md6>
                  <v-select
                    v-model="graphEdgeTable"
                    :items="edgeTables"
                    solo
                  />
                </v-flex>
                <v-btn :disabled="graphCreateDisabled" @click="createGraph">create graph</v-btn>
              </v-layout>
            </v-card-text>

            <v-list
              dark
              subheader
            >
              <v-subheader class="pr-2">
                Your Graphs
                <v-spacer />
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-scroll-x-transition>
                      <v-btn
                        flat
                        icon
                        v-if="somethingCheckedGraph"
                        v-on="on"
                      >
                        <v-icon color="red accent-2">delete_sweep</v-icon>
                      </v-btn>
                    </v-scroll-x-transition>
                  </template>
                  <span>Delete selected</span>
                </v-tooltip>
              </v-subheader>

              <v-divider></v-divider>

              <template v-if="graphs.length > 0">
                <v-hover
                  v-for="graph in graphs"
                  :key="graph"
                >
                  <v-list-tile
                    active-class="grey lighten-4"
                    avatar
                    ripple
                    slot-scope="{ hover }"
                    :to="`/workspaces/${workspace}/graph/${graph}`"
                  >
                    <v-list-tile-avatar @click.prevent>
                      <v-fade-transition hide-on-leave>
                        <v-icon
                          color="blue lighten-1"
                          v-if="!hover && !checkboxGraph[graph]"
                        >timeline</v-icon>

                        <v-checkbox
                          class="ws-detail-checkbox"
                          v-else
                          v-model="checkboxGraph[graph]"
                        ></v-checkbox>
                      </v-fade-transition>
                    </v-list-tile-avatar>

                    <v-list-tile-content>
                      <v-list-tile-title>{{graph}}</v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-hover>
              </template>
              <div
                class="ws-detail-empty-list"
                v-else
              >
                <v-icon color="blue lighten-1">info</v-icon> There are no graphs yet...
              </div>
            </v-list>
          </v-card>
        </v-flex>
      </v-layout>
    </v-content>
  </v-container>
</template>

<script>
import api from '@/api';
import FileInput from '@/components/FileInput'
import Sidebar from '@/components/Sidebar'

export default {
  name: 'WorkspaceDetail',
  components: {
    'file-input': FileInput,
    Sidebar
  },
  props: ['workspace','title'],
  data () {
    return {
      editing: false,
      newTable: '',
      newGraph: '',
      tables: [],
      checkboxTable: {},
      checkboxGraph: {},
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
    somethingCheckedTable() {
      return Object.values(this.checkboxTable)
        .some(d => !!d);
    },
    somethingCheckedGraph() {
      return Object.values(this.checkboxGraph)
        .some(d => !!d);
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
        throw new Error(response.data.errors);
      }

      if (!response.data.data.graph) {
        throw new Error(`Graph "${this.newGraph}" already exists.`);
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

.ws-detail-title {
  align-items: center;
  display: flex;
  letter-spacing: 0;
  width: 95%;
}

.ws-detail-checkbox.v-input--selection-controls {
  margin-top: 19px;
  margin-left: 8px;
}

.ws-detail-empty-list {
  padding: 40px 40px 55px;
  text-align: center;
}
</style>

<style>
.ws-rename.v-text-field.v-text-field--enclosed .v-input__slot {
  font-size: 20px;
  letter-spacing: 2px !important;
  margin-bottom: 2px;
  padding-left: 0 !important;
}
</style>
