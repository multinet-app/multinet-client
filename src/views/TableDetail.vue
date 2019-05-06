<template>
<div>
<h1>Table: {{`${this.workspace}/${this.table}`}}</h1>
  <table>
  <thead>
    <tr >
    <th v-for="col in rowKeys[0]" :key="col.key" class="head">
      {{col.key}}
    </th>
    </tr>
  </thead>
  <tbody v-for="row in rowKeys" :key="row[0].value" class="row-wrap">
    <tr class="row">
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
      rowKeys:[]
    }
  },
  methods: {
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
}
tr.row {
  background-color: #F3F6F6;
  margin:3px;
  padding: 10px 10px;
}
td.col{
margin:5px;
padding:5px 25px;
}
</style>
