"use client";

import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <title>The Set Menu</title>
      <meta property="og:title" content="The Set Menu" />
      <meta property="og:url" content="https://www.thesetmenu.co.uk/" />
      <meta
        name="description"
        content="Use your Spotify history to discover your Glasto 23 Set Menu"
      />
      <meta
        property="og:description"
        content="Use your Spotify history to discover your Glasto 23 Set Menu"
      />
      <meta
        property="og:image"
        content="https://www.thesetmenu.co.uk/disc.png"
      />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
