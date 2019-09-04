<template>
  <v-container fluid class="pa-0">
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

          <v-divider></v-divider>

          <v-list-item
            ripple
            v-for="table in tables"
            :key="table"
            :to="`/workspaces/${workspace}/table/${table}`"
          >
            <v-list-item-action>
              <v-icon color="primary">table_chart</v-icon>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>{{table}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-list>
    </v-navigation-drawer>
    <v-content class="ma-0">
      <v-app-bar app clipped-right>
        <v-toolbar-title
          class="ws-detail-title"
        >
          <v-icon
            class="ml-4 mr-5"
            color="grey lighten-1"
          >library_books</v-icon>

          <span class="breadcrumbs">
            <router-link
              :to="{
                name: 'workspaceDetail',
                params: { workspace }
              }"
            >
              {{workspace}}
            </router-link>
            <v-icon class="mx-4" color="grey lighten-2">chevron_right</v-icon>
            <v-icon class="mr-3" color="grey lighten-1">table_chart</v-icon>
            {{`${this.table}`}}
          </span>

        </v-toolbar-title>

        <v-spacer />

        <v-btn icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
      </v-app-bar>
      <div class="wrapper">
        <v-simple-table
          fixed-header
          height="calc(100vh - 64px)"
        >
          <thead>
            <tr>
              <th v-for="head in this.headers" :key="head" class="head">
                {{head}}
              </th>
            </tr>
          </thead>
          <tbody class="row-wrap">
            <tr v-for="(row, index) in rowKeys" :key="row.value" :class="rowClassName(index)">
              <td v-for="col in row" :key="col.key">
                {{col.value}}
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </v-content>
  </v-container>
</template>
<script>
import api from '@/api'

export default {
  name: 'TableDetail',
  props: ['workspace', 'table'],
  data () {
    return {
      rowKeys:[],
      headers:[],
      tables: [],
      editing: false,
    }
  },
  methods: {
    rowClassName(index) {
      return index % 2 == 0 ? 'even-row' : 'odd-row';
    },
    async update () {
      let response = await api().get(`/workspaces/${this.workspace}/tables/${this.table}?headers=true&rows=true`);
      const result = response.data;

      let rowKeys = [];
      let headers = [];
      if (result) {
        result.forEach(row => {
          let rowData = [];
          Object.keys(row).filter(k => k != '_rev').forEach(key => {
            rowData.push({
              key,
              value: row[key],
            });
          });
          rowKeys.push(rowData);
        });

        headers = Object.keys(result[0]).filter(d => d != '_rev');
      }

      this.rowKeys = rowKeys;
      this.headers = headers;

      // Roni to convert these lines to computed function
      response = await api().get(`workspaces/${this.workspace}/tables?type=all`);
      this.tables = response.data;
    }
  },
  watch: {
    workspace () {
      this.update()
    },
    table () {
      this.update()
    }
  },
  created () {
    this.update()
  }
}
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
th.head{
  text-transform: uppercase;
  background-color: #1976d2 !important;
  color:#fff !important;
  height: 59px;
}
tr.even-row {
  background-color: #F3F6F6;
  padding: 10px 10px;
}
tr.odd-row {
  margin:3px;
  padding: 10px 10px;
}
td.col{
  margin:5px;
  padding:5px 25px;
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
</style>
