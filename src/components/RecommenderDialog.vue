<template>
  <v-layout row justify-center>
    <v-btn color="primary" dark @click.native.stop="dialog = true">Open Recommender</v-btn>
    <v-dialog v-model="dialog" max-width="100%" >
      <v-card>
        <iframe style="width:100%; height:600px;" :src="url"></iframe>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
  export default {
    props: {
      url: {
        type: String,
        default: 'http://localhost:4000/mvnv/',
      },
    },
    data() {
      return {
        dialog: false,
      };
    },
  };
</script>
