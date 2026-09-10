import type { Metadata, Viewport } from "next";
import { Newsreader, Source_Code_Pro, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const sourceCode = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paid — Morning work planner",
  description:
    "Plan your starting work-day blocks when you arrive. Personal calendar with Rob Ross IDE themes.",
};

export const viewport: Viewport = {
  themeColor: "#f4efe6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="lemon-cream" data-mode="light">
      <body
        className={`${newsreader.variable} ${sourceSans.variable} ${sourceCode.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
