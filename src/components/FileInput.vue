<template>
  <div>
    <input type="file" id="file" ref="file" placeholder="Upload File" v-on:change="handleFileInput"/>
    <select v-if="typeList.length" v-model="selectedType">
      <option :value="null"></option>
      <option v-for="type in typeList" :key ="type" :value="type">{{type}}</option>
    </select>
   </div>
</template>
<script>

export default {
  name:"FileInput",
  props: {
    types: {
      type: Object,
      default: function(){
        return {}
      }
    }
  },
  data(){
    return {
      selectedType:null
    }
  },
  computed:{
    typeList(){
      return Object.keys(this.types)
    }
  },
  methods: {
    handleFileInput(){
      this.selectedType = this.fileType(this.$refs.file.files[0])
      this.$emit("handle-file-input", [this.$refs.file.files, this.selectedType])
    },
    fileType(file){
      let fileName = file.name.split('.')
      let extension = fileName[fileName.length - 1]
      for(let type in this.types){
        if(this.types[type].extension.includes(extension)){
          return type
        }
      }
      return null
    }
  },
  watch: {
    selectedType(){
       this.$emit("handle-file-input", [this.$refs.file.files, this.selectedType])
       //this.$emit("handleFileInput", this.$refs.file.files)
    }
  }
}
</script>

<style scoped>
h1{ color:brown }
</style>