<template>
  <v-layout>
    <v-flex
      class="pr-2"
      xs6
    >
      <input type="file" id="file" ref="file" placeholder="Upload File" v-on:change="handleFileInput"/>
    </v-flex>
    <v-spacer />
    <v-flex
      class="pl-2"
      xs6
    >
      <v-select
        filled
        label="File type"
        v-if="typeList.length"
        v-model="selectedType"
        :items="typeList"
      />
    </v-flex>
  </v-layout>
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
      if (!file) {
        return null
      }

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
    }
  }
}
</script>

<style scoped>

</style>
