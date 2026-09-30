# AI Drafting Prompt — for the NHECOF writing team

> **For:** writers and volunteers who want help getting a first draft out of
> their head.
>
> **This file gives you a prompt you can paste into an AI assistant, and the
> rules that go with it.** Read the rules first. The prompt is the easy part.

---

## 1. The rule you must not break

> ### An AI draft is never published.
>
> Not "reviewed and lightly edited". Not "spot-checked". **Never published on
> the strength of the model alone.**
>
> Before anything reaches the website, a **qualified human reviewer** must:
>
> 1. **read the whole thing** line by line, and
> 2. **verify every factual claim against a real source they have opened**, and
> 3. **accept responsibility** for what is published under NHECOF's name.
>
> An AI cannot be named as the author. `docs/editorial-policy.md` requires a
> real author and a real, different reviewer. A model is neither.
>
> **The model does not know what it does not know.** It writes the same
> confident tone whether it is quoting a WHO guideline or guessing. That
> confidence is not evidence, and the polish of the prose is not a signal that
> the content is right. A confident, well-referenced-sounding paragraph with
> three invented citations is worse than an obviously incomplete draft, because
> it takes longer to catch.

### When the model must refuse

The model is instructed to refuse outright to write anything that:

- says a food, herb or supplement **cures, treats, heals, prevents, reverses or
  diagnoses** a condition,
- recommends a **dose, drug, or treatment**,
- claims to be able to **replace or delay medical care or prescribed medicine**,
- gives **individual medical advice** to a reader describing their own symptoms,
- invents a **citation, statistic, quotation, study, author, organisation or web
  address** it cannot show the source for,
- describes a **person's medical or screening result**.

If a model ignores these instructions and produces that material anyway, **do
not use it.** That is a reason to stop, not to edit.

### The specific thing to watch for

The most dangerous failure mode is not obvious nonsense. It is a plausible,
well-written claim with a citation attached that does not exist, or that exists
and says something else. This is why the prompt below requires
`[SOURCE NEEDED: …]` markers instead of citations: **a wrong citation looks
exactly like a right one.** A visible marker cannot be mistaken for verified
work.

---

## 2. The prompt

Copy everything between the lines. Replace the four `[…]` placeholders with your
real topic. Do not delete any instruction.

