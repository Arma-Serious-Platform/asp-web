import { redirect } from 'next/navigation';

export default async function HqPlanTypoRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return redirect(`/hq/plans/${id}`);
}
