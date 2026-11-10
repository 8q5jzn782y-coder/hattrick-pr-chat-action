# Hattrick PR Chat Action

**TRANSLATION POWER COMING SOON**

Ask engineering questions about a pull request and receive a researched answer
in GitHub, with findings, recommendations, and source links.

**Availability: controlled pilot, not a general Marketplace release.** The private
service has been exercised on Hattrick's test repository. Other repositories are
not automatically enabled. Installing this Action or the GitHub App alone does
not grant research access. Contact [Hattrick support](mailto:magic@hattrickai.io)
before adding a workflow to your repository.

The Action lets an authorized teammate ask a question about a pull request.
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

This wrapper is [MIT licensed](LICENSE). The separately hosted research service
is proprietary. Its source, prompts, models, credentials, and customer data are
not covered by the wrapper's license. Service access is governed by Hattrick's
terms and your service agreement; the MIT license does not include free research.

## Setup

1. Have Hattrick enable your team and repository, then install the
   [Hattrick GitHub App](https://github.com/apps/hattrick-action)
   on the selected repository. This step is operator-assisted during the pilot.
2. Add [example-workflow.yml](example-workflow.yml) as
   `.github/workflows/hattrick.yml` on your default branch. Have Hattrick authorize
   that workflow reference and commit. The template pins an existing pilot Action
   commit; update it only to an independently reviewed release commit.

The workflow requires `id-token: write` for short-lived identity and
`contents: read`. No Hattrick password or provider key belongs in repository
secrets. Run only trusted default-branch workflow code: the wrapper does not
check out or execute the submitted pull request's code. The current service
supports GitHub.com, not GitHub Enterprise Server.

Leave a top-level PR comment such as:

```text
/hattrick Could this change lose a queued job during shutdown?
```

To request a response in another language, name it in your PR comment:

```text
/hattrick [language: Español] Review this change.
```

You can name a language in its own writing. Hattrick will try to write its
explanatory prose in that language while preserving code, paths, and source
links. Some fixed status labels may remain in English.

The Action returns `job-id` and the initial `status`. Research continues on the
service's durable queue after the workflow ends and replies on the PR. Hattrick can
also attach up to three findings beside exact changed lines. Reply beneath one of
those findings with `/hattrick <question>` to ask about it there. The private
GitHub App receives that signed review-thread event; it does not run the public
Action from the pull request's merge commit.

To research a specific chunk instead, select the relevant changed lines on the
current PR commit and leave an inline review comment with `/hattrick <question>`.
The selection anchors the review in its complete surrounding file context,
then answers in the same code thread. Subsequent `/hattrick` replies continue
the thread. There is no additional 30-line selection limit. Large inputs use
the service's existing code mapper; the report discloses the reviewed scope.
The current input ceiling is one million characters. Secret files and binaries
are excluded. Requests exceeding input capacity fail before research instead
of silently dropping selected source. Re-running
the same workflow recovers its accepted job. Use `/hattrick rerun <question>` only
when you deliberately want another report; normal service limits still apply.

The response is AI-generated research for engineers to review. Bounded evidence
and missing context can limit its findings. Report errors or unwanted outputs to
the support contact above. Private source is processed by the hosted service and
is not uploaded as a public Action artifact. Responses on public PRs are visible
to those PRs' readers.

## Status and troubleshooting

`queued` means accepted, not finished. Results can be `running`,
`partially_complete`, `completed`, `failed`, or `canceled`. A failed delivery does
not necessarily cancel already accepted research or its usage. Inspect the saved
job and rerun the same workflow before requesting a fresh report.

See [SUPPORT.md](SUPPORT.md) for setup errors, limits, and safe retry guidance.
Report security issues privately using [SECURITY.md](SECURITY.md).

## Development and releases

Run `node --check index.mjs` and `node --test index_test.mjs` on Node 24.
CI uses synthetic requests only: it does not buy research or access customer code.
The release checklist is in [RELEASING.md](RELEASING.md); draft Marketplace copy
is in [MARKETPLACE.md](MARKETPLACE.md). Neither document is a live listing.

