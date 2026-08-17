import { LoginForm } from './ui/login';
import { Layout } from '@/widgets/layout';

export default function LoginPage() {
  return (
    <Layout className="h-full flex justify-center items-center flex-1">
      <LoginForm className="w-full" />
    </Layout>
  );
}
