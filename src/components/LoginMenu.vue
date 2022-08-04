<template>
  <v-menu
    v-model="menu"
    offset-x
  >
    <template #activator="{ on }">
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
              @click="login"
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
import oauthClient from '@/oauth';
import store from '@/store';
import {
  computed, defineComponent, getCurrentInstance, ref, watch,
} from 'vue';

export default defineComponent({
  setup() {
    const menu = ref(false);
    const location = ref('');

    store.dispatch.fetchUserInfo();
    const userInfo = computed(() => store.state.userInfo);
    const userInitials = computed(() => (userInfo.value !== null ? `${userInfo.value.first_name[0] || ''}${userInfo.value.last_name[0] || ''}` : ''));

    watch(menu, () => {
      if (menu.value) {
        location.value = window.location.href;
      }
    });

    function login() {
      oauthClient.redirectToLogin();
    }

    const currentInstance = getCurrentInstance();
    const router = currentInstance !== null ? currentInstance.proxy.$router : null;
    async function logout() {
      // Perform the logout action, then redirect the user to the home page.
      // This is to prevent the logged-out user from continuing to look at, e.g.,
      // workspaces or tables they may have been viewing at the time of logout.
      await store.dispatch.logout();

      // Avoid illegal duplicate navigation if we are already on the Home view.
      if (router !== null && router.currentRoute.name !== 'home') {
        router.push({ name: 'home' });
      }
    }

    return {
      menu,
      location,
      userInfo,
      userInitials,
      login,
      logout,
    };
  },
});
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
