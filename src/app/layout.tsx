import type { Metadata } from 'next';
import { Roboto_Condensed } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import './globals.css';
import { SessionProvider } from '@/entities/session/provider';
import { cookies } from 'next/headers';
import { api } from '@/shared/sdk';
import { User } from '@/shared/sdk/types';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { AxiosError } from 'axios';
import { getCachedUser, getUser } from '@/entities/user/server/fetch';

const robotoCondensed = Roboto_Condensed({
  variable: '--font-roboto-condensed',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Virtual Tactical Games | Українська Arma 3 спільнота',
  description: "Серйозні TvT ігри кожної п'ятниці та неділі о 19:30 по Києву",
  openGraph: {
    title: 'Virtual Tactical Games | Українська Arma 3 спільнота',
    description: "Серйозні TvT ігри кожної п'ятниці та неділі о 19:30 по Києву",
    type: 'website',
    url: 'https://vtg.in.ua',
    siteName: 'Virtual Tactical Games',
    locale: 'uk_UA',
    countryName: 'Ukraine',
    images: [
      {
        url: `https://vtg.in.ua/images/preview.jpg?v=2`,
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
  const cookie = await cookies();
  const token = cookie.get('token')?.value;
  const refreshToken = cookie.get('refreshToken')?.value;

  let user: User | null = null;

  if (token) {
    try {
      api.instance.defaults.headers.Authorization = `Bearer ${token}`;

      user = await getUser();
    } catch {
      user = null;
    }
  }

  return (
    <html lang='en'>
      <head>
        <link
          rel='icon'
          type='image/png'
          href='/images/favicon/favicon-96x96.png'
          sizes='96x96'
        />
        <link
          rel='icon'
          type='image/svg+xml'
          href='/images/favicon/favicon.svg'
        />
        <link rel='shortcut icon' href='/images/favicon/favicon.ico' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/images/favicon/apple-touch-icon.png'
        />
        <meta name='apple-mobile-web-app-title' content='VTG' />
        <link rel='manifest' href='/images/favicon/site.webmanifest' />
      </head>
      <body className={`${robotoCondensed.variable} antialiased`}>
        <Toaster
          position='bottom-center'
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
          <SessionProvider
            initialData={
              user
                ? { user, token: token || '', refreshToken: refreshToken || '' }
                : null
            }>
            {children}
          </SessionProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
