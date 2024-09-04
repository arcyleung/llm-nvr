<template>

    <head>
        <title>Timeline</title>
        <link href="https://unpkg.com/vis-timeline@latest/styles/vis-timeline-graph2d.min.css" rel="stylesheet"
            type="text/css" />
    </head>
    <div id="visualization"></div>
</template>

<script setup>
import { Timeline } from "vis-timeline";
import { DataSet } from "vis-data";
import { onMounted, ref, defineProps } from 'vue';
import { useEventStore } from '../stores/event_store';

const props = defineProps(['events']);

onMounted(() => {
    // DOM element where the Timeline will be attached
    const container = document.getElementById('visualization');

    // Get events from the event store
    const store = useEventStore();
    const events = store.events;

    // Create a DataSet for the timeline items
    const items = new DataSet(
        Object.values(events).map(event => ({
            id: event.id,
            content: event.label || 'No Label',
            start: new Date(event.start_time * 1000) // Convert Unix timestamp to Date object
        }))
    );

    // Configuration for the Timeline
    const options = {
        height: '150px',
        width: '90vw'
    };

    // Create and render the Timeline
    new Timeline(container, items, options);
})
</script>

<style type="text/css">
#visualization {
    border: 1px solid lightgray;
}
</style>