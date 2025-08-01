import { LoaderIcon } from 'lucide-react';

import { Suspense } from 'react';

import { Layout } from '@/widgets/layout';

import { SquadListingCard } from '@/entities/squad/ui/squad-listing-card';
import { api } from '@/shared/sdk';
import { SideType } from '@/shared/sdk/types';

const SquadsPage = async () => {
  const { data: squads } = (await api.findSquads()) || [];

  return (
    <Layout className='w-full bg-card/80 mx-auto my-4 p-4 max-w-4xl'>
      <h1 className='text-lg font-bold text-center'>Загони проекту</h1>

      <div className='flex flex-col'>
        <Suspense fallback={<LoaderIcon className='w-4 h-4 animate-spin' />}>
          {squads
            .filter((squad) => squad.side?.type === SideType.BLUE)
            .map((squad) => (
              <SquadListingCard key={squad.id} squad={squad} />
            ))}
        </Suspense>
      </div>
    </Layout>
  );
};

export default SquadsPage;
