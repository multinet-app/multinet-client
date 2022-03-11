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
            <span>{{ sample.name }}</span>
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
                        <v-list class="my-0 py-0">
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
import { defineComponent, ref, watchEffect } from '@vue/composition-api';
import Papa from 'papaparse';
import { DataTableHeader } from 'vuetify';

type CSVRow = {[key: string]: string};
interface CSVPreview {
  name: string;
  headers: DataTableHeader[];
  rows: CSVRow[];
}

interface TableColumn{
  table: string;
  column: string;
}

// Here, source is the edge table, and target is the associated node table
interface ColumnLink {
  id: string;
  source: TableColumn;
  target: TableColumn;
}

export default defineComponent({
  setup() {
    const menuOpen = ref(false);
    const files = ref<File[]>([]);
    const fileSamples = ref<CSVPreview[]>([]);

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

    function tableColumnString(col: TableColumn) {
      return `${col.table}:${col.column}`;
    }

    function createLinkString(source: TableColumn, target: TableColumn): string {
      return `${source.table}:${source.column}->${target.table}:${target.column}`;
    }

    // Link two columns
    const columnLinks = ref<ColumnLink[]>([]);
    function linkColumns(table: string, column: string, target: TableColumn) {
      const source: TableColumn = { table, column };
      const link: ColumnLink = { id: createLinkString(source, target), source, target };
      if (columnLinks.value.find((l) => l.id === link.id)) {
        return;
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

      columnLinks.value = [...columnLinks.value.slice(0, index), ...columnLinks.value.slice(index + 1)];
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

    function columnLinked(col: TableColumn): boolean {
      return !!columnLinks.value.find((link) => link.id.includes(tableColumnString(col)));
    }

    return {
      files,
      fileSamples,
      getOtherTableColumns,
      columnLinks,
      linkColumns,
      showColumnRemove,
      removeColumnLink,
      columnDisabled,
      columnLinked,

      menuOpen,
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
