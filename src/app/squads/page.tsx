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
          <div className='flex w-full'>
            <div className='flex flex-col gap-2 w-full'>
              <div className='text-blue-500'>BLUEFOR</div>
              {blueSquads.map((squad) => (
                <SquadListingCard key={squad.id} squad={squad} />
              ))}
            </div>
            <div className='flex flex-col gap-2 w-full'>
              <div className='text-red-500 text-right'>OPFOR</div>
              {redSquads.map((squad) => (
                <SquadListingCard key={squad.id} squad={squad} align='right' />
              ))}
            </div>
          </div>
          <div className='flex w-full justify-center items-center'>
            <div className='flex flex-col gap-2'>
              {unassignedSquads.length > 0 && (
                <div className='text-gray-500'>Нейтральні загони</div>
              )}
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
