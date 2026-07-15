# Etymalia Delivery Roadmap

**Purpose:** The executable delivery plan for the web product.

**Current truth:** [`CURRENT_STATUS.md`](./CURRENT_STATUS.md)

**System contract:** [`GENERATION_SYSTEM.md`](./GENERATION_SYSTEM.md)

**Active handoff:** [`HANDOFF.md`](./HANDOFF.md)

## Locked operating model

| Concern | Decision |
| --- | --- |
| Product UX | Guided build and direct creative control share one brand state. A user can generate one asset, a named collection, a custom selection, or a complete kit at every relevant stage. |
| Personal generation | OpenAI OAuth and xAI/Grok OAuth are the first provider integrations. Provider accounts perform available model/media work; Etymalia owns creative controls, durable state, artifacts, and export. |
| SaaS durable work | Cloudflare Workflows + Queues. Workflows orchestrate; Queues buffer, retry, and route work. |
| Product truth | Supabase Auth, Postgres/RLS, private Storage, job ledger, asset ledger, and export ledger. |
| Current runner | Trigger.dev is transitional. Do not add feature work to it. |
| AWS | Preferred heavyweight compute platform. Current AWS runway is reserved for the EC2/open-weight GPU workload. |
| GCP | Vertex media lane. Cloud Run credit eligibility is unconfirmed and must not be assumed. |
| Local infrastructure | No local Docker dependency. |

## Milestone 0 — Cloudflare preflight and repository foundation

**Goal:** establish the real Cloudflare account/project boundary before application code depends on it.

### Deliver

- A dedicated Cloudflare worker package using `wrangler.jsonc`, with staging and production environments.
- Version-controlled bindings for one Workflow and the queue topology needed for the first full-kit workload.
- Generated Worker binding types committed or verified in CI.
- Worker test configuration using the Cloudflare Vitest pool.
- A secret-management procedure that never writes Supabase service credentials into source, `wrangler.jsonc`, logs, queue messages, or command-line arguments.
- A short operational runbook: deploy, dry-run, tail logs, inspect Workflow instances, inspect queue state, and replay dead-letter work.

### Verify

- `wrangler whoami` identifies the intended account.
- `wrangler deploy --dry-run` validates the worker configuration.
- `wrangler types --check` passes.
- Worker unit tests run without a live Cloudflare resource.
- Staging deployment creates the intended Workflow/Queue bindings without changing Supabase product data.

### Do not proceed until

- The Cloudflare account/project and environment names are confirmed.
- The secret boundary is reviewed.
- Staging can receive a harmless test request and report durable state.

## Milestone 1 — Portable generation request and runner ports

**Goal:** separate product behavior from Trigger and provider SDKs.

### Deliver

- A typed `GenerationRequest` model: workspace, brand, selected assets, input versions, priority, and idempotency key.
- A runner port with Cloudflare and transitional Trigger adapters.
- A provider port with logical capabilities rather than vendor/model strings in feature code.
- Database migrations that extend the existing job ledger with runner, request, priority, artifact-selection, terminal-state, and cancellation/supersession fields as required.
- Server-side authorization for every request against workspace role and future entitlement boundary.
- Tests for idempotency, malformed selections, role denial, state transitions, and safe error mapping.

### Verify

- Existing full-kit action calls the runner port, not `@trigger.dev/sdk` directly.
- The same request fixture runs against a fake runner in tests.
- A request cannot contain media bytes, private credentials, arbitrary provider/model names, or an asset outside the caller’s brand.
- Job records are queryable by workspace members and unwritable by browser clients.

### Do not proceed until

- Product code has one runner entry point.
- Trigger is isolated behind its adapter.

## Milestone 2 — Personal OAuth generation lane

**Goal:** make OpenAI OAuth and xAI/Grok OAuth the first live personal-generation integrations.

### Deliver

- Provider-specific OAuth adapters behind the provider port.
- Server-side authorization-code + PKCE flow using the provider’s current official application-registration requirements.
- Encrypted server-side token persistence, refresh, revocation, disconnect, and safe connection-state UI.
- Logical capability mapping for text, image, and video only where the authenticated provider account actually supports that capability.
- A personal-generation settings surface that shows connection state and never displays token material.
- Structured output validation and safe provider-error mapping.

### Verify

- A user can connect and disconnect each provider without tokens entering browser storage, logs, database rows outside protected storage, or exports.
- A disconnected provider cannot be invoked.
- Expired/revoked access produces a reconnect state, not a generic job failure.
- A connected provider can execute one bounded text-generation capability end-to-end before image/video capability is enabled.

### Do not proceed to media until

- Provider OAuth/API terms, scopes, and account entitlements are confirmed for the selected capability.
- Rate, concurrency, and cancellation behavior are implemented and tested.

## Milestone 3 — Cloudflare-backed selective generation

