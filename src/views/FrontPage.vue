<template>
  <v-container
    fill-height
    fluid
  >
    <v-content>
      <div class="getting-started">
        <v-icon
          class="gs-icon"
          color="grey lighten-2"
        >
          outlined_flag
        </v-icon>
        <div class="gs-content">
          <h1 class="gs-title">Getting Started...</h1>
          <p class="gs-text">Use the sidebar to the left to create a workspace or select an existing one.</p>
        </div>
      </div>
    </v-content>
  </v-container>
</template>

<style>
.getting-started {
  align-items: flex-start;
  display: flex;
  justify-content: center;
  margin: 0 auto 100px;
  max-width: 600px;
}

.v-icon.gs-icon {
  font-size: 86px;
  margin-right: 15px;
}

.gs-title {
  color: #d2d2d2;
  font-size: 36px;
}

.gs-text {
  font-size: 20px;
}
</style>
