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
    "Access-Control-Allow-Origin" : "http://localhost:3000",
    "Access-Control-Allow-Credentials" : true,
    "Access-Control-Allow-Methods" : "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers" : "Origin, Content-Type, Accept"

});

function computeTFIDF(documents) {
    const tf = {};
    const df = {};
    const tfidf = {};
    const totalDocs = Object.keys(documents).length;

    // Calculate term frequency (TF)
    for (const [doc, text] of Object.entries(documents)) {
        const words = text.split(' ');
        tf[doc] = {};
        words.forEach(word => {
            if (!tf[doc][word]) {
                tf[doc][word] = 0;
            }
            tf[doc][word]++;
        });
    }

    // Calculate document frequency (DF)
    for (const doc in tf) {
        for (const word in tf[doc]) {
            if (!df[word]) {
                df[word] = 0;
            }
            df[word]++;
        }
    }

    // Calculate TF-IDF
    for (const doc in tf) {
        tfidf[doc] = {};
        for (const word in tf[doc]) {
            const tfValue = tf[doc][word] / Object.keys(tf[doc]).length;
            const idfValue = Math.log(totalDocs / (df[word] || 1));
            tfidf[doc][word] = tfValue * idfValue;
        }
    }

    return tfidf;
}


// Declare a route
fastify.get(
    '/events',
    async (request, reply) => {
        const { start_time, end_time } = request.query
        console.log(start_time, end_time, db_path)
        let query = `SELECT * FROM event WHERE start_time >= ${request.query.start_time} AND start_time <= ${request.query.end_time}`
        console.log(query)
        let results = await db.all(query)
        console.log(results)
        return { results }
    })

fastify.get(
    '/events',
    async (request, reply) => {
        const { start_time, end_time } = request.query
        console.log(start_time, end_time, db_path)
        let query = `SELECT * FROM event WHERE start_time >= ${request.query.start_time} AND start_time <= ${request.query.end_time}`
        console.log(query)
        let results = await db.all(query)
        console.log(results)
        return { results }
    })

// Run the server!
try {
    await fastify.listen({ port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}