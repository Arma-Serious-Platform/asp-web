import { SignUpForm } from '@/features/auth/sign-up/ui';
import { Layout } from '@/widgets/layout';

export default function SignUpPage() {
  return (
    <Layout className="h-full flex justify-center items-center flex-1">
      <SignUpForm className="w-full" />
    </Layout>
  );
}
