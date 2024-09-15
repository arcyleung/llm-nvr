import sqlite3 from 'sqlite3'
import * as path from 'path'
import * as dotenv from 'dotenv'
import fs from 'fs/promises'
import { open } from 'sqlite'
dotenv.config()

const db_path = process.env.DB_PATH
const frigate_clips_path = process.env.FRIGATE_CLIPS_PATH

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
        const { start_time, end_time, limit, search_term } = request.query

        let query = `
        SELECT e.id, e.*, t.transcript
        FROM event e
        LEFT JOIN transcribed t ON e.id = t.id
        WHERE e.start_time >= ${start_time} AND e.start_time <= ${end_time}
    `

    // Add search filter if search_expr is provided
    if (search_term && search_term.trim() !== '') {
        query += ` AND t.transcript LIKE '%${search_term.trim()}%'`
    }

    query += ` ORDER BY RANDOM() LIMIT ${limit}`

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

        return {
            events,
            total_tfidf_scores,
            top_n
        }
    })

    fastify.get('/events/:camera/:id/image', async (request, reply) => {
        const { camera, id } = request.params;

        try {
          // Assuming your images are stored in an 'images' directory
          const imagePath = path.join(frigate_clips_path, `${camera}-${id}-clean.png`);

          // Read the file
          const imageBuffer = await fs.readFile(imagePath);

          // Convert buffer to base64
          const base64Image = imageBuffer.toString('base64');

          // Send the response
          reply
            .code(200)
            .header('Content-Type', 'application/json')
            .send({ image: base64Image });
        } catch (error) {
          console.error(`Error reading image for event ${id}:`, error);
          reply
            .code(404)
            .send({ error: 'Image not found' });
        }

      });

// Run the server!
try {
    await fastify.listen({ port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}