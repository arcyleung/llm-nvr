<template>
  <div class="app">
    <WordCloud events total_tfidf_scores=event.total_tfidf_scores top_n=event.top_n></WordCloud>
    <!-- <Timeline start_time=start_time end_time=end_time></Timeline> -->
    <Scrubber></Scrubber>
    <CameraRoll start_time end_time></CameraRoll>
  </div>
</template>

<script setup lang="ts">
import WordCloud from './components/WordCloud.vue';
import CameraRoll from './components/CameraRoll.vue';
import Scrubber from './components/Scrubber.vue';
import { onMounted, ref, watch } from 'vue';

const end_time = ref(0);
const start_time = ref(0);

end_time.value = Date.now() / 1000;
start_time.value = end_time.value - 60 * 60 * 24;

const events = ref([]);
const filtered_events = ref([]);

onMounted(async () => {
    await fetchEvents();
    return
});

watch([start_time, end_time], async () => {
    await fetchEvents();
    console.log("start_time or end_time changed");
    return
});

const fetchEvents = async () => {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin', 'http://localhost:3000');

    console.log(start_time.value, end_time.value)

    try {
        const response = await fetch(`http://localhost:3000/events?start_time=${start_time.value}&end_time=${end_time.value}`, {
            mode: 'cors',
            method: 'GET',
            headers: headers
        });
        const data = await response.json();
        console.log(data);
        events.value = data.events;

        // Reset the initial filtered_events
        filtered_events.value = Object.keys(data.events);
        return data;
    }
    catch (err) {
        console.log(err)
    }
}

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