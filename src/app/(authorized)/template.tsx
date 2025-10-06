import { hasAccessToAdminPanel } from '@/entities/user/lib';
import { ROUTES } from '@/shared/config/routes';
import { api } from '@/shared/sdk';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = await cookies();
  const token = cookie.get('token')?.value;

  const user = await api.getMe();

  if (!token) return redirect(ROUTES.auth.login);

  if (!hasAccessToAdminPanel(user.data?.role)) return redirect(ROUTES.home);

  return children;
}