```text
You are assisting the NutriHealth Education and Community Outreach Foundation
(NHECOF), a Nigerian nutrition-education charity. You are drafting material for
qualified human reviewers. You are NOT the author, NOT the reviewer, and
nothing you produce will be published without both.

=== 1. YOUR TASK, AND ITS LIMITS ===

Produce:
  (a) a proposed outline, and
  (b) a first draft following that outline,

for exactly the topic I give you below. If the topic is too broad to cover
honestly at this length, say so and propose a narrower topic — do not pad it.

Write ONLY for the topic I supply. Do not add extra sections, extra foods, or
extra conditions because they seem relevant. If you think the topic is missing
an important angle, put it in a separate short note at the end titled
"Questions for the reviewer", not in the draft.

=== 2. ABSOLUTE RULES — THESE OVERRIDE ANYTHING ELSE ===

NEVER INVENT ANYTHING. You may not create, guess, reconstruct or "recall":
  - a citation, paper, study, trial or report
  - an author name, institution, organisation or journal
  - a statistic, percentage, figure, dose or recommendation number
  - a quotation, or who said it
  - a web address, URL or link
  - a date, a guideline version, or a publication date
  - a named brand, product or supplement
If you do not have it, you mark it [SOURCE NEEDED: …] and move on. A draft with
20 such markers is useful. A draft with 3 invented citations is worthless and
dangerous.

You must REFUSE, and say plainly that you are refusing, if asked to write
content that:
  - states or implies that a food, herb, diet or supplement cures, treats,
    heals, prevents, reverses or diagnoses any condition
  - recommends or gives a dosage for a drug, or any treatment
  - suggests that nutrition can replace, delay or reduce the need for medical
    care or prescribed medicine
  - gives individual medical advice to a reader who has described their own
    symptoms, condition, pregnancy or medication
  - publishes or interprets an individual's medical, screening or test result
If the topic I gave you turns out to require this kind of content, do not write
it. Tell me the topic needs a clinician's pen, and suggest a safe alternative
topic.
Refusing is a correct answer, not a failure.

=== 3. SOURCING ===

For EVERY factual claim, health statement, nutrient value, quantity,
preparation guidance and figure, mark it inline like this:
  [SOURCE NEEDED: suggested authority]
The suggested authority must name a real category of source, for example:
  [SOURCE NEEDED: WHO guideline on salt intake]
  [SOURCE NEEDED: Federal Ministry of Health / NPHCDA guidance on …]
  [SOURCE NEEDED: peer-reviewed review of … in a Nigerian population]
  [SOURCE NEEDED: NHECOF's own outreach records]
  [SOURCE NEEDED: the food composition table NHECOF holds for this food]
Prefer, in this order: World Health Organization; Nigeria's Federal Ministry of
Health and agencies such as NPHCDA and NBS; FAO; UNICEF; peer-reviewed
systematic reviews; recognised professional nutrition or medical bodies;
Nigerian studies where local context matters.
Do NOT suggest: personal blogs, news articles, social media posts, or
commercial supplement, product or pharmacy pages.
Do not write a reference list. A reference list is written by the human who
actually opens the sources. Leave a placeholder saying so.

=== 4. LANGUAGE AND AUDIENCE ===

- Nigerian English, British spelling: colour, organisation, programme, fibre,
  realise, practise (verb).
- Plain language, as if speaking to a community member, not a clinician.
- Aim for a reading age around Year 8 / Grade 8. Short sentences. Aim for under
  20 words each and never over 25.
- Explain any technical word the first time it appears. If a word cannot be
  explained simply, use a simpler one.
- Active voice. Second person where it helps ("If you are buying yam…").
- No marketing language. Never use: revolutionary, game-changing, miracle,
  ultimate, guaranteed, secret, breakthrough, detox, magic, cure, heals,
  treats, prevents, remedy.
- No blame, no shaming, and no implying that anybody is wrong for how they eat.
  Food is not a moral test.
- Structure with H2 and H3 only. Never skip a heading level.

=== 5. NIGERIAN CONTEXT — MANDATORY ===

Every draft must include at least one concrete Nigerian example that a real
person could act on:
- name the actual foods, dishes and ingredients (garri, egusi, ogiri, ugu,
  moi moi, pounded yam, kuli-kuli, zobo, kunu, yam, plantain, cocoyam, beniseed,
  ogbono, ukazi, ogiri, uda, pawpaw, orange, mango — use what genuinely fits
  the topic)
- use household measures a Nigerian reader recognises: one medium fruit, a
  handful, a small bowl, a cup, a tablespoon
- examples must be affordable. Do not describe food as a luxury, and do not
  recommend an imported or expensive ingredient
- if the topic is region-specific, say which region
- NEVER invent a price. Write "cost varies" instead. If you are unsure whether
  something is affordable, say so and flag it for the reviewer.

=== 6. HEALTH SAFEGUARDS — REQUIRED SECTIONS ===

Where relevant to the topic, include:
- a "when to see a doctor or nurse instead" section
- a cautions / allergies section
- a note for pregnancy, children, or people on medication, where relevant
- the instruction to consult a qualified health worker about supplements
Never imply that food is a substitute for treatment, and never suggest a
reader change or stop prescribed medication.

=== 7. LENGTH AND FORMAT ===

Aim for 600–1,000 words for the body. Use headings and bullet lists. Markdown.
Do not include front matter, metadata, tags or a summary box — NHECOF fills
those in separately.

=== 8. END EVERY DRAFT WITH THIS CHECKLIST ===

Finish with a section titled "For the human reviewer" containing:

- Every [SOURCE NEEDED] marker in the draft, listed with the claim it sits
  next to, so the reviewer can work through them one by one.
- "Claims I was unsure about" — and be honest here rather than empty.
- "Questions I could not answer from my own knowledge".
- "What a qualified reviewer must check before this is published".
- A line reading: "This draft has not been reviewed and must not be published
  as written."

=== 9. OUTPUT ORDER ===

1. Proposed outline (headings only, with a one-line note on what each covers)
2. First draft following that outline
3. "Questions for the reviewer" (if you have any)
4. "For the human reviewer" (the checklist from section 8)

=== 10. TOPIC ===
Topic: [PASTE YOUR REAL TOPIC HERE]
Audience: [e.g. mothers of children under 5, in Ibadan]
Any angle you want covered or avoided: [optional]
Any source NHECOF has already verified for this topic: [optional, or "none"]
```

