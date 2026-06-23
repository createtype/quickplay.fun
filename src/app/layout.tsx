import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "quickplay.fun — Guess the Movie",
  description: "Guess the movie from a 1-second clip. Play solo or with friends.",
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
