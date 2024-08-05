<template>
    <div id="timeline"></div>
</template>

<script setup lang="ts">
import { Timeline } from "vis-timeline";
import { DataSet } from "vis-data";
import { onMounted, ref } from 'vue';

onMounted(() => {



    // Configuration for the Timeline
    var options = {};

    // Create a Timeline
    var timeline = new Timeline(container, items, options);
})
</script>

<style scoped>
/* #timeline {
    width: 100%;
    height: auto;
} */
</style>