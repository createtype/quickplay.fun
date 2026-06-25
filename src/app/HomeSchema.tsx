// Home structured data (JSON-LD) — helps Google AI Overviews / ChatGPT understand + cite.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quickplay.fun";

const FAQ = [
  {
    q: "What is quickplay.fun?",
    a: "quickplay.fun is a free online game where you watch a one-second clip from a movie and guess the film's name before a 20-second timer runs out. It focuses on Hindi, Tamil and Malayalam movies.",
  },
  {
    q: "How do you play Guess the Movie?",
    a: "You watch a single one-second movie clip, then type the film's title before the timer ends. Each game has four clips in solo mode, and slightly misspelled answers still count.",
  },
  {
    q: "Is quickplay.fun free?",
    a: "Yes. It is completely free, requires no signup, and runs in any web browser on phone or desktop.",
  },
  {
    q: "Can I play the movie guessing game with friends?",
    a: "Yes. Create a room, share the link, and everyone plays the same movie clips. A live leaderboard shows who scored highest.",
  },
  {
    q: "Which movie languages can I play?",
    a: "You can play Hindi (Bollywood), Tamil (Kollywood) and Malayalam movies, choosing one or more languages before each game.",
  },
];

export default function HomeSchema() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "quickplay.fun",
        description:
          "Guess the movie from a 1-second clip — Hindi, Tamil and Malayalam films.",
      },
      {
        "@type": "VideoGame",
        name: "Guess the Movie",
        url: SITE_URL,
        applicationCategory: "Game",
        gamePlatform: "Web browser",
        operatingSystem: "Any",
        description:
          "Watch a one-second movie clip and guess the film before the timer ends. Hindi, Tamil and Malayalam. Free, solo or with friends.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
