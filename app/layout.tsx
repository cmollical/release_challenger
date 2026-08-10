import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Release Challenger", description: "AI-assisted release readiness review" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
