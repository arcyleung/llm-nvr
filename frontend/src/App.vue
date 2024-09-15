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

import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useEventStore } from './stores/event_store';
const store = useEventStore();
const { start_time, end_time } = storeToRefs(store)



// To set the time range:
// store.setTimeRange(newStartTime, newEndTime)

onMounted(async () => {
    // store.setTimeRange(start_time.value)
    await store.fetchEvents();
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