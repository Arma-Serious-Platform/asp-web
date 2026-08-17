'use client';

import { Layout } from '@/widgets/layout';
import { HqPlans } from '@/app/(authorized)/hq/plans/ui/hq-plans';

export default function HqPlansPage() {
  return (
    <Layout>
      <HqPlans />
    </Layout>
  );
}
