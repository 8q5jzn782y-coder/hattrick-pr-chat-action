# Release checklist

This checklist prepares a release; it does not publish one or accept legal terms.
The wrapper is MIT licensed. The hosted service remains proprietary.

## Before the first Marketplace Action release

- [ ] General customer onboarding works on a non-Hattrick repository, with an
  authorized installation, customer entitlement, workflow registration, and worker.
- [ ] A fresh customer completes install, question, result, follow-up, uninstall,
  and denied-access tests without private operator credentials in their workflow.
- [ ] The deployed backend and worker contain the reviewed citation/link changes;
  a local preview or directly invoked test report does not prove deployed readiness.
- [ ] Support and privacy/terms links work and describe actual code processing,
  provider disclosures, retention, deletion, and account cancellation behavior.
- [ ] The release contains only the reviewed public wrapper files and synthetic
  tests. No private service history, code, reports, prompts, or credentials appear.
- [ ] CI passes on Node 24, including the no-research Action startup smoke test.
- [ ] Independently review dependencies (currently no runtime dependencies),
  permissions, pinned workflow actions, and the exact release commit.
- [ ] Confirm the proposed name is available in the Marketplace publishing UI.
- [ ] The owner accepts the Marketplace Developer Agreement and completes 2FA.

Do not mark onboarding complete by deleting repository allowlists or bypassing
tenant, workflow, spending, or installation checks. The controlled pilot is not
ready for an unrestricted customer launch.

## Publishing, after those gates pass

1. Review the wrapper diff and run `node --check index.mjs` and
   `node --test index_test.mjs` in an independent checkout.
2. Create a versioned release for that reviewed commit and choose the Marketplace
   category. Publish only after the owner reviews the listing and agreements.
3. Update the example workflow and customer instructions to the full released
   commit SHA. A major-version tag may be convenient, but full SHA pins are safer.
4. Perform a post-release install test on a separate customer test repository.
   Record results without publishing customer source or internal traces.

GitHub Action listings and GitHub App listings are different. A paid Marketplace
App requires its own publisher verification, pricing, and purchase-event handling.
An Action release is not a substitute for that approval or billing integration.

Official references:
- https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace
- https://docs.github.com/en/apps/github-marketplace/creating-apps-for-github-marketplace/requirements-for-listing-an-app
