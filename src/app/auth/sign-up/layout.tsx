import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Реєстрація',
  description:
    'Зареєструйтеся у Virtual Tactical Games — українській TvT спільноті Arma 3 — та підключіть Steam, щоб почати грати.',
  openGraph: {
    title: 'Реєстрація | VTG',
    description:
      'Зареєструйтеся у Virtual Tactical Games — українській TvT спільноті Arma 3 — та підключіть Steam, щоб почати грати.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
