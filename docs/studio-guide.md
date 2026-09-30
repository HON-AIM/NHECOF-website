# NHECOF Studio Guide

> **For:** content managers, writers, nutrition reviewers, outreach managers.
> **You do not need to write code.** If you can use Word and send an email, you can do everything in this guide.
> **Version:** 1.0 · Companion to `docs/editorial-policy.md` and `docs/content-guidelines.md`.

---

## 0. Before you start

You need:

- a Sanity account that NHECOF has added to the Studio,
- the Studio address (something like `https://<project>.sanity.studio`),
- your login details, normally an email link rather than a password.

If you cannot sign in, that is an access problem, not a content problem. Ask the
administrator to add you. Do not ask a colleague to share their login — the
Studio records who changed what, and shared logins break that record.

### What you can and cannot see

| You can | You cannot |
| --- | --- |
| Create and edit drafts | Undo a published change that someone else made |
| Submit content for review | Publish health content before a reviewer approves it *(see note)* |
| Approve content if you are a named reviewer | See content from another Sanity project |
| Schedule and archive your own items | Change the shape of the site or its design |

> **Please read this once, it matters.** For Articles and Food Profiles, the
> Studio shows a **"Publish (blocked)"** button until a reviewer approves the
> item. That button is a reminder, not a lock. The normal **Publish** button is
> still there, and the website itself hides anything whose Review Status is not
> *Approved* — so if you publish early, the content is invisible on the site and
> you will think the site is broken. It is not. It is doing exactly what it
> should. **Always wait for approval before publishing.**

---

## 1. The five review statuses

Every Article, Food Profile and Quote has a **Review Status**. This is the
single most important field in the Studio.

| Status | What it means | Who sets it | On the website? |
| --- | --- | --- | --- |
| **Draft** | Still being written. The default for anything new. | Author | No |
| **Submitted for Review** | Finished and waiting for a reviewer. | Author | No |
| **Approved** | A qualified reviewer has checked it. | Reviewer only | **Yes** |
| **Needs Revision** | A reviewer sent it back with changes needed. | Reviewer only | No |
| **Archived** | Deliberately withdrawn, kept for the record. | Content manager | No |

Two rules to memorise:

1. **Authors never set their own content to *Approved*.** If you wrote it, you
   ask someone else to review it.
2. Only *Approved* content appears on the website or in the sitemap.

In the Studio's left sidebar you will see a coloured badge next to each document
so you can tell status at a glance: green for approved, orange for submitted,
red for needs revision.

---

## 2. Task A — write an article

> Screenshots to add: [the Studio sidebar with "Content" expanded] ·
> [an open Article form] · [the Review Status radio buttons]

1. In the left sidebar click **Content**, then **Article**. Click the **+** button.
2. Fill in **Title**. Keep it under 80 characters and say what the reader will
   learn. "Eating well on a low budget" beats "Healthy eating tips".
