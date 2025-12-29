import type { Metadata } from "next";
import { SavedPage } from "@/features/saved/components/saved-page";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://namerai.frontera.my.id";

export const metadata: Metadata = {
  title: "Saved Brand Names",
  description:
    "View the brand names you've saved to your local library and keep your favorites handy.",
  openGraph: {
    title: "Saved Brand Names",
    description:
      "Your saved AI-generated names, stored locally for quick access.",
    url: `${APP_URL}/saved`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Saved() {
  return <SavedPage />;
}
