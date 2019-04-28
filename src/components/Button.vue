<template>
  <div>
   <button v-on:click="loadFile">{{buttonAction}}</button>
   </div>
</template>
<script>

export default {
  name:"Button",

  data(){
    return {
      buttonAction: null
    }
  },

  methods: {
  
  }
 
}
</script>

<style scoped>
.button {
  border-style: solid;
  width: 100px;
  height: 20px;
  background-color: green;
  color: white;
  border-color: black;
  border-radius: 5px;
  margin: 5px;
  cursor: pointer;
}
</style>