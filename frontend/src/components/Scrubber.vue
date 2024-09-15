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
import { onMounted, ref, watch } from 'vue';
import { useEventStore } from '../stores/event_store';
// Get events from the event store
const store = useEventStore();
let container = null;
let timeline = null;
// Configuration for the Timeline
const options = {
    height: '150px',
    width: '90vw'
};

onMounted(() => {
    // DOM element where the Timeline will be attached
    container = document.getElementById('visualization');
    timeline = new Timeline(container, null, options);

    timeline.on("rangechanged", async e => {
        store.setTimeRange(e.start.valueOf()/1000 , e.end.valueOf()/1000)
        await store.fetchEvents();
    });
})

// timeline.on

function renderScrubber() {
    const events = store.events;

    // Create a DataSet for the timeline items
    const items = new DataSet(
        Object.values(events).map(event => ({
            id: event.id,
            content: event.label || 'No Label',
            group:  event.label || 'No Label',
            start: new Date(event.start_time * 1000) // Convert Unix timestamp to Date object
        }))
    );

    timeline.setData({items})
}

watch(() => store.events, (newDict) => {
    renderScrubber()
});
</script>

<style type="text/css">
#visualization {
    border: 1px solid lightgray;
}
</style>