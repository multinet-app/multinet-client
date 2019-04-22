<template>
  <div>
    <h1>Table: {{`${this.workspace}/${this.table}`}}</h1>
    <ul>
      <li v-for="field in fields" :key="field">{{field}}</li>
    </ul>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'TableDetail',
  props: ['workspace', 'table'],
  data () {
    return {
      fields: []
    }
  },
  methods: {
    update () {
      api().post('multinet/graphql', {query: `query {
        tables (workspace: "${this.workspace}", name: "${this.table}") {
          fields
        }
      }`}).then(response => {
        this.fields = response.data.data.tables[0].fields
      })
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
ul {
  padding: 0px;
  list-style-type: none;
  text-align: left;
}
</style>
