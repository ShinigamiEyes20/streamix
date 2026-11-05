import assert from "node:assert/strict";
import handler from "../api/index.js";

const originalFetch = globalThis.fetch;
const originalToken = process.env.TMDB_READ_ACCESS_TOKEN;
let mockedStatus = 200;
const upstreamCalls = [];
process.env.TMDB_READ_ACCESS_TOKEN = "check-api-test-token";
globalThis.fetch = async (url, options) => {
  upstreamCalls.push({ url: new URL(url), options });
  return new Response(JSON.stringify({ ok: true }), {
    status: mockedStatus,
    headers: { "content-type": "application/json", ...(mockedStatus === 429 ? { "retry-after": "3" } : {}) },
  });
};

let failures = 0;
let passed = 0;
async function invoke({ method = "GET", path, query = {}, host = "localhost" }) {
  const headers = {};
  let statusCode = 0;
  let body;
  const res = {
    setHeader(key, value) { headers[key] = value; },
    status(code) { statusCode = code; return this; },
    json(value) { body = value; return this; },
    end() { return this; },
  };
  await handler({ method, url: `/api/${path}`, headers: { host }, query: { path, ...query } }, res);
  return { statusCode, headers, body };
}

async function check(label, run, expected = 200) {
  try {
    const response = await run();
    assert.equal(response.statusCode, expected, `expected ${expected}, got ${response.statusCode}`);
    passed += 1;
    return response;
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${label}: ${error.message}`);
    return undefined;
  }
}

const cases = [
  ["movie genres", "genre/movie/list", { language: "en-US" }],
  ["TV genres", "genre/tv/list", { language: "en-US" }],
  ...["movie", "tv"].flatMap((type) => ["day", "week"].map((window) => [`trending ${type}/${window}`, `trending/${type}/${window}`, {}])),
  ["now playing", "movie/now_playing", { language: "en-US", page: "1" }],
  ["anime discover", "discover/tv", { with_genres: "16", with_keywords: "210024", sort_by: "popularity.desc" }],
  ["search", "search/multi", { query: "Alien", include_adult: "false", language: "en-US" }],
  ["search adult URL override", "search/multi", { query: "Alien", include_adult: "true", language: "en-US" }],
  ...["movie", "tv"].flatMap((type) => [
    [`${type} details`, `${type}/123`, { language: "en-US" }],
    [`${type} credits`, `${type}/123/credits`, {}],
    [`${type} recommendations`, `${type}/123/recommendations`, {}],
    [`${type} providers`, `${type}/123/watch/providers`, {}],
    [`${type} videos`, `${type}/123/videos`, { language: "en-US" }],
  ]),
  ["TV season episodes", "tv/123/season/1", {}],
  ["movie discover full filter set", "discover/movie", {
    sort_by: "popularity.desc", include_adult: "false", include_video: "false", language: "en-US", page: "1",
    year: "2020", with_genres: "28", "vote_average.gte": "7",
  }],
  ["movie discover alternate filters", "discover/movie", {
    sort_by: "revenue.desc", include_adult: "true", include_video: "false", language: "en-US", page: "2",
    primary_release_year: "2020", with_genres: "28,12", "vote_average.gte": "8.5",
  }],
  ["TV discover full filter set", "discover/tv", {
    sort_by: "first_air_date.desc", include_adult: "false", include_null_first_air_dates: "false",
    language: "en-US", page: "1", first_air_date_year: "2020", with_genres: "18", with_status: "0",
  }],
  ["TV discover status filter", "discover/tv", { sort_by: "vote_average.asc", page: "3", with_status: "5", with_genres: "18,80" }],
  ...[
    "original_title.asc", "original_title.desc", "popularity.asc", "popularity.desc",
    "revenue.asc", "revenue.desc", "primary_release_date.asc", "primary_release_date.desc",
    "title.asc", "title.desc", "vote_average.asc", "vote_average.desc", "vote_count.asc", "vote_count.desc",
  ].map((sort) => [`movie sort ${sort}`, "discover/movie", { sort_by: sort, page: "1" }]),
  ...[
    "popularity.asc", "popularity.desc", "first_air_date.asc", "first_air_date.desc",
    "vote_average.asc", "vote_average.desc", "vote_count.asc", "vote_count.desc",
  ].map((sort) => [`TV sort ${sort}`, "discover/tv", { sort_by: sort, page: "1" }]),
  ...Array.from({ length: 10 }, (_, index) => {
    const rating = String(index + 1);
    return [`movie minimum rating ${rating}`, "discover/movie", { "vote_average.gte": rating }];
  }),
  ...Array.from({ length: 6 }, (_, index) => {
    const status = String(index);
    return [`TV status ${status}`, "discover/tv", { with_status: status }];
  }),
];

for (const [label, path, query] of cases) {
  const before = upstreamCalls.length;
  const response = await check(label, () => invoke({ path, query }));
  if (response && (query.include_adult !== undefined || path === "search/multi" || path.startsWith("discover/"))) {
    const forwarded = upstreamCalls[before]?.url.searchParams.get("include_adult");
    if (forwarded !== "false") {
      failures += 1;
      passed -= 1;
      console.error(`FAIL ${label}: include_adult forwarded as ${forwarded}`);
    }
  }
}

const blocked = await check("disallowed endpoint", () => invoke({ path: "configuration" }), 404);
const invalidParam = await check("unknown query key", () => invoke({ path: "search/multi", query: { query: "Alien", unsafe: "1" } }), 400);
const invalidSort = await check("invalid sort value", () => invoke({ path: "discover/movie", query: { sort_by: "arbitrary.value" } }), 400);
const negativeSeason = await check("negative season", () => invoke({ path: "tv/123/season/-1" }), 404);
const invalidHost = await check("invalid Host header", () => invoke({ path: "movie/123", host: "bad host" }), 400);
const method = await check("non-GET method", () => invoke({ method: "POST", path: "movie/123" }), 405);
for (const response of [blocked, invalidParam, invalidSort, negativeSeason, invalidHost, method]) {
  if (response && response.headers["Cache-Control"] !== "no-store") {
    failures += 1;
    passed -= 1;
    console.error("FAIL error response did not include Cache-Control: no-store");
  }
}

for (const upstreamStatus of [401, 403]) {
  mockedStatus = upstreamStatus;
  await check(`upstream ${upstreamStatus} maps to 502`, () => invoke({ path: "movie/123" }), 502);
}
mockedStatus = 404;
await check("upstream 404 passthrough", () => invoke({ path: "movie/123" }), 404);
mockedStatus = 429;
const rateLimited = await check("upstream 429 passthrough", () => invoke({ path: "movie/123" }), 429);
if (rateLimited && rateLimited.headers["Retry-After"] !== "3") {
  failures += 1;
  passed -= 1;
  console.error("FAIL upstream 429 did not preserve Retry-After");
}

console.log(`API checks: ${passed} passed, ${failures} failed (${cases.length} frontend call cases plus rejection/status assertions).`);
if (originalFetch) globalThis.fetch = originalFetch;
else delete globalThis.fetch;
if (originalToken === undefined) delete process.env.TMDB_READ_ACCESS_TOKEN;
else process.env.TMDB_READ_ACCESS_TOKEN = originalToken;
if (failures) process.exitCode = 1;
