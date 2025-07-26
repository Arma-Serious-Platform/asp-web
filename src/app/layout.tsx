import type { Metadata } from 'next';
import { Roboto_Condensed } from 'next/font/google';
import './globals.css';

const robotoCondensed = Roboto_Condensed({
  variable: '--font-roboto-condensed',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Virtual Tactical Games | Українська Arma III спільнота',
  description: 'Українська Arma III спільнота',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        {children}
      </body>
    </html>
  );
}
