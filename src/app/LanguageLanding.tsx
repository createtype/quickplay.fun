import Link from "next/link";
import type { LangPage } from "@/lib/languagePages";
import { LANG_PAGE_LIST } from "@/lib/languagePages";

// LanguageLanding — crawlable SEO intro + FAQ + a Play button (server-rendered)
export default function LanguageLanding({ page }: { page: LangPage }) {
  const others = LANG_PAGE_LIST.filter((p) => p.lang !== page.lang);

  // FAQPage structured data for AI/Google extraction
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="enter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <h1 className="h1">{page.h1} 🎬</h1>
      <p className="sub">{page.intro}</p>

      <Link
        className="btn btn-primary"
        href={`/play?langs=${page.lang}`}
        style={{ textDecoration: "none" }}
      >
        ▶️ Play {page.label} now
      </Link>

      <div className="card" style={{ marginTop: 20 }}>
        <span className="label">How it works</span>
        <ol style={{ margin: "10px 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Watch a 1-second clip from a {page.label} movie.</li>
          <li>Type the film&apos;s name before the 20-second timer ends.</li>
          <li>Score points — close spellings still count.</li>
          <li>Share your score card or play with friends.</li>
        </ol>
      </div>

      <div className="card">
        <span className="label">FAQ</span>
        <div style={{ marginTop: 8 }}>
          {page.faq.map((f, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <p style={{ fontWeight: 700, margin: "0 0 4px" }}>{f.q}</p>
              <p className="sub" style={{ margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <span className="label">Other languages</span>
        <div className="chip-row" style={{ marginTop: 12 }}>
          {others.map((p) => (
            <Link key={p.lang} className="chip" href={`/${p.slug}`}>
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
