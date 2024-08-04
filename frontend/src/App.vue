<script setup lang="ts">

import WordCloud from './components/WordCloud.vue';
import CameraRoll from './components/CameraRoll.vue';
</script>

<template>
  <div class="app">
    <WordCloud></WordCloud>
    <CameraRoll></CameraRoll>
  </div>
</template>

<style scoped>

#app {
  justify-content: center;
  align-items: center;
}
.app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* margin:auto;
  width: auto;
  height: 100%; */
}

</style>