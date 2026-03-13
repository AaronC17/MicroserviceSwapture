'use strict';

const request = require('supertest');
const { app, server } = require('../src/server');

afterAll(() => server.close());

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('MicroserviceSwapture');
  });
});

describe('POST /swap', () => {
  it('swaps two values', async () => {
    const res = await request(app).post('/swap').send({ a: 1, b: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ a: 2, b: 1 });
  });

  it('swaps string values', async () => {
    const res = await request(app).post('/swap').send({ a: 'hello', b: 'world' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ a: 'world', b: 'hello' });
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/swap').send({ a: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /capture and GET /capture/:id', () => {
  it('captures a payload and retrieves it by id', async () => {
    const postRes = await request(app).post('/capture').send({ name: 'test', value: 42 });
    expect(postRes.status).toBe(201);
    expect(postRes.body.id).toBeDefined();
    expect(postRes.body.data).toEqual({ name: 'test', value: 42 });

    const getRes = await request(app).get(`/capture/${postRes.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data).toEqual({ name: 'test', value: 42 });
  });

  it('returns 400 for empty body', async () => {
    const res = await request(app).post('/capture').send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/capture/99999');
    expect(res.status).toBe(404);
  });
});

describe('Unknown routes', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
