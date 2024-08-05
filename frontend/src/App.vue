<template>
  <div class="app">
    <WordCloud></WordCloud>
    <!-- <Timeline start_time=start_time end_time=end_time></Timeline> -->
    <CameraRoll start_time end_time></CameraRoll>
    <Scrubber></Scrubber>
  </div>
</template>

<script setup lang="ts">
import WordCloud from './components/WordCloud.vue';
import CameraRoll from './components/CameraRoll.vue';
import Scrubber from './components/Scrubber.vue';
import { onMounted, ref } from 'vue';

const end_time = Date.now() / 1000;
const start_time = end_time - 60 * 60 * 24;

</script>

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
}

</style>