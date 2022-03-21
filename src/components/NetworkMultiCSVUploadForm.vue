<template>
  <v-card>
    <v-card-title>Link Tables</v-card-title>
    <v-card-subtitle>
      Link edge tables with node tables by clicking the <v-icon>link</v-icon> icon on
      the desired edge table, and selecting the node table column that you'd like to link it to.
    </v-card-subtitle>
    <v-row no-gutters>
      <v-col cols="2">
        <v-file-input
          v-model="files"
          multiple
          label="CSV Files"
          accept="text/csv"
          class="ml-3"
        />
      </v-col>
      <v-col
        cols="1"
        align-self="center"
        class="ml-3"
      >
        <v-btn
          color="primary"
          :disabled="!valid"
        >
          Upload
        </v-btn>
      </v-col>
    </v-row>

    <!-- Data tables -->
    <template v-if="fileSamples.length">
      <v-row
        no-gutters
        justify="center"
        class="my-3"
      >
        <v-card
          v-for="file in fileSamples"
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
                    :key="tableColumnString(tableCol)"
                    class="pt-2 pb-4"
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
                      {{ tableCol.column }}
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
                                :disabled="sourceTargetItemDisabled('source', tableCol.column)"
                                :input-value="sourceTargetItemActive('source', tableCol.column)"
                                @click="selectingSource = true"
                              >
                                Source
                              </v-list-item>
                              <v-list-item
                                :disabled="sourceTargetItemDisabled('target', tableCol.column)"
                                :input-value="sourceTargetItemActive('target', tableCol.column)"
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
                                :key="`${tableCol.table}-${col.table}-${col.column}`"
                                :disabled="columnDisabled(tableCol, col)"
                                @click="linkColumns(tableCol, col)"
                              >
                                {{ `${col.table}:${col.column}` }}
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
                              :key="`${tableCol.table}-${col.table}-${col.column}`"
                              :disabled="columnDisabled(tableCol, col)"
                              @click="linkColumns(tableCol, col)"
                            >
                              {{ `${col.table}:${col.column}` }}
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
          </v-data-table>
        </v-card>
      </v-row>
    </template>
  </v-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watchEffect,
} from '@vue/composition-api';
import Papa from 'papaparse';
import { DataTableHeader } from 'vuetify';

type CSVRow = {[key: string]: string};

interface TableHeader extends DataTableHeader {
  tableCol: TableColumn;
}

interface CSVPreview {
  name: string;
  headers: TableHeader[];
  rows: CSVRow[];
}

// TODO: Make this a class
interface TableColumn{
  table: string;
  column: string;
}

// Here, source is the edge table, and target is the associated node table
// TODO: Make this a class
interface ColumnLink {
  id: string;
  source: TableColumn;
  target: TableColumn;
}

export default defineComponent({
  setup() {
    const files = ref<File[]>([]);
    const fileSamples = ref<CSVPreview[]>([]);
    const columnLinks = ref<ColumnLink[]>([]);

    // Parse all selected files, setting results to fileSamples
    watchEffect(async () => {
      const samplesPromise = await Promise.all(files.value.map(async (file) => (
        new Promise((resolve) => {
          Papa.parse(file, {
            preview: 5,
            header: true,
            complete: (result) => {
              if (!result.meta.fields) {
                return;
              }

              const headers: TableHeader[] = result.meta.fields.map((field) => ({
                tableCol: { table: file.name, column: field },
                text: field,
                value: field,
              }));

              resolve({
                headers,
                name: file.name,
                rows: result.data as CSVRow[],
              });
            },
          });
        })
      )));

      fileSamples.value = (await samplesPromise) as CSVPreview[];
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
      const a = type === 'source' ? edgeTableSource.value : edgeTableTarget.value;
      const b = type === 'target' ? edgeTableSource.value : edgeTableTarget.value;

      return (a && a.source.column !== column) || (b && b.source.column === column);
    }

    function sourceTargetItemActive(type: SourceTarget, column: string) {
      if (type === 'source') {
        return edgeTableSource.value && edgeTableSource.value.source.column === column;
      }

      return edgeTableTarget.value && edgeTableTarget.value.source.column === column;
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
      const otherTables = fileSamples.value.filter((table) => table.name !== tableName);
      return otherTables.reduce(
        (prev, cur) => (
          [...prev, ...cur.headers.map((sample) => sample.tableCol)]
        ), [] as TableColumn[],
      );
    }

    // TODO: Place as getter of TableColumn class
    function tableColumnString(col: TableColumn) {
      return `${col.table}:${col.column}`;
    }

    // TODO: Place as getter of ColumnLink class
    function createLinkString(source: TableColumn, target: TableColumn): string {
      return `${source.table}:${source.column}->${target.table}:${target.column}`;
    }

    // Link two columns
    function linkColumns(source: TableColumn, target: TableColumn) {
      const link: ColumnLink = { id: createLinkString(source, target), source, target };
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
          l.id.includes(tableColumnString(tableCol))
          && l.id.includes(tableColumnString(colListing))
        ),
      );
    }

    function removeColumnLink(a: TableColumn, b: TableColumn) {
      const index = columnLinks.value.findIndex(
        (link) => (
          link.id.includes(tableColumnString(a))
          || link.id.includes(tableColumnString(b))
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
      const existingTableLinks = columnLinks.value.filter((l) => l.id.includes(tableColumnString(tableCol)));
      if (existingTableLinks.length) {
        // Check if listed column is part of any existing links
        const colInvolved = existingTableLinks.find((l) => l.id.includes(tableColumnString(colListing)));
        if (!colInvolved) {
          return true;
        }
      }

      // Check if column is linked to a different table column
      const columnAlreadyLinked = columnLinks.value.find(
        (l) => (
          l.id.includes(tableColumnString(colListing))
          && !l.id.includes(tableColumnString(tableCol))
        ),
      );
      if (columnAlreadyLinked) {
        return true;
      }

      return false;
    }

    // Include/Exclude a table column
    const excludedTableColumns = ref<TableColumn[]>([]);
    const tableColExcludedIndex = (tableCol: TableColumn) => (
      excludedTableColumns.value.findIndex((tc) => tc.table === tableCol.table && tc.column === tableCol.column)
    );
    function includeExcludeTableColumn(tableCol: TableColumn, excluded: boolean) {
      const existingIndex = tableColExcludedIndex(tableCol);
      const found = existingIndex !== -1;

      // Only take action if found and excluded differ
      if (!found && excluded) {
        // Add to excluded columns
        excludedTableColumns.value.push(tableCol);
      } else if (found && !excluded) {
        // Remove from excluded columns
        excludedTableColumns.value = [
          ...excludedTableColumns.value.slice(0, existingIndex),
          ...excludedTableColumns.value.slice(existingIndex + 1),
        ];
      }
    }

    function columnLinked(col: TableColumn): boolean {
      return !!columnLinks.value.find((link) => link.id.includes(tableColumnString(col)));
    }

    // Denotes whether the dialog is in a submittable state
    const valid = computed(() => !!(edgeTable.value && edgeTableSource.value && edgeTableTarget.value));

    return {
      files,
      fileSamples,
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
      columnLinked,
      edgeTable,
      edgeTableSwitchDisabled,
      setEdgeTable,
      valid,
      tableColumnString,
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
