import { LoginForm } from '@/features/auth/login/ui';
import { Layout } from '@/widgets/layout';

export default function LoginPage() {
  return (
    <Layout className='h-full flex justify-center items-center flex-1'>
      <LoginForm className='w-full' />
    </Layout>
  );
}
