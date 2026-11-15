import type { Metadata } from 'next';
import { SignUpForm } from './ui/sign-up';
import { Layout } from '@/widgets/layout';

export const metadata: Metadata = {
  alternates: { canonical: '/auth/sign-up' },
};

export default function SignUpPage() {
  return (
    <Layout className="h-full flex justify-center items-center flex-1">
      <SignUpForm className="w-full" />
    </Layout>
  );
}
