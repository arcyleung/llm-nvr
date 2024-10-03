import { ref, computed } from 'vue'
import { defineStore } from 'pinia'


// Custom debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const useEventStore = defineStore('event', () => {
  const end_time = ref(Date.now() / 1000)
  const start_time = ref(end_time.value - 60 * 60 * 24)
  const events = ref({})
  const total_tfidf_scores = ref({})
  const search_term = ref("")
  const url_host = (process.env.URL_HOST !== undefined ? process.env.URL_HOST : "localhost")
  const url_port = (process.env.URL_HOST !== undefined ? process.env.URL_PORT : 3000)

  function setTimeRange(start, end) {
    start_time.value = start;
    end_time.value = end;
  }

  function setSearchTerm(searchTerm) {
    search_term.value = searchTerm;
  }

  async function fetchEvents(limit = 300) {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin', 'http://frontend:3000');
    let url = `http://${url_host}:${url_port}/events?start_time=${start_time.value}&end_time=${end_time.value}&limit=${limit}`


    if (search_term.value) {
      url += `&search_term=${encodeURIComponent(search_term.value)}`
    }

    try {
      const response = await fetch(url, {
        mode: 'cors',
        method: 'GET',
        headers: headers
      });
      const data = await response.json();
      events.value = data.events;
      total_tfidf_scores.value = data.total_tfidf_scores;
      return data;
    }
    catch (err) {
      console.error(err)
    }
  }

  async function fetchImage(id, camera) {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin', 'http://frontend:3000');

    try {
      const response = await fetch(`http://${url_host}:${url_port}/events/${camera}/${id}/image`, {
        mode: 'cors',
        method: 'GET',
        headers: headers
      });
      const data = await response.json();
      return data.image; // Assuming the API returns the image data in the 'image' field
    }
    catch (err) {
      console.error(err)
      throw err; // Re-throw the error so it can be caught in the component
    }
  }

  const debouncedFetchEvents = debounce(() => {
    fetchEvents();
  }, 300);

  return {
    start_time,
    end_time,
    events,
    total_tfidf_scores,
    search_term,
    setTimeRange,
    setSearchTerm,
    debouncedFetchEvents,
    fetchEvents,
    fetchImage
  }
})
