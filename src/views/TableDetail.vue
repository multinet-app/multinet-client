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
          <v-subheader>
            Table Visualizations
          </v-subheader>
          <v-divider />
          <v-list-item
            v-for="app in apps.table_visualizations"
            :key="app.name"
            class="pl-2"
            :href="`${app.url}/?workspace=${workspace}&table=${table}`"
            target="_blank"
          >
            <v-list-item-avatar class="mr-3">
              <v-icon color="blue lighten-3">
                exit_to_app
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-title>
              {{ app.name }}
            </v-list-item-title>
            <v-list-item-icon>
              <v-icon color="blue lighten-3">
                chevron_right
              </v-icon>
            </v-list-item-icon>
          </v-list-item>

          <v-subheader class="pr-2">
            All Tables
          </v-subheader>

          <v-divider />

          <div v-if="loadingTables">
            <v-skeleton-loader type="list-item" />
            <v-skeleton-loader type="list-item" />
            <v-skeleton-loader type="list-item" />
          </div>

          <v-list-item
            v-for="t in tables"
            :key="t.name"
            ripple
            :to="`/workspaces/${workspace}/table/${t.name}`"
          >
            <v-list-item-action>
              <v-icon color="primary">
                table_chart
              </v-icon>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>{{ t.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-list>
    </v-navigation-drawer>
    <v-main>
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

        <workspace-option-menu :workspace="workspace" />
      </v-app-bar>
      <div class="wrapper">
        <v-data-table
          fixed-header
          height="calc(100vh - 123px - 63px)"
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
          <template #header>
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
import {
  computed,
  defineComponent, PropType, Ref, ref, watch,
} from 'vue';
import { DataPagination } from 'vuetify';

import api from '@/api';
import { App, KeyValue, TableRow } from '@/types';
import store from '@/store';
import WorkspaceOptionMenu from '@/components/WorkspaceOptionMenu.vue';

export default defineComponent({
  name: 'TableDetail',

  components: {
    WorkspaceOptionMenu,
  },

  props: {
    workspace: {
      type: String as PropType<string>,
      required: true,
    },

    table: {
      type: String as PropType<string>,
      required: true,
    },

    apps: {
      type: Object as PropType<{ network_visualizations: App[]; table_visualizations: App[] }>,
      required: true,
    },
  },
  setup(props) {
    const rowKeys: Ref<KeyValue[][]> = ref([]);
    const headers: Ref<Array<keyof TableRow>> = ref([]);
    const editing = ref(false);
    const tableSize = ref(1);
    const pagination: Ref<DataPagination> = ref({} as DataPagination);
    const loading = ref(true);
    const loadingTables = ref(true);
    const columnTypes = ref({});

    api.columnTypes(props.workspace, props.table).then((data) => { columnTypes.value = data; });

    const tables = computed(() => store.getters.tables);
    const dataTableHeaders = computed(() => headers.value.map((header) => ({
      text: header,
      value: header,
    })));
    const dataTableRows = computed(() => {
      const result = [] as TableRow[];

      rowKeys.value.forEach((rowKey) => {
        const obj = {} as TableRow;
        rowKey.forEach((entry) => {
          obj[entry.key] = entry.value;
        });

        result.push(obj);
      });

      return result;
    });

    async function update() {
      loading.value = true;

      const result = await api.table(props.workspace, props.table, {
        offset: (pagination.value.page - 1) * pagination.value.itemsPerPage,
        limit: pagination.value.itemsPerPage,
      });

      const {
        results: rows,
        count,
      } = result;

      tableSize.value = count;

      const newRowKeys: KeyValue[][] = [];
      let newHeaders: Array<keyof TableRow> = [];
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

          newRowKeys.push(rowData);
        });

        newHeaders = rows.length > 0 ? Object.keys(rows[0]).filter((d) => d !== '_rev') : [];
      }

      rowKeys.value = newRowKeys;
      headers.value = newHeaders;

      loading.value = false;
    }

    watch([() => props.workspace, () => props.table, pagination], () => update());
    watch(tables, () => { loadingTables.value = false; });

    store.dispatch.fetchWorkspace(props.workspace);

    return {
      rowKeys,
      headers,
      editing,
      tableSize,
      pagination,
      loading,
      loadingTables,
      dataTableHeaders,
      dataTableRows,
      columnTypes,
      tables,
    };
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