**Goal:** replace the full-kit-only interaction with direct, selective, durable generation.

### Deliver

- Cloudflare Queue producer from the runner adapter.
- Cloudflare Workflow that reloads versioned Supabase inputs and updates the existing job ledger.
- Independently retryable artifact steps for identity, favicon, and social collections.
- Priority routing for interactive single assets, standard collections, and background complete kits.
- Workspace job panel: queued/running/completed/failed, completed count, safe failure summary, retry eligibility, and cancellation where supported.
- Direct controls for one asset, identity collection, favicon collection, social collection, custom selection, and complete kit.

### Verify

- An authenticated production user can generate one asset, a selected collection, and a complete kit through Cloudflare.
- Successful sibling artifacts remain ready when another artifact fails.
- Every ready artifact has a private Storage object, matching `assets` record, lineage metadata, and short-lived authorized preview/download URL.
- A non-member cannot access jobs, assets, exports, or Storage objects.
- Queue retries and dead-letter handling are observable and replayable.

### Trigger retirement condition

Only after this milestone passes in production:

1. remove Trigger from application enqueue paths;
2. preserve historical Trigger records and artifacts;
3. revoke Trigger runtime credentials after confirming no active run depends on them; and
4. remove Trigger configuration/dependencies in one clean change.

## Milestone 4 — Reference import and creative direction

**Goal:** bring human visual direction into the shared brand state without automation overwriting taste.

### Deliver

- Image-only reference upload first, with explicit MIME, byte, count, and pixel limits.
- Private Storage path, `brand_references` record, signed preview, deletion, and retention behavior.
- Cloudflare-backed extraction job state.
- Palette and visual-direction suggestions as reviewable outputs.
- Explicit user actions to apply, ignore, compare, or retain suggestions; no silent token overwrite.

### Verify

- Invalid files are rejected before storage.
- Upload/delete updates Storage and `brand_references` atomically from the user’s perspective.
- Extraction result is linked to the exact reference and version.
- Applying a suggestion creates a new token/version lineage and does not destroy the previous brand direction.

## Milestone 5 — Guide and export completion

**Goal:** make every persisted artifact deliverable through individual, collection, custom, and complete-kit exports.

### Deliver

- Equivalent Typst and React-PDF guide prototypes based on the same document model and selected assets.
- A documented renderer decision using visual quality, deployment compatibility, performance, accessibility, and maintainability criteria.
- Guide PDF as a persisted asset with version lineage.
- Export selector for individual assets, named collections, custom selections, and complete kit.
- Manifest that lists exact included artifact IDs, paths, versions, and generator metadata.

### Verify

- Export contents match the selected ledger assets exactly.
- Private source artifacts cannot be downloaded by a non-member through an export URL.
- Regenerating an artifact does not silently change an existing export.

## Milestone 6 — Commercial and collaborative product

**Goal:** add product depth only after the request/job/asset/export system is production-proven.

### Deliver in this order

1. Google BYOK user settings and execution path, using the established credential boundary.
2. Email signature, card/QR/vCard, letterhead, and template system as persisted assets.
3. Workspace invitations, membership roles, and audit events.
4. Entitlement model enforced in server actions, runners, and exports.
5. Stripe only after plans, limits, merchant/tax responsibilities, webhook lifecycle, and managed-credit policy are defined.
6. Public export API only after the internal export contract is stable and audited.

### Verify

- Entitlements are enforced server-side, not only hidden in UI.
- Invitations, role changes, API credentials, billing events, and export access are auditable.
- Every paid or provider-funded action has a workspace-level limit and observable usage record.

## Milestone 7 — Heavy media and scale

**Goal:** use the strongest platform for work that Cloudflare should not own.

### Direction

- Keep personal provider OAuth for provider-hosted generation.
- Keep Cloudflare for SaaS orchestration and queueing.
- Use AWS when the workload requires heavyweight compute beyond the protected current EC2 GPU lane.
- Use Vertex for selected GCP media capabilities.

### Entry criteria

- A specific workload exists: video transcode, large vectorization, large document extraction, batch media rendering, or equivalent.
- Inputs, output format, latency target, cost budget, cancellation behavior, data residency, and expected volume are documented.
- The workload cannot meet the Cloudflare worker/workflow capability and cost envelope.

### Verify

- The heavy-compute adapter still honors the same generation request, job, asset, and export contracts.
- No raw media moves through browser requests or queue payloads.
- Cost, concurrency, failure recovery, and cancellation are observable before release.

## Official implementation references

- [Cloudflare Workflows](https://developers.cloudflare.com/workflows/)
- [Cloudflare Queues](https://developers.cloudflare.com/queues/)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- [Trigger.dev](https://trigger.dev/docs/introduction)
- [AWS Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)
- [Google Cloud Workflows](https://cloud.google.com/workflows/docs/overview)
