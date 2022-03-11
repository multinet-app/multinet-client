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
                    {{ header.text }}
                    <v-menu
                      :close-on-content-click="false"
                      @input="menuOpen = $event"
                    >
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          v-on="on"
                        >
                          link
                        </v-icon>
                      </template>
                      <v-card max-height="30vh">
                        <v-card-actions
                          v-if="sourceMenu || targetMenu"
                          class="my-0 py-0"
                        >
                          <v-btn
                            icon
                            @click="closeBothMenus"
                          >
                            <v-icon>
                              arrow_left
                            </v-icon>
                          </v-btn>
                        </v-card-actions>
                        <v-list class="my-0 py-0">
                          <v-list-item
                            v-for="col in getOtherTableColumns(sample.name)"
                            :key="col.column"
                            @click="linkColumns(sample.name, header.value, col)"
                          >
                            {{ `${col.table}:${col.column}` }}
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
import {
  computed, defineComponent, ref, watchEffect,
} from '@vue/composition-api';
import { chunk } from 'lodash';
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
  source: TableColumn;
  target: TableColumn;
}

export default defineComponent({
  setup() {
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

    // Chunk samples to allow for row rendering
    const chunkedFileSamples = computed(() => chunk(fileSamples.value, 2));

    // Menu state
    const menuOpen = ref(false);
    const sourceMenu = ref(false);
    const targetMenu = ref(false);
    function closeBothMenus() {
      sourceMenu.value = false;
      targetMenu.value = false;
    }

    // Ensure values reset if menu closed
    watchEffect(async () => {
      if (!menuOpen.value) {
        // Delay by a small amount to look natural
        await new Promise((resolve) => setTimeout(resolve, 200));
        closeBothMenus();
      }
    });

    // Link two columns
    const linkedColumns = ref<ColumnLink[]>([]);
    function linkColumns(table: string, column: string, otherColumn: TableColumn) {
      linkedColumns.value.push({ source: { table, column }, target: otherColumn });
    }

    return {
      files,
      fileSamples,
      getOtherTableColumns,
      linkedColumns,
      linkColumns,
      chunkedFileSamples,

      menuOpen,
      sourceMenu,
      targetMenu,
      closeBothMenus,
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
