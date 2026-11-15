import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Анонси ігор та новини',
  description: 'Розклад ігор VTG: місії, сторони та дати найближчих TvT подій в Arma 3, а також новини проєкту.',
  alternates: { canonical: '/weekends' },
  openGraph: {
    title: 'Анонси ігор та новини | VTG',
    description: 'Розклад ігор VTG: місії, сторони та дати найближчих TvT подій в Arma 3, а також новини проєкту.',
    url: '/weekends',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
