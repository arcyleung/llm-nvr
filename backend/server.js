import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import * as dotenv from 'dotenv'
dotenv.config()

const db_path = process.env.DB_PATH

let db

(async () => {
    // open the database
    db = await open({
        filename: db_path,
        driver: sqlite3.Database
    })
})()

import Fastify from 'fastify'
const fastify = Fastify({
    logger: true
})
import cors from '@fastify/cors'
fastify.register(cors, {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Origin, Content-Type, Accept"

});

function computeTFIDF(documents) {
    const tf = {};
    const df = {};
    const idf = {};
    const tfidf = {};
    const totalDocs = Object.keys(documents).length;

    // Calculate term frequency (TF) and document frequency (DF)
    for (const [docId, event] of Object.entries(documents)) {
        if (!event["transcript"]) {
            continue
        }
        const words = event["transcript"].toLowerCase().split(/\W+/);
        tf[docId] = {};
        const wordCount = {};

        words.forEach(word => {
            if (!wordCount[word]) wordCount[word] = 0;
            wordCount[word]++;
        });

        for (const [word, count] of Object.entries(wordCount)) {
            tf[docId][word] = count / words.length;
            if (!df[word]) df[word] = 0;
            df[word]++;
        }
    }

    // Calculate inverse document frequency (IDF)
    for (const [word, count] of Object.entries(df)) {
        idf[word] = Math.log(totalDocs / count);
    }

    // Calculate TF-IDF
    for (const [docId, words] of Object.entries(tf)) {
        tfidf[docId] = {};
        for (const [word, tfValue] of Object.entries(words)) {
            const score = tfValue * idf[word];
            // Set score threshold to exclude common words
            if (score > 0)
                tfidf[docId][word] = score;
        }
    }

    return tfidf;
}

function sum_tfidf_scores(events_scores) {
    return events_scores.reduce((acc, scores) => {
        for (let key in scores) {
            if (scores.hasOwnProperty(key)) {
                acc[key] = (acc[key] || 0) + scores[key];
            }
        }
        return acc;
    }, {});
}

function max_of_tfidf_scores(events_scores) {
    return events_scores.reduce((acc, scores) => {
        for (let key in scores) {
            if (scores.hasOwnProperty(key)) {
                acc[key] = Math.max((acc[key] || 0), scores[key]);
            }
        }
        return acc;
    }, {});
}



// Declare a route
fastify.get(
    '/events',
    async (request, reply) => {
        // const { start_time, end_time } = request.query

        const start_time = 1723259761
        const end_time = 1724123761
        let query = `SELECT e.id, e.*, t.transcript FROM event e LEFT JOIN transcribed t ON e.id = t.id WHERE e.start_time >= ${start_time} AND e.start_time <= ${end_time}`

        let results = await db.all(query)

        // Reduce list of events into one object
        const events = results.reduce(
            (obj, event) => {
                const { id, ...rest_of_event } = event
                return Object.assign(obj, { [id]: rest_of_event })
            }, {});

        // Compute TF-IDF for all events in this time range
        const tfidf_results = computeTFIDF(events)

        // Reduce TF-IDF scores into single object, filter words by score
        const total_tfidf_scores = max_of_tfidf_scores(Object.values(tfidf_results))
        const top_n = Object.keys(total_tfidf_scores).sort((a, b) => total_tfidf_scores[b] - total_tfidf_scores[a]).slice(0, 100)

        // console.log(events)
        return {
            events,
            total_tfidf_scores,
            top_n
        }
    })

// Run the server!
try {
    await fastify.listen({ port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}