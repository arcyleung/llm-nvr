<template>
  <div class="app">
    <WordCloud events="events" total_tfidf_scores=events.total_tfidf_scores top_n=events.top_n></WordCloud>
    <!-- <Timeline start_time=start_time end_time=end_time></Timeline> -->
    <Scrubber events="events"></Scrubber>
    <CameraRoll start_time end_time></CameraRoll>
  </div>
</template>

<script setup>
import WordCloud from './components/WordCloud.vue';
import CameraRoll from './components/CameraRoll.vue';
import Scrubber from './components/Scrubber.vue';

import { onMounted, ref, watch } from 'vue';

import { useEventStore } from './stores/event_store';
const store = useEventStore();

const end_time = ref(0);
const start_time = ref(0);

end_time.value = Date.now() / 1000;
start_time.value = end_time.value - 60 * 60 * 24;

onMounted(async () => {
    await store.fetchEvents(start_time.value, end_time.value);
    return
});

watch([start_time, end_time], async () => {
    await store.fetchEvents(start_time.value, end_time.value);
    console.log("start_time or end_time changed");
    return
});

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