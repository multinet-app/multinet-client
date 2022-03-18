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
          v-for="sample in fileSamples"
          :key="sample.name"
          outlined
          raised
          class="ma-4"
          max-width="90%"
        >
          <v-sheet class="table-title px-2">
            <v-row no-gutters>
              <span>{{ sample.name }}</span>
              <v-spacer />
              <v-switch
                label="Edge Table"
                dark
                hide-details
                class="ma-0 pa-0"
                :disabled="edgeTableSwitchDisabled(sample.name)"
                :value="edgeTable === sample.name"
                @change="setEdgeTable(sample.name, $event)"
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
            <template v-slot:header="{ props: { headers } }">
              <thead dark>
                <tr>
                  <th
                    v-for="header in headers"
                    :key="header.value"
                    class="pt-2 pb-4"
                  >
                    <span :class="columnLinked({table: sample.name, column: header.value}) ? 'amber--text' : ''">
                      {{ header.text }}
                    </span>
                    <v-menu
                      :close-on-content-click="false"
                      @input="menuOpen = $event"
                    >
                      <template v-slot:activator="{ on }">
                        <v-icon
                          :color="columnLinked({table: sample.name, column: header.value}) ? 'amber' : ''"
                          v-on="on"
                        >
                          link
                        </v-icon>
                      </template>
                      <v-card max-height="30vh">
                        <!-- Edge Table -->
                        <template v-if="edgeTable === sample.name">
                          <v-card-subtitle class="py-1 px-2">
                            Select Source/Target
                          </v-card-subtitle>

                          <template v-if="!(selectingSource || selectingTarget)">
                            <v-list
                              class="my-0 py-0"
                              dense
                            >
                              <v-list-item
                                :disabled="sourceTargetItemDisabled('source', header.value)"
                                :input-value="sourceTargetItemActive('source', header.value)"
                                @click="selectingSource = true"
                              >
                                Source
                              </v-list-item>
                              <v-list-item
                                :disabled="sourceTargetItemDisabled('target', header.value)"
                                :input-value="sourceTargetItemActive('target', header.value)"
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
                                v-for="col in getOtherTableColumns(sample.name)"
                                :key="`${sample.name}-${col.table}-${col.column}`"
                                :disabled="columnDisabled({table: sample.name, column: header.value}, col)"
                                @click="linkColumns(sample.name, header.value, col)"
                              >
                                {{ `${col.table}:${col.column}` }}
                                <v-spacer />
                                <v-btn
                                  v-if="showColumnRemove({table: sample.name, column: header.value}, col)"
                                  icon
                                  right
                                  @click.stop="removeColumnLink({table: sample.name, column: header.value}, col)"
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
                              v-for="col in getOtherTableColumns(sample.name)"
                              :key="`${sample.name}-${col.table}-${col.column}`"
                              :disabled="columnDisabled({table: sample.name, column: header.value}, col)"
                              @click="linkColumns(sample.name, header.value, col)"
                            >
                              {{ `${col.table}:${col.column}` }}
                              <v-spacer />
                              <v-btn
                                v-if="showColumnRemove({table: sample.name, column: header.value}, col)"
                                icon
                                right
                                @click.stop="removeColumnLink({table: sample.name, column: header.value}, col)"
                              >
                                <v-icon>close</v-icon>
                              </v-btn>
                            </v-list-item>
                          </v-list>
                        </template>
                      </v-card>
                    </v-menu>

                    <!-- Include/Exclude Column -->
                    <v-icon
                      dark
                      @click="includeExcludeTableColumn({table: sample.name, column: header.value}, true)"
                    >
                      check
                    </v-icon>
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
interface CSVPreview {
  name: string;
  headers: DataTableHeader[];
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
              resolve({
                name: file.name,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                headers: result.meta.fields!.map((field) => ({ text: field, value: field })),
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
      const otherSamples = fileSamples.value.filter((sample) => sample.name !== tableName);
      const headers: TableColumn[] = [];

      // Add headers from each table to headers
      otherSamples.forEach((sample) => {
        // const values = sample.headers.map((header) => `${sample.name}:${header.value}`);
        const values = sample.headers.map((header) => ({ table: sample.name, column: header.value }));
        headers.push(...values);
      });

      return headers;
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
    function linkColumns(table: string, column: string, target: TableColumn) {
      const source: TableColumn = { table, column };
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

    // Exclude a table column
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function includeExcludeTableColumn(tableCol: TableColumn, included: boolean) {
      // TODO: Implement
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
      includeExcludeTableColumn,
      columnLinked,
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
