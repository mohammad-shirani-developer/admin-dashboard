import { redirect } from "next/navigation";

/* The admin panel has no public landing page — the app root is the dashboard. */
export default function Home() {
  redirect("/dashboard");
}
