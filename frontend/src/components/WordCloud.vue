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
  import transcribed from '../../../transcribed/analyze_2024-07-26T00:48:28.144473.json';

  const wordCloud = ref(null);
  const searchTerm = ref('');

  const jsonDict: any = ref(transcribed)

  const filteredDict = computed(() => {
      if (!searchTerm.value) {
        return jsonDict.value;
      }

      let searchTermLower = searchTerm.value.toLowerCase();

      let filteredObject = Object.keys(jsonDict.value).reduce((acc: any, key: string) => {
        if (jsonDict.value[key].toLowerCase().includes(searchTermLower)) {
          acc[key] = jsonDict.value[key];
        }
        return acc;
      }, {})

      return filteredObject;
  });
  // console.log("Filtered" + filteredDict)

  const countUniqueWords = (obj: { [key: string]: string }): { [word: string]: number } => {

    console.log("filteredDict " + obj)
    const wordCount: { [word: string]: number } = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            let words = obj[key].toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
            words = words.filter(word => word.length > 2)
            for (const word of words) {
                if (wordCount[word]) {
                    wordCount[word]++;
                } else {
                    wordCount[word] = 1;
                }
            }
        }
    }

    return wordCount;
}

  const drawWordCloud = (eventsDict: any) => {
    console.log("eventsDict" + Object.keys(eventsDict))
    let words = countUniqueWords(eventsDict.value || eventsDict)

    const ltr_ttb = function(size): any {
      // t indicates the current step along the spiral; it may monotonically
      // increase or decrease indicating clockwise or counterclockwise motion.
      var dy = 4,
        dx = dy * size[0] / size[1],
        x = 0,
        y = 0,
        incr = 0
      return function(t: number): [number, number] {
        incr += 50;
        // console.log(t)
        // console.log(size)
        x = incr % size[0]
        y = incr / size[1]
        // console.log(x)
        return [x, y];
      };
    }

    function rectangularSpiral(size) {
    var dy = 4,
        dx = dy * size[0] / size[1],
        x = 0,
        y = 0;
    return function(t) {
      var sign = t < 0 ? -1 : 1;
      // See triangular numbers: T_n = n * (n + 1) / 2.
      switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
        case 0:  x += dx; break;
        case 1:  y += dy; break;
        case 2:  x -= dx; break;
        default: y -= dy; break;
      }
      // console.log([x, y])
      return [x, y];
    };
  }


    // let words = Object.values(eventsDict).reduce((acc: any, event: any) => acc += event)
    const layout = cloud()
      .size([window.innerWidth * 0.9, window.innerHeight * 0.28])
      // .spiral(rectangularSpiral)
      .words(Object.keys(words).map(k => ({ text: k, size: words[k] })))
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
        .data(words)
        .enter().append('text')
        .style('font-size', d => d.size + 'px')
        .style('font-family', 'Impact')
        .style('fill', (d, i) => "#dddddd")
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