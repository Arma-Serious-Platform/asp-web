import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Загони',
  description: 'Загони української Arma 3 спільноти VTG: склад сторін, кількість гравців та подача заявки на вступ.',
  alternates: { canonical: '/squads' },
  openGraph: {
    title: 'Загони | VTG',
    description: 'Загони української Arma 3 спільноти VTG: склад сторін, кількість гравців та подача заявки на вступ.',
    url: '/squads',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
