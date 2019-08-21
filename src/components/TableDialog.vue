<template>
  <v-dialog
    v-model="tableDialog"
    width="700"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        block
        color="blue darken-2"
        dark
        depressed
        large
        v-on="on"
      >
        New Table
        <v-spacer />
        <v-icon
          right
          size="20px"
        >add_circle</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card>
        <v-card-title
          class="headline pb-0 pt-3"
          primary-title
        >
          Create Table
        </v-card-title>

        <v-card-text class="px-4 pt-4 pb-1">
          <v-layout wrap>
            <v-flex>
              <v-text-field
                filled
                v-model="newTable"
                label="Table name"
                :error-messages="tableCreationError"
              />
            </v-flex>
          </v-layout>
          <v-layout wrap>
            <v-flex
              class="pr-2"
              xs6
            >
              <v-file-input
                clearable
                filled
                label="Upload file"
                prepend-icon=""
                prepend-inner-icon="attach_file"
                single-line
                @change="handleFileInput"
              />
            </v-flex>
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
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn :disabled="tableCreateDisabled" @click="createTable">
            Create Table
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/api';

export default {
  name: 'TableDialog',

  props: {
    types: {
      type: Object,
      default: function(){
        return {}
      }
    },

    workspace: String,
  },

  data () {
    return {
      tableCreationError: null,
      tableDialog: false,
      selectedType: null,
      file: null,
      newTable: '',
    };
  },

  computed: {
    typeList () {
      return Object.keys(this.types);
    },

    tableCreateDisabled () {
      return !this.file || !this.selectedType || !this.newTable;
    },
  },

  methods: {
    handleFileInput (file) {
      this.selectedType = this.fileType(file);
      this.file = file;
    },

    async createTable(){
      let queryType = this.types[this.selectedType].queryCall;
      try {
        await api().post(`${queryType}/${this.workspace}/${this.newTable}`,
        this.file,
        {
          headers: {
            'Content-Type': 'text/plain'
          },
        }
        );
        this.tableCreationError = null;
        this.$emit('success');
        this.tableDialog = false;
      } catch(err) {
        this.tableCreationError = err.response.data.message;
      }
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
}
</script>
