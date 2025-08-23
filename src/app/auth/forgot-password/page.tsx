'use client';
import { ForgotPasswordConfirmForm } from '@/features/auth/forgot-password-confirm/ui';
import { ForgotPasswordForm } from '@/features/auth/forgot-password/ui';
import { Layout } from '@/widgets/layout';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  // ?token=a95a17bf308ef0524a65cf8c8dbcf5b2e6f9f24d96acd6b77906abf47557a250
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <Layout className='h-full flex justify-center items-center flex-1'>
      {token ? (
        <ForgotPasswordConfirmForm token={token} className='w-full' />
      ) : (
        <ForgotPasswordForm className='w-full' />
      )}
    </Layout>
  );
}
