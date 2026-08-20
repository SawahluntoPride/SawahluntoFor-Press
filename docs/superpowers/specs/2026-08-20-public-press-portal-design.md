# Public and Press Portal Design

## Goal

Evolve the current Sawahlunto press cooperation application into a public information portal with a verified press contribution workflow and an operational admin dashboard. Preserve the existing visual language, typography, palette, logo treatment, spacing, and component style.

## Product Surfaces

### Public portal

- `/` is a balanced homepage with one featured news item beside one featured YouTube video, followed by latest news and latest videos.
- `/berita` lists published news with category filtering.
- `/berita/[slug]` displays a published article, author/source label, publication date, cover image, attachments where public, and related content.
- `/video` lists curated YouTube videos and their thumbnails.
- `/tentang` explains the public information service.
- `/masuk` is the press account login.

Only published content is visible publicly. Draft, submitted, rejected, change-requested, and private attachments remain inaccessible.

### Press portal

Press organizations can request an account through `/daftar`. Admin approval is required before the organization can submit content. The press dashboard provides:

- account and organization verification state;
- draft, submitted, in-review, changes-requested, approved, and published content;
- a direct article editor;
- optional supporting document and image uploads;
- optional YouTube URL submission;
- submission status, admin feedback, and revision history;
- organization profile and permitted access information.

Press content follows this state flow:

`DRAFT -> SUBMITTED -> IN_REVIEW -> CHANGES_REQUESTED | APPROVED -> PUBLISHED`

Admins may reject a submission. Rejected content can be duplicated or revised into a new submission without exposing the rejected version publicly.

### Admin operations

- `/admin` shows operational metrics and prioritized queues.
- `/admin/content` lists news and video submissions with filters by type, status, category, source, and date.
- `/admin/content/[id]` shows full content, metadata, author organization, files, YouTube preview, review history, and publish controls.
- `/admin/press` manages account and organization verification, access state, and press profile details.
- `/admin/documents` manages uploaded files and verification state.
- `/admin/categories` manages public categories.

The dashboard must make these facts visible without opening each record: total published content, drafts, pending review, changes requested, rejected, scheduled content, verified press organizations, unverified organizations, unreviewed files, and recent activity.

## Content Model

Add a content domain beside the existing proposal/document domain rather than replacing the proposal workflow immediately.

### NewsPost

- title, slug, excerpt, body, cover image, category, source type, author user, author organization;
- status, submittedAt, reviewedAt, publishedAt, scheduledAt;
- rejection/change-request note;
- createdAt and updatedAt.

Source types distinguish official government content from press contributions. Public labels are `Berita Pemerintah` and `Kontribusi Media`.

### Video

- YouTube URL, normalized video ID, title, description, thumbnail URL, channel title;
- source type, status, featured flag, publishedAt, submittedBy;
- optional official-feed marker for future automatic synchronization.

The first release supports manually curated YouTube URLs. The data model and configuration leave room for an official channel or playlist feed later. The public UI must tolerate unavailable thumbnails or stale metadata with a non-breaking fallback.

### ContentAsset

- content ID, file name, stored file name, URL, MIME type, byte size;
- asset kind such as cover, inline image, supporting document, or press release;
- uploadedBy, verification state, verifiedBy, verifiedAt, createdAt.

### ReviewEvent

- content ID, admin user, previous status, next status, note, createdAt.

Review events provide an audit trail and allow the press user to understand why content changed state.

### Press access

Reuse the existing `User`, `Organization`, and role model where possible. Add an explicit organization/account verification state and submission permission state rather than inferring access only from the role. A media user may sign in while still being unable to submit until the organization is approved.

## Public Visibility Rules

- Public queries return only published content whose publication date is not in the future.
- Press drafts, review content, rejected content, and private assets are never returned by public routes or public APIs.
- YouTube embeds use the normalized video ID and safe provider URLs; arbitrary external iframe URLs are not accepted.
- Uploaded files are private by default. An asset becomes public only when the related content is published and the asset is marked public.
- Admin routes require the admin role. Press routes require an authenticated media user. Organization verification is required for content submission.

## Admin Workflow

1. Admin sees queue counts and recent activity.
2. Admin opens a content record and reviews title, body, category, source, files, and YouTube preview.
3. Admin can request changes with a required note, reject with a required note, approve, publish immediately, or schedule publication.
4. Every transition creates a review event.
5. Publishing updates public listings and homepage eligibility.
6. Press users see the latest status and notes in their dashboard.

## Error and Empty States

- Empty public listings explain that no content is available in the selected category.
- A missing YouTube thumbnail uses a local neutral fallback and keeps the video link usable.
- Upload validation enforces allowed MIME types, file size limits, safe filenames, and authenticated ownership.
- Failed metadata fetching never blocks manual title and thumbnail fallback entry.
- Unauthorized access returns the existing login/not-found behavior rather than leaking record existence.

## Phased Delivery

1. **Foundation and public portal**: schema additions, public queries, homepage replacement, news/video routes, manual YouTube curation, and seed data.
2. **Press workflow**: verified account state, article editor, asset uploads, submission state changes, feedback, and press dashboard.
3. **Admin operations**: content review queue, organization verification, review events, metrics, publishing controls, and category management.
4. **Automatic YouTube feed**: configure channel or playlist synchronization after the official source is supplied.

The first implementation phase is the public portal and its data foundation. The visual design remains the current design system throughout.

## Testing Strategy

- Unit-test status transitions, public visibility filtering, YouTube URL normalization, and file validation.
- Add route-level checks for public published-only behavior and protected press/admin behavior.
- Add focused Playwright coverage for public homepage navigation, press login boundary, and admin review visibility once those routes exist.
- Run lint, typecheck, build, and the focused browser tests after each phase.
