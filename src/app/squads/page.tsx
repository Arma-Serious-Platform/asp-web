import { LoaderIcon } from 'lucide-react';

import { Suspense } from 'react';

import { Layout } from '@/widgets/layout';

import { SquadListingCard } from '@/entities/squad/ui/squad-listing-card';

import { model } from './model';
import { SideType } from '@/shared/sdk/types';
import { Hero } from '@/widgets/hero';

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
    <Layout showHero className='w-full mx-auto'>
      <h1 className='text-2xl font-bold text-left mt-4 container mx-auto'>Загони проекту</h1>
      <div className='container w-full mx-auto my-4 paper p-4'>
        <Suspense fallback={<LoaderIcon className='w-4 h-4 animate-spin' />}>
          <div className='flex flex-col'>
            <div className='flex w-full'>
              <div className='flex flex-col gap-2 w-full'>
                <div className='text-blue-500 text-2xl'>СТОРОНА BLUEFOR</div>
                {blueSquads.map((squad) => (
                  <SquadListingCard key={squad.id} squad={squad} />
                ))}
              </div>
              <div className='text-2xl flex flex-col items-center justify-center px-4'>
                <div className='text-2xl'>VS</div>
              </div>
              <div className='flex flex-col gap-2 w-full'>
                <div className='text-red-500 text-right text-2xl'>СТОРОНА OPFOR</div>
                {redSquads.map((squad) => (
                  <SquadListingCard
                    key={squad.id}
                    squad={squad}
                    align='right'
                  />
                ))}
              </div>
            </div>
            <div className='flex flex-col w-full justify-center items-center mt-4'>
              {unassignedSquads.length > 0 && (
                <div className='text-neutral-300 text-2xl mb-4'>
                  Незалежні загони
                </div>
              )}
              <div className='flex gap-2 flex-wrap'>
                {unassignedSquads.map((squad) => (
                  <SquadListingCard key={squad.id} squad={squad} />
                ))}
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    </Layout>
  );
};

export default SquadsPage;
