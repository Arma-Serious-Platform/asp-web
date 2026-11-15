import type { Metadata } from 'next';
import { Roboto_Condensed } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import './globals.css';
import { SessionProvider } from '@/entities/session/provider';
import { getSessionUser } from '@/entities/session/server/get-session-user';
import { SITE_URL } from '@/shared/config/site';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

const robotoCondensed = Roboto_Condensed({
  variable: '--font-roboto-condensed',
  // Без кирилиці весь український текст рендерився fallback-шрифтом і "стрибав" після завантаження (CLS).
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  adjustFontFallback: true,
});

const SITE_TITLE = 'Virtual Tactical Games | Українська Arma 3 спільнота';
const SITE_DESCRIPTION = "Серйозні TvT ігри кожної п'ятниці та неділі о 19:30 по Києву";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | VTG',
  },
  description: SITE_DESCRIPTION,
  keywords: ['Arma 3', 'TvT', 'VTG', 'Virtual Tactical Games', 'українська спільнота', 'мілсім', 'тактичні ігри'],
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/images/preview.jpg?v=2`],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    url: SITE_URL,
    siteName: 'Virtual Tactical Games',
    locale: 'uk_UA',
    countryName: 'Ukraine',
    images: [
      {
        url: `${SITE_URL}/images/preview.jpg?v=2`,
        width: 1200,
        height: 630,
        alt: 'Virtual Tactical Games',
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getSessionUser();

  return (
    <html lang="uk" className={robotoCondensed.variable}>
      <head>
        <link rel="icon" type="image/png" href="/images/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/images/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/images/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="VTG" />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
      </head>
      <body className="antialiased">
        <Toaster
          position="bottom-center"
          toastOptions={{
            success: {
              style: {
                backgroundColor: '#1f1f1f',
                color: '#fff',
                border: '1px solid #fff',
              },
            },
            error: {
              style: {
                backgroundColor: '#1f1f1f',
                color: '#fff',
                border: '1px solid #fff',
              },
            },
          }}
        />
        <NuqsAdapter>
          <SessionProvider initialUser={initialUser}>{children}</SessionProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
