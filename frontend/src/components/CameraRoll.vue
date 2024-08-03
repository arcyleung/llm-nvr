<template>
    <v-for="event in events" :key="event.id">
        <img :src="event.image" alt="event.name">
    </v-for>
</template>

<script setup lang="ts">


</script>