<template>
    <div class="scrubbing-timeline">

    </div>
    <div class="image-grid">
        <div class="image-item" v-for="ev in events" :key="ev.id">
            <img :src="`data:image/png;base64,${ev.thumbnail}`" alt="event.name">
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, defineProps } from 'vue';

const props = defineProps(['start_time', 'end_time']);

const events = ref([]);

onMounted(async () => {
    await fetchEvents();
    return
});

watch(props, async () => {
    await fetchEvents();
    console.log("start_time or end_time changed");
    return
});

const fetchEvents = async () => {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin', 'http://localhost:3000');

    const end_time = props.start_time || Date.now() / 1000;
    const start_time = props.end_time || end_time - 60 * 60 * 24;

    console.log(start_time, end_time)

    try {
        const response = await fetch(`http://localhost:3000/events?start_time=${start_time}&end_time=${end_time}`, {
            mode: 'cors',
            method: 'GET',
            headers: headers
        });
        const data = await response.json();
        console.log(data);
        events.value = data.results;
        return data;
    }
    catch (err) {
        console.log(err)
    }
}

</script>

<style scoped>
.image-grid {
    width: 100%;
    display: grid;
    /* justify-content: start; */
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 1px;
}

.image-item img {
    width: 100%;
    height: auto;
    display: block;
}
</style>