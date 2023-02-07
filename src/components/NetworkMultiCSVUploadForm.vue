<template>
  <v-card>
    <v-card-title>Create from Existing Tables</v-card-title>
    <v-card-subtitle>
      Link edge tables with node tables by clicking the <v-icon>mdi-link</v-icon> icon on
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
          v-model="networkName"
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
                    :disabled="edgeTable !== undefined && edgeTable.table.name !== sample.table.name"
                    :value="edgeTable !== undefined && edgeTable.table.name === sample.table.name"
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
                          @click="excludedMap[sample.table.name][col] = true"
                        >
                          mdi-checkbox-marked
                        </v-icon>
                        <v-icon
                          v-else
                          dark
                          :disabled="checkboxDisabled(sample.table, col)"
                          @click="excludedMap[sample.table.name][col] = false"
                        >
                          mdi-checkbox-blank-outline
                        </v-icon>

                        <!-- Column name -->
                        <span>{{ col }}</span>

                        <!-- Link to other table column -->
                        <v-menu
                          v-if="mainTables.some((t) => t !== undefined && t.name === sample.table.name)"
                          :close-on-content-click="false"
                          @input="menuOpen = $event"
                        >
                          <template #activator="{ on }">
                            <v-icon
                              :color="linkColor(sample.table, col)"
                              dark
                              :class="{ 'disable-events': linkDisabled(sample.table) }"
                              v-on="on"
                            >
                              mdi-link
                            </v-icon>
                          </template>
                          <v-card max-height="30vh">
                            <!-- Edge Table -->
                            <v-card-subtitle
                              class="py-1 px-2"
                            >
                              <span v-if="linkExists(sample.table, col, ['source', 'target'])">
                                Remove Link
                              </span>
                              <span v-else>
                                Select Source/Target
                              </span>
                            </v-card-subtitle>

                            <template v-if="!(linkExists(sample.table, col, ['source', 'target']) || selectingSource || selectingTarget)">
                              <v-list
                                class="my-0 py-0"
                                dense
                              >
                                <v-list-item
                                  :disabled="sourceTable !== undefined"
                                  @click="selectingSource = true"
                                >
                                  Source
                                </v-list-item>
                                <v-list-item
                                  :disabled="targetTable !== undefined"
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
                                <template v-if="linkExists(sample.table, col, ['source', 'target'])">
                                  <v-list-item>
                                    {{ getLinkText(sample.table, col, ['source', 'target']) }}
                                    <v-spacer />
                                    <v-btn
                                      icon
                                      right
                                      @click.stop="removeColumnLink(sample.table, col)"
                                    >
                                      <v-icon>mdi-close</v-icon>
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
                          </v-card>
                        </v-menu>

                        <v-menu
                          v-if="inNetworkTables.some((t) => t !== undefined && t.name === sample.table.name)"
                          :close-on-content-click="false"
                          @input="menuOpen = $event"
                        >
                          <template #activator="{ on }">
                            <v-icon
                              :color="linkColor(sample.table, col, true)"
                              :class="{ 'disable-events': joinDisabled(sample.table, col) }"
                              dark
                              v-on="on"
                            >
                              mdi-call-merge
                            </v-icon>
                          </template>
                          <v-card max-height="30vh">
                            <!-- Node Table -->
                            <v-card-subtitle class="py-1 px-2">
                              <span v-if="linkExists(sample.table, col, ['join'])">
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
                              <template v-if="linkExists(sample.table, col, ['join'])">
                                <v-list-item>
                                  {{ getLinkText(sample.table, col, ['join']) }}
                                  <v-spacer />
                                  <v-btn
                                    icon
                                    right
                                    @click.stop="removeColumnLink(sample.table, col, true)"
                                  >
                                    <v-icon>mdi-close</v-icon>
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
} from 'vue';
import type { DataTableHeader } from 'vuetify';

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
  excluded: string[];
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

function isFullTable(table: FullTable | BaseTable): table is FullTable {
  return 'joined' in table;
}

interface EdgeTableDef {
  table: FullTable;
  source?: Link;
  target?: Link;
}

// For fully constructed network
interface CSVNetwork {
  name: string;
  edge: EdgeTableDef;
  source_table: FullTable;
  target_table: FullTable;
}

