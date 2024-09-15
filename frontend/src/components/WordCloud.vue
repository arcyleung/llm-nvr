<template>
  <div>
    <input type="text" v-model="localSearchTerm" placeholder="Search..." @input="updateSearchTerm" />
    <div ref="wordCloud" id="wordcloud" style="width:100%;  display: block"></div>
  </div>

</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import * as d3 from 'd3';
  import cloud from 'd3-cloud';

  import { useEventStore } from '../stores/event_store';
  import { storeToRefs } from 'pinia';
  const store = useEventStore();
  const { start_time, end_time } = storeToRefs(store)

  // import transcribed from '../../../transcribed/analyze_2024-07-26T00:48:28.144473.json';
  // const props = defineProps(['total_tfidf_scores' , 'top_n', 'events']);

  const wordCloud = ref(null);
  const localSearchTerm = ref('');

  const updateSearchTerm = () => {
    store.setSearchTerm(localSearchTerm.value)
    store.debouncedFetchEvents();
  };

  const drawWordCloud = (eventsDict) => {
    // let words = Object.values(eventsDict).reduce((acc: any, event: any) => acc += event)
    const layout = cloud()
      .size([window.innerWidth * 0.9, window.innerHeight * 0.28])
      // .spiral(rectangularSpiral)
      .words(Object.keys(store.total_tfidf_scores).map(k => ({ text: k, size: ((store.total_tfidf_scores[k]) * 800) ^ 2 })) )
      .padding(0.2)
      .rotate(() => 0)
      .font('Impact')
      .fontSize(d => d.size)
      .on('end', draw);

    layout.start();

    function draw(words) {
      d3.select(wordCloud.value)
        .append('svg')
        .attr('width', layout.size()[0])
        .attr('height', layout.size()[1])
        .append('g')
        .attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')')
        .selectAll('text')
        .data(words)
        .enter().append('text')
        .style('font-size', d => d.size + 'px')
        .style('font-family', 'Impact')
        .style('fill', (d, i) => "#333333")
        .attr('text-anchor', 'middle')
        .attr('transform', d => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
        .style('width', '100%')
        .style('height', '20px')
        .text(d => d.text)
        .on("click", function (word, i){
            store.setSearchTerm(i.text)
            store.fetchEvents()
        });
    }
  };

  onMounted(() => {
    drawWordCloud(store.total_tfidf_scores);
    localSearchTerm.value = store.search_term;
  });

  watch(() => store.total_tfidf_scores, (newDict) => {
    d3.select(wordCloud.value).selectAll('*').remove();
    drawWordCloud(store.total_tfidf_scores);
  });

  watch(() => store.search_term, (newSearchTerm) => {
    localSearchTerm.value = newSearchTerm;
  });
  </script>

  <style scoped>
  input {
    margin-bottom: 10px;
    padding: 5px;
    width: 100%;
    box-sizing: border-box;
  }

  text:hover { fill: #eeeeee !important; }
  </style>