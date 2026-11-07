# Security policy

Report vulnerabilities privately to **magic@hattrickai.io**. Use the subject
"Hattrick security report" and include the affected Action commit, a minimal
reproduction, and the suspected impact. Do not open a public issue containing
credentials, private repository code, customer reports, or exploitable details.
Do not send active access tokens or production secrets by email.

## Scope and data handling

- This MIT-licensed repository contains the public wrapper, not the research engine.
- The wrapper submits repository, PR, comment, and run identifiers using GitHub OIDC.
  It does not submit source code, account passwords, or provider credentials.
- The private service independently checks installation, requester permission,
  workflow identity, entitlement, and request deduplication before research.
- Authorized source is processed by the hosted service. Consult its privacy policy
  and your service agreement for processing and retention terms.
- Reports posted on public PRs are public. On private PRs they are visible to people
  who can access that repository. Do not request findings containing secrets.
- The workflow never needs to run or check out untrusted PR code. Do not replace
  the example with a `pull_request_target` workflow that executes PR-head code.
- Pin the Action to a reviewed full commit SHA. Keep workflow credentials out of
  PR text, job summaries, public issues, and uploaded artifacts.

Only the commits explicitly identified in a published release will be supported
as releases. There are no published releases yet. A repository branch or example
pin is not a general-availability or security certification claim.
