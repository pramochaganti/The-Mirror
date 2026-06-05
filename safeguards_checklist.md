# The Mirror — Child-Safety & DPDP Safeguards Checklist

A build-ready checklist for a **personal, non-commercial** parent–teen reflection tool that processes a minor's data. Hand this to the build chat. *Not legal advice — a practical framework. Verify helpline numbers and get counsel before any non-personal use.*

---

## Priority 1 — Architecture (does most of the legal heavy lifting)

- [ ] **Local-first only.** Store all of the child's entries on the family's own device (localStorage). Make this the *only* mode for now.
- [ ] **Do not centralize children's data.** Disable / don't use the central Vercel KV sync of child content. If cross-device sync is truly needed, keep it per-family and minimal — never a central store you own.
- [ ] **No analytics or trackers.** Remove every third-party SDK, pixel, and analytics tag (Google Analytics, Meta, etc.). There should be nothing tracking the child.

## Priority 2 — Data minimization

- [ ] First name or nickname only — no full name.
- [ ] No date of birth (a coarse "13–17" band at most), no email, no phone, no location, no contacts, no device IDs.
- [ ] **Retention:** auto-expire old entries; one-tap "delete everything"; no indefinite accumulation.

## Priority 3 — The AI (Claude) call

- [ ] Send only the entry text needed for the decipher; **never store it server-side; never log it.**
- [ ] Disclose plainly: "What you write is sent to an AI to spot interest patterns. It isn't saved on our servers, and it's never sold or shared."
- [ ] (Anthropic doesn't train on API data by default — still disclose.)

## Priority 4 — Consent & assent

- [ ] Explicit **parental setup step**: the parent enables the child's use and sees a plain-language explanation. Record consent locally.
- [ ] Age-appropriate **kid assent**: the child sees what it does and agrees.

## Priority 5 — Behavioural-monitoring line (DPDP)

- [ ] No ads, no profiling, no third-party sharing, no selling — ever.
- [ ] Frame durability tracking as the *family's own on-device reflection*, never surveillance. The child can view and delete all of their own data.

## Priority 6 — Distress safety net (NON-NEGOTIABLE)

- [ ] The decipher step must detect signs of distress / self-harm / abuse and, instead of returning an interest analysis, trigger a gentle **care screen** (below).
- [ ] Do **not** counsel, diagnose, or flag it punitively to the parent.
- [ ] Show help resources and encourage talking to a trusted adult.
- [ ] **Verify current Indian helpline numbers before shipping:** Tele-MANAS `14416`, KIRAN `1800-599-0019`.

## Priority 7 — Kid dignity in the "compare"

- [ ] Nothing the kid writes reaches the parent view without the kid's explicit tap.
- [ ] Kid can keep entries private, edit, and see exactly what the parent sees.
- [ ] Frame as "what we each noticed," never a verdict or report card on the child.

## Priority 8 — Plain-language notice (one screen)

- [ ] What's collected · that text goes to an AI · nothing sold/shared · lives on your device · one-tap delete.

---

## Distress detection — prompt language for the build chat

**Add this to the top of the existing `DECIPHER_SYSTEM` prompt, before the interest-extraction instructions:**

```
SAFETY CHECK FIRST. Before anything else, read the entry for signs of serious distress —
self-harm, suicidal thoughts, abuse, violence, or a child reaching out for help.

If ANY such signal is present, do NOT analyse interests. Return ONLY this JSON:
{ "safety_flag": true, "reason": "<one short, non-judgmental phrase>" }

Do not diagnose, counsel, quote the content back, or add commentary. Just the flag.

If there is NO such signal, ignore this and proceed with the normal interest decipher below.
```

**App behaviour when `safety_flag` is true — show this care screen instead of a portrait/observation (do not store the flagged content beyond the device, do not notify the parent automatically):**

```
It sounds like something heavy might be going on. You don't have to carry it alone.

If you're in distress, please reach out — talking to someone helps:
  • Tele-MANAS: 14416   • KIRAN: 1800-599-0019   [verify current numbers]
And please tell an adult you trust. They want to help, even if it doesn't feel that way.

This is a safe space to notice things — but for the big stuff, a real person is better than any app. 💛
```

*(Tune the wording to feel warm and age-appropriate, not clinical. Keep it short.)*

---

## What NOT to build (until/unless this ever becomes non-personal)

- No central database of children's entries.
- No third-party data sharing, no ad/marketing pixels.
- No account system that harvests emails.
- No auto-sharing of the kid's reflections to the parent.

If The Mirror ever moves beyond your own circle to a public/commercial product, the **full DPDP children's regime** (verifiable parental consent at scale, the behavioural-monitoring prohibition, etc.) applies — stop and get a lawyer first.
