import { ForgotPasswordForm } from '@/features/auth/forgot-password/ui';
import { Layout } from '@/widgets/layout';

export default function LoginPage() {
  return (
    <Layout className='h-full flex justify-center items-center flex-1'>
      <ForgotPasswordForm className='w-full' />
    </Layout>
  );
}
