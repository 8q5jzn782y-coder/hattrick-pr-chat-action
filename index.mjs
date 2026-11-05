import { appendFile, readFile } from "node:fs/promises"
import { pathToFileURL } from "node:url"

export const SERVICE = "https://www.hattrickai.io/api/integrations/github/pr-chat/v1"
const statuses = new Set(["queued", "running", "partially_complete", "completed", "failed", "canceled"])
const positive = value => { const n = Number(value); if (!Number.isSafeInteger(n) || n <= 0) throw new Error("Invalid GitHub event identity."); return n }

export function submission(event, env) {
  if (env.GITHUB_EVENT_NAME !== "issue_comment" || event.action !== "created" || !event.issue?.pull_request || event.comment?.user?.type === "Bot") return null
  if (!/^(?:\/hattrick|@hattrick)\s+\S/i.test(String(event.comment?.body ?? "").trim())) return null
  return { repositoryId: positive(event.repository?.id), pullRequest: positive(event.issue.number),
    commentId: positive(event.comment.id), runId: positive(env.GITHUB_RUN_ID), runAttempt: positive(env.GITHUB_RUN_ATTEMPT) }
}

export async function submitRequest(event, env, { fetchImpl = fetch, pause = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  const body = submission(event, env)
  if (!body) return { skipped: true }
  const identityUrl = new URL(env.ACTIONS_ID_TOKEN_REQUEST_URL)
  if (identityUrl.protocol !== "https:" || !identityUrl.hostname.endsWith(".actions.githubusercontent.com") || identityUrl.username || identityUrl.password) throw new Error("GitHub workflow identity is unavailable.")
  if (!env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) throw new Error("Grant id-token: write to the Hattrick job.")
  identityUrl.searchParams.set("audience", SERVICE)
  const identity = await fetchImpl(identityUrl, { headers: { Authorization: `Bearer ${env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` }, redirect: "error", signal: AbortSignal.timeout(15000) })
  if (!identity.ok) throw new Error("GitHub workflow identity is unavailable.")
  const { value: token } = await identity.json()
  if (typeof token !== "string" || !token || token.length > 17000) throw new Error("GitHub workflow identity is unavailable.")
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetchImpl(`${SERVICE}/requests`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body), redirect: "error", signal: AbortSignal.timeout(60000),
    }).catch(() => null)
    let result
    try { result = await response?.json() } catch { /* never expose server responses in runner logs */ }
    if (response?.ok) {
      if (!/^[a-f0-9-]{36}$/.test(result?.jobId ?? "") || !statuses.has(result.status)) throw new Error("Hattrick returned an invalid status.")
      return { jobId: result.jobId, status: result.status }
    }
    const retryable = !response || [429, 502, 503, 504].includes(response.status) || (response.status === 409 && result?.error === "EVENT_PENDING")
    if (!retryable || attempt === 2) throw new Error(`Hattrick request could not be accepted${response ? ` (HTTP ${response.status})` : ""}. Rerun this workflow to retrieve the same request.`)
    await pause((attempt + 1) * 2000)
  }
}

async function main() {
  const env = process.env
  const event = JSON.parse(await readFile(env.GITHUB_EVENT_PATH, "utf8"))
  const result = await submitRequest(event, env)
  if (result.skipped) { console.log("No Hattrick request in this comment."); return }
  if (env.GITHUB_OUTPUT) await appendFile(env.GITHUB_OUTPUT, `job-id=${result.jobId}\nstatus=${result.status}\n`)
  console.log(`Hattrick request accepted: ${result.status}. Follow the pull request for its reply.`)
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(() => {
  console.error("Hattrick could not accept this request. Check the installation and workflow setup, then rerun the same workflow.")
  process.exitCode = 1
})
