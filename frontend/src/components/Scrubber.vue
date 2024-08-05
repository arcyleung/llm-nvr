<template>

    <head>
        <title>Timeline</title>
        <link href="https://unpkg.com/vis-timeline@latest/styles/vis-timeline-graph2d.min.css" rel="stylesheet"
            type="text/css" />
    </head>
    <div id="visualization"></div>
</template>

<script setup lang="ts">
import { Timeline } from "vis-timeline";
import { DataSet } from "vis-data";
import { onMounted, ref } from 'vue';

onMounted(() => {
    // DOM element where the Timeline will be attached
    var container = document.getElementById('visualization');

    // Create a DataSet (allows two way data-binding)
    var items = new DataSet([
        { id: 1, content: 'item 1', start: '1722823120327' },
        { id: 2, content: 'item 2', start: '2014-04-14' },
        { id: 3, content: 'item 3', start: '2014-04-18' },
        { id: 4, content: 'item 4', start: '2014-04-16' },
        { id: 5, content: 'item 5', start: '2014-04-25' },
        { id: 6, content: 'item 6', start: '2014-04-27', type: 'point' }
    ]);

    // Configuration for the Timeline
    var options = {
        // maxHeight: 200,
        height: 150,
        width: "90vw"
    };

    // Create a Timeline
    var timeline = new Timeline(container, items, options);
})
</script>

<style type="text/css">
#visualization {
    border: 1px solid lightgray;
}
</style>