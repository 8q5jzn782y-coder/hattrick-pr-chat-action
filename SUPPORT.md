# Support

Email **magic@hattrickai.io** for setup, account access, billing questions, and
incorrect or unwanted findings. Include the Action commit, job ID, UTC time,
and a PR link only if you are comfortable sharing it. Never include tokens,
passwords, provider responses, or private source in public support requests.

## Common setup errors

| Result | What to do |
| --- | --- |
| Missing workflow identity | Grant `id-token: write` to the job and use a supported PR-comment event. |
| `REPOSITORY_NOT_ENABLED` | Ask Hattrick to enable your repository. Installing the App alone is insufficient. |
| `FORBIDDEN` or HTTP 403 | Check requester permission, installation access, and the registered workflow reference/commit with support. |
| `PILOT_DISABLED` | The service is unavailable for admission. Contact support; do not create replacement reports. |
| `EVENT_PENDING` | The signed App delivery has not arrived. The Action retries briefly; rerun the same workflow if necessary. |
| `ALLOWANCE_OR_REQUEST_CONFLICT` | Ask support to inspect allowance or request state. Retrying with a new question may create additional usage. |
| Network error or HTTP 429/502/503/504 | The Action retries the same request. Rerun that workflow to recover its saved job. |
| Input capacity exceeded | Request fewer or smaller files. Selected source is not silently truncated before research. |

## Expectations

- The Action output shows acceptance status, not the final report. Research runs
  asynchronously; the result appears on the PR.
- General questions such as "check this out" are supported. A code selection
  identifies the surrounding review context, not a request to critique a comment.
- Current requests allow questions up to 2,000 characters and source input up to
  one million characters. Above 22,000 source characters, the existing mapper
  selects focused code for the regular report; this is not an exhaustive repo scan.
- Permissions, allowance, spending controls, and any agreed team limits apply.
  The owner's test-account exemptions are not a customer entitlement.
- Cancellation or uninstall blocks new access/delivery; already accepted research
  may still finish and use allowance. Ask support about a particular saved job.
- Findings are engineering advice, not an automatic approval or proof of safety.
  A code link verifies a location, not the correctness of the claim.

Intentional `/hattrick rerun <question>` requests can create fresh research usage.
Use an ordinary workflow rerun to recover an existing request after an interruption.
