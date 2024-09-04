<template>
  <div>
    <input type="text" v-model="searchTerm" placeholder="Search..." />
    <div ref="wordCloud" id="wordcloud" style="width:100%;  display: block"></div>
  </div>

</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import * as d3 from 'd3';
  import cloud from 'd3-cloud';

  import { useEventStore } from '../stores/event_store';
  const store = useEventStore();

  // import transcribed from '../../../transcribed/analyze_2024-07-26T00:48:28.144473.json';
  // const props = defineProps(['total_tfidf_scores' , 'top_n', 'events']);

  const wordCloud = ref(null);
  const searchTerm = ref('');

  const drawWordCloud = (eventsDict) => {
    // let words = Object.values(eventsDict).reduce((acc: any, event: any) => acc += event)
    const layout = cloud()
      .size([window.innerWidth * 0.9, window.innerHeight * 0.28])
      // .spiral(rectangularSpiral)
      .words(Object.keys(store.total_tfidf_scores).map(k => ({ text: k, size: (store.total_tfidf_scores[k]) * 300 })) )
      .padding(0.2)
      .rotate(() => 0)
      .font('Impact')
      .fontSize(d => d.size)
      .on('end', draw);

    layout.start();

    function draw(words) {
      console.log(words)


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
        .on("click", function (d, i){
            // window.open(d.url, "_blank");
            console.log(d)
            console.log(i)
        });
    }
  };

  onMounted(() => {
    drawWordCloud(store.total_tfidf_scores);
  });

  watch(() => store.total_tfidf_scores, (newDict) => {
    d3.select(wordCloud.value).selectAll('*').remove();
    // console.log("Newdict" + Object.keys(newDict))
    drawWordCloud(store.total_tfidf_scores);
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