import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => (
    {
      events: {},
      total_tfidf_scores: {},
      searchTerm: ""
    }
  ),
  getters: {
    filteredEvents: (state) => {
      if (!state.searchTerm) {
        return state.events;
      }

      let searchTermLower = state.searchTerm.toLowerCase();

      let filteredObject = Object.keys(state.events).reduce((acc, event_id) => {
        const ev = state.events.get(event_id);
        if (ev?.transcribed.toLowerCase().includes(searchTermLower)) {
          acc[event_id] = ev;
        }
        return acc;
      }, {})

      return filteredObject;
  },
  },
  actions: {
    async fetchEvents(start_time, end_time) {
      let headers = new Headers();

      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Origin', 'http://localhost:3000');

      // console.log(start_time, end_time)

      try {
          const response = await fetch(`http://localhost:3000/events?start_time=${start_time.value}&end_time=${end_time.value}`, {
              mode: 'cors',
              method: 'GET',
              headers: headers
          });
          const data = await response.json();
          console.log(data);
          this.events = data.events;
          this.total_tfidf_scores = data.total_tfidf_scores;
          return data;
      }
      catch (err) {
          console.log(err)
      }
  }
  },
})
