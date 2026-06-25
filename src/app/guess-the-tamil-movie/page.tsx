import type { Metadata } from "next";
import LanguageLanding from "@/app/LanguageLanding";
import { LANG_PAGES } from "@/lib/languagePages";

const page = LANG_PAGES.tamil;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: `/${page.slug}` },
  openGraph: { title: page.title, description: page.description, type: "website" },
};

export default function Page() {
  return <LanguageLanding page={page} />;
}
