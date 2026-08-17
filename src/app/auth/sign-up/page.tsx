import { SignUpForm } from './ui/sign-up';
import { Layout } from '@/widgets/layout';

export default function SignUpPage() {
  return (
    <Layout className="h-full flex justify-center items-center flex-1">
      <SignUpForm className="w-full" />
    </Layout>
  );
}