3. **Slug** fills itself from the title. Read it. If it is ugly or wrong, edit it
   now — see [Section 8](#8-task-g--redirect-after-you-change-a-slug) if you
   have to change it later.
4. **Summary**: two or three sentences, under 300 characters. This appears in
   search results and link previews, so write it for someone who has not clicked.
5. **Author**: search for and select a person. This must be a real `Person`
   record with a role.
6. **Reviewer**: select the qualified reviewer who will check this. Agree this
   with the reviewer *before* you start writing, not after.
7. **Categories**: add at least one. The Studio will not let you save without it.
8. **Key Takeaways**: at least two short bullet points. These are the most-read
   part of the article — most people read these and stop.
9. **Body**: the article itself. Use the **H2** and **H3** heading buttons.
   Never skip a heading level. Keep paragraphs to three or four sentences.
10. **References**: at least one. Add the title, the publisher, the web address
    and the date you looked at it. See [Section 11](#11-photos-and-people) if
    you are unsure what counts as a good reference.
11. **Published Date**: required for articles. For a first draft, put today's
    date. You will update it when you actually publish.
12. Leave **Next Review Due** empty for now. You set it at approval time.
13. **Save draft.** Do not publish yet.

### The three fields the Studio will not let you skip

| Field | Rule | Why |
| --- | --- | --- |
| `Categories` | at least 1 | Without it the article cannot be found by browsing or filtering |
| `Key Takeaways` | at least 2 | Readers scan these; an empty list wastes the page |
| `References` | at least 1 | Unreferenced health content cannot be published at all |

If you see a red error under a field, the Studio is telling you the article
cannot be published as it stands. Read the message — they are written to be
actionable.

---

## 3. Task B — submit for review

1. Open the draft.
2. Set **Review Status** to **Submitted for Review**.
3. Add a short message to the reviewer. In the Studio, use the **comment** field
   in the top-right of the document, or send an email. Tell them:
   - what the article covers,
   - which claims you think are the riskiest,
   - what you could not verify.
4. Press **Save draft**, then close the document.

> **Screenshot to add:** the comment box with a submission note.

Do not set the status yourself and expect the reviewer to notice. The Studio
does not send a notification. **The reviewer only finds out if you tell them.**

---

## 4. Task C — review and approve

The reviewer opens the draft and works through this list.

1. **Read it as a member of the public would.** Is the language clear? Is
   anything written for a health professional rather than a parent?
2. **Check every claim against its source.** Open each reference. Does the
   source actually say what the article says it says? A reference that is on
   topic but does not support the sentence is not good enough.
3. **Look hard for health claims.** Words like *cures*, *treats*, *heals*,
   *prevents*, *guaranteed* and *detox* must not be used to describe food. See
   [Section 12](#12-what-the-tools-will-not-check-for-you).
4. **Check the cautions.** Does the article tell a reader when to see a
   professional instead of trying something themselves?
5. **Check the images.** Every image needs consent cleared. See
   [Section 11](#11-photos-and-people).
6. **Set Review Status to Approved** — but see step 7 first.
7. **Set the review dates:**
   - **Last Reviewed** — today's date.
   - **Next Review Due** — one year from today, or sooner if the guidance is
     likely to change. **Do not leave this empty.** An empty date means the item
   will never appear in the weekly reminder and will quietly go stale.

If changes are needed, set **Needs Revision** and leave a comment saying exactly
what to change. "Not good enough" is not a review.

> **Screenshot to add:** an approved article showing Review Status = Approved,
> Last Reviewed and Next Review Due filled in.

---

## 5. Task D — schedule or publish

You may publish straight away, or hold an item until a chosen day.

**To hold it until a chosen date:** the Studio does not have a built-in
scheduled-publish button. The NHECOF way to do this is:

1. Finish and approve the item.
2. Note the intended date somewhere shared with the content manager.
3. On that morning, open the document and press **Publish**.

Do this for time-sensitive material such as a dated announcement or a
campaign. For everything else, publishing when it is ready is fine — articles
do not go stale just by being live.

> **Screenshot to add:** the Publish button, and the "Published" confirmation.

### Quotes also have a display window

Quotes are different from articles. A Quote has **Display Start Date** and
**Display End Date**, and the website picks the quote to show for today's date.
To run a quote for a campaign or a season, set both dates. To run it forever,
leave **Display End Date** empty.

A quote only ever appears on the site if it is **both** Active **and** Approved.

---

## 6. Task E — correct a mistake

When something published turns out to be wrong, fix it in this order.

1. **If it is a health error, fix it first and tell the reviewer.** Do not wait
   for the next scheduled update. Change the incorrect sentence, save, publish.
2. **Update Last Reviewed** to today and set a new **Next Review Due**.
3. **Leave a comment** saying what was wrong, what you changed, and on what
   date. This is the correction log. Someone will read it one day.
4. **If a reader reported it, acknowledge it** in the reply and record the date.
5. **If the error was in a reference**, fix the reference too, and check
   whether the same reference is used in other articles. Use Studio search for
   the source's title.

**Corrections are never quietly edited.** If you change the meaning of
something, not just the spelling, say so in the comment and in the change note.

---

## 7. Task F — archive

Use **Archived** for content that was published and should no longer be shown,
but which you want to keep as a record — for example, a one-off campaign page
about a past event.

1. Set **Review Status** to **Archived**.
2. Save and publish.
3. The page disappears from the site and from the sitemap.

**Archived is not deleted.** The document stays in the Studio, and its history
is intact. Use Archived rather than deleting whenever you might need to show
what was published before.

**Do not archive to hide a mistake.** Fix it. Archiving hides the evidence.

---

## 8. Task G — redirect after you change a slug

Changing a published article's slug breaks its address. Anyone who has the old
link, or who found it in a search engine, gets an error. You must set up a
redirect.

1. Note the **old slug** before you change it.
2. Change the slug and publish.
3. In the left sidebar click **Site**, then **Redirect**.
4. Click **+** and fill in:
   - **From**: the full old path, starting with a slash and including the folder —
     for example `/nutrition/articles/my-old-article-title`, not just
     `my-old-article-title`.
   - **To**: the new full path in the same form.
   - **Status Code**: **301 (Permanent)**. Use 301 for a permanent move. Only use
     302 for something genuinely temporary.
   - **Note**: one line saying what changed and why.
5. Publish the redirect.

> **Screenshot to add:** a completed Redirect form with From, To and 301.

The folders are:

| Content type | Path starts with |
| --- | --- |
| Article | `/nutrition/articles/` |
| Food Profile | `/nutrition/foods/` |
| Outreach | `/outreaches/` |
| Resource | `/resources/` |
| Programme | `/what-we-do/` |

**How to check it worked:** open the old address in a private/incognito window.
You should land on the new page. If you see a 404, the `From` path is wrong —
it is nearly always missing the folder name at the front.

Keep redirects for at least two to three months, then review them.

---

## 9. Where things live in the sidebar

| Sidebar item | Contains |
| --- | --- |
| **Content** | Article, Food Profile, Quote, Page |
| **Nutrition Hub** | Category, Resource |
| **Outreach & Impact** | Outreach, Impact Metric, Impact Milestone, Event |
| **People** | Person, Partner |
| **Site** | Site Settings, Homepage, Redirect |
| **Content Due for Review** | A live list — see [Section 13](#13-the-weekly-review-reminder) |

> **Programme is not in the sidebar.** This is a known gap. To reach a Programme,
> press the Studio search button (magnifying glass) and type the programme name.
> Please report it to the administrator so it can be added.

---

## 10. Add an outreach record

> Screenshots to add: [an outreach form] · [the location object] ·
> [the Photographs list with consent fields expanded]

An outreach record is the evidence that an event happened. It is also what
feeds the numbers on the Impact page, so accuracy matters more than speed.

Create it under **Outreach & Impact → Outreach → +**.

### Field-by-field

| Field | What to enter | Watch out for |
| --- | --- | --- |
| **Title** | What the event was, e.g. "Nutrition talk for expectant mothers" | Under 80 characters |
| **Theme** | The main health or nutrition subject | One clear topic, not a list |
| **Date** | The day it happened | Required. Use the actual date, not the date you typed it up |
| **Status** | **Completed** for something that already happened | See the warning below |
| **Location** | Community / Town, Local Government Area, State | The state list is a dropdown of all 36 states and the FCT |
| **Venue** | The hall, market, school or site | Optional for a talk that has not happened yet |
| **Summary** | Two or three sentences about the event | Under 300 characters |
| **Objectives** | What you set out to do | Bullet points work well |
| **Target Population** | Who it was for | e.g. "Pregnant women and caregivers of children under 5" |
| **Activities Conducted** | What actually happened | Be specific: "waist and blood-pressure checks", not "health talk" |
| **Total Attendance** | Head count | Whole number, no thousands separators |
| **Number Screened** | How many people had a health screening | Whole number. Leave empty if nobody was screened — do not put 0 |
| **Key Results** | Repeatable rows: a label, a number, a short description | Use this for measurable outcomes |
| **Volunteers & Professionals** | Who took part | Link to existing Person records where possible |
| **Partners & Sponsors** | Organisations that supported it | Link to existing Partner records |
| **Key Findings / Outcomes** | What you learned | The honest version, including what did not work |
| **Follow-up Activity** | What happens next | e.g. "Referral of 12 women to the clinic on 14 January" |
| **Photographs** | Images, each with its own consent fields | See [Section 11](#11-photos-and-people) |
| **Testimonial** | Quote, who said it, and consent obtained | Only if you have permission in writing |
| **Verified by Outreach Manager** | Tick once a manager has checked every number | Leave unticked until checked |

> **Warning — the default is wrong for you.** A new Outreach record opens with
> **Status = Completed**, even though you are creating it before the event
> happens. If the event has not happened yet, set **Status = Upcoming** and
> publish it as an announcement. Change it to **Completed** and fill in the
> numbers afterwards. Getting this wrong publishes a completed event that never
> happened.

### Why the Impact page updates by itself

You do not type totals into the Impact page. The Impact page **adds up your
outreach records**. Here is the chain, so you can explain it to anyone who asks:

```
Outreach record published
        ↓  Total Attendance and Number Screened
Website reads every published outreach
        ↓  adds the numbers together
Impact Metric (People Reached, etc.)
        ↓  the figure shown on the Impact page
```

So:

- **Publish an outreach record and the Impact page can change.** That is
  intended.
- **If the Impact page does not change, the reason is almost always one of:**
  the outreach is not **Published** (a saved draft is invisible), its Status is
  still **Upcoming**, its Review Status is not **Approved**, or the Impact
  Metric is set to **Manual**, in which case someone typed the number in by hand
  and your new record will not be counted until that metric is switched to
  **Computed**.

### Manual versus computed metrics

An **Impact Metric** has a **Basis** field:

- **Computed** — the number is added up from published outreach records. Choose
  this unless you have a good reason not to. It cannot drift out of date.
- **Manual** — you type the number yourself. Studio then asks you for a
  **Verified By** name and an **Evidence Note** saying where the number came
  from. Use this only for figures that genuinely do not come from a single
  outreach, such as a funding total.

**Never publish a "people reached" total that no one can trace back to outreach
records.** If two totals disagree, the traced one wins.

---

## 11. Photos and people

Every image in the Studio asks you the same four questions. They are not
optional decoration — they are the record that NHECOF has permission to publish
the photograph.

| Field | What it means |
| --- | --- |
| **Alt text** | What a blind reader needs to know. Required unless the image is marked decorative. Describe what is happening, not the styling. |
| **Decorative** | Tick only for pure decoration such as a background shape. Alt text is then not required. |
| **Caption** | The line printed under the photo, if any |
| **Credit** | Photographer, or `NHECOF` |

And the two that protect people's rights:

| Field | What it means |
| --- | --- |
| **Consent Status** | `Cleared for publication` · `Consent pending` · `Not for publication` |
| **Does this image show anyone under 18?** | Yes or no. Ticking Yes reveals the guardian field. |
| **Guardian Consent Recorded** | Only appears when the answer above is Yes. Studio blocks publication until this is ticked. |

### The rules that do not bend

**Images of children.** Anyone under 18.

1. Tick **"Does this image show anyone under 18?"** → Yes.
2. Tick **Guardian Consent Recorded** only when a parent or guardian has agreed
   **in writing**, naming the event and saying the photo may be published.
3. If you cannot produce that written agreement, set **Consent Status** to
   `Not for publication` and leave the image out. An image of a child without
   written guardian consent does not go on the website, whatever else is true
   about it.
4. Prefer images that show hands, backs, or a group shot from a distance where
   a child is not individually identifiable, unless you have that consent.
5. A verbal "yes" at the event is not sufficient. Written only.

**Images of pregnant women, breastfeeding mothers and women in traditional or
private dress.** These are adults, so the under-18 rule above does not apply,
and the Studio has no separate tick box for them. The rule is therefore manual
and equally strict:

1. **Written consent only**, on the same basis as children. Use the same consent
   wording, with the guardian fields left blank.
2. Record the consent in the same place you record other outreach paperwork, and
   make sure the name on the file matches the **Attribution** on any testimonial
   from the same person.
3. **Do not photograph or publish a medical or antenatal screening result**, a
   blood-pressure reading, a weight, a test result, or any part of a
   screening record. Publish the *number of people screened* as an aggregate.
   Never publish an individual's result, even with consent. This one is not
   negotiable and there is no consent form that makes it acceptable.
4. Be careful with modesty. Avoid images a woman would not want shown to a
   whole community, and check with her before a talk as well as afterwards.
5. If you are unsure whether a photograph is appropriate, do not use it. The
   cost of skipping a good photo is far lower than the cost of publishing one
   that harms someone.

### Before you upload

- Compress large photos first. Aim for under 2 MB.
- Use landscape orientation for feature and hero images.
- Use a width of at least 1200 px for a featured image.
- Name the file something meaningful, not `IMG_4821.jpg`.

The full checklist is in
[`docs/templates/image-consent-checklist.md`](templates/image-consent-checklist.md).

---

## 12. What the tools will not check for you

This section is deliberately blunt. Each of these is a real limitation of the
current setup, and each one is a place where a human being must be careful.

1. **The prohibited-word list is not active.** NHECOF has a list of words that
   must never be used to describe food — *cures, treats, heals, prevents,
   detox, detoxify, miracle, guaranteed, remedy, secret, breakthrough,
   magical, instant, immediate, ultimate, and similar*. The Studio **does not
   currently warn you** when you type one. You must check by eye. Search your
   draft for "cure", "treat", "heal", "prevent" and "guarantee" before you
   submit it.

2. **The publish gate is a reminder, not a lock.** Covered in
   [Section 0](#0-before-you-start).

3. **"Can Act as Reviewer" does not stop you.** A Person record has a
   `Can Act as Reviewer` tick box, but the Studio will still let you pick anyone
   as a reviewer, even someone whose box is unticked. Choosing a qualified
   reviewer is your responsibility.

4. **There is no preview of the finished page.** The Studio shows you the form,
   not the website. To see the real page, publish and open the live URL.

5. **"Last Reviewed" and "Next Review Due" are never required.** You can leave
   them blank and the Studio will not complain. Blank means the item never
   appears in the weekly reminder.

6. **On the outreach page, image consent is not currently enforced by the
   website.** The outreach page displays your photographs and assumes consent
   has been given, rather than checking the Consent Status you set. Until this
   is fixed, **the only protection is the person setting the field**. Treat
   `Consent Status` as if it were the last line of defence, because at the
   moment it is.

7. **The social-sharing image has no consent fields.** A separate image chooser
   appears under SEO Metadata. It is not connected to the photo consent system.
   Do not use a photograph of a child or a recognisable person there.

---

## 13. The weekly review reminder

Every Monday morning the content manager gets an email listing Articles and
Food Profiles that are due or overdue for review.

**What appears in that email:**

- Everything with **Review Status = Approved** whose **Next Review Due** date
  has already passed, listed as overdue with the number of days.
- Everything due in the next 30 days.
- Nothing else. If the list is empty, the job sends no email at all. That is
  normal and is not a fault.

**What does not appear, and why:**

- Drafts and anything Submitted for Review — only approved content is tracked.
- Articles or Food Profiles with a blank **Next Review Due** date.
- **Quotes, Pages, Resources, Programmes, Outreach records and Events.** These
  content types do not have a Next Review Due field at all, so nothing reminds
  you to check them. For those, review them yourself — a yearly reminder in your
  own calendar is a good idea.
- Anything whose Next Review Due is more than 30 days away.

The same list is on the left of the Studio under **Content Due for Review**, so
you can see it without waiting for the email.

**To run it yourself,** ask the administrator for the "Review Reminders"
workflow in GitHub, or run it locally:

```bash
pnpm review:reminders:dry     # render the email, send nothing
pnpm review:reminders         # actually send it
pnpm review:reminders:test    # run the tests for the reminder logic
```

---

## 14. Troubleshooting

| What you see | What it means | What to do |
| --- | --- | --- |
| Cannot sign in | Not yet added to the Studio | Ask the administrator |
| Red "required" message under a field | The field must be filled before publishing | Fill it, or ask the reviewer if it is genuinely not applicable |
| "At least one reference is required" | No source added | Add a real source. Do not publish without one |
| My article is published but not on the website | Review Status is not *Approved* | Ask a reviewer to approve it |
| Content Due for Review is empty | Nothing approved is due, or dates are blank | Check that **Next Review Due** is filled in |
| Old link gives a 404 | No redirect set up | [Section 8](#8-task-g--redirect-after-you-change-a-slug) |
| Cannot find Programme in the sidebar | Known gap | Use Studio search |
| Cannot find a person | They have no Person record yet | Ask the administrator to create one first |
| A field I expected is missing | Different content types have different fields | Check the table in [Section 10](#10-add-an-outreach-record) |

---

## 15. Related documents

| Document | What it is for |
| --- | --- |
| `docs/editorial-policy.md` | The rules, and who is accountable for them |
| `docs/content-guidelines.md` | How to write: tone, spelling, structure |
| `docs/templates/article-outline-template.md` | Blank structure for a new article |
| `docs/templates/food-profile-template.md` | Blank structure for a new food profile |
| `docs/templates/outreach-record-checklist.md` | Before/after list for recording an outreach |
| `docs/templates/quote-submission-form.md` | How to send a quote in for approval |
| `docs/templates/image-consent-checklist.md` | The photo consent rules in full |
| `docs/launch-content-tracker.md` | What still has to be written before launch |
| `docs/ai-drafting-prompt.md` | How to use AI to draft — and the limits on it |
