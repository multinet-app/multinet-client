<template>
  <v-card>
    <v-card-title>Create from Existing Tables</v-card-title>
    <v-card-subtitle>
      Link edge tables with node tables by clicking the <v-icon>link</v-icon> icon on
      the desired edge table, and selecting the node table column that you'd like to link it to.
    </v-card-subtitle>
    <v-progress-linear
      v-if="networkCreating"
      indeterminate
    />
    <v-row
      no-gutters
      align="center"
    >
      <v-col
        cols="2"
        align-self="center"
        class="ml-3"
      >
        <v-text-field
          v-model="network.name"
          label="Network Name"
          solo
        />
      </v-col>
      <v-col
        cols="1"
        align-self="center"
      >
        <v-btn
          color="primary"
          :disabled="!valid"
          class="ml-2 mb-6"
          @click="createNetwork"
        >
          Create
        </v-btn>
      </v-col>
    </v-row>

    <!-- Data tables -->
    <template v-if="tableSamples.length">
      <v-row
        no-gutters
        class="ml-3"
      >
        <v-col cols="2">
          <v-list>
            <v-list-item class="px-0">
              <v-list-item-action>
                <v-checkbox
                  :value="allTablesVisible"
                  @change="selectAllTables"
                />
              </v-list-item-action>
              <v-list-item-subtitle>
                All Tables
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item
              v-for="sample in tableSamples"
              :key="sample.table.name"
              class="px-0"
            >
              <v-list-item-action>
                <v-checkbox v-model="tablesVisible[sample.table.name]" />
              </v-list-item-action>
              <v-list-item-title>
                {{ sample.table.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
        <v-divider vertical />
        <v-col cols="10">
          <v-row
            no-gutters
            justify="start"
          >
            <v-card
              v-for="sample in visibleTableSamples"
              :key="sample.table.name"
              outlined
              raised
              class="ma-4"
            >
              <v-sheet class="table-title px-2">
                <v-row no-gutters>
                  <span>{{ sample.table.name }}</span>
                  <v-spacer />
                  <v-switch
                    label="Edge Table"
                    dark
                    hide-details
                    class="ma-0 pa-0"
                    :disabled="network.edge?.table && network.edge.table.name !== sample.table.name"
                    :value="network.edge?.table.name === sample.table.name"
                    @change="setEdgeTable(sample.table, $event)"
                  />
                </v-row>
              </v-sheet>
              <v-data-table
                class="upload-preview"
                hide-default-footer
                hide-default-header
                :headers="sample.headers"
                :items="sample.rows"
                disable-sort
              >
                <template #header="{ props: { headers } }">
                  <thead dark>
                    <tr>
                      <th
                        v-for="{ value: col } in headers"
                        :key="`${sample.table.name}:${col}`"
                        style="width: 1px; white-space: nowrap;"
                      >
                        <!-- Include/Exclude Column -->
                        <v-icon
                          v-if="!excludedMap[sample.table.name][col]"
                          :disabled="checkboxDisabled(sample.table, col)"
                          dark
                          :color="linkColor(sample.table, col)"
                          @click="excludedMap[sample.table.name][col] = true"
                        >
                          check_box
                        </v-icon>
                        <v-icon
                          v-else
                          dark
                          :disabled="checkboxDisabled(sample.table, col)"
                          :color="linkColor(sample.table, col)"
                          @click="excludedMap[sample.table.name][col] = false"
                        >
                          check_box_outline_blank
                        </v-icon>

                        <!-- Column name -->
                        <span :class="linkColor(sample.table, col, true)">
                          {{ col }}
                        </span>

                        <!-- Link to other table column -->
                        <v-menu
                          :close-on-content-click="false"
                          @input="menuOpen = $event"
                        >
                          <template #activator="{ on }">
                            <v-icon
                              :color="linkColor(sample.table, col)"
                              dark
                              :disabled="linkDisabled(sample.table)"
                              v-on="on"
                            >
                              link
                            </v-icon>
                          </template>
                          <v-card max-height="30vh">
                            <!-- Edge Table -->
                            <template v-if="network.edge?.table.name === sample.table.name">
                              <v-card-subtitle
                                class="py-1 px-2"
                              >
                                <span v-if="linkMap[sample.table.name]?.[col] !== undefined">
                                  Remove Link
                                </span>
                                <span v-else>
                                  Select Source/Target
                                </span>
                              </v-card-subtitle>

                              <template v-if="!(linkMap[sample.table.name]?.[col] || selectingSource || selectingTarget)">
                                <v-list
                                  class="my-0 py-0"
                                  dense
                                >
                                  <v-list-item
                                    :disabled="network.source_table !== undefined"
                                    @click="selectingSource = true"
                                  >
                                    Source
                                  </v-list-item>
                                  <v-list-item
                                    :disabled="network.target_table !== undefined"
                                    @click="selectingTarget = true"
                                  >
                                    Target
                                  </v-list-item>
                                </v-list>
                              </template>
                              <template v-else>
                                <v-list
                                  class="my-0 py-0"
                                  dense
                                >
                                  <template v-if="linkMap[sample.table.name]?.[col] !== undefined">
                                    <v-list-item>
                                      {{ `${linkMap[sample.table.name][col].table.name}:${linkMap[sample.table.name][col].column}` }}
                                      <v-spacer />
                                      <v-btn
                                        icon
                                        right
                                        @click.stop="removeColumnLink(sample.table, col)"
                                      >
                                        <v-icon>close</v-icon>
                                      </v-btn>
                                    </v-list-item>
                                  </template>
                                  <template v-else>
                                    <v-list-item
                                      v-for="otherCol in getOtherTableColumns(sample.table.name)"
                                      :key="`${sample.table.name}-${otherCol.table.name}-${otherCol.column}`"
                                      @click="linkSourceOrTargetTable(col, otherCol.table, otherCol.column)"
                                    >
                                      {{ `${otherCol.table.name}:${otherCol.column}` }}
                                    </v-list-item>
                                  </template>
                                </v-list>
                              </template>
                            </template>

                            <!-- Node Table -->
                            <template v-else>
                              <v-card-subtitle class="py-1 px-2">
                                <span v-if="linkMap[sample.table.name]?.[col] !== undefined">
                                  Remove Link
                                </span>
                                <span v-else>
                                  Join From
                                </span>
                              </v-card-subtitle>
                              <v-list
                                class="my-0 py-0"
                                dense
                              >
                                <template v-if="linkMap[sample.table.name]?.[col] !== undefined">
                                  <v-list-item>
                                    {{ `${linkMap[sample.table.name][col].table.name}:${linkMap[sample.table.name][col].column}` }}
                                    <v-spacer />
                                    <v-btn
                                      icon
                                      right
                                      @click.stop="removeColumnLink(sample.table, col)"
                                    >
                                      <v-icon>close</v-icon>
                                    </v-btn>
                                  </v-list-item>
                                </template>
                                <template v-else>
                                  <v-list-item
                                    v-for="otherCol in getOtherTableColumns(sample.table.name)"
                                    :key="`${sample.table.name}-${otherCol.table.name}-${otherCol.column}`"
                                    @click="joinTable(sample.table, col, otherCol.table, otherCol.column)"
                                  >
                                    {{ `${otherCol.table.name}:${otherCol.column}` }}
                                  </v-list-item>
                                </template>
                              </v-list>
                            </template>
                          </v-card>
                        </v-menu>
                      </th>
                    </tr>
                  </thead>
                </template>
                <template #item="{ item, headers }">
                  <tr>
                    <td
                      v-for="header in headers"
                      :key="header.value"
                      :class="getColumnItemClass(sample.table, header.value)"
                      style="width: 1px; white-space: nowrap;"
                    >
                      {{ columnItemText(item, header.value) }}
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card>
          </v-row>
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>

<script lang="ts">
/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */
/* eslint-disable brace-style */

import {
  computed, defineComponent, onMounted, reactive, ref, watch, watchEffect,
} from '@vue/composition-api';
import { DataTableHeader } from 'vuetify';

import api from '@/api';
import store from '@/store';

const LinkColors = [
  'amber',
  'green',
  'red',
  'brown',
  'orange',
  'lime',
  'purple',
  'cyan',
];

interface BaseTable {
  name: string;
  excluded: {[key: string]: boolean | undefined};
  // excluded: Set<string>;
}

interface Link {
  local: string;
  foreign: string;
}

interface FullTable extends BaseTable {
  joined?: {
    table: BaseTable;
    link: Link;
  };
}

// For fully constructed network
interface CSVNetwork {
  name: string;
  // edge_table: FullTable;
  edge: {
    table: FullTable;
    source: Link;
    target: Link;
  };
  source_table: FullTable;
  target_table: FullTable;
}

interface CSVNetworkModel extends Partial<Omit<CSVNetwork, 'edge'>> {
  edge?: {
    table: FullTable;
    source?: Link;
    target?: Link;
  }
}

type CSVRow = {[key: string]: string};
interface CSVPreview {
  headers: DataTableHeader[];
  rows: CSVRow[];
  table: BaseTable;
}

export default defineComponent({
  setup(props, ctx) {
    const files = ref<File[]>([]);
    const tableSamples = ref<CSVPreview[]>([]);
    const tablesVisible = ref<Record<string, boolean>>({});
    const visibleTableSamples = computed(
      () => tableSamples.value.filter(
        (sample) => tablesVisible.value[sample.table.name] === true,
      ),
    );
    const allTablesVisible = computed(
      () => visibleTableSamples.value.length === tableSamples.value.length,
    );
    function selectAllTables(on: boolean | null) {
      // Coerce null to boolean
      const state = !!on;
      Object.keys(tablesVisible.value).forEach((key) => {
        tablesVisible.value[key] = state;
      });
    }

    const network: CSVNetworkModel = reactive({
      name: undefined,
      edge: undefined,
      source_table: undefined,
      target_table: undefined,
    });
    const mainTables = computed(() => [network.edge?.table, network.source_table, network.target_table]);
    const inNetworkTables = computed(() => [
      ...mainTables.value,
      network.edge?.table.joined?.table,
      network.source_table?.joined?.table,
      network.target_table?.joined?.table,
    ]);

    interface ExclusionMap {
      [key: string]: {
        [innerKey: string]: boolean
      }
    }

    // Remove any no longer visible links
    watch(tablesVisible, (visible) => {
      const invisibleTables = tableSamples.value.filter((s) => visible[s.table.name] === false);
      invisibleTables.forEach((sample) => {
        const { table } = sample;

        // Edge table + joined
        if (network.edge?.table.name === table.name) {
          network.edge = undefined;
          network.source_table = undefined;
          network.target_table = undefined;
          return;
        }
        if (network.edge?.table.joined?.table.name === table.name) {
          network.edge.table.joined = undefined;
          return;
        }

        // Source table + joined
        if (network.source_table?.name === table.name) {
          network.source_table = undefined;
          if (network.edge) {
            network.edge.source = undefined;
          }
          return;
        }
        if (network.source_table?.joined?.table.name === table.name) {
          network.source_table.joined = undefined;
          return;
        }

        // Target table + joined
        if (network.target_table?.name === table.name) {
          network.target_table = undefined;
          if (network.edge) {
            network.edge.target = undefined;
          }
          return;
        }
        if (network.target_table?.joined?.table.name === table.name) {
          network.target_table.joined = undefined;
        }
      });
    }, { deep: true });

    // Update excluded map when visible tables change
    const excludedMap = ref(reactive({} as ExclusionMap));
    watch(visibleTableSamples, (samples) => {
      excludedMap.value = reactive(samples.reduce((acc, cur) => (
        {
          ...acc,
          [cur.table.name]: cur.headers.reduce((hacc, hcur) => (
            {
              ...hacc,
              // Default all tables to not excluded
              [hcur.value]: false,
            }
          ), {}),
        }
      ), {}));
    });

    interface LinkMapValue {
      table: BaseTable;
      column: string;
      type: 'source' | 'target' | 'join'
    }
    const linkMap = computed(() => {
      const map = {} as Record<string, Record<string, LinkMapValue>>;

      // Edge table
      if (network.edge) {
        map[network.edge.table.name] = {};

        if (network.edge.source && network.source_table) {
          map[network.edge.table.name][network.edge.source.local] = {
            table: network.source_table,
            column: network.edge.source.foreign,
            type: 'source',
          };
        }
        if (network.edge.target && network.target_table) {
          map[network.edge.table.name][network.edge.target.local] = {
            table: network.target_table,
            column: network.edge.target.foreign,
            type: 'target',
          };
        }
        if (network.edge.table.joined) {
          map[network.edge.table.name][network.edge.table.joined.link.local] = {
            table: network.edge.table.joined.table,
            column: network.edge.table.joined.link.foreign,
            type: 'join',
          };
        }
      }

      // Source table
      if (network.source_table?.joined) {
        map[network.source_table.name] = {};
        map[network.source_table.name][network.source_table.joined.link.local] = {
          table: network.source_table.joined.table,
          column: network.source_table.joined.link.foreign,
          type: 'join',
        };
      }

      // Target table
      if (network.target_table?.joined) {
        map[network.target_table.name] = {};
        map[network.target_table.name][network.target_table.joined.link.local] = {
          table: network.target_table.joined.table,
          column: network.target_table.joined.link.foreign,
          type: 'join',
        };
      }

      return map;
    });

    // Network data
    function setEdgeTable(table: BaseTable, val: boolean) {
      const newEdgeTable = {
        table: {
          ...table,
          joined: undefined,
        },
        source: undefined,
        target: undefined,
      };
      network.edge = val ? newEdgeTable : undefined;
      network.source_table = undefined;
      network.target_table = undefined;
    }

    // Load table from workspace and store in tableSamples
    onMounted(async () => {
      if (!store.state.currentWorkspace) {
        return;
      }

      const ws = store.state.currentWorkspace;
      const tables = [...ws.nodeTables, ...ws.edgeTables];
      const samples: CSVPreview[] = await Promise.all(tables.map(async (table) => {
        const res = await api.axios.get(`workspaces/${ws.name}/tables/${table.name}/rows`, {
          params: {
            limit: 5,
          },
        });

        const rows = res.data.results;
        const headers: DataTableHeader[] = Object.keys(rows[0])
          .filter((header) => !['_id', '_key', '_rev'].includes(header))
          .map((header) => ({ text: header, value: header }));

        return {
          // table: { name: table.name, excluded: new Set<string>() },
          table: reactive({ name: table.name, excluded: {} }),
          headers,
          rows,
        };
      }));

      // Sort samples by number of headers, to provide easier viewing
      const sortedSamples = samples.sort((a, b) => {
        if (a.headers.length < b.headers.length) {
          return -1;
        }
        if (b.headers.length > a.headers.length) {
          return 1;
        }
        return 0;
      });

      // Store value in tableSamples
      tableSamples.value = sortedSamples;
      tablesVisible.value = reactive(sortedSamples.reduce((obj, cur) => ({ ...obj, [cur.table.name]: true }), {}));
    });

    // Edge source/target
    const selectingSource = ref(false);
    const selectingTarget = ref(false);

    // Menu state
    const menuOpen = ref(false);
    watchEffect(() => {
      if (!menuOpen.value) {
        selectingSource.value = false;
        selectingTarget.value = false;
      }
    });

    const unusedTable = (table: string) => (![network.edge?.table.name, network.source_table?.name, network.target_table?.name].includes(table));
    function getOtherTableColumns(tableName: string) {
      const otherTables = visibleTableSamples.value.filter(
        (sample) => unusedTable(sample.table.name) && sample.table.name !== tableName,
      );

      return otherTables.reduce((prev, cur) => ([
        ...prev,
        ...cur.headers.map((sample) => ({ table: cur.table, column: sample.value })),
      ]), [] as {table: BaseTable; column: string}[]);
    }

    /** Links the source/target table to the edge table. */
    function linkSourceOrTargetTable(edgeCol: string, table: BaseTable, col: string) {
      if (network.edge?.table === undefined) {
        throw new Error('Edge table not yet defined!');
      }

      const type = selectingSource.value ? 'source' : 'target';
      const newTable = { ...table, joined: undefined };
      if (type === 'source') {
        network.source_table = newTable;
      } else {
        network.target_table = newTable;
      }

      // Set reference to link in edge def
      network.edge[type] = {
        local: edgeCol,
        foreign: col,
      };
    }

    function joinTable(mainTable: FullTable, col: string, subTable: BaseTable, subCol: string) {
      // eslint-disable-next-line no-param-reassign
      // mainTable.joined = {table: subTable };
      // TODO

      const joined = { table: subTable, link: { local: col, foreign: subCol } as Link };
      if (network.edge && network.edge.table.name === mainTable.name) {
        network.edge.table.joined = joined;
      } else if (network.source_table && network.source_table.name === mainTable.name) {
        network.source_table.joined = joined;
      } else if (network.target_table && network.target_table.name === mainTable.name) {
        network.target_table.joined = joined;
      } else {
        throw new Error('Attempted to join onto invalid table!');
      }
    }

    function tableColId(table: BaseTable, col: string) {
      return `${table.name}:${col}`;
    }

    function checkboxDisabled(table: BaseTable, col: string) {
      // Disable if source/target column in edge table
      if (
        (
          network.edge?.table.name === table.name && (
            network.edge.source?.local === col || network.edge?.target?.local === col
          )
        )
        || (network.source_table?.name === table.name && network.edge?.source?.foreign === col)
        || (network.target_table?.name === table.name && network.edge?.target?.foreign === col)
      ) {
        return true;
      }

      // Disable if column is joined on either side
      if (mainTables.value.some((t) => (
        (t?.name === table.name && t.joined?.link.local === col)
        || (t?.joined?.table.name === table.name && t.joined.link.foreign === col)
      ))) {
        return true;
      }

      // Disable if not one of main tables or a joined table
      if (!mainTables.value.some(
        (t) => t?.name === table.name || t?.joined?.table.name === table.name,
      )) {
        return true;
      }

      return false;
    }

    function linkDisabled(table: BaseTable): boolean {
      // Disable if not one of main tables
      return !mainTables.value.some((t) => t?.name === table.name);
    }

    function removeColumnLink(mainTable: FullTable, col: string) {
      const link: LinkMapValue | undefined = linkMap.value[mainTable.name]?.[col];
      if (link === undefined) {
        throw new Error('Link not found!');
      }

      if (
        (
          network.source_table?.name === mainTable.name
          || network.target_table?.name === mainTable.name
        )
        && link.type !== 'join'
      ) {
        throw new Error('Cannot have source/target links from source/target table!');
      }

      if (network.edge?.table.name === mainTable.name) {
        switch (link.type) {
          case 'source':
            network.source_table = undefined;
            network.edge.source = undefined;
            return;
          case 'target':
            network.target_table = undefined;
            network.edge.target = undefined;
            return;
          case 'join':
            network.edge.table.joined = undefined;
            return;
          default:
            break;
        }
      }

      if (network.source_table?.name === mainTable.name) {
        network.source_table.joined = undefined;
        return;
      }

      if (network.target_table?.name === mainTable.name) {
        network.target_table.joined = undefined;
        return;
      }

      throw new Error('Attempted to remove unexpected link!');
    }

    function getColumnItemClass(table: BaseTable, col: string) {
      // "Disable" if table not in full network or column is excluded
      const tableInNetwork = inNetworkTables.value.some((t) => t?.name === table.name);
      if (!tableInNetwork || excludedMap.value[table.name]?.[col]) {
        return 'grey--text lighten-3';
      }

      return undefined;
    }

    const maxItemLength = 20;
    function columnItemText(item: CSVRow, key: string) {
      let val = item[key];
      if (typeof val !== 'string') {
        val = JSON.stringify(val);
      }

      const truncated = val.substring(0, maxItemLength);
      if (val === truncated) {
        return val;
      }

      return `${truncated}...`;
    }

    /* eslint-disable prefer-destructuring */
    function linkColor(table: BaseTable, col: string, text = false) {
      let color;

      // Source link
      if (
        (network.edge?.table.name === table.name && col === network.edge?.source?.local)
        || (network.source_table?.name === table.name && col === network.edge?.source?.foreign)
      ) {
        color = LinkColors[0];
      }

      // Target link
      if (
        (network.edge?.table.name === table.name && col === network.edge.target?.local)
        || (network.target_table?.name === table.name && col === network.edge?.target?.foreign)
      ) {
        color = LinkColors[1];
      }

      // Edge table join
      if (
        (network.edge?.table.name === table.name && col === network.edge?.table.joined?.link.local)
        || (network.edge?.table.joined?.table.name === table.name && col === network.edge?.table.joined.link.foreign)
      ) {
        color = LinkColors[2];
      }

      // Source table join
      if (
        (network.source_table?.name === table.name && col === network.source_table.joined?.link.local)
        || (network.source_table?.joined?.table.name === table.name && col === network.source_table.joined.link.foreign)
      ) {
        color = LinkColors[3];
      }

      // Target table join
      if (
        (network.target_table?.name === table.name && col === network.target_table.joined?.link.local)
        || (network.target_table?.joined?.table.name === table.name && col === network.target_table.joined.link.foreign)
      ) {
        color = LinkColors[4];
      }

      if (color && text) {
        color = `${color}--text`;
      }

      return color;
    }
    /* eslint-enable prefer-destructuring */

    // Denotes whether the dialog is in a submittable state
    const valid = computed(() => !!(
      network.name
      && network.edge?.table
      && network.source_table
      && network.target_table
    ));

    const networkCreating = ref(false);
    async function createNetwork() {
      if (!valid.value || store.state.currentWorkspace === null) {
        return;
      }

      networkCreating.value = true;

      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      // const _network: CSVNetwork = {
      //   name: networkName.value!,
      //   edge_table: {
      //     name: edgeTable.value!,
      //     source: {
      //       column: edgeTableSource.value!.a.column,
      //       foreign_column: edgeTableSource.value!.b,
      //     },
      //     target: {
      //       column: edgeTableTarget.value!.a.column,
      //       foreign_column: edgeTableTarget.value!.b,
      //     },
      //   },
      // };

      // const nodeLinks = columnLinks.value.filter((l) => !l.id.includes(edgeTable.value!));
      // if (nodeLinks.length) {
      //   network.joins = nodeLinks.reduce((prev, cur) => ({
      //     ...prev,
      //     [cur.a.table]: {
      //       column: cur.a.column,
      //       foreign_column: cur.b,
      //     },
      //   }), {});
      // }
      /* eslint-enable @typescript-eslint/no-non-null-assertion */

      // Create network with post request
      // await api.axios.post(`/workspaces/${store.state.currentWorkspace.name}/networks/from_tables/`, network);
      networkCreating.value = false;
      ctx.emit('success');
    }

    return {
      excludedMap,
      network,
      files,
      tableSamples,
      tablesVisible,
      visibleTableSamples,
      allTablesVisible,
      selectAllTables,
      menuOpen,
      selectingSource,
      selectingTarget,
      getOtherTableColumns,
      checkboxDisabled,
      linkSourceOrTargetTable,
      joinTable,
      removeColumnLink,
      linkMap,
      getColumnItemClass,
      columnItemText,
      linkColor,
      linkDisabled,
      setEdgeTable,
      valid,
      createNetwork,
      networkCreating,
    };
  },
});
</script>
<style scoped>
.upload-preview table th, .table-title {
  background-color: #1976d2 !important;
  color: #fff !important;
}
</style>
