import { test, mock } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

function fixture(overrides = {}) {
  return {
    id: 1, name: "Test café", area: "Test area", address: "Test address",
    wifi: null, power_sockets: null, work_friendliness: null,
    category: "Café", description: "", website: null, sources: "[]",
    ...overrides
  };
}

function environment(rows) {
  return {
    DB: { prepare: () => ({ all: async () => ({ results: rows }) }) },
    ASSETS: { fetch: async () => new Response("static asset") }
  };
}

test("amenities preserve unknown values and convert SQLite booleans", async () => {
  const response = await worker.fetch(new Request("https://example.test/api/places"), environment([
    fixture(),
    fixture({ id: 2, wifi: 1, power_sockets: 0, work_friendliness: "Test work note" }),
    fixture({ id: 3, wifi: 0, power_sockets: 1 })
  ]));
  assert.equal(response.status, 200);
  const { places } = await response.json();
  assert.deepEqual(places.map(place => [place.wifi, place.powerSockets, place.workFriendliness]), [
    [null, null, null], [true, false, "Test work note"], [false, true, null]
  ]);
});

test("the public API rejects write requests without querying the database", async () => {
  const env = environment([]);
  env.DB.prepare = () => { throw new Error("A write must not query the database"); };
  const response = await worker.fetch(new Request("https://example.test/api/places", { method: "POST" }), env);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "GET");
});

test("unknown API routes return JSON 404s and pages use the asset binding", async () => {
  const env = environment([]);
  const missing = await worker.fetch(new Request("https://example.test/api/missing"), env);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: "API route not found" });
  const page = await worker.fetch(new Request("https://example.test/"), env);
  assert.equal(await page.text(), "static asset");
});

test("database failures return a retryable response without database details", async () => {
  const log = mock.method(console, "error", () => {});
  try {
    const env = environment([]);
    env.DB.prepare = () => { throw new Error("Internal database detail"); };
    const response = await worker.fetch(new Request("https://example.test/api/places"), env);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), { error: "The directory is temporarily unavailable. Please try again." });
  } finally {
    log.mock.restore();
  }
});
