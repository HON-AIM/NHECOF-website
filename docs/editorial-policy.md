# NHECOF Editorial Policy

> **Version:** Draft — for internal review
> **Last updated:** September 2025

## Purpose

This policy defines how NHECOF creates, reviews, and publishes content on its website. It ensures all public health and nutrition information is accurate, evidence-based, and clearly attributed.

---

## Publishing Workflow

### 1. Content Creation

- A contributor drafts content using Sanity Studio.
- All drafts begin with `reviewStatus: "draft"`.

### 2. Evidence Review

- A qualified nutrition or health reviewer checks all claims, references, and cautions.
- The reviewer confirms the content meets NHECOF's evidence standards (see below).
- The reviewer sets `reviewStatus: "approved"` or `"needs-revision"`.

### 3. Editorial Review

- A content manager checks grammar, readability, formatting, images, and metadata.
- The content manager confirms key takeaways, SEO, and mobile readability.

### 4. Publication

- An authorised publisher publishes the content.
- The system records the publication date and schedules the next review.

### 5. Ongoing Review

- Every published health article is reviewed at least annually.
- The `nextReviewAt` field determines when re-review is due.
- Outdated content is revised, redirected, or archived.

---

## Evidence Standards

### Preferred Sources

- **World Health Organization (WHO)**
- **Nigeria's Federal Ministry of Health** and relevant public agencies
- **Food and Agriculture Organization (FAO)**
- **UNICEF**
- **Peer-reviewed systematic reviews** and high-quality studies
- **Recognised professional nutrition and medical organisations**
- **Nigerian studies** where local context materially matters

### Standards

- References must support the actual claim made.
- Blog posts and commercial wellness pages must not be used as primary evidence for health claims.
- Statistics must show a source and relevant date.
- Every article must show when it was last reviewed.

---

## Content Safeguards

- Educational content must **not diagnose** readers.
- Disease-related articles must **encourage appropriate professional care**.
- Pregnancy, infant feeding, supplements, and medication-interaction content requires **qualified review**.
- All statistics must show a **source and relevant date**.
- Conflicts of interest and sponsored content must be **disclosed**.
- Corrections must be logged and significant changes acknowledged.

### Prohibited Language

Content must not use words that imply medical cures or guaranteed outcomes, including but not limited to:

> cure, detox, miracle, guaranteed, heals, remedy, prevents, treatment, secret, breakthrough

If these words appear in body text, the system displays an editorial warning explaining the rule.

---

## Health Content Publication Requirements

Before any article or food profile can be published, the following fields must be complete:

| Field | Requirement |
|---|---|
| Author | Named person with relevant qualifications |
| Reviewer | Different qualified person from the author |
| References | At least 1 authoritative reference |
| Published Date | Date of initial publication |
| Last Reviewed | Date of most recent review |
| Next Review | Date by which re-review is due |
| Review Status | Must be "approved" |
| Key Takeaways | At least 2 (articles only) |
| Cautions | Non-empty (food profiles only; "None known" is acceptable) |

---

## Image Consent Policy

- All identifiable images require **publication consent** from the individual (or guardian for minors).
- Images with `consentStatus !== "cleared"` are **blocked from publication**.
- Images containing minors without a recorded guardian consent are **blocked from publication**.
- Captions and credits are required for all non-decorative images.

---

## Corrections

If an error is found in published content:

1. The content is flagged for revision.
2. The error is corrected and the revision date is updated.
3. Significant changes are noted in an editorial changelog.
4. The next review date is set.

---

## Roles and Responsibilities

| Role | Access |
|---|---|
| **Administrator** | Configuration, users, and all content |
| **Content Manager** | Manage articles, quotes, food profiles, resources, and homepage selections |
| **Nutrition Reviewer** | Review health content and update review fields |
| **Outreach Manager** | Manage outreaches, events, photographs, and metrics |
| **Contributor** | Create and revise drafts without final publication authority |

> **Note:** If the Sanity plan does not support custom roles, reviewer/publisher separation is enforced through the `reviewStatus` gate. The publish action blocks publication unless `reviewStatus === "approved"`.

---

## Contact

For editorial enquiries or to report an error, contact: [editorial@nhecof.org]
