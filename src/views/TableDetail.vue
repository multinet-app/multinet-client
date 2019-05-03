<template>
  <div>
    <h1>Table: {{`${this.workspace}/${this.table}`}}</h1>

<!-- 
    <ul>
     <li v-for="field in fields" :key="field">{{field}}</li> 
       <li v-for="row in rowKeys" :key="row[0].value">{{row[0].value}}</li>
    </ul>
-->
  <div v-for="row in rowKeys" :key="row[0].value" class="row">
    {{row[0].value}}
  </div>

  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'TableDetail',
  props: ['workspace', 'table'],
  data () {
    return {
      //fields: []
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
      this.rowKeys = response.data.data.tables[0].rows.rows.map(r=> r.columns)
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
div.row {
  padding: 10px 10px;
  text-align: left;
  background-color: #F3F6F6;
  margin:2px;
  font-weight:bold;
}
</style>
