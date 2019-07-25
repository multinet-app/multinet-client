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
                  <v-text-field v-model="newTable" placeholder="name your table" solo :error-messages="tableCreationError"/>
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex>
                  <file-input @handle-file-input="handleFileInput" v-bind:types="fileTypes"/>
                </v-flex>
              </v-layout>
              <v-btn :disabled="tableCreateDisabled" @click="createTable">create table</v-btn>
            </v-card-text>

            <item-panel
              title="Your Tables"
              :items="tables"
              :workspace="workspace"
              route-type="table"
              icon="table_chart"
            />

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

            <item-panel
              title="Your Graphs"
              :items="graphs"
              :workspace="workspace"
              route-type="graph"
              icon="timeline"
              />

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
import ItemPanel from '@/components/ItemPanel'

export default {
  name: 'WorkspaceDetail',
  components: {
    'file-input': FileInput,
    Sidebar,
    ItemPanel,
  },
  props: ['workspace','title'],
  data () {
    return {
      editing: false,
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
      tableCreationError: null,
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
      try {
        await api().post(`multinet/${queryType}/${this.workspace}/${this.newTable}`,
        this.fileList[0],
        {
          headers: {
          'Content-Type': 'text/plain'
          },
        }
        );
        this.tableCreationError = null;
        this.update()
      } catch(err) {
        this.tableCreationError = err.response.data.message;
      }
    },

    async createGraph () {
      const response = await api().post('multinet/graphql', {query: `mutation {
        graph (
          workspace: "${this.workspace}",
          name: "${this.newGraph}",
          node_tables: ${JSON.stringify(this.graphNodeTables)},
          edge_table: "${this.graphEdgeTable}"
        ) {
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
    },
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
