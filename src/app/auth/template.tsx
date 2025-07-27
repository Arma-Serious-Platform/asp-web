import { ROUTES } from '@/shared/config/routes';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = await cookies();
  const token = cookie.get('token')?.value;

  if (!token) {
    return children;
  }

  return redirect(ROUTES.home);
}
