<template>
    <div class="scrubbing-timeline">

    </div>
    <div class="image-grid">
        <div class="image-item" v-for="(event_data, event_id, idx) in props.events" :key="event_id">
            <img :src="`data:image/png;base64,${event_data.thumbnail}`" alt="event.name">
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, defineProps } from 'vue';

const props = defineProps(['events']);

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