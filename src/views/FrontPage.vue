<template>
  <v-container class="pa-0" fluid>
    <v-content>
      <!-- BANNER -->
      <v-responsive
        class="mb-5 pt-5"
      >
        <v-container class="d-flex align-center">
          <v-sheet
            class="d-flex pa-5"
            color="primary"
            dark
            flat
            height="100%"
          >
            <v-card
              class="pr-5"
              color="transparent"
              flat
              width="66%"
            >
              <v-card-title>Welcome to Multinet!</v-card-title>
              <v-divider />
              <v-card-text>
                <p>Check out the featured datasets and visualizations below! You
                can also create your own workspace and upload your own data with
                the <strong>New Workspace</strong> button to the left, or
                explore data others have uploaded.</p>
                <p>This project is a joint research and development effort between
                the University of Utah and Kitware Inc., funded by the National
                Science Foundation.</p>
              </v-card-text>
            </v-card>
            <v-card
              class="d-flex align-center"
              light
              width="33%"
            >
              <v-card-text>
                <v-row class="px-4">
                  <v-col
                    class="align-center d-flex py-1"
                    cols="4"
                    :key="collab.logo"
                    v-for="collab in collabs"
                  >
                    <img :src="collab.logo" alt="" width="100%" height="auto">
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-container>
      </v-responsive>

      <!-- COLUMNS -->
      <v-container>
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
                        <v-btn
                          color="primary"
                          :href="sample.href"
                          target="_blank"
                          >
                          Open in New Window
                        </v-btn>
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
          title: 'Paul Revere - Node Link Diagram',
          image: require('../assets/boston.jpg'),
          text: 'Explore the Paul Revere dataset using an interactive and beautiful node-link diagram. Discover the figures coordinating a pivotal event in history!',
          href: '/nodelink/?workspace=boston&graph=boston',
        },
        {
          title: 'Les Miserables - Adjacency Matrix',
          image: require('../assets/miserables.jpg'),
          text: 'Explore the Les Miserables dataset using an interactive adjacency matrix. See the factions and relationships for yourself!',
          href: '/adjmatrix/?workspace=miserables&graph=miserables',
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
