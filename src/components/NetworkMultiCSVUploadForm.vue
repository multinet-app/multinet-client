<template>
  <v-card>
    <v-sheet width="10vw">
      <v-file-input
        v-model="files"
        multiple
        label="CSV Files"
        accept="text/csv"
      />
    </v-sheet>

    <!-- Data tables -->
    <template v-if="fileSamples.length">
      <v-data-table
        v-for="sample in fileSamples"
        :key="sample.name"
        style="width: 40%"
        hide-default-footer
        :headers="sample.headers"
        :items="sample.rows"
      />
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

export default defineComponent({
  setup() {
    const files = ref<File[]>([]);
    const fileSamples = ref<CSVPreview[]>([]);
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

    return {
      files,
      fileSamples,
    };
  },
});
</script>
