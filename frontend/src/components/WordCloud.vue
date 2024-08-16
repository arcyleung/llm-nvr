<template>
  <div>
    <input type="text" v-model="searchTerm" placeholder="Search..." />
    <div ref="wordCloud" id="wordcloud" style="width:100%;  display: block"></div>
  </div>

</template>

<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue';
  import * as d3 from 'd3';
  import cloud from 'd3-cloud';
  // import transcribed from '../../../transcribed/analyze_2024-07-26T00:48:28.144473.json';
  const props = defineProps(['total_tfidf_scores' , 'top_n', 'events']);

  const wordCloud = ref(null);
  const searchTerm = ref('');

  const filteredDict = computed(() => {
      if (!searchTerm.value) {
        return props.events;
      }

      let searchTermLower = searchTerm.value.toLowerCase();

      let filteredObject = Object.keys(props.events).reduce((acc: any, event_id: str) => {
        if (props.events[event_id].transcribed.toLowerCase().includes(searchTermLower)) {
          acc[key] = props.events[event_id];
        }
        return acc;
      }, {})

      return filteredObject;
  });

  const drawWordCloud = (eventsDict: any) => {
    // let words = Object.values(eventsDict).reduce((acc: any, event: any) => acc += event)
    const layout = cloud()
      .size([window.innerWidth * 0.9, window.innerHeight * 0.28])
      // .spiral(rectangularSpiral)
      .words(Object.keys(props.total_tfidf_scores).map(k => ({ text: k, size: props.total_tfidf_scores[k] * 100 })))
      .padding(0.2)
      .rotate(() => 0)
      .font('Impact')
      .fontSize(d => d.size as number)
      .on('end', draw);

    layout.start();

    function draw(words: Array<any>) {
      d3.select(wordCloud.value)
        .append('svg')
        .attr('width', layout.size()[0])
        .attr('height', layout.size()[1])
        .append('g')
        .attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')')
        .selectAll('text')
        .data(Object.keys(props.total_tfidf_scores))
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
    drawWordCloud(filteredDict);
  });

  watch(filteredDict, (newDict) => {
    d3.select(wordCloud.value).selectAll('*').remove();
    console.log("Newdict" + Object.keys(newDict))
    drawWordCloud(newDict);
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