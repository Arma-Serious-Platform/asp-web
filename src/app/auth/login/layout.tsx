import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вхід',
  description: 'Увійдіть до облікового запису Virtual Tactical Games, щоб брати участь в іграх та керувати профілем.',
  alternates: { canonical: '/auth/login' },
  openGraph: {
    title: 'Вхід | VTG',
    description: 'Увійдіть до облікового запису Virtual Tactical Games, щоб брати участь в іграх та керувати профілем.',
    url: '/auth/login',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
