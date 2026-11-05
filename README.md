# Hattrick PR Chat Action

Public integration workspace for Hattrick pull-request research.

Status: pre-release. The Action and API contract are implemented and tested locally.
The hosted integration must be deployed and configured before this Action can
accept live requests. No Marketplace release is available yet.

The planned Action lets an authorized teammate ask a question about a pull request.
It submits the request to Hattrick's hosted service and shows the job status.
Hattrick researches the authorized code and returns its response to the PR.

This repository contains only the integration, setup instructions, API contract,
and synthetic tests. The research service is proprietary and is not included,
bundled, downloaded, or executed in the GitHub Actions runner.

The wrapper being public does not make connected repositories or research data
public. Source access requires a separate authorized installation. Sending code to
a hosted service still involves data processing; read the service's terms and
privacy policy before enabling it.

- Product: https://www.hattrickai.io/
- Privacy: https://www.hattrickai.io/privacy
- Terms: https://www.hattrickai.io/terms
- Support: magic@hattrickai.io

Public release and wrapper licensing are pending owner approval. No license to the
private backend is granted by this integration package.

## Setup

Install Hattrick's GitHub App on the repositories you want researched and have your
team's service access enabled. Start with `example-workflow.yml`, replace its Action
reference with the reviewed release commit, and grant the job `id-token: write`.
The service owner must authorize your workflow reference and commit. Run from
trusted workflow code; the Action never checks out the submitted pull-request code.

Leave a top-level PR comment such as:

```text
/hattrick Could this change lose a queued job during shutdown?
```

The Action returns `job-id` and the initial `status`. Research continues on the
service's durable queue after the workflow ends and replies on the PR. Hattrick can
also attach up to three findings beside exact changed lines. Reply beneath one of
those findings with `/hattrick <question>` to ask about it there. The private
GitHub App receives that signed review-thread event; it does not run the public
Action from the pull request's merge commit.

To research a specific chunk instead, select up to 30 changed lines on the
current PR commit and leave an inline review comment with `/hattrick <question>`.
Hattrick includes those exact lines in a bounded single-file research snapshot,
then answers in the same code thread. Subsequent `/hattrick` replies continue
the thread. If the selected code cannot be read completely, the service fails
the request rather than silently analyzing different lines. Re-running
the same workflow recovers its accepted job. Use `/hattrick rerun <question>` only
when you deliberately want another report; normal service limits still apply.

The response is AI-generated research for engineers to review. Bounded evidence
and missing context can limit its findings. Report errors or unwanted outputs to
the support contact above. Private source is processed by the hosted service and
is not uploaded as a public Action artifact. Responses on public PRs are visible
to those PRs' readers.

Run wrapper tests independently with `node --test index_test.mjs` on Node 24.

