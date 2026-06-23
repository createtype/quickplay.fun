import { notFound } from "next/navigation";
import AdminClient from "./AdminClient";

// Admin clip-check — DEV ONLY. 404s in production so it never works on Vercel.
export const dynamic = "force-dynamic";

export default function AdminPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AdminClient />;
}
