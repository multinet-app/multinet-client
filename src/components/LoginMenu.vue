<template>
  <v-menu
    v-model="menu"
    offset-x
  >
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        v-on="on"
      >
        <v-avatar
          color="grey lighten-4"
          size="36px"
        >
          <span v-if="userInfo">{{ userInitials }}</span>
          <v-icon
            v-else
            color="grey"
          >
            account_circle
          </v-icon>
        </v-avatar>
      </v-btn>
    </template>

    <v-card>
      <v-list>
        <v-list-item class="sign-in-item">
          <v-list-item-action>
            <v-btn
              v-if="userInfo"
              dark
              color="grey darken-3"
              @click="logout"
            >
              Log out
            </v-btn>

            <v-btn
              v-else
              class="google-sign-in"
              dark
              :ripple="false"
              :href="loginLink"
            >
              <span class="google-logo">
                <img
                  alt="Google"
                  src="../assets/google_badge.svg"
                >
              </span>
              <span class="button-text">
                Sign in with Google
              </span>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { UserSpec } from 'multinet';
import { host } from '@/environment';
import store from '@/store';
import api from '@/api';
import { saveLoginToken } from '@/utils/localStorage';

const loginTokenRegex = /^#loginToken=(\S+)$/;
export default {
  data: () => ({
    menu: false,
    location: '',
  }),

  computed: {
    userInfo: (): UserSpec | null => store.state.userInfo,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loginLink(this: any): string {
      const {
        location,
      } = this;
      const encodedLocation = encodeURIComponent(location);
      return `${host}/api/user/oauth/google/login?return_url=${encodedLocation}`;
    },

    userInitials(): string {
      // Required due to poor Vue TS support. See
      // https://github.com/multinet-app/multinet-client/pull/80#discussion_r422401040
      const userInfo = this.userInfo as unknown as UserSpec | null;

      if (userInfo !== null) {
        return `${userInfo.given_name[0]}${userInfo.family_name[0]}`;
      }
      return '';
    },
  },

  watch: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu(this: any, menu: boolean) {
      if (menu) {
        this.location = window.location.href;
      }
    },
  },

  created() {
    store.dispatch.fetchUserInfo();
    this.checkUrlForLogin();
  },

  methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async logout(this: any) {
      // Perform the logout action, then redirect the user to the home page.
      // This is to prevent the logged-out user from continuing to look at, e.g.,
      // workspaces or tables they may have been viewing at the time of logout.
      await store.dispatch.logout();

      // Avoid illegal duplicate navigation if we are already on the Home view.
      if (this.$router.currentRoute.name !== 'home') {
        this.$router.push({ name: 'home' });
      }
    },
    /**
     * When login is completed, the server will redirect the browser back here,
     * with an appended url fragment of `loginToken=<token>`. This function checks
     * for this fragment, and if it exists, it pops that token from the URL, saves
     * it in localStorage, and re-fetches app info, using this new token.
     */
    checkUrlForLogin() {
      if (this.$route.hash) {
        const result = this.$route.hash.match(loginTokenRegex);

        if (result && result.length >= 2) {
          const loginToken = result[1];
          api.client.setAuthToken(loginToken);

          const currentRouteName = this.$route.name;
          const name = currentRouteName || 'home';

          this.$router.replace({ name });
          saveLoginToken(loginToken);
          store.dispatch.fetchUserInfo();
          store.dispatch.fetchWorkspaces();
        }
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap');

.v-btn.google-sign-in {
  background: #4285F4 !important;
  border: 2px solid transparent;
  border-radius: 2px;
  height: auto;
  padding: 1px;
}
.v-btn.google-sign-in:active {
  background: #3367D6 !important;
}
.v-btn.google-sign-in:focus {
  border: 2px solid rgba(66, 133, 244, .3) !important;
}
.v-btn.google-sign-in:before {
  display: none;
}
.v-btn.google-sign-in .google-logo {
  height: 38px;
  width: 38px;
}
.v-btn.google-sign-in .google-logo img {
  height: auto;
  margin-left: -1px;
  width: 100%;
}
.v-btn.google-sign-in .button-text {
  padding: 0 16px 0 18px;
}
.v-list-item.sign-in-item {
  padding: 0 12px;
}
</style>

<style>
.v-btn.google-sign-in .v-btn__content {
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  height: 38px;
  padding: 0;
  text-transform: none;
}
.v-list-item.sign-in-item .v-list-item__action {
  margin: 0 !important;
}
</style>
