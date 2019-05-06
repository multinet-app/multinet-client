<template>
<div>
<h1>Table: {{`${this.workspace}/${this.table}`}}</h1>
  <table>
    <thead>
      <tr >
      <th v-for="head in this.headers" :key="head" class="head">
        {{head}}
      </th>
      </tr>
    </thead>
    <tbody v-for="(row, index) in rowKeys" :key="row[0].value" class="row-wrap">
      <tr :class="rowClassName(index)">
        <td v-for="col in row" :key="col.key" class="col">
          {{col.value}}
        </td>
      </tr>
    </tbody>
  </table>
  </div>
</template>
<script>
import api from '@/api'

export default {
  name: 'TableDetail',
  props: ['workspace', 'table'],
  data () {
    return {
      rowKeys:[],
      headers:[]
    }
  },
  methods: {
    rowClassName(index) {
      return index % 2 == 0 ? 'even-row' : 'odd-row';
    },
    async update () {
      const response = await api().post('multinet/graphql', {query: `query {
        tables (workspace: "${this.workspace}", name: "${this.table}") {
          name,
          rows{
            total,
            rows(offset: 0, limit: 30){
              key,
              columns{
                key,
                value
              }
            }
          },
        }
      }`});
      let table = response.data.data.tables[0];
      this.rowKeys = table.rows.rows.map(r=> r.columns.filter(c=> c.key != "_rev"))
      this.headers = this.rowKeys[0].map(k=> k.key.startsWith("_") ? k.key.slice(1) : k.key);
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
table{
  margin:auto;
}
th.head{
text-transform: uppercase;
 background-color: #55B8CD;
 color:#fff;
 padding: 15px 25px;
 letter-spacing:1.5px;
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
</style>
