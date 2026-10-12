import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/Providers";
export const metadata: Metadata = {
  title: "FyerX — Community Events",
  description: "Discover your next community moment.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
