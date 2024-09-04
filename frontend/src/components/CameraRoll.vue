<template>
    <div class="scrubbing-timeline">

    </div>
    <div class="image-grid">
        <div class="image-item" v-for="(event_data, event_id, idx) in events" :key="event_id">
            <img :src="`data:image/png;base64,${event_data.thumbnail}`" alt="event.name">
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, defineProps } from 'vue';
import { useEventStore } from '../stores/event_store';

onMounted(async ()=> {
    const store = useEventStore();
    await store.fetchEvents();

    const events = computed(() => store.events);

    watch(events, (newEvents) => {
        // This will re-render the image grid when events change
    });
})
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