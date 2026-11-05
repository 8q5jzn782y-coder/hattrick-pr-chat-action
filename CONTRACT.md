# Integration contract: v1 pre-release

Implemented locally. The hosted API is disabled until its operator deploys and
configures the service. The Action's fixed service origin is
`https://www.hattrickai.io/api/integrations/github/pr-chat/v1`.

`POST /requests` takes `repositoryId`, `pullRequest`, `commentId`, `runId`, and
`runAttempt` as positive integers. Authenticate with a GitHub Actions OIDC bearer
token using the service origin above as its audience. A successful 202 response
contains `jobId`, `status`, `reused`, and `pullRequestUrl`.

`GET /jobs/{jobId}` requires the same workflow identity and current repository
authorization and returns `jobId`, `status`, and `reused`. It never returns report
content or internal traces. Reports are delivered in the PR conversation.

The Action accepts top-level `issue_comment` commands only. Inline commands on
selected changed lines, and replies under Hattrick-owned or previously requested
review threads, are accepted by the private GitHub App webhook,
then use the same durable jobs and allowance. The App verifies its webhook
signature and rechecks the commenter, selected lines, thread root, repository and current PR
commit before admitting paid work. The Action does not handle review-comment
workflow events from a pull request merge commit.

If a verified webhook has not arrived yet, submission returns 409 `EVENT_PENDING`;
retry the same identifiers. Other authorization or allowance failures must not
start replacement jobs. The wrapper retries temporary delivery failures at most
twice and prints no raw service response or identity token.

## Wrapper responsibilities

- Accept a supported PR conversation command from a trusted workflow.
- Obtain a short-lived identity for the intended Hattrick service audience.
- Submit repository ID, PR number, triggering comment ID, and workflow run identity.
- Use the documented HTTPS service origin and token audience; do not follow
  redirects or accept a destination URL from PR content.
- Show an accepted job ID and status link. Retry delivery with the same request
  identity, never silently request a fresh paid report.
- Do not execute submitted PR code or expose secrets, code, or reports in runner logs.

## Service responsibilities

- Authenticate the workflow and independently authorize the user and repository.
- Resolve the installation and customer account server-side.
- Verify the run and comment belong to that repository/PR, verify the actual
  requester's current permission, and freeze the accepted question and commits.
- Match comment requests to signature-verified GitHub App webhook records and
  current GitHub data. Workflow identity alone does not attest the comment text.
- Fetch the actual comment, immutable commits, code evidence and CI status.
- Enforce quotas and deduplicate before accepting paid work.
- Make delivery retries and workflow reruns return the existing accepted job.
  A fresh paid run requires a deliberate authorized rerun request.
- Keep the job durable beyond the Action run, preserve evidence references, and
  deliver the report into the authorized PR conversation.
- Return safe statuses: queued, running, partially complete, completed, failed,
  or canceled. Explain when canceling delivery does not cancel accepted research.
- Authorize status reads and report links for the same customer and repository.
  Job IDs and links alone grant no access. Stop repository access and delivery
  when the installation is removed.

No account passwords, provider keys, database keys, raw backend prompts, internal
traces, or client-provided billing overrides belong in this contract. GitHub access
tokens are not forwarded from the wrapper; the service manages its own installation
credentials. Inputs and results are untrusted data, not executable instructions.
Public wrapper tests use synthetic data. Customer code and reports stay in private
service storage or the authorized customer repository; reports posted on public
PRs are visible to those PRs' readers.

