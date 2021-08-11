<template>
  <v-container
    fluid
    class="pa-0"
  >
    <v-navigation-drawer
      app
      clipped
      fixed
      right
      permanent
    >
      <v-list>
        <v-list subheader>
          <v-subheader class="pr-2">
            All Tables
          </v-subheader>

          <v-divider />

          <div v-if="loading">
            <v-skeleton-loader type="list-item" />
            <v-skeleton-loader type="list-item" />
            <v-skeleton-loader type="list-item" />
          </div>

          <v-list-item
            v-for="t in tables"
            :key="t"
            ripple
            :to="`/workspaces/${workspace}/table/${t}`"
          >
            <v-list-item-action>
              <v-icon color="primary">
                table_chart
              </v-icon>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>{{ t }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-list>
    </v-navigation-drawer>
    <v-main class="ma-0">
      <v-app-bar
        app
        clipped-right
      >
        <v-toolbar-title
          class="ws-detail-title"
        >
          <v-icon
            class="ml-4 mr-5"
            color="grey lighten-1"
          >
            library_books
          </v-icon>

          <span class="breadcrumbs">
            <router-link
              :to="{
                name: 'workspaceDetail',
                params: { workspace }
              }"
            >
              {{ workspace }}
            </router-link>
            <v-icon
              class="mx-4"
              color="grey lighten-2"
            >chevron_right</v-icon>
            <v-icon
              class="mr-3"
              color="grey lighten-1"
            >table_chart</v-icon>
            {{ table }}
          </span>
        </v-toolbar-title>

        <v-spacer />

        <v-btn icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
      </v-app-bar>
      <div class="wrapper">
        <v-data-table
          fixed-header
          height="calc(100vh - 123px)"
          class="table-details"
          :headers="dataTableHeaders"
          hide-default-header
          :items="dataTableRows"
          :footer-props="{
            itemsPerPageOptions: [10, 20, 50, 100],
            showFirstLastPage: true,
          }"
          :server-items-length="tableSize"
          :options.sync="pagination"
          :loading="loading"
        >
          <template v-slot:header>
            <thead dark>
              <tr>
                <th
                  v-for="(header, i) in dataTableHeaders"
                  :key="i"
                  class="pt-2 pb-2"
                >
                  {{ header.text }}
                  <span v-if="columnTypes[header.text]">
                    ({{ columnTypes[header.text] }})
                  </span>
                </th>
              </tr>
            </thead>
          </template>
        </v-data-table>
      </div>
    </v-main>
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import api from '@/api';
import { KeyValue, TableRow } from '@/types';

interface DataPagination {
  page: number;
  itemsPerPage: number;
  pageStart: number;
  pageStop: number;
  pageCount: number;
  itemsLength: number;
}

export default Vue.extend({
  name: 'TableDetail',
  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },

    table: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    return {
      rowKeys: [] as KeyValue[][],
      headers: [] as Array<keyof TableRow>,
      tables: [] as string[],
      editing: false,
      tableSize: 1,
      pagination: {} as DataPagination,
      loading: true,
    };
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataTableHeaders(this: any) {
      const {
        headers,
      } = this;

      return headers.map((header: Array<keyof TableRow>) => ({
        text: header,
        value: header,
      }));
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataTableRows(this: any) {
      const result = [] as TableRow[];

      this.rowKeys.forEach((rowKey: KeyValue[]) => {
        const obj = {} as TableRow;
        rowKey.forEach((entry: KeyValue) => {
          obj[entry.key] = entry.value;
        });

        result.push(obj);
      });

      return result;
    },
  },

  asyncComputed: {
    columnTypes: {
      async get() {
        try {
          return await api.tableColumnTypes(this.workspace, this.table);
        } catch (err) {
          return {};
        }
      },

      default: {},
    },
  },

  watch: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workspace(this: any) {
      this.update();
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table(this: any) {
      this.update();
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pagination(this: any) {
      this.update();
    },
  },

  methods: {
    rowClassName(index: number): 'even-row' | 'odd-row' {
      return index % 2 === 0 ? 'even-row' : 'odd-row';
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async update(this: any) {
      const {
        pagination,
      } = this;

      this.loading = true;

      const result = await api.table(this.workspace, this.table, {
        offset: (pagination.page - 1) * pagination.itemsPerPage,
        limit: pagination.itemsPerPage,
      });

      const {
        results: rows,
        count,
      } = result;

      this.tableSize = count;

      const rowKeys: KeyValue[][] = [];
      let headers: Array<keyof TableRow> = [];
      if (rows) {
        rows.forEach((row) => {
          const rowData: KeyValue[] = [];
          Object.entries(row)
            .filter(([key]) => key !== '_rev')
            .forEach(([key, value]) => {
              rowData.push({
                key,
                value,
              });
            });

          rowKeys.push(rowData);
        });

        headers = rows.length > 0 ? Object.keys(rows[0]).filter((d) => d !== '_rev') : [];
      }

      this.rowKeys = rowKeys;
      this.headers = headers;

      // Roni to convert these lines to computed function
      this.tables = (await api.tables(this.workspace, {
        type: 'all',
      })).results.map((table) => table.name);

      this.loading = false;
    },
  },
});
</script>

<style scoped>
.nav{
  position: fixed;
  top:0px;
  left:0px;
  right:0px;
  height:60px;
  background-color: #F3F6F6;
}

.return-nav{
  height:100px;
  margin: 5px 10px;
  float:left;
}
.return-nav button{
  background-color: #F3F6F6;
  box-shadow: 0 0 0 0;
}
.fa-home{
  font-size: 20px;
}
table{
  margin:auto;
}
.ws-detail-title {
  align-items: center;
  display: flex;
  letter-spacing: 0;
  width: 95%;
}
.ws-detail-title a {
  text-decoration: none;
}
.ws-detail-title a:hover {
  text-decoration: underline;
}
</style>

<style>
.ws-rename.v-text-field {
  height: 64px; /* match toolbar height */
}

.ws-rename.v-text-field.v-text-field--enclosed .v-input__slot {
  font-size: 20px;
  letter-spacing: 2px !important;
  padding-top: 14px;
}

.table-details table th {
  background-color: #1976d2 !important;
  color:#fff !important;
  height: 59px;
  white-space: nowrap;
}
.table-details table td {
  white-space: nowrap;
}
.table-details table tr:nth-of-type(even) {
  background-color: #F3F6F6;
}
</style>
