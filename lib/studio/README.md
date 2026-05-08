# Flowwwzy Studio — Production Pipeline

Internal system that turns configurator inputs + reference URLs into a
ranked list of library components. Senior-designer audit closes the loop.

This module is **self-contained**. It must not import from `app/`, `components/`
(LP), or `lib/store.ts` / `lib/types.ts` (LP form types). When this gets
extracted to its own repo, only `lib/studio/` moves; nothing else needs to
change.

## Architecture (3 layers)

1. **DNA layer** — `vocabulary.ts` + `types.ts`
   Closed vocabularies (mood, typography, palette, motion, etc.) and zod
   schemas that lock the LLM output to those vocabularies. The matcher
   never reasons about strings outside this surface.

2. **Extractor** *(Day 2-3)* — `extractor/`
   `URL → screenshot (Apify) → Claude Sonnet vision → ReferenceDNA`. Cache
   keyed by URL hash so a second run over the same URL is free.

3. **Matcher** *(Week 2)* — `match/`
   `MatchRequest (form + references + library) → MatchResponse (ranked picks
   per section)`. Pure function. Deterministic. No LLM in this layer.

A 4th layer — **generator** — assembles the picked components with form
content into a deployable Next.js project. Built last because it depends
on the library being populated.

## Why closed vocabularies

An open vocabulary lets the LLM drift. Same URL, two runs, different DNA
→ matcher loses determinism → the senior-designer audit becomes the only
filter, which kills the speed promise.

With closed vocabs, two runs over the same URL produce the same DNA
(within tiny variance), and any drift is an extractor bug we can fix in
the prompt — not a matcher problem.

## DNA shape (high level)

A `DesignDNA` is:

| Field        | Closed set? | Source                                  |
|--------------|-------------|-----------------------------------------|
| moodTags     | yes (14)    | extractor LLM, form (subset of 6)        |
| tone         | 0-100 ints  | extractor LLM, form sliders             |
| typography   | yes         | extractor LLM (visual classification)   |
| palette      | hex + ID    | extractor (raw hex), matcher (closest ID)|
| density      | yes (3)     | extractor LLM                           |
| alignment    | yes (3)     | extractor LLM                           |
| imagery      | yes         | extractor LLM                           |
| motion       | yes (4)     | extractor LLM (often `static` from img) |

Components in the library carry the SAME DNA shape, hand-tagged at build
time. Matching = comparing two `DesignDNA` objects.

## Test references

These three URLs are the canonical Day 4-5 validation set. They span the
"premium aesthetic" range we ship:

- https://studio-mcgee.com — interior design firm
- https://danfinkstudio.com — interior / architecture
- https://charliehornerdesign.com — graphic / web designer portfolio

If the extractor produces consistent, plausible DNA for these three across
multiple runs, ship the schema.

## Deploy boundary

For now this lives inside `flowwwzy-express`. When extracted later:

1. Copy `lib/studio/` to the new repo.
2. The only LP-side dependency is the configurator → Studio handoff,
   which goes through `MatchRequestSchema`. Either of these works:
     - Webhook from the LP form to the Studio API
     - A shared types package

Nothing in `lib/studio/` needs to know about React, Next.js routes, or
the LP build process.
