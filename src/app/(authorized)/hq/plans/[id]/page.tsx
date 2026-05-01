'use client';

import { Layout } from '@/widgets/layout';
import { HqPlans } from '@/widgets/hq/plans';
import { useParams } from 'next/navigation';

export default function HqPlanByIdPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  return (
    <Layout>
      <HqPlans activePlanId={id} />
    </Layout>
  );
}
