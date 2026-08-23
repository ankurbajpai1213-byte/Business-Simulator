import type { Metadata } from "next";
import "./globals.css";
import ProgressionDockV2 from "@/components/ProgressionDockV2";

export const metadata: Metadata = {
  title: "Business Simulator",
  description: "Run a business. Make decisions. Survive the market.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<ProgressionDockV2 /></body>
    </html>
  );
}
