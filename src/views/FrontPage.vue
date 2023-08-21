<template>
  <v-container
    class="pa-0"
    fluid
  >
    <v-main>
      <v-card
        color="grey lighten-2"
        flat
        tile
      >
        <v-row class="align-center justify-center">
          <v-col cols="1" />
          <v-col cols="2">
            <img
              src="../assets/logo/app_logo.svg"
              class="mx-auto"
              :style="{ maxHeight: '100px', maxWidth: '100px' }"
              alt="Multinet Logo"
            />
          </v-col>
          <v-col>
            <v-card-text
              class="grey--text text--darken-3 text-center text-h4 pt-10"
            >
              <strong class="black--text">Multinet</strong> is visualization tool for networks with attributes associated with the nodes and links.
            </v-card-text>
          </v-col>
          <v-col cols="3" />
        </v-row>
      </v-card>

      <v-row class="text-center mt-6">
        <v-spacer />
        <v-col class="text-h4 grey--text text--darken-4">
          Getting Started
        </v-col>
        <v-spacer />
      </v-row>
      <v-row class="text-center pb-12">
        <v-spacer />
        <v-col
          cols="3"
          class="text-h6 grey--text text--darken-4"
        >
          <v-btn
            icon
            x-large
            @click="login"
          >
            <v-icon x-large>
              mdi-upload
            </v-icon>
          </v-btn>
          Sign up and upload your own data
        </v-col>
        <v-spacer />
        <v-col
          cols="3"
          class="text-h6 grey--text text--darken-4"
        >
          <v-icon
            x-large
            class="pr-1"
          >
            mdi-gamepad-square
          </v-icon>
          Try a demo below or explore the public workspaces
        </v-col>
        <v-spacer />
        <v-col
          cols="3"
          class="text-h6 grey--text text--darken-4"
        >
          <v-dialog
            v-model="dialog"
            width="500"
          >
            <template #activator="{ on }">
              <v-btn
                class="px-0"
                icon
                x-large
                min-width="40px"
                v-on="on"
              >
                <v-icon x-large>
                  mdi-information
                </v-icon>
              </v-btn>
            </template>

            <about-text @toggle="dialog = false" />
          </v-dialog>
          Learn more about MultiNet
        </v-col>
        <v-spacer />
      </v-row>

      <!-- COLUMNS -->
      <div class="px-6 py-2">
        <v-row class="px-5 pb-6">
          <v-col
            v-for="sample in samples"
            :key="sample.title"
            cols="4"
          >
            <v-hover>
              <template #default="{ hover }">
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
                          rel="noopener noreferrer"
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
      </div>
    </v-main>
  </v-container>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
  computed, defineComponent, ref,
} from 'vue';
import type { App } from '@/types';
import AboutText from '@/components/AboutText.vue';
import oauthClient from '@/oauth';

import bostonLink from '../assets/placard/boston.png';
import bostonMatrix from '../assets/placard/boston2.png';
import miserablesMatrix from '../assets/placard/miserables.png';
import miserablesLink from '../assets/placard/miserables2.png';
import upsetMovies from '../assets/placard/movies.png';
import upsetSimpsons from '../assets/placard/simpsons.png';

export default defineComponent({
  components: { AboutText },
  props: {
    apps: {
      type: Object as PropType<{ network_visualizations: App[]; table_visualizations: App[] }>,
      required: true,
    },
  },

  setup(props) {
    const dialog = ref(false);

    const multiMatrixURL = computed(() => `${props.apps.network_visualizations.filter((d) => d.name === 'MultiMatrix')[0].url}`);
    const multiLinkURL = computed(() => `${props.apps.network_visualizations.filter((d) => d.name === 'MultiLink')[0].url}`);
    const upsetURL = computed(() => `${props.apps.table_visualizations.filter((d) => d.name === 'Upset')[0].url}`);
    const samples = computed(() => [
      {
        title: 'Les Miserables - MultiLink',
        // eslint-disable-next-line global-require
        image: miserablesLink,
        text: 'The characters of Les Miserables, laid out in a colorful and interactive node-link diagram.',
        href: `${multiLinkURL.value}/?workspace=miserables&network=miserables&sessionId=12`,
      },
      {
        title: 'Paul Revere - MultiMatrix',
        // eslint-disable-next-line global-require
        image: bostonMatrix,
        text: 'See the relationships between Paul Revere and his contemporaries through an adjacency matrix layout.',
        href: `${multiMatrixURL.value}/?workspace=boston&network=boston&sessionId=15`,
      },
      {
        title: 'Movies - Upset',
        // eslint-disable-next-line global-require
        image: upsetMovies,
        text: 'Explore the relationships between movies and their genres using an interactive UpSet plot.',
        href: `${upsetURL.value}/?workspace=Upset+Examples&table=movies&sessionId=118`,
      },
      {
        title: 'Les Miserables - MultiMatrix',
        // eslint-disable-next-line global-require
        image: miserablesMatrix,
        text: 'Explore the Les Miserables dataset using an interactive adjacency matrix. See the factions and relationships for yourself!',
        href: `${multiMatrixURL.value}/?workspace=miserables&network=miserables&sessionId=13`,
      },
      {
        title: 'Paul Revere - MultiLink',
        // eslint-disable-next-line global-require
        image: bostonLink,
        text: 'Explore the Paul Revere dataset using an interactive and beautiful node-link diagram. Discover the figures coordinating a pivotal event in history!',
        href: `${multiLinkURL.value}/?workspace=boston&network=boston&sessionId=14`,
      },
      {
        title: 'Simpsons - Upset',
        // eslint-disable-next-line global-require
        image: upsetSimpsons,
        text: 'Explore the relationships between Simpsons characters and their occupations using an interactive UpSet plot.',
        href: `${upsetURL.value}/?workspace=Upset+Examples&table=simpsons&sessionId=119`,
      },
    ]);

    function login(): void {
      oauthClient.redirectToLogin();
    }

    return {
      dialog,
      samples,
      login,
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

.welcome-text p {
  font-size: 18px;
}

.logo {
  filter: grayscale(100%);
}

#lower-half{
  max-width: 1500px;
}
</style>
