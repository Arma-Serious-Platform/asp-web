import { LoaderIcon } from 'lucide-react';

import { Suspense } from 'react';

import { Layout } from '@/widgets/layout';

import { SquadListingCard } from '@/entities/squad/ui/squad-listing-card';

import { model } from './model';
import { SideType } from '@/shared/sdk/types';

const SquadsPage = async () => {
  const squads = await model.squads.init();

  const blueSquads = squads.filter(
    (squad) => squad.side?.type === SideType.BLUE
  );
  const redSquads = squads.filter((squad) => squad.side?.type === SideType.RED);
  const unassignedSquads = squads.filter(
    (squad) => squad.side?.type === SideType.UNASSIGNED
  );

  return (
    <Layout className='w-full bg-card/80 mx-auto my-4 p-4 max-w-4xl'>
      <h1 className='text-lg font-bold text-center'>Загони проекту</h1>

      <Suspense fallback={<LoaderIcon className='w-4 h-4 animate-spin' />}>
        <div className='flex flex-col'>
          <div className='flex'>
            <div className='flex flex-col gap-2'>
              {blueSquads.map((squad) => (
                <SquadListingCard key={squad.id} squad={squad} />
              ))}
            </div>
            <div className='flex flex-col gap-2'>
              {redSquads.map((squad) => (
                <SquadListingCard key={squad.id} squad={squad} />
              ))}
            </div>
            <div className='flex flex-col gap-2'>
              {unassignedSquads.map((squad) => (
                <SquadListingCard key={squad.id} squad={squad} />
              ))}
            </div>
          </div>
        </div>
      </Suspense>
    </Layout>
  );
};

export default SquadsPage;
