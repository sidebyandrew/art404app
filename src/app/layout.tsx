import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../styles/globals.css";
import { ContextProps } from "@/contexts/TMA";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

export const runtime = "edge"; // 'nodejs' (default) | 'edge'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ART-404",
  description: "State of NFT Art",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersForContext: ContextProps["headers"] = {};
  headers().forEach((value: any, key: any) => (headersForContext[key] = value));
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        {/* todo remove tma pink*/}
        {/*<TMAProvider headers={headersForContext}>*/}
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex h-screen flex-col">
            <main className="">{children}</main>
            <Toaster />
          </div>
        </Providers>
        {/*</TMAProvider>*/}
      </body>
    </html>
  );
}
