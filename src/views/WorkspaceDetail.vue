<template>
  <v-container fluid>
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
            <item-panel
              title="Tables"
              :items="tables"
              :workspace="workspace"
              route-type="table"
              icon="table_chart"
            />
            <v-dialog
              v-model="tableDialog"
              width="700"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  block
                  class="pl-3 pr-2"
                  color="blue darken-2"
                  dark
                  depressed
                  large
                  v-on="on"
                >
                  New Table
                  <v-spacer />
                  <v-icon
                    right
                    size="20px"
                  >add_circle</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card>
                  <v-card-title
                    class="headline pb-0 pt-3"
                    primary-title
                  >
                    Create Table
                  </v-card-title>

                  <v-card-text class="px-4 pt-4 pb-1">
                    <v-layout row wrap>
                      <v-flex>
                        <v-text-field
                          box
                          v-model="newTable"
                          label="Table name"
                          :error-messages="tableCreationError"
                        />
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex>
                        <file-input @handle-file-input="handleFileInput" v-bind:types="fileTypes"/>
                      </v-flex>
                    </v-layout>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions class="px-4 py-3">
                    <v-spacer></v-spacer>
                    <v-btn :disabled="tableCreateDisabled" @click="createTable">
                      Create Table
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-card>
            </v-dialog>
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
            <item-panel
              title="Graphs"
              :items="graphs"
              :workspace="workspace"
              route-type="graph"
              icon="timeline"
              />
              <v-dialog
                v-model="graphDialog"
                width="700"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    block
                    class="pl-3 pr-2"
                    color="blue darken-2"
                    dark
                    depressed
                    large
                    v-on="on"
                  >
                    New Graph
                    <v-spacer />
                    <v-icon
                      right
                      size="20px"
                    >add_circle</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-card>
                    <v-card-title
                      class="headline pb-0 pt-3"
                      primary-title
                    >
                      Create Graph
                    </v-card-title>

                    <v-card-text class="px-4 pt-4 pb-1">
                      <v-layout row wrap>
                        <v-flex>
                          <v-text-field
                            box
                            label="Graph name"
                            v-model="newGraph"
                            :error-messages="graphCreationErrors"
                          />
                        </v-flex>
                      </v-layout>

                      <v-layout row wrap>
                        <v-flex>
                          <v-select
                            box
                            chips
                            class="choose-tables"
                            clearable
                            deletable-chips
                            label="Choose node tables"
                            multiple
                            v-model="graphNodeTables"
                            :items="nodeTables"
                          />
                        </v-flex>
                      </v-layout>

                      <v-layout row wrap>
                        <v-flex>
                          <v-select
                            box
                            label="Choose edge table"
                            v-model="graphEdgeTable"
                            :items="edgeTables"
                          />
                        </v-flex>
                      </v-layout>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions class="px-4 py-3">
                      <v-spacer></v-spacer>
                      <v-btn
                        depressed
                        :disabled="graphCreateDisabled"
                        @click="createGraph"
                      >create graph</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-card>
              </v-dialog>

          </v-card>
        </v-flex>
      </v-layout>
    </v-content>
  </v-container>
</template>

<script>
import api from '@/api';
import FileInput from '@/components/FileInput'
import ItemPanel from '@/components/ItemPanel'

export default {
  name: 'WorkspaceDetail',
  components: {
    'file-input': FileInput,
    ItemPanel,
  },
  props: ['workspace','title'],
  data () {
    return {
      editing: false,
      tableDialog: false,
      graphDialog: false,
      newTable: '',
      newGraph: '',
      tables: [],
      nodeTables: [],
      edgeTables: [],
      graphs: [],
      fileList: [],
      fileTypes: {
        csv: {extension: ['csv'], queryCall: 'csv'},
        newick: {extension: ['phy', 'tree'], queryCall: 'newick'},
        nested_json: {extension: ['json'], queryCall: 'nested_json'},
      },
      selectedType: null,
      graphNodeTables: [],
      graphEdgeTable: null,
      graphCreationErrors: [],
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
      const { workspace, newGraph } = this;
      const response = await api().post(`/multinet/workspace/${workspace}/graph/${newGraph}`, {
        node_tables: this.graphNodeTables,
        edge_table: this.graphEdgeTable,
      });

      if (!response) {
        const message = `Graph "${this.newGraph}" already exists.`

        this.graphCreationErrors = [message];
        throw new Error(message);
      }

      this.graphCreationErrors = [];

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
.help-icon {
  cursor: pointer;
  margin-left: 4px;
}

.list-link a {
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
</style>

<style>
.ws-rename.v-text-field.v-text-field--enclosed .v-input__slot {
  font-size: 20px;
  letter-spacing: 2px !important;
  margin-bottom: 2px;
  padding-left: 0 !important;
}

.choose-tables.v-select .v-select__selections {
  min-height: auto !important;
}
</style>
