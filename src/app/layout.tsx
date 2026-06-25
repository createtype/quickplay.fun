import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quickplay.fun";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Guess the Movie from a 1-Second Clip | quickplay.fun",
    template: "%s | quickplay.fun",
  },
  description:
    "Guess the movie from a 1-second clip — Hindi, Tamil and Malayalam films. Free, no signup. Play solo or with friends and share your score.",
  keywords: [
    "guess the movie",
    "movie guessing game",
    "1 second movie clip game",
    "guess the Hindi movie",
    "guess the Tamil movie",
    "guess the Malayalam movie",
    "Bollywood quiz",
    "Indian movie quiz",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "quickplay.fun",
    url: SITE_URL,
    title: "Guess the Movie from a 1-Second Clip | quickplay.fun",
    description:
      "Watch a 1-second clip, name the film. Hindi, Tamil & Malayalam. Free, no signup — play solo or with friends.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guess the Movie from a 1-Second Clip",
    description:
      "Watch a 1-second clip, name the film. Hindi, Tamil & Malayalam. Free, play solo or with friends.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="wrap">
          <a className="brand" href="/">
            <span className="dot" aria-hidden />
            <span>quickplay<span className="tld">.fun</span></span>
          </a>
          {children}
        </div>
      </body>
    </html>
  );
}
