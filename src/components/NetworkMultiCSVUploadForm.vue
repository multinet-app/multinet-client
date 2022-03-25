<template>
  <v-card>
    <v-card-title>Create from Existing Tables</v-card-title>
    <v-card-subtitle>
      Link edge tables with node tables by clicking the <v-icon>link</v-icon> icon on
      the desired edge table, and selecting the node table column that you'd like to link it to.
    </v-card-subtitle>
    <v-row no-gutters>
      <v-col
        cols="1"
        align-self="center"
        class="ml-3"
      >
        <v-btn
          color="primary"
          :disabled="!valid"
        >
          Create
        </v-btn>
      </v-col>
    </v-row>

    <!-- Data tables -->
    <template v-if="tableSamples.length">
      <v-row
        no-gutters
        justify="center"
        class="my-3"
      >
        <v-card
          v-for="file in tableSamples"
          :key="file.name"
          outlined
          raised
          class="ma-4"
          max-width="90%"
        >
          <v-sheet class="table-title px-2">
            <v-row no-gutters>
              <span>{{ file.name }}</span>
              <v-spacer />
              <v-switch
                label="Edge Table"
                dark
                hide-details
                class="ma-0 pa-0"
                :disabled="edgeTableSwitchDisabled(file.name)"
                :value="edgeTable === file.name"
                @change="setEdgeTable(file.name, $event)"
              />
            </v-row>
          </v-sheet>
          <v-data-table
            class="upload-preview"
            hide-default-footer
            hide-default-header
            :headers="file.headers"
            :items="file.rows"
            disable-sort
          >
            <template v-slot:header="{ props: { headers } }">
              <thead dark>
                <tr>
                  <th
                    v-for="{ tableCol } in headers"
                    :key="tableCol.id"
                    style="width: 1px; white-space: nowrap;"
                  >
                    <!-- Include/Exclude Column -->
                    <v-icon
                      v-if="tableColExcludedIndex(tableCol) === -1"
                      dark
                      :color="columnLinked(tableCol) ? 'amber' : ''"
                      @click="includeExcludeTableColumn(tableCol, true)"
                    >
                      check_box
                    </v-icon>
                    <v-icon
                      v-else
                      dark
                      :color="columnLinked(tableCol) ? 'amber' : ''"
                      @click="includeExcludeTableColumn(tableCol, false)"
                    >
                      check_box_outline_blank
                    </v-icon>

                    <!-- Column name -->
                    <span :class="columnLinked(tableCol) ? 'amber--text' : ''">
                      {{ tableCol.col }}
                    </span>

                    <!-- Link to other table column -->
                    <v-menu
                      :close-on-content-click="false"
                      @input="menuOpen = $event"
                    >
                      <template v-slot:activator="{ on }">
                        <v-icon
                          :color="columnLinked(tableCol) ? 'amber' : ''"
                          dark
                          :disabled="linkDisabled(tableCol)"
                          v-on="on"
                        >
                          link
                        </v-icon>
                      </template>
                      <v-card max-height="30vh">
                        <!-- Edge Table -->
                        <template v-if="edgeTable === tableCol.table">
                          <v-card-subtitle class="py-1 px-2">
                            Select Source/Target
                          </v-card-subtitle>

                          <template v-if="!(selectingSource || selectingTarget)">
                            <v-list
                              class="my-0 py-0"
                              dense
                            >
                              <v-list-item
                                :disabled="sourceTargetItemDisabled('source', tableCol.col)"
                                :input-value="sourceTargetItemActive('source', tableCol.col)"
                                @click="selectingSource = true"
                              >
                                Source
                              </v-list-item>
                              <v-list-item
                                :disabled="sourceTargetItemDisabled('target', tableCol.col)"
                                :input-value="sourceTargetItemActive('target', tableCol.col)"
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
                              <v-list-item
                                v-for="col in getOtherTableColumns(tableCol.table)"
                                :key="`${tableCol.table}-${col.id}`"
                                :disabled="columnDisabled(tableCol, col)"
                                @click="linkColumns(tableCol, col)"
                              >
                                {{ `${col.table}:${col.col}` }}
                                <v-spacer />
                                <v-btn
                                  v-if="showColumnRemove(tableCol, col)"
                                  icon
                                  right
                                  @click.stop="removeColumnLink(tableCol, col)"
                                >
                                  <v-icon>close</v-icon>
                                </v-btn>
                              </v-list-item>
                            </v-list>
                          </template>
                        </template>

                        <!-- Node Table -->
                        <template v-else>
                          <v-card-subtitle class="py-1 px-2">
                            Select Foreign Key
                          </v-card-subtitle>
                          <v-list
                            class="my-0 py-0"
                            dense
                          >
                            <v-list-item
                              v-for="col in getOtherTableColumns(tableCol.table)"
                              :key="`${tableCol.table}-${col.id}`"
                              :disabled="columnDisabled(tableCol, col)"
                              @click="linkColumns(tableCol, col)"
                            >
                              {{ col.id }}
                              <v-spacer />
                              <v-btn
                                v-if="showColumnRemove(tableCol, col)"
                                icon
                                right
                                @click.stop="removeColumnLink(tableCol, col)"
                              >
                                <v-icon>close</v-icon>
                              </v-btn>
                            </v-list-item>
                          </v-list>
                        </template>
                      </v-card>
                    </v-menu>
                  </th>
                </tr>
              </thead>
            </template>
            <template v-slot:item="{ item, headers }">
              <tr>
                <td
                  v-for="header in headers"
                  :key="header.tableCol.id"
                  :class="getColumnItemClass(header.tableCol)"
                  style="width: 1px; white-space: nowrap;"
                >
                  {{ columnItemText(item, header.value) }}
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-row>
    </template>
  </v-card>
