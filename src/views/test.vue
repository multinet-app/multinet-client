<template>
    <div id ="test">
        <h1>{{msg}}</h1>
      </div>
</template>

<script>

export default {
  
    name:"test",
    props: {
    msg: String
  },
}
</script>

<style scoped>
h1{ color:brown }
</style>

