import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Simulator",
  description: "Run a business. Make decisions. Survive the market.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