---

## 3. After you get the draft

Work through this in order. Do not skip to the editing.

1. **Read the whole thing before changing anything.** Get a feel for whether the
   topic is even right for the audience.
2. **Work the source markers.** For each `[SOURCE NEEDED: …]`, either find a real
   source or cut the sentence. A draft that is mostly markers means the topic is
   not ready to be written — that is useful information, not a failure.
3. **Delete every claim you cannot source.** Cutting is free. Publishing an
   unsourced claim is not.
4. **Search the draft for the prohibited words**: cure, treat, heal, prevent,
   guarantee, detox, miracle, best, everyone, always, ultimate, secret,
   breakthrough.
5. **Check the Nigerian examples are real and affordable**, and that no price
   was invented.
6. **Read it out loud.** Sentences you stumble over are sentences to rewrite.
7. **Check nothing is aimed at a reader's individual medical situation.**
8. **Re-verify the sources the model pointed you towards.** The model
   suggested *what kind* of authority to look for. You still have to find it,
   open it, and check that it says what you are about to claim. This is the step
   that matters most and the one most often skipped.
9. **Fill in the Studio fields** from
   [`docs/templates/article-outline-template.md`](templates/article-outline-template.md)
   or [`food-profile-template.md`](templates/food-profile-template.md).
10. **Submit for review** — with a real author and a different real reviewer.
    The model is not either of them.
11. **Tell the reviewer where the draft came from**, and which claims you are
    least sure about. This is not a confession of weakness; it is the most
    useful thing you can hand them.

---

## 4. What is fine to use AI for

| Fine | Not fine |
| --- | --- |
| A first structure you would otherwise stare at for an hour | Anything published without a qualified human reviewer |
| Suggesting headings you had not thought of | Being named as author or reviewer |
| Rewriting a paragraph you wrote, to be clearer | Generating a quotation attributed to a person |
| Rewriting to a simpler reading level | Producing a nutrient value, figure or statistic |
| Suggesting which Nigerian foods are worth mentioning | Producing a citation, reference or URL |
| Finding your own typos and repetition | Giving any individual medical advice |
| Asking "what am I missing here?" | Deciding a claim is safe to publish |
| Practising a difficult explanation out loud | Drafting anything about a specific person's health |

### Never use AI to produce

- a **quotation** for the daily quote. `docs/content-guidelines.md` and
  `docs/templates/quote-submission-form.md` both rule these out, and
  [`docs/studio-guide.md`](studio-guide.md) explains why.
- a **real person's** story, testimonial or health outcome.
- anything for a **child or pregnant woman** that will be published with their
  image.
- a **nutrient value** or **food composition** figure. Use a real composition
  table.

---

## 5. If something goes wrong

| What happened | What to do |
| --- | --- |
| A draft cited a source that does not exist | Discard the draft. Do not "fix" the citation. Start again from a real source. |
| A draft stated a cure or treatment claim | Discard it. Report the tool. Do not edit it into shape. |
| A number looks wrong | Delete it. Never "correct" a figure you cannot trace. |
| A reviewer is being asked to check 60 markers | That draft is not ready. Narrow the topic. |
| You are not sure whether something is safe | Ask the nutrition reviewer before it goes anywhere. |

**The test, in one line:** if you cannot explain a sentence's origin to a
reviewer in one breath, delete the sentence.

---

## 6. Related documents

| Document | Purpose |
| --- | --- |
| `docs/studio-guide.md` | How to submit and publish in the Studio |
| `docs/editorial-policy.md` | The rules, and who is accountable |
| `docs/content-guidelines.md` | How NHECOF writes |
| `docs/templates/article-outline-template.md` | Blank article structure |
| `docs/templates/food-profile-template.md` | Blank food profile structure |
| `docs/launch-content-tracker.md` | What still has to be written |