</template>

<script lang="ts">
/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */

import {
  computed, defineComponent, onMounted, ref, watchEffect,
} from '@vue/composition-api';
import { DataTableHeader } from 'vuetify';

import api from '@/api';
import store from '@/store';

export default defineComponent({
  setup() {
    const files = ref<File[]>([]);
    const tableSamples = ref<CSVPreview[]>([]);
    const columnLinks = ref<ColumnLink[]>([]);

    /* CLASSES AND TYPES */

    class TableColumn {
      id: string;
      table: string;
      col: string;

      constructor(table: string, col: string) {
        this.id = `${table}:${col}`;
        this.table = table;
        this.col = col;
      }

      createLinkString(other: TableColumn): string {
        return `${this.id}->${other.id}`;
      }
    }

    class ColumnLink {
      id: string;
      a: TableColumn;
      b: TableColumn;

      constructor(a: TableColumn, b: TableColumn) {
        this.a = a;
        this.b = b;
        this.id = `${a.id}->${b.id}`;
      }
    }

    interface TableHeader extends DataTableHeader {
      tableCol: TableColumn;
    }

    type CSVRow = {[key: string]: string};
    interface CSVPreview {
      name: string;
      headers: TableHeader[];
      rows: CSVRow[];
    }

    /* COMPONENT LOGIC */

    // Load table from workspace and store in tableSamples
    onMounted(async () => {
      if (!store.state.currentWorkspace) {
        return;
      }

      const ws = store.state.currentWorkspace;
      const tables = [...ws.nodeTables, ...ws.edgeTables];
      const samples: CSVPreview[] = await Promise.all(tables.map(async (table) => {
        const res = await api.axios.get(`workspaces/${ws.name}/tables/${table}/rows`, {
          params: {
            limit: 5,
          },
        });

        const rows = res.data.results;
        const headers: TableHeader[] = Object.keys(rows[0])
          .filter((header) => !['_id', '_key', '_rev'].includes(header))
          .map((header) => ({
            text: header,
            value: header,
            tableCol: new TableColumn(table, header),
          }));

        return {
          rows,
          headers,
          name: table,
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
    });

    // Edge Table
    const edgeTable = ref<string | null>(null);
    const edgeTableSwitchDisabled = (table: string) => (
      (edgeTable.value && edgeTable.value !== table)
      || !!columnLinks.value.find((l) => l.id.includes(table))
    );

    function setEdgeTable(table: string, val: boolean) {
      edgeTable.value = val ? table : null;
    }

    // Edge source/target
    const selectingSource = ref(false);
    const selectingTarget = ref(false);

    // Here, ColumnLink.source is the edge table column,
    // and ColumnLink.target is the node table column
    const edgeTableSource = ref(null as null | ColumnLink);
    const edgeTableTarget = ref(null as null | ColumnLink);

    type SourceTarget = 'source' | 'target';
    function sourceTargetItemDisabled(type: SourceTarget, column: string) {
      const link1 = type === 'source' ? edgeTableSource.value : edgeTableTarget.value;
      const link2 = type === 'target' ? edgeTableSource.value : edgeTableTarget.value;

      return (link1 && link1.a.col !== column) || (link2 && link2.a.col === column);
    }

    function sourceTargetItemActive(type: SourceTarget, column: string) {
      if (type === 'source') {
        return edgeTableSource.value && edgeTableSource.value.a.col === column;
      }

      return edgeTableTarget.value && edgeTableTarget.value.a.col === column;
    }

    // Menu state
    const menuOpen = ref(false);
    watchEffect(() => {
      if (!menuOpen.value) {
        selectingSource.value = false;
        selectingTarget.value = false;
      }
    });

    function getOtherTableColumns(tableName: string) {
      const otherTables = tableSamples.value.filter((table) => table.name !== tableName);
      return otherTables.reduce(
        (prev, cur) => (
          [...prev, ...cur.headers.map((sample) => sample.tableCol)]
        ), [] as TableColumn[],
      );
    }

    // Link two columns
    function linkColumns(source: TableColumn, target: TableColumn) {
      const link = new ColumnLink(source, target);
      if (columnLinks.value.find((l) => l.id === link.id)) {
        return;
      }

      // Set up edge table links if necessary
      if (edgeTable.value !== null) {
        if (selectingSource.value) {
          edgeTableSource.value = link;
        } else if (selectingTarget.value) {
          edgeTableTarget.value = link;
        }
      }

      columnLinks.value.push(link);
    }

    function showColumnRemove(tableCol: TableColumn, colListing: TableColumn) {
      return columnLinks.value.find(
        (l) => (
          l.id.includes(tableCol.id)
          && l.id.includes(colListing.id)
        ),
      );
    }

    function removeColumnLink(a: TableColumn, b: TableColumn) {
      const index = columnLinks.value.findIndex(
        (link) => (
          link.id.includes(a.id)
          && link.id.includes(b.id)
        ),
      );

      if (index === -1) {
        return;
      }

      const link = columnLinks.value[index];
      columnLinks.value = [...columnLinks.value.slice(0, index), ...columnLinks.value.slice(index + 1)];

      // Unlink edge source if necessary
      if (edgeTableSource.value && link.id === edgeTableSource.value.id) {
        edgeTableSource.value = null;
      }
      if (edgeTableTarget.value && link.id === edgeTableTarget.value.id) {
        edgeTableTarget.value = null;
      }
    }

    function columnDisabled(tableCol: TableColumn, colListing: TableColumn) {
      // Check if current table has a link with this column
      const existingTableLinks = columnLinks.value.filter((l) => l.id.includes(tableCol.id));
      if (existingTableLinks.length) {
        // Check if listed column is part of any existing links
        const colInvolved = existingTableLinks.find((l) => l.id.includes(colListing.id));
        if (!colInvolved) {
          return true;
        }
      }

      // Check if column is linked to a different edge table column
      const edgeColumnAlreadyLinked = columnLinks.value.find(
        (l) => (
          l.id.includes(colListing.id)
          && !l.id.includes(tableCol.id)),
      );
      if (tableCol.table === edgeTable.value && edgeColumnAlreadyLinked) {
        return true;
      }

      return false;
    }

    // Include/Exclude a table column
    const excludedTableColumns = ref<TableColumn[]>([]);
    const tableColExcludedIndex = (tableCol: TableColumn) => (
      excludedTableColumns.value.findIndex((tc) => tc.table === tableCol.table && tc.col === tableCol.col)
    );
    function includeExcludeTableColumn(tableCol: TableColumn, excluded: boolean) {
      const existingIndex = tableColExcludedIndex(tableCol);
      const found = existingIndex !== -1;

      // Only take action if found and excluded differ
      if (!found && excluded) {
        // Add to excluded columns
        excludedTableColumns.value.push(tableCol);

        // Remove any existing links
        columnLinks.value
          .filter((l) => l.id.includes(tableCol.id))
          .forEach((l) => { removeColumnLink(l.a, l.b); });
      } else if (found && !excluded) {
        // Remove from excluded columns
        excludedTableColumns.value = [
          ...excludedTableColumns.value.slice(0, existingIndex),
          ...excludedTableColumns.value.slice(existingIndex + 1),
        ];
      }
    }

    function getColumnItemClass(col: TableColumn) {
      if (tableColExcludedIndex(col) !== -1) {
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

    function columnLinked(col: TableColumn): boolean {
      return !!columnLinks.value.find((link) => link.id.includes(col.id));
    }

    function linkDisabled(col: TableColumn): boolean {
      // If table has no links, don't disable
      const tableLinks = columnLinks.value.filter((l) => l.id.includes(col.table));
      if (!tableLinks.length) {
        return false;
      }

      // Disable column if table has links but column isn't linked
      const colLinked = tableLinks.find((l) => l.id.includes(col.id));
      if (col.table !== edgeTable.value && !colLinked) {
        return true;
      }

      return false;
    }

    // Denotes whether the dialog is in a submittable state
    const valid = computed(() => !!(edgeTable.value && edgeTableSource.value && edgeTableTarget.value));

    return {
      files,
      tableSamples,
      menuOpen,
      selectingSource,
      edgeTableSource,
      selectingTarget,
      edgeTableTarget,
      sourceTargetItemDisabled,
      sourceTargetItemActive,
      getOtherTableColumns,
      columnLinks,
      linkColumns,
      showColumnRemove,
      removeColumnLink,
      columnDisabled,
      excludedTableColumns,
      tableColExcludedIndex,
      includeExcludeTableColumn,
      getColumnItemClass,
      columnItemText,
      columnLinked,
      linkDisabled,
      edgeTable,
      edgeTableSwitchDisabled,
      setEdgeTable,
      valid,
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
