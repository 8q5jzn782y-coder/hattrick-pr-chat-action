import test from "node:test"
import assert from "node:assert/strict"
import { SERVICE, submission, submitRequest } from "./index.mjs"

const env = { GITHUB_EVENT_NAME: "issue_comment", GITHUB_RUN_ID: "900", GITHUB_RUN_ATTEMPT: "1",
  ACTIONS_ID_TOKEN_REQUEST_URL: "https://pipelines.actions.githubusercontent.com/idtoken?api-version=2",
  ACTIONS_ID_TOKEN_REQUEST_TOKEN: "synthetic-runner-token" }
const event = { action: "created", repository: { id: 12 }, issue: { number: 3, pull_request: {} },
  comment: { id: 44, user: { type: "User" }, body: "/hattrick Does this preserve cancellation?" } }
const jobId = "11111111-1111-4111-8111-111111111111"

test("wrapper sends identifiers only, with no code, prompt, or GitHub credential", async () => {
  const calls = []
  const result = await submitRequest(event, env, { fetchImpl: async (url, init) => {
    calls.push({ url: String(url), init })
    assert.equal(init.redirect, "error")
    if (calls.length === 1) return Response.json({ value: "synthetic-oidc-token" })
    assert.equal(init.headers.Authorization, "Bearer synthetic-oidc-token")
    assert.deepEqual(JSON.parse(init.body), { repositoryId: 12, pullRequest: 3, commentId: 44, runId: 900, runAttempt: 1 })
    assert.doesNotMatch(init.body, /cancellation|token|code|password|prompt/)
    return Response.json({ jobId, status: "queued" }, { status: 202 })
  } })
  assert.deepEqual(result, { jobId, status: "queued" })
  assert.equal(new URL(calls[0].url).searchParams.get("audience"), SERVICE)
  assert.equal(calls[1].url, `${SERVICE}/requests`)
})

test("unrelated, edited, bot, and non-PR events make no call", async () => {
  for (const value of [{ ...event, action: "edited" }, { ...event, issue: { number: 3 } },
    { ...event, comment: { ...event.comment, body: "hello" } }, { ...event, comment: { ...event.comment, user: { type: "Bot" } } }]) {
    assert.equal(submission(value, env), null)
    assert.deepEqual(await submitRequest(value, env), { skipped: true })
  }
})

test("a PR review event cannot obtain the Action's trusted identity path", async () => {
  const review = { ...event, issue: undefined, pull_request: { number: 3 },
    comment: { ...event.comment, id: 45, in_reply_to_id: 500, body: "/hattrick Why is this a race?" } }
  const reviewEnv = { ...env, GITHUB_EVENT_NAME: "pull_request_review_comment" }
  assert.equal(submission(review, reviewEnv), null)
  assert.equal(submission({ ...review, comment: { ...review.comment, in_reply_to_id: undefined } }, reviewEnv), null)
  assert.equal(submission({ ...review, action: "edited" }, reviewEnv), null)
  assert.deepEqual(await submitRequest(review, reviewEnv), { skipped: true })
})

test("webhook race and ambiguous network retries preserve the exact same request", async () => {
  const bodies = []; let requests = 0
  const result = await submitRequest(event, env, { pause: async () => {}, fetchImpl: async (url, init) => {
    if (String(url).includes("actions.githubusercontent.com")) return Response.json({ value: "synthetic" })
    bodies.push(init.body); requests++
    if (requests === 1) throw new Error("network lost after submission")
    if (requests === 2) return Response.json({ error: "EVENT_PENDING" }, { status: 409 })
    return Response.json({ jobId, status: "running" })
  } })
  assert.equal(result.status, "running")
  assert.equal(new Set(bodies).size, 1)
})

test("authentication and allowance failures are never automatically retried", async () => {
  for (const status of [401, 403, 409]) {
    let posts = 0
    await assert.rejects(submitRequest(event, env, { fetchImpl: async url => {
      if (String(url).includes("actions.githubusercontent.com")) return Response.json({ value: "synthetic" })
      posts++; return Response.json({ error: "PRIVATE_PROVIDER_RESPONSE_MUST_NOT_LEAK" }, { status })
    } }), error => !error.message.includes("PRIVATE_PROVIDER") && error.message.includes(`HTTP ${status}`))
    assert.equal(posts, 1)
  }
})

test("identity credentials cannot be redirected to an arbitrary host", async () => {
  for (const url of ["https://evil.test/token", "http://pipelines.actions.githubusercontent.com/token", "https://actions.githubusercontent.com.evil.test"]) {
    await assert.rejects(submitRequest(event, { ...env, ACTIONS_ID_TOKEN_REQUEST_URL: url }, { fetchImpl: () => { throw new Error("must not fetch") } }), /identity is unavailable/)
  }
})
