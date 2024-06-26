"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import * as Sentry from "@sentry/react";
import ReactGA from "react-ga4";
import { Flowbite } from "flowbite-react";

ReactGA.initialize("G-P3NCLKN91M");

Sentry.init({
  dsn: "https://ae91e64465c842eaaaf0a0736f131dce@o4505364394934272.ingest.sentry.io/4505364397621248",
  integrations: [
    new Sentry.BrowserTracing({
      // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        "localhost",
        /^https:\/\/thesetmenu\.co.uk\/api/,
      ],
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <title>My Glasto Set Menu</title>
      <meta property="og:title" content="My Glasto Set Menu" />
      <meta property="og:url" content="https://myglastosetmenu.co.uk/" />
      <meta
        name="description"
        content="Use your Spotify history to discover your Glasto 24 Set Menu"
      />
      <meta
        property="og:description"
        content="Use your Spotify history to discover your Glasto 24 Set Menu"
      />
      <meta
        property="og:image"
        content="https://myglastosetmenu.co.uk/disc.png"
      />
      {/*<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
      <link rel="manifest" href="/site.webmanifest">*/}
      <Flowbite>
        <body className={inter.className}>{children}</body>
      </Flowbite>
    </html>
  );
}
