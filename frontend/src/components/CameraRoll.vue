<template>
    <div class="scrubbing-timeline">

    </div>
    <div class="image-grid">
        <div class="image-item" v-for="(event_data, event_id, idx) in store.events" :key="event_id"  @click="expandImage(event_id, event_data)">
            <img :src="`data:image/png;base64,${event_data.thumbnail}`" alt="event.name">
        </div>
    </div>
    <div v-if="expandedImage" class="expanded-image-overlay" @click="closeExpandedImage">
        <img :src="expandedImage" alt="Expanded Image">
      <div v-if="expandedCaption" class="expanded-image-caption">
        {{ expandedCaption }}
      </div>
    </div>
</template>

<script setup>
import { watch, ref } from 'vue';
import { useEventStore } from '../stores/event_store';

const store = useEventStore()
const eventsRef = ref(null)
const expandedImage = ref(null)
const expandedCaption = ref(null)

watch(store.events, (newEvents) => {
    eventsRef.value = store.events
});

const expandImage = async (event_id, event_data) => {
    try {
        const cameraName = event_data.camera
        const imageData = await store.fetchImage(event_id, cameraName);
        expandedImage.value = `data:image/png;base64,${imageData}`;
        expandedCaption.value = event_data.transcript || 'No transcription available';
    } catch (error) {
        console.error('Error fetching full image:', error);
    }
}

const closeExpandedImage = () => {
    expandedImage.value = null;
    expandedCaption.value = null;
}
</script>

<style scoped>
.image-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 1px;
}

.image-item {
    cursor: pointer;
}

.image-item img {
    width: 100%;
    height: auto;
    display: block;
}

.expanded-image-overlay {
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.expanded-image-container {
  align-items: center;
  max-width: 90%;
  max-height: 90%;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
}

.expanded-image-container img {
  max-width: 100%;
  max-height: calc(80vh - 100px);
  object-fit: contain;
  margin-bottom: 20px;
}

.expanded-image-caption {
  color: white;
  padding: 10px;
  width: 80%;
  text-align: center;
  font-size: 16px;
  line-height: 1.4;
}
</style>