type CSVRow = {[key: string]: string};
interface CSVPreview {
  headers: DataTableHeader[];
  rows: CSVRow[];
  table: BaseTable;
}

export default defineComponent({
  setup(props, { emit }) {
    const workspace = computed(() => store.state.currentWorkspace);

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

    // Network def
    const networkName = ref('');
    const edgeTable = ref<EdgeTableDef>();
    const sourceTable = ref<FullTable>();
    const targetTable = ref<FullTable>();

    const mainTables = computed(() => [edgeTable.value?.table, sourceTable.value, targetTable.value]);
    const inNetworkTables = computed(() => [
      ...mainTables.value,
      edgeTable.value?.table.joined?.table,
      sourceTable.value?.joined?.table,
      targetTable.value?.joined?.table,
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
        if (edgeTable.value?.table.name === table.name) {
          edgeTable.value = undefined;
          sourceTable.value = undefined;
          targetTable.value = undefined;
          return;
        }
        if (edgeTable.value?.table.joined?.table.name === table.name) {
          edgeTable.value.table.joined = undefined;
          return;
        }

        // Source table + joined
        if (sourceTable.value?.name === table.name) {
          sourceTable.value = undefined;
          if (edgeTable.value) {
            edgeTable.value.source = undefined;
          }
          return;
        }
        if (sourceTable.value?.joined?.table.name === table.name) {
          sourceTable.value.joined = undefined;
          return;
        }

        // Target table + joined
        if (targetTable.value?.name === table.name) {
          targetTable.value = undefined;
          if (edgeTable.value) {
            edgeTable.value.target = undefined;
          }
          return;
        }
        if (targetTable.value?.joined?.table.name === table.name) {
          targetTable.value.joined = undefined;
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

    type LinkType = 'source' | 'target' | 'join';
    interface LinkMapValue {
      table: BaseTable;
      column: string;
    }
    const linkMap = computed(() => {
      const map = {} as Record<string, Record<string, Partial<Record<LinkType, LinkMapValue>>>>;
      function set(table: string, col: string, type: LinkType, val: LinkMapValue) {
        if (map[table] === undefined) {
          map[table] = {};
        }
        if (map[table][col] === undefined) {
          map[table][col] = {};
        }
        map[table][col][type] = val;
      }

      // Edge table
      if (edgeTable.value?.source && sourceTable.value) {
        set(edgeTable.value.table.name, edgeTable.value.source.local, 'source', {
          table: sourceTable.value,
          column: edgeTable.value.source.foreign,
        });
      }
      if (edgeTable.value?.target && targetTable.value) {
        set(edgeTable.value.table.name, edgeTable.value.target.local, 'target', {
          table: targetTable.value,
          column: edgeTable.value.target.foreign,
        });
      }
      if (edgeTable.value?.table.joined) {
        set(edgeTable.value.table.name, edgeTable.value.table.joined.link.local, 'join', {
          table: edgeTable.value.table.joined.table,
          column: edgeTable.value.table.joined.link.foreign,
        });
      }

      // Source table
      if (sourceTable.value?.joined) {
        set(sourceTable.value.name, sourceTable.value.joined.link.local, 'join', {
          table: sourceTable.value.joined.table,
          column: sourceTable.value.joined.link.foreign,
        });
      }

      // Target table
      if (targetTable.value?.joined) {
        set(targetTable.value.name, targetTable.value.joined.link.local, 'join', {
          table: targetTable.value.joined.table,
          column: targetTable.value.joined.link.foreign,
        });
      }

      return map;
    });

    function linkExists(table: BaseTable, col: string, types?: LinkType[]) {
      const entry = linkMap.value[table.name]?.[col];
      if (entry === undefined) {
        return false;
      }
      if (types === undefined) {
        return true;
      }

      const linkTypes = Object.keys(entry) as LinkType[];
      const intersection = linkTypes.some((t) => types.includes(t));
      return entry !== undefined && intersection;
    }

    /** Get first link that matches specified type. */
    function getLinkText(table: BaseTable, col: string, types?: LinkType[]) {
      const format = (val: LinkMapValue) => (`${val.table.name}:${val.column}`);
      const entry = linkMap.value[table.name]?.[col];
      const linkTypes = Object.keys(entry || {}) as LinkType[];
      if (entry === undefined || !linkTypes.length) {
        return '';
      }

      if (types === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return format(entry[linkTypes[0]]!);
      }

      // Return first matching linkType
      const match = linkTypes.find((t) => types.includes(t));
      if (match === undefined) {
        return '';
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return format(entry[match]!);
    }

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
      edgeTable.value = val ? newEdgeTable : undefined;
      sourceTable.value = undefined;
      targetTable.value = undefined;
    }

    async function init() {
      if (workspace.value === null) {
        tableSamples.value = [];
        tablesVisible.value = {};
        return;
      }

      const ws = workspace.value;
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
          table: reactive({ name: table.name, excluded: [] }),
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
    }

    // Load table from workspace and store in tableSamples
    onMounted(() => {
      init();
    });

    watch(workspace, () => {
      init();
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

    function getOtherTableColumns(tableName: string) {
      const otherTables = visibleTableSamples.value.filter(
        (sample) => sample.table.name !== tableName,
      );

      return otherTables.reduce((prev, cur) => ([
        ...prev,
        ...cur.headers.map((sample) => ({ table: cur.table, column: sample.value })),
      ]), [] as {table: BaseTable; column: string}[]);
    }

    /** Links the source/target table to the edge table. */
    function linkSourceOrTargetTable(edgeCol: string, table: BaseTable, col: string) {
      if (edgeTable.value?.table === undefined) {
        throw new Error('Edge table not yet defined!');
      }

      const type = selectingSource.value ? 'source' : 'target';
      const newTable = { ...table, joined: undefined };
      if (type === 'source') {
        sourceTable.value = newTable;
      } else {
        targetTable.value = newTable;
      }

      // Set reference to link in edge def
      edgeTable.value[type] = {
        local: edgeCol,
        foreign: col,
      };
    }

    function joinTable(mainTable: FullTable, col: string, subTable: BaseTable, subCol: string) {
      // eslint-disable-next-line no-param-reassign
      // mainTable.joined = {table: subTable };
      // TODO

      const joined = { table: subTable, link: { local: col, foreign: subCol } as Link };
      if (edgeTable.value && edgeTable.value.table.name === mainTable.name) {
        edgeTable.value.table.joined = joined;
      } else if (sourceTable.value && sourceTable.value.name === mainTable.name) {
        sourceTable.value.joined = joined;
      } else if (targetTable.value && targetTable.value.name === mainTable.name) {
        targetTable.value.joined = joined;
      } else {
        throw new Error('Attempted to join onto invalid table!');
      }
    }

    function checkboxDisabled(table: BaseTable, col: string) {
      // Disable if source/target column in edge table
      if (
        (
          edgeTable.value?.table.name === table.name && (
            edgeTable.value.source?.local === col || edgeTable.value?.target?.local === col
          )
        )
        || (sourceTable.value?.name === table.name && edgeTable.value?.source?.foreign === col)
        || (targetTable.value?.name === table.name && edgeTable.value?.target?.foreign === col)
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
      return edgeTable.value?.table.name !== table.name;
    }

    function joinDisabled(table: BaseTable, col: string): boolean {
      // Disable if not one of main tables, or if another column
      // in this table is already linked (only one join per table allowed)
      const entry = linkMap.value[table.name];
      return !mainTables.value.some((t) => t?.name === table.name) || (
        entry !== undefined
        && Object.keys(entry).some((key) => key !== col && entry[key].join !== undefined)
      );
    }

    function removeColumnLink(mainTable: FullTable, col: string, join = false) {
      const link = linkMap.value[mainTable.name]?.[col];
      if (link === undefined) {
        throw new Error('Link not found!');
      }

      if (
        (
          sourceTable.value?.name === mainTable.name
          || targetTable.value?.name === mainTable.name
        )
        && link.join === undefined
      ) {
        throw new Error('Cannot have source/target links from source/target table!');
      }

      // Edge table
      if (edgeTable.value?.table.name === mainTable.name) {
        const keys = Object.keys(link) as LinkType[];
        if (!join) {
          if (keys.includes('source')) {
            sourceTable.value = undefined;
            edgeTable.value.source = undefined;
          }
          if (keys.includes('target')) {
            targetTable.value = undefined;
            edgeTable.value.target = undefined;
          }
        } else if (keys.includes('join')) {
          edgeTable.value.table.joined = undefined;
        }

        return;
      }

      if (sourceTable.value?.name === mainTable.name) {
        sourceTable.value.joined = undefined;
        return;
      }

      if (targetTable.value?.name === mainTable.name) {
        targetTable.value.joined = undefined;
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
    function linkColor(table: BaseTable, col: string, join = false) {
      // There's at most 5 links
      // Edge -> Source
      // Edge -> Target
      // Edge -> Joined Table
      // Source -> Joined Table
      // Target -> Joined Table
      // Since we want to show both sides of link, in reality there are 10 places it can live

      // Source link
      if (
        !join && (
          (edgeTable.value?.table.name === table.name && col === edgeTable.value?.source?.local)
          || (sourceTable.value?.name === table.name && col === edgeTable.value?.source?.foreign)
        )
      ) {
        return LinkColors[0];
      }

      // Target link
      if (
        !join && (
          (edgeTable.value?.table.name === table.name && col === edgeTable.value.target?.local)
          || (targetTable.value?.name === table.name && col === edgeTable.value?.target?.foreign)
        )
      ) {
        return LinkColors[1];
      }

      // Edge table join
      if (
        join && (
          (edgeTable.value?.table.name === table.name && col === edgeTable.value?.table.joined?.link.local)
          || (edgeTable.value?.table.joined?.table.name === table.name && col === edgeTable.value?.table.joined.link.foreign)
        )
      ) {
        return LinkColors[2];
      }

      // Source table join
      if (
        join && (
          (sourceTable.value?.name === table.name && col === sourceTable.value.joined?.link.local)
          || (sourceTable.value?.joined?.table.name === table.name && col === sourceTable.value.joined.link.foreign)
        )
      ) {
        return LinkColors[3];
      }

      // Target table join
      if (
        join && (
          (targetTable.value?.name === table.name && col === targetTable.value.joined?.link.local)
          || (targetTable.value?.joined?.table.name === table.name && col === targetTable.value.joined.link.foreign)
        )
      ) {
        return LinkColors[4];
      }

      return undefined;
    }
    /* eslint-enable prefer-destructuring */

    // Denotes whether the dialog is in a submittable state
    const valid = computed(() => !!(
      networkName.value
      && edgeTable.value?.table
      && sourceTable.value
      && targetTable.value
    ));

    const networkCreating = ref(false);
    async function createNetwork() {
      if (!valid.value || store.state.currentWorkspace === null) {
        return;
      }
      if (!(edgeTable.value && sourceTable.value && targetTable.value)) {
        throw new Error('Falsey values when trying to create network!');
      }

      networkCreating.value = true;

      const network: CSVNetwork = {
        name: networkName.value,
        edge: edgeTable.value,
        source_table: sourceTable.value,
        target_table: targetTable.value,
      };

      /**
       * Inject excluded columns into passed table.
       */
      function injectExcluded(table: FullTable | BaseTable | undefined) {
        if (table === undefined) {
          return;
        }

        const excluded = excludedMap.value[table.name];
        // eslint-disable-next-line no-param-reassign
        table.excluded = Object.keys(excluded).filter((key) => excluded[key] === true);

        if (isFullTable(table)) {
          injectExcluded(table.joined?.table);
        }
      }

      // Inject excluded columns
      injectExcluded(network.edge.table);
      injectExcluded(network.source_table);
      injectExcluded(network.target_table);

      // Create network with post request
      await api.axios.post(`/workspaces/${store.state.currentWorkspace.name}/networks/from_tables/`, network);
      networkCreating.value = false;
      emit('success');
    }

    return {
      excludedMap,
      networkName,
      edgeTable,
      sourceTable,
      targetTable,
      files,
      tableSamples,
      tablesVisible,
      visibleTableSamples,
      allTablesVisible,
      selectAllTables,
      mainTables,
      inNetworkTables,
      menuOpen,
      selectingSource,
      selectingTarget,
      getOtherTableColumns,
      checkboxDisabled,
      linkSourceOrTargetTable,
      joinTable,
      removeColumnLink,
      linkMap,
      linkExists,
      getColumnItemClass,
      columnItemText,
      linkColor,
      linkDisabled,
      getLinkText,
      joinDisabled,
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

.disable-events {
  pointer-events: none
}
</style>
