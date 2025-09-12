# Find Your Path — Product Requirements Document (PRD) v0.9

## 1. Summary

**Problem:** Many Dartmouth students (especially first‑gen/international) don’t know what opportunities exist or how to start (professors, offices, grants).
**Solution:** A simple assistant that suggests programs based on year/interests/goals, explains how research works here, and links to official pages. No deadline tracking.

## 2. Goals & Non‑Goals

**Goals (MVP):**

* G1: Students can describe themselves in plain English and receive **3 relevant program cards** with concrete next steps + official links.
* G2: Students can **browse** a lightweight database (Airtable‑style) with filters (Year, Area, International‑friendly, Department, Type).
* G3: Students can **save** (bookmark) items and view saved items.
* G4: Students feel **reassured**; the agent explains research at Dartmouth when asked and asks one helpful clarifier.
* G5: App access is **.edu email gated**.

**Non‑Goals:**

* N1: No deadline tracking, reminders, or calendars.
* N2: No application routing or form submission on behalf of students.
* N3: No guarantees of outcomes; not an official Dartmouth channel.

## 3. Audience & Personas

* **P1: First‑year explorer** — doesn’t know what exists; needs gentle intro and concrete “what to do next.”
* **P2: Intimidated sophomore** — wants research but nervous to email professors; needs pep talk + simple steps.
* **P3: International student** — wants to know if programs are open to them; needs filtering and clear links.
* **P4: Upperclass switcher** — knows area; wants quick pointers and saving.

## 4. Top User Stories (MVP)

* US1: As a first‑year, I can say “I’m into biology” and get **3 cards** with what to do next and links.
* US2: As a student who says “I want to make money,” I get options for paid lab/tech/tutoring/grant paths and one clarifying question.
* US3: As an intimidated sophomore, I get a reassurance line plus 3 steps and a follow‑up question about field.
* US4: As an international student, I can filter to international‑friendly programs in **Browse**.
* US5: As any student, I can **Save** items and later view my saved list.

## 5. Core Features (MVP)

1. **Ask (AI) chat**

   * Free‑form chat; history retained per session.
   * One clarifying question max before offering value.
   * **Research Explainer** paragraph when “I want to do research” is detected.
   * Output format: 1 short setup sentence + **3 recommendation cards** (2–4 acceptable).

2. **Recommendation cards**

   * Fields: Title; Department/Unit badge; Who it’s for; What to do next (1–3 bullets; no templates); Official link; Optional contact (if listed); Tags (First‑years, International‑friendly, Paid, Grant, Lab, Low‑time); Actions: Save/Unsave.

3. **Browse database**

   * List/grid of entries with filters: Year, Area, International‑friendly, Department, Type (Paid/Grant/Lab/Explore).

4. **Bookmarks**

   * Save/Unsave from cards; Saved list view.

5. **Auth gate**

   * Require Dartmouth .edu sign‑in for access.

6. **Contribute**

   * Link to “Submit an opportunity” form.
   * Link to “Add advice” form (content not surfaced yet in chat).

## 6. Copy & Tone Requirements

* Default: warm, peer‑like, concise; light Gen‑Z allowed sparingly (no emojis by default).
* Reassurance‑first for anxious/intimidated users.
* Always disclose: “We point to official pages; confirm details there.”
* Never mention deadlines, reminders, or “verified as of.”

## 7. Data Model (content level, MVP)

**Program**: id, title, department/unit, description, audience tags (year/area/international‑friendly), type (paid/grant/lab/explore), **what\_to\_do\_next\[]** (1–3 bullets), official\_url, contact\_role/name (optional), tags\[].
**Saved item**: user\_id, program\_id, saved\_at.
**(Optional later)** Advice: id, author\_meta (class year), text, tags, status (pending/published).

## 8. UX Flows (happy paths)

* **First‑time:** Gated landing → Sign‑in (.edu) → Hero (Ask input + Browse link).
* **Ask path:** User message → (maybe 1 clarifier) → 3 cards → Save/Browse.
* **Browse path:** Filters → Cards → Detail → Open official page → (optionally Save).
* **Save:** Tap Save → toast “Saved to your list” → View saved.

## 9. Acceptance Criteria (MVP)

* AC1: From a single free‑form message, the agent can return **3 recommendation cards** with the required fields.
* AC2: If the message is vague, the agent asks exactly **one** clarifying question before recommending.
* AC3: When the message contains “research,” the **Research Explainer** appears before the clarifier.
* AC4: Browse supports the listed filters and opens/filters without re‑auth.
* AC5: Save/Unsave works from cards; a Saved list view exists.
* AC6: All copy avoids deadlines/reminders/verification language.
* AC7: Auth requires Dartmouth .edu sign‑in.

## 10. Analytics (lightweight)

* A1: # unique signed‑in users (weekly).
* A2: # Ask messages sent; # recommendations returned.
* A3: # Saves; # Official‑link clicks.
* A4: Popular filters/areas.

## 11. Risks & Mitigations

* R1: **Stale/missing links** → Mitigation: “Report an opportunity” + fallback to department homepage.
* R2: **Over‑asking** → Mitigation: enforce 1 clarifier rule.
* R3: **Tone mismatch** → Mitigation: tone guide + examples; light Gen‑Z only when user is casual.
* R4: **Scope creep (deadlines/reminders)** → Mitigation: Non‑goals explicit; copy QA.

## 12. Privacy & Constraints

* No collection of financial need or sensitive personal data.
* Store minimal profile (year, areas, goals, experience, confidence) only if necessary for UX; else keep ephemeral.

## 13. Dependencies (implementation references; not commitments)

* **AI SDK UI (useChat hook)** for chat UX: supports real‑time **message streaming**, managed **chat state** (input/messages/status/error), and controls like **stop/regenerate** and **status** display. Transport can be configured per request for auth/headers.
* **Chat SDK (template)** for a production‑ready Next.js App Router app with **message persistence**, **authentication**, **multimodal support**, shareable chats, and advanced patterns like **generative UI**, **customizable artifacts**, and **in‑browser code execution**.

## 14. Out of Scope (MVP)

* Deadlines, reminders, calendars.
* Email template generation or auto‑sending.
* Surfacing unmoderated student advice in chat.

## 15. Open Questions

* OQ1: Show grant amounts **only** when stated on official pages?
* OQ2: Ask explicitly about first‑gen/international early, or infer and ask later if relevant?
* OQ3: Minimum cards rule—always 3 (with near‑matches) vs. allow fewer?

## 16. Timeline (suggested)

* Week 1–2: Content schema + 50 seed programs + Ask/Browse skeleton + Save.
* Week 3: Tone QA, clarifier logic, Browse filters.
* Week 4: Polish, link QA, analytics, launch.
