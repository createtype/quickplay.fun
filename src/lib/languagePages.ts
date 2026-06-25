// SEO copy + FAQ per language landing page. One source for content + structured data.
import type { Language } from "@/data/movies";

export type LangPage = {
  lang: Language;
  slug: string;
  label: string;
  title: string;       // <title>
  description: string; // meta description
  h1: string;
  intro: string;       // crawlable lead paragraph
  faq: { q: string; a: string }[];
};

export const LANG_PAGES: Record<string, LangPage> = {
  malayalam: {
    lang: "malayalam",
    slug: "guess-the-malayalam-movie",
    label: "Malayalam",
    title: "Guess the Malayalam Movie — 1-Second Clip Game | quickplay.fun",
    description:
      "Play Guess the Malayalam Movie: watch a 1-second clip and name the film before the timer runs out. Free, no signup, play solo or with friends.",
    h1: "Guess the Malayalam Movie",
    intro:
      "Guess the Malayalam Movie is a fast, free guessing game: you watch a single one-second clip from a Malayalam film and type the movie's name before the 20-second timer runs out. Play solo or share a link to play with friends and compare scores.",
    faq: [
      {
        q: "How do you play Guess the Malayalam Movie?",
        a: "Watch a one-second clip from a Malayalam movie, then type the film's name before the timer ends. You get four rounds in solo mode, and answers are matched even if your spelling is slightly off.",
      },
      {
        q: "Is the Malayalam movie guessing game free?",
        a: "Yes. quickplay.fun is completely free, needs no signup, and works in your browser on phone or desktop.",
      },
      {
        q: "Can I play the Malayalam movie game with friends?",
        a: "Yes. Create a room, share the link, and everyone plays the same Malayalam movie clips. A live leaderboard shows who scored highest.",
      },
    ],
  },
  hindi: {
    lang: "hindi",
    slug: "guess-the-hindi-movie",
    label: "Hindi",
    title: "Guess the Hindi Movie — 1-Second Bollywood Clip Game | quickplay.fun",
    description:
      "Play Guess the Hindi Movie: watch a 1-second Bollywood clip and name the film before time runs out. Free, no signup, solo or with friends.",
    h1: "Guess the Hindi Movie",
    intro:
      "Guess the Hindi Movie is a quick, free Bollywood guessing game: you see a one-second clip from a Hindi film and type its name before the 20-second timer ends. Play solo or invite friends with a shareable link and compare scores.",
    faq: [
      {
        q: "How do you play Guess the Hindi Movie?",
        a: "Watch a one-second clip from a Hindi (Bollywood) movie, then type the film's name before the timer runs out. Slightly misspelled answers still count.",
      },
      {
        q: "Is the Hindi movie guessing game free?",
        a: "Yes. It's free, needs no signup, and runs in your browser on any device.",
      },
      {
        q: "Can I play the Bollywood movie game with friends?",
        a: "Yes. Create a room, share the link, and everyone guesses the same Hindi movie clips on a live leaderboard.",
      },
    ],
  },
  tamil: {
    lang: "tamil",
    slug: "guess-the-tamil-movie",
    label: "Tamil",
    title: "Guess the Tamil Movie — 1-Second Kollywood Clip Game | quickplay.fun",
    description:
      "Play Guess the Tamil Movie: watch a 1-second Kollywood clip and name the film before the timer runs out. Free, no signup, solo or with friends.",
    h1: "Guess the Tamil Movie",
    intro:
      "Guess the Tamil Movie is a fast, free Kollywood guessing game: you watch a one-second clip from a Tamil film and type the movie's name before the 20-second timer ends. Play solo or share a link to play with friends.",
    faq: [
      {
        q: "How do you play Guess the Tamil Movie?",
        a: "Watch a one-second clip from a Tamil (Kollywood) movie, then type the film's name before the timer ends. Close spellings are accepted.",
      },
      {
        q: "Is the Tamil movie guessing game free?",
        a: "Yes. quickplay.fun is free, needs no signup, and works on phone or desktop.",
      },
      {
        q: "Can I play the Tamil movie game with friends?",
        a: "Yes. Create a room, share the link, and everyone plays the same Tamil clips with a live leaderboard.",
      },
    ],
  },
};

export const LANG_PAGE_LIST = Object.values(LANG_PAGES);
