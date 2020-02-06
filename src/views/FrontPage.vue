<template>
  <v-container class="pa-0" fluid>
    <v-content>
      <!-- BANNER -->
      <v-responsive
        class="primary mb-5 pa-5"
        height="350"
      >
        <v-container
          class="d-flex"
        >
          <v-card
            class="pr-5"
            color="transparent"
            dark
            flat
            height="100%"
            tile
          >
            <v-container>
              <v-card-title>Samples Heading</v-card-title>
              <v-divider />
              <v-card-text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dignissim ante ac felis aliquet, ut elementum nibh efficitur. In semper consequat felis vel tempor. Cras vestibulum mauris odio, sit amet mattis nunc blandit ut. Pellentesque auctor lacinia ante faucibus pharetra.
              </v-card-text>
            </v-container>
          </v-card>
          <v-card width="33%">
            <v-card-title>Collaborators</v-card-title>
            <v-card-text class="mb-3 pb-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dignissim ante ac felis aliquet, ut elementum nibh efficitur.
            </v-card-text>
            <v-divider />
            <v-card-text>
              <v-row class="px-4">
                <v-col
                  class="align-center d-flex py-1"
                  cols="4"
                  v-for="collab in collabs"
                >
                  <img :src="collab.logo" alt="" width="100%" height="auto">
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-container>
      </v-responsive>

      <!-- COLUMNS -->
      <v-container class="pt-5">
        <v-row>
          <v-col
            cols="4"
            v-for="sample in samples"
            :key="sample.title"
          >
            <v-hover>
              <template v-slot:default="{ hover }">
                <v-card>
                  <v-img
                    class="align-end"
                    height="250px"
                    :src="sample.image"
                  >
                    <v-card-title class="box-shadow-title">
                      {{ sample.title }}
                    </v-card-title>
                  </v-img>
                  <v-fade-transition>
                    <v-overlay
                      v-if="hover"
                      absolute
                      opacity=".85"
                    >
                      <div class="overlay-text">
                        <p>{{ sample.text }}</p>
                        <v-btn color="primary">See more info</v-btn>
                      </div>
                    </v-overlay>
                  </v-fade-transition>
                </v-card>
              </template>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>

    </v-content>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend ({
  data() {
    return {
      collabs: [
        {
          logo: require('../assets/Ulogo_100px.png'),
        },
        {
          logo: require('../assets/kw_logo.png'),
        },
        {
          logo: require('../assets/nsf_logo.png'),
        },
      ],
      samples: [
        {
          title: 'Boston',
          image: require('../assets/boston.jpg'),
          text: 'Boston Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dignissim ante ac felis aliquet, ut elementum nibh efficitur. In semper consequat felis vel tempor.',
        },
        {
          title: 'Miserables',
          image: require('../assets/miserables.jpg'),
          text: 'Miserables Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dignissim ante ac felis aliquet, ut elementum nibh efficitur. In semper consequat felis vel tempor.',
        },
      ],
    };
  },
});
</script>

<style>
.box-shadow-title {
  box-shadow: inset 0px -230px 70px -120px white;
  padding-bottom: 8px;
  padding-top: 210px;
}
.overlay-text {
  padding: 48px;
}
</style>
