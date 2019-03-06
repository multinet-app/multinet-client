<template>
  <table v-if="nodes.length > 0">
    <thead>
      <tr>
        <th></th>
        <th v-for="header in headers" :key="header">
          {{ header }}
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(node, index) in nodes" :key="node._key">
        <td>{{ index }}</td>
        <td v-for="header in headers" :key="header">
          {{ node[header] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    nodes: Array
  },
  computed: {
    headers () {
      if (this.nodes) {
        return Object.keys(this.nodes[0]);
      }

      return [];
    }
  },
}
</script>

<style scoped>
table, th, td {
  border: 1px solid;
  border-collapse: collapse;
};
</style>
