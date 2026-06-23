# PRODUCT.md — quickplay.fun

## Register
**brand** — this is a fun, viral consumer game. The design IS part of the product's appeal and its growth engine (shareable score cards). It must feel like entertainment, not a tool.

## Product purpose
quickplay.fun is a platform for short, social, replayable games. The first game is **Guess the Movie**: a ~1-second clip (built from key movie screenshots) plays, you type the title before a 20s timer ends, and you get a shareable score card. Two modes: **Solo** (instant) and **With Friends** (host shares a link, everyone plays the same set, live leaderboard). Launch languages: Hindi, Tamil, Malayalam. The viral loop hinges on the score card unfurling beautifully in WhatsApp/Instagram/X.

## Users
- **Core:** Gen-Z / college crowd. Social-first, phone-first, competitive with friends, share to Instagram stories and WhatsApp groups. They bounce instantly if something feels like homework or a corporate tool.
- **Secondary:** broader Indian movie fans of all ages who get pulled in via shared links.
- Context of use: on a phone, one-handed, in a group chat or between classes. Low attention, high expectation of fun. No signup wall to play.

## Brand & tone
- **Vibe: arcade / playful-loud.** Game-show energy. Bright committed color, chunky rounded display type, springy/poppy motion, emoji-forward but not childish. A party game you pull up at a hangout.
- Voice: hype, friendly, a little cheeky. Short punchy copy ("Name that movie 🎬", "GO!", "You're a Movie Oracle"). Never instructional or formal.
- Confident and celebratory on results: the score title is the hero, made to screenshot and brag.

## Strategic principles
1. **Instant & frictionless** — the very first tap should start play. No language wall, no name wall before the player understands what they're doing. Solo should be one tap.
2. **Mobile-first, one-handed** — thumb-reachable actions, big tap targets, no tiny chips. Most plays and all shares happen on phones.
3. **The clip is the star** — during play, the 1s clip and the guess are the only things on screen. Everything else gets out of the way.
4. **Share-worthy by default** — the result screen and its card are designed to be screenshotted and posted. Brag-forward.
5. **Forgiving** — transliteration-tolerant matching; the UI should reassure ("close enough counts").

## Anti-references (do NOT look like these)
- **Generic SaaS dashboard** — no card-grid-everything, no Inter + blue accent, no B2B-tool feel. (User explicitly: "not technical or saas-like.")
- **Kahoot / Mentimeter** — must not read as an education/quiz tool.
- **Crypto / neon-on-black** — no glowing neon gradients, no tech-bro dark.
- **Corporate streaming (Netflix clone)** — not a knockoff streaming UI.

## Known UX problems to fix in this redesign
- Home crams language-select + Solo + a full friends-room form (name + movie count + create) on one screen. Confusing: it's unclear language applies to Solo too, and Solo vs Friends order is muddled.
- Friends flow forces back-and-forth: pick name, then realize you must also pick movie language.
- Goal: a clear, guided, fun flow — choose mode, then only the steps that mode needs, progressively.

## Surfaces
Home (`/`), Solo play (`/play`), Friends room (`/room/[code]`), shared round loop (`GameRounds.tsx`), Result (`/result`), Share landing (`/s/[slug]`), Submit a movie (`/submit`).

## Tech constraints
Hand-rolled minimal Next.js 15 (App Router, TS) in `dev/web/`. Plain global CSS in `src/app/globals.css` (no Tailwind/CSS-in-JS currently). Supabase for data/realtime. Build in small increments; verify with `npm run build`. Keep code comments sparse.
