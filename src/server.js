'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MicroserviceSwapture', timestamp: new Date().toISOString() });
});

// Swap endpoint - swaps the values of two fields in the provided payload
app.post('/swap', (req, res) => {
  const { a, b } = req.body;

  if (a === undefined || b === undefined) {
    return res.status(400).json({ error: 'Both "a" and "b" fields are required.' });
  }

  res.json({ a: b, b: a });
});

// Capture endpoint - stores the payload and returns a confirmation with a unique id
const store = new Map();
let counter = 1;

app.post('/capture', (req, res) => {
  const payload = req.body;

  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'A non-empty JSON body is required.' });
  }

  const id = counter++;
  store.set(id, { id, data: payload, capturedAt: new Date().toISOString() });
  res.status(201).json(store.get(id));
});

app.get('/capture/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const entry = store.get(id);

  if (!entry) {
    return res.status(404).json({ error: `No captured entry found with id ${id}.` });
  }

  res.json(entry);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

const server = app.listen(PORT, () => {
  console.log(`MicroserviceSwapture running on port ${PORT}`);
});

module.exports = { app, server };
